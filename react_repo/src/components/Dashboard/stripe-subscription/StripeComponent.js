import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOktaAuth } from "@okta/okta-react";

import { Button, Card, Input, Alert,  Spin, Tag, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import axios from 'axios';
// stripe
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardAction, CardBilling, CardDescription, CardFeatures } from './SubscriptionDetails'
import { stripe_publish_key } from '../../../config'
// Util imports
// Custom Components
import CardInput from './CardInput';

import './index.scss'

const { confirm } = Modal;


const CheckoutForm = () => {
  // State
  // State
  const [email, setEmail] = useState();
  const [tip, setTip] = useState('');
  const [status, setStatus] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [user, setUserInfo] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [subscribeBtnLoading, setSubscribeBtnLoading] = useState(false);
  const [resumeBtnLoading, setResumeBtnLoading] = useState(false);
  const [tipBtnLoading, setTipBtnLoading] = useState(false);
  const [payments, setPayments] = useState([]);

  const { oktaAuth, authState } = useOktaAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      setUserLoading(true);
      setSubscribeBtnLoading(true);
      oktaAuth.getUser().then(info => {
        setUserInfo(info);
        console.log(info);
        setEmail(info.email);
        setUserLoading(false);
        setSubscribeBtnLoading(false);
      });
    }
  }, [authState, oktaAuth]);

  const stripe = useStripe();
  const elements = useElements();


  const handleSubmitPay = async (event) => {
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setTipBtnLoading(true)
    try {
      const res = await axios.post(`${process.env.REACT_APP_API}/stripe/tip/`, { tip: tip, access_token: authState.accessToken.value });
      
      const clientSecret = res.data['client_secret'];
      
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
          },
        },
      });
      
      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        setMessage(result.error.message);
        setMessageType('error');
        setTipBtnLoading(false);
      } else {
        // The payment has been processed!
        setTipBtnLoading(false);
        handleGetPayments()
        if (result.paymentIntent.status === 'succeeded') {
          // Show a success message to your customer
          // There's a risk of the customer closing the window before callback
          // execution. Set up a webhook or plugin to listen for the
          // payment_intent.succeeded event that handles any business critical
          // post-payment actions.
          setMessageType('success');
          setMessage('Thank you for tipping $' + tip);
        }
      }
    } catch(error) {
      setTipBtnLoading(false);
      setMessage("Unable to tip. Please try again!");
      setMessageType('error');
      return;
    }
  };


  useEffect(() => {
    if (email) {
      handleGetSub()
      handleGetPayments()
    }
  }, [email])

  const handleGetSub = async (event) => {
    setSubscribeBtnLoading(true);
    try {

      const res = await axios.post(`${process.env.REACT_APP_API}/stripe/get-subscription/`, { access_token: authState.accessToken.value });
      if (res.data && res.data.result) {
        setIsSubscribed(res.data.result.stripe_subscription_status === 'succeeded');
        setIsPaused(res.data.result.stripe_subscription_status === 'keep_as_draft');
        
        setSubscribeBtnLoading(false);
      } else {
        setIsPaused(false);
        setIsSubscribed(false);
        setSubscribeBtnLoading(false);
      }
    } catch(error) {
      setSubscribeBtnLoading(false);
      setMessage("Unable to get subscription status. Please try again!");
      setMessageType('error');
    }

  }

  const handleSubmitSub = async (event) => {
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
    setSubscribeBtnLoading(true);
    try{

      if (status !== '') {
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              email: email,
            },
          },
        });
        if (result.error) {
          setMessageType('error');
          setMessage(result.error.message);
          setSubscribeBtnLoading(false);
          // Show error in payment form
        } else {
          setMessageType('success');
          setMessage('Thank you for Subscribing for a monthly $10!');
        }
      } else {
        const result = await stripe.createPaymentMethod({
          type: 'card',
          card: elements.getElement(CardElement),
          billing_details: {
            email: email,
          },
        });

        if (result.error) {
          setMessageType('error');
          setMessage(result.error.message);
          setSubscribeBtnLoading(false);
          // Show error in payment form
        } else {
          const payload = {
            email: email,
            payment_method: result.paymentMethod.id,
            access_token: authState.accessToken.value
          };

          // Otherwise send paymentMethod.id to your server
          const res = await axios.post(`${process.env.REACT_APP_API}/stripe/subscribe/`, payload);


          handleGetSub();

          // eslint-disable-next-line camelcase
          const { client_secret, status } = res.data;

          if (status === 'requires_action') {
            setClientSecret(client_secret);
            stripe.confirmCardPayment(client_secret).then(function (result) {
              if (result.error) {
                // Display error message in your UI.
                // The card was declined (i.e. insufficient funds, card has expired, etc)
                setMessageType('error');
                setMessage(result.error.message);
              } else {
                // Show a success message to your customer
                setMessageType('success');
                setMessage('Thank you for Subscribing for a monthly $10!');
              }
            });
          } else {
            setMessageType('success');
            setMessage('Thank you for Subscribing for a monthly $10!');
          }
          setSubscribeBtnLoading(false);
        }
      }
    } catch(error) {
      setSubscribeBtnLoading(false);

      setMessage("Unable to subscribe. Please try again!");
      setMessageType('error');
    }
  };

  const handleCancelSub = () => {
    confirm({
      title: 'Are you sure you want to cancel your monthly subscription?',
      icon: <ExclamationCircleOutlined />,
      content: '',
      onOk() {
        return axios.post(`${process.env.REACT_APP_API}/stripe/cancel-subscription/`, {  access_token: authState.accessToken.value }).then( () => {
          handleGetSub()
          handleGetPayments()
          return Promise.resolve();
        })
      },
      onCancel() {},
    });
  }

  const handlePauseSub = () => {
    confirm({
      title: 'Are you sure you want to pause your monthly subscription?',
      icon: <ExclamationCircleOutlined />,
      content: 'You can resume your subscription any time you want',
      onOk() {
        return axios.post(`${process.env.REACT_APP_API}/stripe/pause-subscription/`, {  access_token: authState.accessToken.value }).then( () => {
          handleGetSub()
          handleGetPayments()
          return Promise.resolve();
        }).catch(() => {
          return Promise.reject();
        })
      },
      onCancel() {},
    });
  }

  const handleResumeSub = async () => {
    setResumeBtnLoading(true);
    try {

      const res = await axios.post(`${process.env.REACT_APP_API}/stripe/resume-subscription/`, { access_token: authState.accessToken.value });
      setResumeBtnLoading(false)
      
      handleGetSub()
      handleGetPayments()
    } catch (error) {
      setResumeBtnLoading(false)
      setMessage("Unable to resume subscription. Please try again!");
      setMessageType('error');
    }
  }

  const handleGetPayments = async () => {
    const res = await axios.post(`${process.env.REACT_APP_API}/stripe/get-payments/`, { access_token: authState.accessToken.value });
    setPayments(res.data);
  }

  const useInterval = (callback, delay) => {

    const savedCallback = useRef();
  
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
  
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }
  useInterval(() => {
    handleGetPayments()
   }, 1000 * 5);

  return (
    <div className="stripe-main">
        {message && <Alert message={message} type={messageType} showIcon closable onClose={() => setMessage('')} />}
        <div className={`card pricing-card basic`}>
          {!email && <Spin />  }

          <p>We will not store your credit card information.</p>

          {isSubscribed && <Alert message={"You are subscribed for a monthly $10 payment"} type="info" showIcon> </Alert>}
          {isPaused && <Alert message={"Subscription Paused for the moment"} type={"warning"} />}
          {(isSubscribed || isPaused ) ?
            <CardFeatures>
              {isPaused ?
                <Button shape="round" loading={resumeBtnLoading} size="large" onClick={handleResumeSub}>
                  Resume Subscription
                </Button>
                : 
                <Button shape="round" loading={resumeBtnLoading} size="large" onClick={handlePauseSub}>
                    Pause Subscription
                </Button>
              }
              <span>{" "}</span>
              <Button shape="round" danger size="large" onClick={handleCancelSub}>
                Cancel Subscription
              </Button>
            </CardFeatures>
          :
          <React.Fragment>

            <CardBilling price={10} recurrency={"$"} />
            <CardFeatures>
              <CardInput />
            </CardFeatures>
            <CardAction clickMe={() =>{}} name={"Subscribe"} />
            <CardAction>
                <Button size='large' className="pay-button" shape="round" loading={subscribeBtnLoading} onClick={handleSubmitSub}>
                  Subscribe for $10 monthly
                </Button>
            </CardAction>
          </React.Fragment>
        }

        {(isSubscribed || isPaused) ? 
          <CardFeatures>
            <CardInput />
          </CardFeatures> 
          : <div />
        }

        <CardFeatures>
          <Input
              className='tip-input'
              type='number'
              size="large"
              placeholder="Input tip amount"
              min={1}
              required
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              
            />
        </CardFeatures>
        <CardAction>
          <Button size={'large'} shape="round"  className="pay-button" loading={tipBtnLoading} onClick={handleSubmitPay}>
            Tip {tip && `$${tip}`}
          </Button>
        </CardAction>
		</div>
      <Card>
        <h3 className="trasactions">Previous Transactions</h3> 
        {(payments && payments.length) ?
          payments.map((payment, i) => (
            <p key={i}><b>${payment.amount}</b> <Tag style={{float: 'right'}}color="#87d068">PAID</Tag> { payment.stripe_customer_id? <Tag style={{float: 'right'}} color="#2db7f5">Monthly Fee</Tag>: <Tag style={{float: 'right'}} color="#108ee9">Tip</Tag>}</p>
          ))
          : "No Transactions"
        }
      </Card>

    </div>
  );
}

const stripePromise = loadStripe(stripe_publish_key);

const StripeComponent = ({ userInfo }) => {
  return (
    <div className="AppWrapper">
      <Elements stripe={stripePromise} >
        <CheckoutForm userInfo={userInfo} />
      </Elements>
    </div>
  );
};

export default StripeComponent;