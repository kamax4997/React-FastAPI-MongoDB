from pymongo import MongoClient

from app.config import settings

client = MongoClient(settings.MONGO_URL)
database = client["links"]
