from enum import Enum
from typing import Optional
from datetime import date, datetime

from pydantic import BaseModel, Field, validator


class InBannedDomainException(Exception):
    pass

class InPreventedDomainException(Exception):
    pass


class URLType(str, Enum):
    SHORT = "short"
    LONG = "long"


class ShortenCreate(BaseModel):
    brand_domain: str
    long_url: str
    user_id: Optional[str] = None
    time_limit: Optional[str] = None
    click_limit: Optional[int] = None
    go_rougue: Optional[int] = None
    not_child: Optional[int] = None
    not_work: Optional[int] = None
    contains_politics: Optional[int] = None
    contains_promotions: Optional[int] = None
    contains_violence: Optional[int] = None

    @validator("long_url")
    def validate_long_url(value: str) -> str:
        return value.strip()


class ShortenOut(ShortenCreate):
    key: str = Field(..., alias="_key")
    mini_link: str
    seq: int
    epoch_elapsed: float
    validity: int


class UTMParameters(BaseModel):
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_term: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None


class Location(BaseModel):
    ip: Optional[str]
    type: Optional[str]
    continent_code: Optional[str]
    continent_name: Optional[str]
    country_code: Optional[str]
    country_name: Optional[str]
    region_code: Optional[str]
    region_name: Optional[str]
    city: Optional[str]
    zip: Optional[str]
    latitude: Optional[str]
    longitude: Optional[str]


class UserData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    custom_domains: Optional[list] = None
    short_description: Optional[str] = None
    stripe_subscription_status: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None


class Payment(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    amount: Optional[float] = None
    stripe_customer_id: Optional[str] = None
    payment_event_type: Optional[str] = None


class ShortenInDB(UTMParameters, Location, UserData):
    long_url: str
    key: str = Field(..., alias="_key")
    mini_link: str
    seq: int
    brand_domain: str
    epoch_elapsed: float
    validity: str
    short_url_uuid: Optional[str]
    user_agent: str
    date_time: str
    time_limit: Optional[datetime] = None
    click_limit: Optional[int] = None
    last_clicked_on: Optional[datetime] = None
    go_rougue: Optional[int] = None
    not_child: Optional[int] = None
    not_work: Optional[int] = None
    contains_politics: Optional[int] = None
    contains_promotions: Optional[int] = None
    contains_violence: Optional[int] = None


class DashboardData(BaseModel):
    linechart_datasets: Optional[dict] = {}
    map_datasets: Optional[dict] = {}
    urls: Optional[list] = []


class UserAgent(Location):
    user_id: Optional[str] = None
    type: Optional[str] = None
    browser: Optional[str] = None
    device: Optional[str] = None
    os: Optional[str] = None
    short_url: Optional[str] = None
    long_url: Optional[str] = None
    time_stamp: Optional[datetime] = None
    user_agent: Optional[str] = None


class BannedDomain(BaseModel):
    domain: str = None
    created_at: Optional[datetime] = datetime.utcnow().timestamp()
    note: str = None


class PreventedDomain(BaseModel):
    domain: str = None
    created_at: Optional[datetime] = datetime.utcnow().timestamp()
    note: str = None
