from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ ROTAS ------------------

@app.post("/brightness")
async def brilho(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    img = await converter_imagem(imagem)
    
    resultado = cv2.add(img, intensidade)
    
    _, buffer = cv2.imencode(".png", resultado)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")


@app.post("/media")
async def desfoque_media(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    img = await converter_imagem(imagem)
    
    k = max(1, intensidade)
    resultado = cv2.blur(img, (k, k))
    
    _, buffer = cv2.imencode(".png", resultado)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")


@app.post("/gaussiano")
async def desfoque_gaussiano(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    img = await converter_imagem(imagem)
    
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

    resultado = cv2.GaussianBlur(img, (k, k), 0)
    
    _, buffer = cv2.imencode(".png", resultado)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")


@app.post("/sobel")
async def nitidez_sobel(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    img = await converter_imagem(imagem)
    
    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    k = int(intensidade)

    # garantir ímpar
    if k % 2 == 0:
        k += 1

    # limitar entre 1 e 31
    k = max(1, min(k, 31))

    sobel_x = cv2.Sobel(cinza, cv2.CV_64F, 1, 0, ksize=k)
    sobel_y = cv2.Sobel(cinza, cv2.CV_64F, 0, 1, ksize=k)

    bordas = cv2.magnitude(sobel_x, sobel_y)
    bordas = cv2.convertScaleAbs(bordas)
    bordas = cv2.cvtColor(bordas, cv2.COLOR_GRAY2BGR)

    resultado = cv2.addWeighted(img, 1.0, bordas, 0.1, 0)

    _, buffer = cv2.imencode(".png", resultado)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

@app.post("/laplaciano")
async def nitidez_laplaciano(imagem: UploadFile = File(...), intensidade: int = Form(...)):
    img = await converter_imagem(imagem)

    cinza = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    k = int(intensidade)

    # garantir ímpar
    if k % 2 == 0:
        k += 1

    # limitar entre 1 e 31
    k = max(1, min(k, 31))

    laplaciano = cv2.Laplacian(cinza, cv2.CV_64F, ksize=k)
    laplaciano = cv2.convertScaleAbs(laplaciano)
    laplaciano = cv2.cvtColor(laplaciano, cv2.COLOR_GRAY2BGR)

    resultado = cv2.addWeighted(img, 1.0, laplaciano, 0.1, 0)

    _, buffer = cv2.imencode(".png", resultado)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")

# ------------------ FUNÇÃO AUXILIAR ------------------

async def converter_imagem(imagem: UploadFile):
    conteudo = await imagem.read()
    np_img = np.frombuffer(conteudo, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    return img



    
# ------------------ SELEÇÃO (OTIMIZADA) ------------------
@app.post("/selecionar_objetos")
async def selecionar_objetos(imagem: UploadFile = File(...)):
    img = await converter_imagem(imagem)

    h, w = img.shape[:2]


    scale = 0.5 if max(h, w) < 1000 else 0.3
    small = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    small = cv2.GaussianBlur(small, (3, 3), 0)

    sh, sw = small.shape[:2]

    mask = np.zeros((sh, sw), np.uint8)

    rect = (1, 1, sw - 2, sh - 2)

    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)

    cv2.grabCut(small, mask, rect, bgdModel, fgdModel, 2, cv2.GC_INIT_WITH_RECT)

    mask_bin = ((mask == 1) | (mask == 3)).astype("uint8") * 255

    kernel = np.ones((3, 3), np.uint8)

    mask_bin = cv2.morphologyEx(mask_bin, cv2.MORPH_CLOSE, kernel)

    mask_bin = cv2.resize(mask_bin, (w, h), interpolation=cv2.INTER_NEAREST)

    _, buffer = cv2.imencode(".png", mask_bin)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")