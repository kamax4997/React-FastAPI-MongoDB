import time
import random
from urllib.parse import urlparse
from datetime import date, datetime
from typing import Optional
from urllib import parse
import  tldextract

from app.database import database
from app.schemas import ShortenInDB, UserData, UTMParameters
from app.schemas import InBannedDomainException, InPreventedDomainException
from app.utils import get_day_key, get_location


def _get_milliseconds() -> str:
    millis = int(round(time.time() * 1000))
    str_millis = str(millis)
    str_millis = str_millis[-6:]
    str_millis = hex(int(str_millis))
    return str_millis[2:]


def create_shorten_url(
        ip_address: str,
        user_id: str,
        user_agent: str,
        brand_domain: str,
        long_url: str,
        keyword: Optional[str],
        time_limit: Optional[int] = None,
        click_limit: Optional[int] = None,
        go_rougue: Optional[int] = None,
        not_child: Optional[int] = None,
        not_work: Optional[int] = None,
        contains_politics: Optional[int] = None,
        contains_promotions: Optional[int] = None,
        contains_violence: Optional[int] = None,
        utm_data: Optional[dict] = None,
        user_data: Optional[dict] = None,
        short_url_uuid: Optional[dict] = None,
) -> str:
    # Validate domain
    is_domain_banned(long_url=long_url)

    day_key = get_day_key(datetime.now().timetuple().tm_yday)
    millis = _get_milliseconds()
    short_url_key = "".join(sorted(millis + day_key))

    if keyword is None:
        keyword = short_url_key

    query = {"_key": keyword, "brand_domain": brand_domain}
    if database["short"].find_one(query) is not None:
        return None

    database["counters"].update_one({}, update={"$inc": {"seq": 1}})
    short_url = f"{brand_domain}/{keyword}"
    location = get_location(ip_address)
    user = UserData(**(user_data or {}))
    user.user_id = user_id
    utm_parameters = UTMParameters(**(utm_data or {}))

    short_obj = ShortenInDB(
        long_url=long_url,
        _key=keyword,
        mini_link=short_url,
        seq=int(database["counters"].find_one({}).get("seq")),
        brand_domain=brand_domain,
        epoch_elapsed=time.time(),
        validity=7,
        user_agent=user_agent,
        date_time=date.today().strftime("%Y-%b-%d %H").replace(' 0', ' '),
        short_url_uuid=short_url_uuid,
        time_limit=time_limit,
        click_limit=click_limit,
        go_rougue=go_rougue,
        not_child=not_child,
        not_work=not_work,
        contains_politics=contains_politics,
        contains_promotions=contains_promotions,
        contains_violence=contains_violence,
        **location.dict(),
        **user.dict(),
        **utm_parameters.dict(),
    )
    database["short"].insert_one(short_obj.dict(by_alias=True))
    return short_url

def get_url_document(short_url: str):
    short_parsed_url = urlparse(short_url)

    if short_url[0:4] == 'www.':
        netloc = short_parsed_url.netloc
        netloc = netloc.replace('www.', '')

        short_parsed_url = short_parsed_url.path.split('/')
        short_parsed_url[0] = short_parsed_url[0].replace('www.', '')

        myquery = {"_key": short_parsed_url[1], "brand_domain": short_parsed_url[0]}

        mydoc = database['short'].find_one(myquery)
        return mydoc

    elif short_url[0:4] == 'http':
        netloc = short_parsed_url.netloc
        netloc = netloc.replace('www.', '')

        short_parsed_url = short_parsed_url.path
        short_parsed_url = short_parsed_url.replace('/', '')

        myquery = {"_key": short_parsed_url, "brand_domain": netloc}
        mydoc = database['short'].find(myquery)

        mydoc = database['short'].find_one(myquery)
        return mydoc
    else:
        short_parsed_url = short_parsed_url.path.split('/')
        myquery = {"_key": short_parsed_url[1], "brand_domain": short_parsed_url[0]}

        mydoc = database['short'].find_one(myquery)
        return mydoc

    return


def get_real_url(short_url: str):
    short_parsed_url = urlparse(short_url)

    if short_url[0:4] == 'www.':
        netloc = short_parsed_url.netloc
        netloc = netloc.replace('www.', '')

        short_parsed_url = short_parsed_url.path.split('/')
        short_parsed_url[0] = short_parsed_url[0].replace('www.', '')

        myquery = {"_key": short_parsed_url[1], "brand_domain": short_parsed_url[0]}
        print(myquery)

        mydoc = database['short'].find(myquery)
        print(database['short'].count_documents(myquery))

        if database['short'].count_documents(myquery) > 0:
            for i in mydoc:
                original_url = i['long_url']
                return original_url
    elif short_url[0:4] == 'http':
        netloc = short_parsed_url.netloc
        netloc = netloc.replace('www.', '')

        short_parsed_url = short_parsed_url.path
        short_parsed_url = short_parsed_url.replace('/', '')

        myquery = {"_key": short_parsed_url, "brand_domain": netloc}
        mydoc = database['short'].find(myquery)

        print('netloc', netloc)
        print('path', short_parsed_url)
        print(database['short'].count_documents(myquery))
        if database['short'].count_documents(myquery) > 0:
            for i in mydoc:
                original_url = i['long_url']
                print("original_url", original_url)
                return original_url
    else:
        print('code was in else')
        short_parsed_url = short_parsed_url.path.split('/')

        myquery = {"_key": short_parsed_url[1], "brand_domain": short_parsed_url[0]}

        mydoc = database['short'].find(myquery)
        print(database['short'].count_documents(myquery))
        if database['short'].count_documents(myquery) > 0:
            for i in mydoc:
                original_url = i['long_url']
                return original_url

    return 'https://omelet.xyz/'


