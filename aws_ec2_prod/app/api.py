from typing import List, Optional

import dns.resolver
import dns.resolver
from fastapi import APIRouter, Query, Request, status, Body, Response
from fastapi.exceptions import HTTPException

from app.agg_pipeline import agg_dashboard
from app.crud import create_shorten_url, create_user, is_domain_banned
from app.database import database
from app.schemas import InBannedDomainException
from app.schemas import ShortenCreate, ShortenOut, URLType, UserAgent, DashboardData
from app.utils import extract_ip_from_request, ts_to_dt, useragent_parser, generate_large_url

router = APIRouter(prefix="/shorten", tags=["shorten"])


@router.post(
    "/",
    responses={409: {"description": "Short URL is not available."}},
    response_model=str,
)
def create_shorten(
        request: Request,
        body: ShortenCreate,
        desired_keyword: Optional[str] = None,
):
    body_dict = body.dict()
    if desired_keyword is not None:
        desired_keyword = desired_keyword.strip().replace(" ", "")

    if ("go_rougue" in body_dict and body_dict["go_rougue"] == 1):
        desired_keyword = generate_large_url()

    user_agent = request.headers.get("user-agent")
    ip_address = extract_ip_from_request(request)
    kwargs = body_dict
    # kwargs.update({'brand_domain': request.headers.get('Host')})
    try:
        shorten_url = create_shorten_url(
            ip_address=ip_address,
            user_agent=user_agent,
            keyword=desired_keyword,
            **kwargs
        )
    except InBannedDomainException:
        raise HTTPException(status_code=409, detail="This domain is in our banned list")
    if shorten_url is None:
        raise HTTPException(status_code=409, detail="Short URL is not available.")
    return shorten_url


@router.delete(
    "/softdel",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "Short URL not found."}},
)
def soft_delete_link(user_id: str = Body(...), short_url: str = Body(...)):
    # database["short"].update({"user_id": user_id},
    #                          {"$unset": {"deleted": ""}}, multi=True)

    # First: Mark the link as deleted
    mini_link = short_url.replace("http://", "").replace("https://", "")
    database["short"].update_one({"user_id": user_id, "mini_link": mini_link},
                                 {"$set": {"deleted": True}})
    # Second: Mark all link clicks records as deleted
    database["link_performance"].update_many(
        {"user_id": user_id, "short_url": {"$in": ["http://" + short_url, "https://" + short_url]}},
        {"$set": {"deleted": True}})
    return "OK"


