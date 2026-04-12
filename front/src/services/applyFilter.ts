// FRONTEND - ApplyFilter + máscara convertida para PNG

import type { Tab, FilterAply, TypeOfBlur } from "../types";

// ---------------- CONVERSOR BOOLEAN[][] -> PNG ----------------

function maskToPngFile(mask: boolean[][]): Promise<File> {
  return new Promise((resolve) => {
    const height = mask.length;
    const width = mask[0].length;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const value = mask[y][x] ? 255 : 0;

        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      resolve(
        new File([blob], "mask.png", {
          type: "image/png",
        }),
      );
    }, "image/png");
  });
}

// ---------------- ENTRYPOINT ----------------

export async function ApplyFilter({
  tab,
  filter,
}: {
  tab: Tab;
  filter: FilterAply;
}): Promise<Tab | undefined> {
  if (!tab) return undefined;

  if (filter.filter === "brilho") {
    return ApplyBrightnessFilter(filter.valor, tab);
  }

  if (filter.filter === "desfoque") {
    return ApplyBlurFilter(filter.valor, filter.type as string, tab);
  }

  if (filter.filter === "realce") {
    return ApplyHighFilter(filter.valor, filter.type as string, tab);
  }

  return undefined;
}

// ---------------- BRILHO ----------------

async function ApplyBrightnessFilter(
  brightness: number,
  activeTab: Tab,
): Promise<Tab> {
  const formData = new FormData();

  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(brightness));

  if (activeTab.maskFilter) {
    const maskFile = await maskToPngFile(activeTab.maskFilter);
    formData.append("mask", maskFile);
  }

  const res = await fetch("http://localhost:8000/brightness", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Erro no endpoint /brightness");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return {
    ...activeTab,
    previewUrl: url,
    filters: [...activeTab.filters, { filter: "brilho", valor: brightness }],
  };
}

// ---------------- DESFOQUE ----------------

async function ApplyBlurFilter(
  desfoque: number,
  tipo: string,
  activeTab: Tab,
): Promise<Tab> {
  const formData = new FormData();

  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(desfoque));

  if (activeTab.maskFilter) {
    const maskFile = await maskToPngFile(activeTab.maskFilter);
    formData.append("mask", maskFile);
  }

  let endpoint = "";
  if (tipo === "media") endpoint = "http://localhost:8000/media";
  if (tipo === "gaussiano") endpoint = "http://localhost:8000/gaussiano";

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Erro no endpoint blur");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return {
    ...activeTab,
    previewUrl: url,
    filters: [
      ...activeTab.filters,
      { filter: "desfoque", valor: desfoque, type: tipo as TypeOfBlur },
    ],
  };
}

// ---------------- REALCE ----------------

async function ApplyHighFilter(
  realce: number,
  tipo: string,
  activeTab: Tab,
): Promise<Tab> {
  const formData = new FormData();

  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(realce));

  if (activeTab.maskFilter) {
    const maskFile = await maskToPngFile(activeTab.maskFilter);
    formData.append("mask", maskFile);
  }

  let endpoint = "";
  if (tipo === "sobel") endpoint = "http://localhost:8000/sobel";
  if (tipo === "laplaciano") endpoint = "http://localhost:8000/laplaciano";

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Erro no endpoint realce");

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return {
    ...activeTab,
    previewUrl: url,
    filters: [
      ...activeTab.filters,
      { filter: "realce", valor: realce, type: tipo as TypeOfBlur },
    ],
  };
}
