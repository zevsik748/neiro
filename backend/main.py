
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import requests
import os

app = FastAPI()

# Разрешаем все источники для теста
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

KIE_API_KEY = os.getenv("KIE_API_KEY", "<ВАШ_API_КЛЮЧ>")
KIE_API_URL = "https://kie.ai/api/generate"

@app.post("/generate")
def generate_image(prompt: str = "nano banana"):
    headers = {"Authorization": f"Bearer {KIE_API_KEY}"}
    payload = {"prompt": prompt}
    try:
        response = requests.post(KIE_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