def inject(ip_address, user_agent, short_url, original_url, referrer_url):
    # Retrieve Lat long based on Ip Address
    # url = "http://api.ipstack.com/" + ip_address + "?access_key=55a1adfd4020c63a6080af8759e88e3b"
    # response = requests.request("GET", url, headers={}, data={'': ''}, files=[])
    # ip_address_based_response = json.loads(response.text.encode('utf8'))
    try:
        # Retrieve user_id of the user who generated this short link
        if parse.urlsplit(short_url).netloc == "":
            mini_link = parse.urlsplit(short_url).path[4:]
        else:
            parsed_short_url = parse.urlsplit(short_url)
            mini_link = parsed_short_url.netloc + parsed_short_url.path

        short_record = database["short"].find_one({"mini_link": mini_link})

        # If there is no short record matched with mini link then skip
        if short_record is None:
            return False

        ip_meta = dict()
        if not short_record.get('user_id'):  # If there is no user_id is attached to this short_url then leave these None
            ip_meta["ip"] = ip_address
            ip_meta['type'] = None
            ip_meta["continent_code"] = None
            ip_meta["continent_name"] = None
            ip_meta["country_code"] = None
            ip_meta["country_name"] = None
            ip_meta["region_code"] = None
            ip_meta["region_name"] = None
            ip_meta["city"] = None
            ip_meta["zip"] = None
            ip_meta['latitude'] = None
            ip_meta['longitude'] = None
        else:
            ip_meta = get_location(ip_address).dict()

        # Inserting click Analytics
        my_dict = {
            "ip": ip_meta['ip'],
            "type": ip_meta['type'],
            "continent_code": ip_meta['continent_code'],
            "continent_name": ip_meta['continent_name'],
            "country_code": ip_meta['country_code'],
            "country_name": ip_meta['country_name'],
            "region_code": ip_meta['region_code'],
            "region_name": ip_meta['region_name'],
            "city": ip_meta['city'],
            "zip": ip_meta['zip'],
            "latitude": ip_meta['latitude'],
            "longitude": ip_meta['longitude'],
            "short_url": short_url,
            "long_url": original_url,
            "time_stamp": time.time(),
            "referrer_url": referrer_url,
            "user_agent": user_agent,
            "user_id": short_record.get('user_id')
        }

        database["link_performance"].insert_one(my_dict)
        return True
    except Exception as e:
        print("Error occurred Inject", e)
        return False


def create_user(email: str, user_id: str, stripe_id: str):
    user_record = {"email": email,
                   "user_id": user_id,
                   "stripe_id": stripe_id,
                   "created_at": datetime.utcnow().timestamp(),
                   "status": "active_in_the_system"}
    record = database["user_list"].find_one({"user_id": user_id})
    if not record:
        database["user_list"].insert_one(user_record)


def is_domain_banned(long_url: str):
    parsed_long_url = urlparse(long_url)
    domain = parsed_long_url.netloc
    result = database["banned_domain"].find_one({"$or": [{"domain": domain.replace("www.", "")},
                                                         {"domain": "www."+domain}]})
    if result:
        raise InBannedDomainException("Domain is banned")


def is_domain_prevented(long_url: str):
    parsed_long_url = urlparse(long_url)
    domain = parsed_long_url.netloc
    
    extracted_domain= tldextract.extract(long_url)
    extracted_domain= extracted_domain.domain+"."+extracted_domain.suffix
    result = database["redirect_prevention"].find_one({"$or": [{"domain": domain.replace("www.", "")},
                                                               {"domain": "www."+domain},{"domain":extracted_domain}]})
    if result:
        raise InPreventedDomainException("Domain is prevent")


def random_redirect():
    available_domains = ["io.deals",
                         "amzn.how",
                         "ytube.page",
                         "twttr.site",
                         "insta.blue",
                         "dev.care",
                         "ios.page",
                         "etsy.one",
                         "reddit.fyi",
                         "claim.run",
                         "howdy.biz",
                         "yelp.pw",
                         "pinterest.blue",
                         "wlmart.in",
                         "wiki.army",
                         "lnkd.dev",
                         "unrobinhood.com",
                         "moneylion.co.in",
                         "chime.expert",
                         "ebay.party",
                         "url.gifts",
                         "url.cafe",
                         "url.toys",
                         "omelet.xyz"]
    return random.choice(available_domains)
