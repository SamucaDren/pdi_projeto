from fastapi import FastAPI, UploadFile, File, Form
import cv2
import numpy as np
from fastapi.responses import StreamingResponse
import io
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/teste_de_api")
async def teste_de_api(file: UploadFile = File(...), valor_sub: int = Form(...)):
    conteudo = await file.read()
    
    np_img = np.frombuffer(conteudo, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    resultado = cv2.add(img, -valor_sub)
    
    _, buffer = cv2.imencode(".png", resultado)

    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")