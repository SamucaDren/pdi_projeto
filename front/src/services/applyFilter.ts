import type { Tab, FilterAply } from "../types";

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
