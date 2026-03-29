import React, { useState } from "react";
import Slider from "./Slider";
import "./brightness_filter.css";
import type { Tab } from "../types";

//FUNÇÃO QUE APLICA O FILTRO DE BRILHO CHAMANDO A API
async function ApplyBrightnessFilter(
  brightness: number,
  activeTab: Tab | undefined,
  //  onApply: (tab: Tab) => void,

  onApply: (tab: string) => void,
) {
  if (!activeTab) return;

  const formData = new FormData();
  formData.append("file", activeTab.file);
  formData.append("valor_sub", String(brightness));

  const res = await fetch("http://localhost:8000/teste_de_api", {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  activeTab.previewUrl = url;
  activeTab.filters.push({ filter: "brilho", valor: brightness });
  onApply(url);
}

type BrightnessFilterProps = {
  activeTab?: Tab;
  onApply: (url: string) => void;
};

function BrightnessFilter({ activeTab, onApply }: BrightnessFilterProps) {
  const [brightness, setBrightness] = useState(0);

  return (
    <div className="container_brightness_filter">
      <div className="brightness_filter">
        <span className="filter_title">Brilho</span>

        <Slider
          value={brightness}
          setValue={setBrightness}
          min={-100}
          max={100}
          orientation="horizontal"
        />
      </div>
      <button
        className="apply_button button_red"
        onClick={() => ApplyBrightnessFilter(brightness, activeTab, onApply)}
      >
        Aplicar Filtro
      </button>
    </div>
  );
}
export default BrightnessFilter;
