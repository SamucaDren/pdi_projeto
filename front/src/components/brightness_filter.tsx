import { useState } from "react";
import Slider from "./Slider";
import "./brightness_filter.css";
import type { FilterAply } from "../types";

/*
async function ApplyBrightnessFilter(
  brightness: number,
  activeTab: Tab | undefined,
  onApply: (url: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) {
  if (!activeTab) return;

  setLoading(true);

  const formData = new FormData();
  formData.append("file", activeTab.file);
  formData.append("intensidade", String(brightness));

  const res = await fetch("http://localhost:8000/brightness", {
    method: "POST",
    body: formData,
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  activeTab.previewUrl = url;
  activeTab.filters.push({ filter: "brilho", valor: brightness });

  onApply(url);

  setLoading(false);
}
*/

//function ApplyBightnessFilter01(brightness: number) {console.log(brightness)}

type BrightnessFilterProps = {
  //activeTab?: Tab;
  // onApply: (url: string) => void;
  getMask?: () => boolean[][] | undefined;
  filterAply: (filter: FilterAply) => void;
};

function BrightnessFilter({
  //activeTab,
  // onApply,
  filterAply,
}: BrightnessFilterProps) {
  const [brightness, setBrightness] = useState(0);
  //const [loading, setLoading] = useState(false);
  return (
    <div className="container_brightness_filter">
      <div className="brightness_filter">
        <span className="filter_title">Brilho</span>
        <span className="filter_subtitle">
          Ajusta a luminosidade da imagem, clareando ou escurecendo os pixels de
          forma uniforme.
        </span>
        <span className="line"></span>

        <span className="filter_subtitle">Valor:</span>
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
        // disabled={loading}
        onClick={() =>
          filterAply({
            filter: "brilho",
            valor: brightness,
          })
        }
      >
        {/*loading ? "Processando..." : "Aplicar Filtro"*/}
        Aplicar Filtro
      </button>
    </div>
  );
}

export default BrightnessFilter;
