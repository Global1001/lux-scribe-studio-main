from fastapi import APIRouter, Request, Response, HTTPException
from fastapi.responses import JSONResponse
from app.config.environment import env_config
from jose import jwt
from docx import Document
import os
import datetime
import httpx
import secrets
import string

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "../../../uploads")


@router.options("/editor-config")
async def handle_options():
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info, apikey",
    })

@router.post("/editor-config")
async def editor_config(request: Request):
    try:
        body = await request.json()
        file_type = body.get("fileType")

        if file_type == "new":
            key = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
            title = "Untitled Document"
            file_name = "Document.docx"
            document_type = "docx"
            base_url = body.get("baseUrl")
            theme = body.get("theme")

            onlyoffice_secret = env_config.ONLYOFFICE_SECRET

            if not all([file_type, base_url, theme]):
                raise HTTPException(status_code=400, detail="Missing required fields.")

            new_file_path = os.path.join(UPLOAD_DIR, file_name)
            new_index = 1
            while os.path.exists(new_file_path):
                file_name = f"Document({new_index}).docx"
                new_file_path = os.path.join(UPLOAD_DIR, file_name)
                new_index = new_index + 1
            doc = Document()
            doc.save(new_file_path)

            expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            payload = {
                "document": {
                    "fileType": 'docx',
                    "key": key,
                    "title": title,
                    "url": f"{base_url}/uploads/{file_name}"
                },
                "editorConfig": {
                    "callbackUrl": f"{base_url}/api/v1/document/callback?filename={file_name}"
                },
                "exp": int(expires_at.timestamp())
            }

            token = jwt.encode(payload, onlyoffice_secret, algorithm="HS256")

            response_payload = {
                **payload,
                "width": "100%",
                "height": "100%",
                "type": "desktop",
                "documentType": "word",
                "token": token,
                "document": {
                    **payload["document"],
                    "token": token,
                },
                "editorConfig": {
                    **payload["editorConfig"],
                    "customization": {
                        "forcesave": True,
                        "uiTheme": f"theme-{theme}",
                        "zoom": -2
                    },
                    "token": token
                }
            }
        else:
            key = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(64))
            title = body.get("title")
            file_name = body.get("fileName")
            document_type = body.get("documentType")
            base_url = body.get("baseUrl")
            theme = body.get("theme")

            onlyoffice_secret = env_config.ONLYOFFICE_SECRET

            if not all([file_type, title, file_name, document_type, base_url, theme]):
                raise HTTPException(status_code=400, detail="Missing required fields.")

            expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            payload = {
                "document": {
                    "fileType": file_type,
                    "key": key,
                    "title": title,
                    "url": f"{base_url}/uploads/{file_name}"
                },
                "editorConfig": {
                    "callbackUrl": f"{base_url}/api/v1/document/callback?filename={file_name}"
                },
                "exp": int(expires_at.timestamp())
            }

            token = jwt.encode(payload, onlyoffice_secret, algorithm="HS256")

            response_payload = {
                **payload,
                "width": "100%",
                "height": "100%",
                "type": "desktop",
                "documentType": "word",
                "token": token,
                "document": {
                    **payload["document"],
                    "token": token,
                },
                "editorConfig": {
                    **payload["editorConfig"],
                    "customization": {
                        "forcesave": True,
                        "uiTheme": f"theme-{theme}",
                        "zoom": -2
                    },
                    "token": token
                }
            }

        return JSONResponse(status_code=200, content=response_payload, headers={
            "Access-Control-Allow-Origin": "*",
        })

    except Exception as e:
        print(e)
        return JSONResponse(status_code=500, content={"error": str(e)}, headers={
            "Access-Control-Allow-Origin": "*"
        })

@router.options("/callback")
async def handle_callback_options():
    return Response(status_code=204, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, x-client-info",
    })

@router.post("/callback")
async def handle_callback(request: Request):
    try:
        body = await request.json()
        status = body.get("status")
        
        # Only act on final save statuses
        if status in [2, 3, 6, 7]:
            query = dict(request.query_params)
            file_name = query.get("filename")
            download_url = body.get("url")

            if not file_name or not download_url:
                raise HTTPException(status_code=400, detail="Missing fileName or download URL")

            # Download file from OnlyOffice
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    download_url,
                    headers={"Authorization": f"Bearer {body.get('token')}"}
                )
                if res.status_code != 200:
                    raise HTTPException(status_code=500, detail="Failed to download file from OnlyOffice")
                content = res.content

            file_path = os.path.join(UPLOAD_DIR, file_name)

            # Overwrite file locally
            with open(file_path, "wb") as f:
                f.write(content)

            return JSONResponse(
                status_code=200,
                content={"status": "saved", "error": 0},
                headers={"Access-Control-Allow-Origin": "*"}
            )

        return JSONResponse(
            status_code=200,
            content={"status": "ignored", "error": 0},
            headers={"Access-Control-Allow-Origin": "*"}
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)},
            headers={
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            }
        )
