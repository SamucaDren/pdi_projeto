import type { Tab } from "./types";

export async function applyFilters(activeTab: Tab): Promise<string> {
  let currentFile: File | Blob = activeTab.file;

  for (const filter of activeTab.filters) {
    const formData = new FormData();

    formData.append("file", currentFile);
    formData.append("filter", filter.filter);
    formData.append("valor", String(filter.valor));

    const res = await fetch("http://localhost:8000/teste_de_api", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();

    currentFile = blob;
  }

  return URL.createObjectURL(currentFile);
}
