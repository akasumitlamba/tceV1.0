from pymongo import MongoClient
import os

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/")
DB_NAME = os.environ.get("DB_NAME", "test_execution_tracker")

client = MongoClient(MONGO_URL)
db = client[DB_NAME] 