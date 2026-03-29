import React, { useState } from "react";
import Slider from "./Slider";
import "./brightness_filter.css";
import type { Tab } from "../types";

async function ApplyBrightnessFilter(
  brightness: number,
  activeTab: Tab | undefined,
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
  console.log(url);
}

type BrightnessFilterProps = {
  activeTab?: Tab;
};

function BrightnessFilter({ activeTab }: BrightnessFilterProps) {
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
        onClick={() => ApplyBrightnessFilter(brightness, activeTab)}
      >
        Aplicar Filtro
      </button>
    </div>
  );
}
export default BrightnessFilter;