@router.delete(
    "/",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"description": "Short URL not found."}},
)
def delete_link(short_url: str, user_id: Optional[str] = None):
    result = database["short"].delete_one({"mini_link": short_url, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Short URL not found.")


@router.get("/", response_model=List[ShortenOut])
def retrieve_links(size: int, user_id: Optional[str] = None):
    return [obj for obj in database["short"].find({"user_id": user_id}).limit(size)]


@router.put(
    "/",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        404: {"description": "Short URL not found."},
        409: {"description": "Short URL is not available."},
    },
)
def update_shorten(
        short_url: str,
        new_url: str,
        type_: URLType = Query(..., alias="type"),
        user_id: Optional[str] = None,
):
    if type_ == URLType.SHORT:
        if database["short"].find_one({"mini_link": new_url}) is not None:
            raise HTTPException(status_code=409, detail="Short URL is not available.")
        result = database["short"].update_one(
            {"mini_link": short_url}, {"$set": {"mini_link": new_url}}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Short URL not found.")
    else:
        database["short"].update_one(
            {"mini_link": short_url}, {"$set": {"long_url": new_url}}
        )


@router.get("/users", response_model=List[UserAgent])
def users(user_id: str):
    docs = [obj for obj in database["link_performance"].find({"user_id": user_id}, {"_id": False})] or []
    for doc in docs:
        ua = useragent_parser(doc["user_agent"])
        doc["os"] = ua.os
        doc["device"] = ua.device
        doc["browser"] = ua.browser
        doc["time_stamp"] = ts_to_dt(doc["time_stamp"])
    return docs


@router.post("/aggregate/dashboard", response_model=DashboardData)
async def users_dashboard(data: dict = Body(...)):
    post_data = data["data"]
    return agg_dashboard(db=database,
                         user_id=post_data.get("user_id"),
                         long_url=post_data.get("long_url"),
                         short_url=post_data.get("short_url"))


@router.post("/users")
def create_loggedin_user(data: dict = Body(...)):
    create_user(data["email"], data["user_id"], data["stripe_id"])
    return "OK"


# Custom domain endpoints

elastic_server_ip = "15.223.127.242"


@router.post("/users/custom-domain")
def add_custom_domain(data: dict = Body(...)):
    dns_request = check_a_record(data["domain"])
    if (dns_request["status"] == "success"):
        # The subdomain is connected to the server
        user = database["user_list"].find_one({"email": data["email"]})
        if (user == None):
            return {"status": "error", "message": "User not found"}
        else:
            if ("custom_domains" in user):
                # The user already has custom domains, add one to the list if it doesn't exist
                if (data["domain"] not in user["custom_domains"]):
                    database["user_list"].update_one({"_id": user['_id']}, {"$push": {
                        "custom_domains": data["domain"]
                    }})
                else:
                    return {"status": "error", "message": "Domain already added"}
            else:
                # The user does not have custom domains
                database["user_list"].update_one({"_id": user['_id']}, {"$set": {
                    "custom_domains": [data["domain"]]
                }})

            user = database["user_list"].find_one({"email": data["email"]})
            return {"status": "success", "data": user["custom_domains"]}
    else:
        # The subdomain is not connecto to the server
        return dns_request


@router.get("/users/custom-domain")
def get_custom_domains(email: str):
    user = database["user_list"].find_one({"email": email})
    if (user == None):
        return {"status": "error", "message": "User not found"}
    else:
        if ("custom_domains" in user):
            return {"status": "success", "data": user["custom_domains"]}
        else:
            return {"status": "success", "data": []}


@router.get("/users/all-custom-domain")
def get_all_custom_domains():
    users = database["user_list"].find({})

    custom_domains = []

    for document in users:
        if ("custom_domains" in document):
            custom_domains.extend(document['custom_domains'])

    return custom_domains


@router.delete("/users/custom-domain")
def delete_custom_domain(data: dict = Body(...)):
    user = database["user_list"].find_one({"email": data["email"]})
    if (user == None):
        return {"status": "error", "message": "User not found"}
    else:
        if ("custom_domains" in user):
            if (data["domain"] in user["custom_domains"]):
                database["user_list"].update_one({"_id": user['_id']}, {"$pull": {
                    "custom_domains": data["domain"]
                }})
                user = database["user_list"].find_one({"email": data["email"]})
                return {"status": "success", "data": user["custom_domains"]}
            else:
                return {"status": "error", "message": "Custom domain not found"}
        else:
            return {"status": "error", "message": "Custom domain not found"}


@router.get("/utils/check-a-record")
def check_a_record(domain: str):
    # Checks DNS record for the correct A record
    # https://support.cloudflare.com/hc/en-us/articles/360019093151-Managing-DNS-records-in-Cloudflare
    try:
        # server_ip=requests.get('https://checkip.amazonaws.com').text.strip()
        server_ip = elastic_server_ip
        resolver = dns.resolver.Resolver();
        answers = resolver.query(domain, "A")
        for answer in answers:
            if (answer.to_text() == server_ip):
                return {"status": "success"}

        return {"status": "error", "message": "IP address not found in DNS record"}
    except Exception:
        return {"status": "error", "message": "Unknown error"}


@router.get("/utils/server-ip")
def get_server_ip(response: Response):
    try:
        # server_ip=requests.get('https://checkip.amazonaws.com').text.strip()
        return {"status": "success", "data": {"ip": elastic_server_ip}}
    except Exception:
        return {"status": "error", "message": "Unknown error"}


@router.post("/domains/verification")
def check_domain_banned(data: dict = Body(...)):
    try:
        is_domain_banned(data.get("long_url"))
        return "OK"
    except InBannedDomainException:
        raise HTTPException(status_code=400, detail="The domain is blocked")
