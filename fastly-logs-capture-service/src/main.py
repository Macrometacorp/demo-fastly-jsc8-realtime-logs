from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from c8 import C8Client
from src.config import GDN_URL, GDN_API_KEY, COLLECTION_NAME, SERVICE_ID

import hashlib

app = FastAPI(
    title="fastly-challenge-logs-api",
)

client = C8Client(
    protocol="https",
    host=GDN_URL,
    port=443,
    apikey=GDN_API_KEY
)


@app.get("/ping", summary="Check that the service is operational")
def pong():
    """
    Sanity check - this will let the user know that the service is operational.
    """
    return {"ping": "pong!"}


@app.get("/", response_class=PlainTextResponse)
@app.get("/.well-known/fastly/logging/challenge", response_class=PlainTextResponse)
def fastly_http_challenge():
    checksum = hashlib.sha256(SERVICE_ID.encode('utf-8')).hexdigest()
    return checksum


@app.post("/logs")
async def post_logs_to_gdn(request: Request):
    requestBody = await request.json()

    client.insert_document(
        collection_name=COLLECTION_NAME, document=requestBody)
    return
