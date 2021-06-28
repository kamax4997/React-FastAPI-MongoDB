import base64
import datetime
import json
from datetime import timezone

import requests
from fastapi import APIRouter, Request, Path
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates

from app.crud import InPreventedDomainException
from app.crud import inject, get_url_document, is_domain_prevented, random_redirect
from app.database import database
from app.utils import extract_ip_from_request

router = APIRouter()

intermediate_pages = Jinja2Templates(directory="app/intermediate_pages")


def has_extra_options(url_document):
    for prop in ["time_limit", "click_limit", "go_rougue", "not_child", "not_work", "contains_politics",
                 "contains_promotions", "contains_violence"]:
        if (prop not in url_document):
            return False
    return True


def classifications_to_list(url_document):
    classification_list = []
    for classification in ["not_child", "not_work", "contains_politics", "contains_promotions", "contains_violence"]:
        if (url_document[classification] != None):
            classification_list.append(classification)
    return classification_list


def generate_intermediate_page(api_data, request):
    print(api_data)
    # api_data_encoded = base64.urlsafe_b64encode(json.dumps(api_data).encode()).decode()
    api_data_encoded = base64.urlsafe_b64encode(json.dumps(api_data).encode('ascii')).decode('ascii')
    print(api_data_encoded)

    return intermediate_pages.TemplateResponse("index.html", {"request": request, "api_data": api_data_encoded})


@router.get('/{path}')
def lookup(request: Request, path: str = Path(...)):
    # if a proxy is used, then the right method for get the actually ip of the client must be done in the
    # uvicorn (or similar) proxy headers, the use of "X-Forwarded-For" is very insecure as pointed here
    # (https://research.securitum.com/x-forwarded-for-header-security-problems/)
    client_ip = extract_ip_from_request(request)
    print("\n\n###############", client_ip)

    # the unquote method is not needed, the browser and fastapi alredy unquote the URL
    # short_url = "https://pinterest.blue/" + path # for localhost develpment testing
    short_url = str(request.url)
    url_document = get_url_document(short_url)

    if url_document is not None:
        referrer = request.headers.get("Referer")
        real_url = url_document['long_url']

        # Is the domain in prevent then redirect
        try:
            is_domain_prevented(real_url)
        except InPreventedDomainException as e:
            rand_domain = random_redirect()
            return RedirectResponse("https://" + rand_domain, 302)

        # Check if url is risky (Google WebRisk + check 1,2,3)
        try:
            data = {"params": {"url": url_document['long_url']}}
            r = requests.post('http://localhost:3333/urlcheck', json=data)
            print("R,TEXT", r.text)
            if r.text != '0':
                rand_domain = random_redirect()
                return RedirectResponse("https://" + rand_domain, 302)
        except Exception:
            rand_domain = random_redirect()
            return RedirectResponse("https://" + rand_domain, 302)

        # Certain conditions must be satisfied in order to process the URL
        # User Agent has to be more than certain length
        length_condition = len(real_url) > 1  # and len(request.headers.get('User-Agent')) >= 14  # ok why 18??

        # Original url which is the long url cannot be the site
        site_condition = real_url != 'https://omelet.xyz/'

        # url cannot contain robots.txt
        robots_condition = short_url.find('robot.txt') == -1

        # User agent can not contain any bots including alexa
        user_agent = request.headers.get('User-Agent').lower()
        bots_condition = user_agent.find('bot') == -1 and \
                         user_agent.find('alexa') == -1 and \
                         user_agent.find('slackbot') == -1 and \
                         user_agent.find('twitterbot') == -1 and \
                         user_agent.find('embedly') == -1 and \
                         user_agent.find('facebookexternalhit') == -1

        # print("user-agent", user_agent)
        # Short url cannot be the refferer
        # print('robots_condition and bots_condition', robots_condition, bots_condition)
        if robots_condition and bots_condition:
            if referrer is None or referrer.replace('http', 'https') != short_url:
                inject(client_ip, request.headers.get('User-Agent'), short_url, real_url, referrer)
        # print('length_condition and site_condition', length_condition, site_condition)
        if length_condition and site_condition:
            if has_extra_options(url_document):

                if (url_document["time_limit"] != None):

                    is_over_time_limit = datetime.datetime.utcnow() > url_document["time_limit"]
                    if is_over_time_limit:
                        api_data = {
                            "type": "time_limit",
                            "timeLimit": url_document["time_limit"].replace(tzinfo=timezone.utc).isoformat()
                        }
                        return generate_intermediate_page(api_data, request)

                if ((click_limit := url_document["click_limit"]) != None):
                    if (click_limit > 0):
                        # Has clicks left, subtract one click from document
                        database["short"].update_one(
                            {"_id": url_document['_id']},
                            {
                                "$inc": {
                                    "click_limit": -1
                                },
                                "$set": {
                                    "last_clicked_on": datetime.datetime.utcnow(),
                                }
                            }
                        )
                    else:
                        # Click limit reached
                        api_data = {
                            "type": "click_limit",
                        }
                        return generate_intermediate_page(api_data, request)

                if (len((classification_list := classifications_to_list(url_document))) > 0):
                    api_data = {
                        "url": real_url,
                        "type": "classifications",
                        "classificationsList": classification_list
                    }
                    return generate_intermediate_page(api_data, request)

            return RedirectResponse(real_url, 302)
        else:
            return RedirectResponse('https://lnkd.dev', 302)

    else:
        return RedirectResponse('https://lnkd.dev', 302)
