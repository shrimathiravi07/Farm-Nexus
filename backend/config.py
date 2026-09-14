import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

JWT_SECRET = os.getenv(
    "JWT_SECRET",
    "farmnexus_super_secret_key_2026"
)

JWT_EXPIRE_DAYS = int(
    os.getenv("JWT_EXPIRE_DAYS", "30")
)