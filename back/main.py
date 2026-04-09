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
    
    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

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

    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

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