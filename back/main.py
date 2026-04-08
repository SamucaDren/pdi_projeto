from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import io
from typing import Optional
import json

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
    img = converter_imagem(imagem)
    
    resultado = cv2.add(img, intensidade)
    
    _, buffer = cv2.imencode(".png", resultado)

    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/media")
async def  desfoque(imagem : UploadFile = File(...), intensidade : int = Form(...)):
    img = converter_imagem(imagem)
    
    k = max(1, intensidade)

    resultado = cv2.blur(img, (k, k))
    
    _, buffer = cv2.imencode(".png", resultado)
    
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/gaussiano")
async def  desfoque(imagem : UploadFile = File(...), intensidade : int = Form(...)):
    
    img = converter_imagem(imagem)
    
    # kernel precisa ser ímpar
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)   

    resultado = cv2.GaussianBlur(img, (k, k), 0)
    
    _, buffer = cv2.imencode(".png", resultado)
    
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/sobel")
async def nitidez_sobel(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    
    img = await converter_imagem(imagem)
    
    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

    # calcula as bordas horizontais
    sobel_x = cv2.Sobel(cinza, cv2.CV_64F, 1, 0, ksize=k)

    # calcula as bordas verticais
    sobel_y = cv2.Sobel(cinza, cv2.CV_64F, 0, 1, ksize=k)

    # combina as duas direções de borda
    bordas = cv2.magnitude(sobel_x, sobel_y)

    # converte para formato de imagem normal
    bordas = cv2.convertScaleAbs(bordas)

    # transforma bordas em 3 canais para somar com a imagem original
    bordas = cv2.cvtColor(bordas, cv2.COLOR_GRAY2BGR)

    # soma as bordas com a imagem original para aumentar nitidez
    resultado = cv2.addWeighted(img, 1.0, bordas, 0.1, 0)

    # codifica a imagem para PNG
    _, buffer = cv2.imencode(".png", resultado)

    # envia a imagem de volta
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/laplaciano")
async def nitidez_laplaciano(imagem: UploadFile = File(...), intensidade: int = Form(...)):

    # converte imagem enviada
    img = await converter_imagem(imagem)

    # converte para escala de cinza
    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # garante kernel ímpar
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

    # calcula o laplaciano (detecção de detalhes)
    laplaciano = cv2.Laplacian(cinza, cv2.CV_64F, ksize=k)

    # converte para imagem normal
    laplaciano = cv2.convertScaleAbs(laplaciano)

    # transforma em 3 canais
    laplaciano = cv2.cvtColor(laplaciano, cv2.COLOR_GRAY2BGR)

    # adiciona detalhes à imagem original
    resultado = cv2.addWeighted(img, 1.0, laplaciano, 0.1, 0)

    # codifica a imagem
    _, buffer = cv2.imencode(".png", resultado)

    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")


async def converter_imagem(imagem : UploadFile = File(...)):
    conteudo = await imagem.read()
    np_img = np.frombuffer(conteudo, np.uint8)
    img = img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    return img