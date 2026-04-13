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

# ------------------ HELPERS ------------------

def converter_imagem(imagem: UploadFile):
    np_img = np.frombuffer(imagem.file.read(), np.uint8)
    return cv2.imdecode(np_img, cv2.IMREAD_COLOR)


def resize_if_needed(img, max_size=800):
    h, w = img.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        return cv2.resize(img, (int(w * scale), int(h * scale)))
    return img


def read_mask(mask_file: UploadFile, shape):
    if not mask_file:
        return None

    np_arr = np.frombuffer(mask_file.file.read(), np.uint8)
    mask = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

    if mask is None:
        return None

    _, mask = cv2.threshold(mask, 127, 1, cv2.THRESH_BINARY)

    mask = cv2.resize(mask, (shape[1], shape[0]), interpolation=cv2.INTER_NEAREST)

    return mask


def apply_mask(img, result_full, mask):
    if mask is None:
        return result_full

    return np.where(mask[..., None] == 1, result_full, img)


def encode_img(img):
    _, buffer = cv2.imencode(".jpg", img, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/jpeg")


# ------------------ BRILHO ------------------

@app.post("/brightness")
def brilho(
    imagem: UploadFile = File(...),
    intensidade: int = Form(...),
    mask: UploadFile = File(None)
):
    img = resize_if_needed(converter_imagem(imagem))

    result_full = cv2.add(img, intensidade)

    m = read_mask(mask, img.shape)
    result = apply_mask(img, result_full, m)

    return encode_img(result)


# ------------------ MEDIA ------------------

@app.post("/media")
def media(
    imagem: UploadFile = File(...),
    intensidade: int = Form(...),
    mask: UploadFile = File(None)
):
    img = resize_if_needed(converter_imagem(imagem))

    k = max(1, intensidade)
    result_full = cv2.blur(img, (k, k))

    m = read_mask(mask, img.shape)
    result = apply_mask(img, result_full, m)

    return encode_img(result)


# ------------------ GAUSSIANO ------------------

@app.post("/gaussiano")
def gaussiano(
    imagem: UploadFile = File(...),
    intensidade: int = Form(...),
    mask: UploadFile = File(None)
):
    img = resize_if_needed(converter_imagem(imagem))

    k = intensidade if intensidade % 2 == 1 else intensidade + 1
    k = max(1, k)

    result_full = cv2.GaussianBlur(img, (k, k), 0)

    m = read_mask(mask, img.shape)
    result = apply_mask(img, result_full, m)

    return encode_img(result)


# ------------------ SOBEL ------------------

@app.post("/sobel")
def sobel(
    imagem: UploadFile = File(...),
    intensidade: int = Form(...),
    mask: UploadFile = File(None)
):
    img = resize_if_needed(converter_imagem(imagem))

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    sobelx = cv2.Sobel(gray, cv2.CV_16S, 1, 0, ksize=3)
    sobely = cv2.Sobel(gray, cv2.CV_16S, 0, 1, ksize=3)

    edges = cv2.magnitude(sobelx.astype(np.float32), sobely.astype(np.float32))
    edges = cv2.convertScaleAbs(edges)
    edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    result_full = cv2.addWeighted(img, 1.0, edges, 0.2, 0)

    m = read_mask(mask, img.shape)
    result = apply_mask(img, result_full, m)

    return encode_img(result)


# ------------------ LAPLACIANO ------------------
@app.post("/laplaciano")
def laplaciano(
    imagem: UploadFile = File(...),
    intensidade: int = Form(...),
    mask: UploadFile = File(None)
):
    img = resize_if_needed(converter_imagem(imagem))

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    k = int(intensidade)
    k = max(1, min(k, 31))
    if k % 2 == 0:
        k -= 1

    lap = cv2.Laplacian(gray, cv2.CV_16S, ksize=k)
    lap = cv2.convertScaleAbs(lap)
    lap = cv2.cvtColor(lap, cv2.COLOR_GRAY2BGR)

    result_full = cv2.addWeighted(img, 1.0, lap, 0.2, 0)

    m = read_mask(mask, img.shape)
    result = apply_mask(img, result_full, m)

    return encode_img(result)

# ------------------ SELEÇÃO (OTIMIZADA) ------------------

@app.post("/selecionar_objetos")
def selecionar_objetos(imagem: UploadFile = File(...)):
    img = converter_imagem(imagem)

    h, w = img.shape[:2]

    max_dim = 800
    scale = min(1.0, max_dim / max(h, w))
    small = cv2.resize(img, (int(w * scale), int(h * scale)))

    small = cv2.GaussianBlur(small, (5, 5), 0)

    sh, sw = small.shape[:2]

    mask = np.zeros((sh, sw), np.uint8)


    rect = (1, 1, sw - 2, sh - 2)

    bgdModel = np.zeros((1, 65), np.float64)
    fgdModel = np.zeros((1, 65), np.float64)


    cv2.grabCut(
        small,
        mask,
        rect,
        bgdModel,
        fgdModel,
        5,
        cv2.GC_INIT_WITH_RECT
    )

    mask_bin = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD),
        255,
        0
    ).astype("uint8")


    kernel = np.ones((3, 3), np.uint8)
    mask_bin = cv2.morphologyEx(mask_bin, cv2.MORPH_OPEN, kernel, iterations=1)
    mask_bin = cv2.morphologyEx(mask_bin, cv2.MORPH_DILATE, kernel, iterations=1)

  
    mask_bin = cv2.resize(mask_bin, (w, h), interpolation=cv2.INTER_NEAREST)

    _, buffer = cv2.imencode(".png", mask_bin)
    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/png")