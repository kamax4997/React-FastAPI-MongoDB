from fastapi import APIRouter, Query, Request, status, HTTPException, Depends
import stripe
from app.config import settings
from app.database import database
from app.schemas import UserData, Payment
from okta_jwt.jwt import validate_token
from fastapi.security import OAuth2PasswordBearer

stripe_router = APIRouter(prefix="/stripe", tags=["stripe"])

# Define the auth scheme and access token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl='token')
# database.drop_collection('users')
# database.drop_collection('payments')
stripe.api_key = settings.STRIPE_SECRET_KEY

def validate(token: str = Depends(oauth2_scheme)):
    try:
        res = validate_token(
            token,
            settings.OKTA_ISSUER,
            settings.OKTA_AUDIENCE,
            settings.OKTA_CLIENT_ID
        )
        return res
    except Exception:
        raise HTTPException(status_code=403)


@stripe_router.post(path="/tip/", name="tip")
async def tip(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    response =  stripe.PaymentIntent.create(
            amount= int(float(body['tip']) * 100),
            currency='usd',
            receipt_email=validation_data['sub']
        )

    return {"client_secret": response['client_secret']}


@stripe_router.post(path="/get-subscription/", name="get-subscription")
async def get_subscription(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}, {'_id': 0}) 
    return {'result': user}


@stripe_router.post(path="/pause-subscription/", name="pause-subscription")
async def pause_subscription(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}, {'_id': 0}) 
    if user is not None:
        pause = stripe.Subscription.modify(
            user['stripe_subscription_id'],
            pause_collection={
                'behavior': 'keep_as_draft',
            },
        )
        if pause['pause_collection']['behavior'] == 'keep_as_draft':
            result = database["users"].update_one({"email": validation_data['sub']}, {"$set": {'stripe_subscription_status': 'keep_as_draft'}})
            return str(result)
        raise HTTPException(status_code=500, detail='Unable to pause subscripiton!')
    raise HTTPException(status_code=404, detail='Subscription Not Found!')


@stripe_router.post(path="/resume-subscription/", name="resume-subscription")
async def resume_subscription(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}, {'_id': 0}) 
    if user is not None:
        resume = stripe.Subscription.modify(
            user['stripe_subscription_id'],
            pause_collection=''
        )
        result = database["users"].update_one({"email": validation_data['sub']}, {"$set": {'stripe_subscription_status': 'succeeded'}})
        return str(result)
        
    raise HTTPException(status_code=404, detail='Subscription Not Found!')


@stripe_router.post(path="/cancel-subscription/", name="cancel-subscription")
async def cancel_subscription(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}, {'_id': 0}) 
    if user is not None:
        subscription = stripe.Subscription.delete(user['stripe_subscription_id'])
        result = database["users"].update_one({"email": validation_data['sub']}, {"$set": {'stripe_subscription_status': None, 'stripe_subscription_id' : None}})
        return str(result)
    raise HTTPException(status_code=404, detail='Subscription Not Found!')


@stripe_router.post(path="/get-payments/", name="get-payments")
async def get_payments(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}, {'_id': 0})
    payments = []
    if user is not None:
        payments = database["payments"].find({"$or": [{"email": validation_data['sub']}, {"stripe_customer_id": user['stripe_customer_id']}]}, {'_id': 0})
        return list(payments)
    return list(payments)


@stripe_router.post(path="/subscribe/", name="subscribe")
async def subscribe(request: Request):
    body = await request.json()
    token = body['access_token']
    validation_data = validate(token)
    user = database["users"].find_one({"email": validation_data['sub']}) 
    if user is not None:
        if user['stripe_subscription_id'] is not None:
            try:
                subscription = stripe.Subscription.delete(user['stripe_subscription_id'])
            except Exception:
                pass

        subscription = stripe.Subscription.create(
            customer=user['stripe_customer_id'],
            items=[
                {
                'price': settings.STRIPE_PRICE_ID,
                },
            ],
            expand=['latest_invoice.payment_intent'],
        )

        status = subscription['latest_invoice']['payment_intent']['status'] 
        client_secret = subscription['latest_invoice']['payment_intent']['client_secret']
        result = database["users"].update_one({"email": validation_data['sub']}, {"$set": {'stripe_subscription_status': status, 'stripe_subscription_id' : subscription['id']}})
        return {"status": status, "client_secret": client_secret}
    else:
        customer = stripe.Customer.create(
            payment_method=body['payment_method'],
            email=validation_data['sub'],
            invoice_settings={
                'default_payment_method': body['payment_method'],
            },
        )
    
        subscription = stripe.Subscription.create(
            customer=customer['id'],
            items=[
                {
                'price': settings.STRIPE_PRICE_ID,
                },
            ],
            expand=['latest_invoice.payment_intent'],
        )
    
        status = subscription['latest_invoice']['payment_intent']['status'] 
        client_secret = subscription['latest_invoice']['payment_intent']['client_secret']

        user_obj = UserData(
            email = validation_data['sub'],
            stripe_subscription_status = status,
            stripe_customer_id = customer['id'],
            stripe_subscription_id = subscription['id']
        )
        database["users"].insert_one(user_obj.dict(by_alias=True))
     
        return {"status": status, "client_secret": client_secret}

    return ''


@stripe_router.post('/stripe-webhook')
async def stripe_webhook(request: Request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    endpoint_secret = settings.STRIPE_WEBHOOK_KEY
    payload = await request.body()
    sig_header = request.headers['stripe-signature']
    event = None
    user_info = {}

    if not sig_header:
        raise HTTPException(status_code=400, detail='No Signiture Header!')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        raise HTTPException(status_code=400, detail='Value error')
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        raise HTTPException(status_code=400, detail='Signature Verification error')

    
    if event['type'] == 'payment_intent.succeeded':
        amount = event['data']['object']['amount'] / 100.0 
        customer_id = event['data']['object']['customer'] # contains the customer id
        email = event['data']['object']['receipt_email'] # contains the email that will recive the recipt for the payment (users email usually)
        user_info['email'] = email
        user_info['amount'] = amount
        user_info['customer_id'] = customer_id
        payment_obj = Payment(
            email=email,
            amount=amount,
            stripe_customer_id=customer_id,
            payment_event_type=event['type']
        )
        insert = database["payments"].insert_one(payment_obj.dict(by_alias=True))

    if event['type'] == 'invoice.payment_succeeded':
        email = event['data']['object']['customer_email'] # contains the email that will recive the recipt for the payment (users email usually)
        customer_id = event['data']['object']['customer'] # contains the customer id
        subscription_id = event['data']['object']['subscription'] # contains the customer id
        amount = event['data']['object']['amount_paid'] / 100.0 

    return ''
    
