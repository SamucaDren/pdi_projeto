import React, { useState } from "react";
import Slider from "./Slider";
import "./blur_filter.css";
import type { Tab } from "../types";

type BlurFilterProps = {
  activeTab?: Tab;
  onApply: (url: string) => void;
};

async function ApplyBlurFilter(
  brightness: number,
  activeTab: Tab | undefined,
  //  onApply: (tab: Tab) => void,

  onApply: (tab: string) => void,
) {
  if (!activeTab) return;

  const formData = new FormData();
  formData.append("file", activeTab.file);
  formData.append("valor_sub", String(brightness));

  //AJUSTAR DEPOIS PARA O ENDPOINT DE DESFOQUE
  const res = await fetch("http://localhost:8000/brightness", {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  activeTab.previewUrl = url;
  activeTab.filters.push({ filter: "brilho", valor: brightness });
  onApply(url);
}

function BlurFilter({ activeTab, onApply }: BlurFilterProps) {
  const [blur, setBlur] = useState(0);

  return (
    <div className="blur-filter_container">
      <div className="brightness_filter">
        <span className="filter_title">Desfoque</span>

        <Slider
          value={blur}
          setValue={setBlur}
          min={0}
          max={10}
          orientation="horizontal"
        />
      </div>
      <button
        className="apply_button button_red"
        onClick={() => ApplyBlurFilter(blur, activeTab, onApply)}
      >
        Aplicar Filtro
      </button>
    </div>
  );
}
export default BlurFilter;
