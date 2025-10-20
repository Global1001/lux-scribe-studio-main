import sys
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env or env.example from project root
root = Path(__file__).resolve().parents[3]
env_path = root / ".env"
example_path = root / "env.example"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print("Loaded environment from .env")
elif example_path.exists():
    load_dotenv(dotenv_path=example_path)
    print("Loaded environment from env.example")
else:
    print("No .env or env.example file found at", root)
    sys.exit(1)

from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

print(f"SUPABASE_URL: {SUPABASE_URL}")
if SUPABASE_SERVICE_KEY:
    print(f"SUPABASE_SERVICE_KEY: {SUPABASE_SERVICE_KEY[:6]}...{SUPABASE_SERVICE_KEY[-6:]}")
else:
    print("SUPABASE_SERVICE_KEY is missing or empty!")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment.")
    sys.exit(1)

try:
    print("Creating Supabase client...")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("Listing buckets...")
    buckets = supabase.storage.list_buckets()
    print("Supabase connection successful. Buckets:", buckets)
except Exception as e:
    print("Supabase connection failed:", str(e))
    sys.exit(1)
except BaseException as e:
    print("Unexpected error:", str(e))
    sys.exit(1) 