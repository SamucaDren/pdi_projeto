import type { Tab, FilterAply, TypeOfBlur } from "../types";

type ApplyFilterProps = {
  tab: Tab;
  filter: FilterAply;
};

export async function ApplyFilter({
  tab,
  filter,
}: ApplyFilterProps): Promise<Tab | undefined> {
  if (filter.filter === "brilho") {
    return ApplyBrightnessFilter(filter.valor, tab);
  } else if (filter.filter === "desfoque") {
    return ApplyBlurFilter(filter.valor, filter.type as string, tab);
  } else if (filter.filter === "realce") {
    return ApplyHighFilter(filter.valor, filter.type as string, tab);
  } else {
    return undefined;
  }
}

async function ApplyBrightnessFilter(
  brightness: number,
  activeTab: Tab,
): Promise<Tab | undefined> {
  if (!activeTab) return;

  const formData = new FormData();
  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(brightness));

  const res = await fetch("http://localhost:8000/brightness", {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return {
    ...activeTab,
    previewUrl: url,
    filters: [...activeTab.filters, { filter: "brilho", valor: brightness }],
  };
}

async function ApplyBlurFilter(
  desfoque: number,
  tipo: string,
  activeTab: Tab | undefined,
): Promise<Tab | undefined> {
  if (!activeTab) return undefined;

  const formData = new FormData();
  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(desfoque));

  let endpoint = "";

  if (tipo === "media") {
    endpoint = "http://localhost:8000/media";
  } else if (tipo === "gaussiano") {
    endpoint = "http://localhost:8000/gaussiano";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

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

async function ApplyHighFilter(
  realce: number,
  tipo: string,
  activeTab: Tab | undefined,
): Promise<Tab | undefined> {
  if (!activeTab) return;

  const formData = new FormData();
  formData.append("imagem", activeTab.file);
  formData.append("intensidade", String(realce));

  let endpoint = "";

  if (tipo === "sobel") {
    endpoint = "http://localhost:8000/sobel";
  } else if (tipo === "laplaciano") {
    endpoint = "http://localhost:8000/laplaciano";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  return {
    ...activeTab,
    previewUrl: url,
    filters: [
      ...activeTab.filters,
      { filter: "desfoque", valor: realce, type: tipo as TypeOfBlur },
    ],
  };
}
