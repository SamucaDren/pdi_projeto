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

@app.post("/brightness")
async def brilho(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    conteudo = await imagem.read()
    
    np_img = np.frombuffer(conteudo, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    resultado = cv2.add(img, intensidade)
    
    _, buffer = cv2.imencode(".png", resultado)

    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/media")
async def  desfoque(imagem : UploadFile = File(...), intensidade : int = Form(...)):
    conteudo = await imagem.read()
    
    np_img = np.frombuffer(conteudo, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    k = max(1, intensidade)

    resultado = cv2.blur(img, (k, k))
    
    _, buffer = cv2.imencode(".png", resultado)
    
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/gaussiano")
async def  desfoque(imagem : UploadFile = File(...), intensidade : int = Form(...)):
    conteudo = await imagem.read()
    
    np_img = np.frombuffer(conteudo, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    # kernel precisa ser ímpar
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)   

    resultado = cv2.GaussianBlur(img, (k, k), 0)
    
    _, buffer = cv2.imencode(".png", resultado)
    
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")
    