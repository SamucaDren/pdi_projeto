import { useState } from "react";
import Slider from "./Slider";
import "./blur_filter.css";
import type { Tab } from "../types";

type HighFilterProps = {
  activeTab?: Tab;
  onApply: (url: string) => void;
};

async function ApplyHighFilter(
  realce: number,
  tipo : string,
  activeTab: Tab | undefined,  
  onApply: (tab: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (!activeTab) return;

  setLoading(true);

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
  activeTab.previewUrl = url;
  activeTab.filters.push({ filter: "realce", valor: realce });
  onApply(url);
  setLoading(false);
}

function HighFilter({ activeTab, onApply }: HighFilterProps) {
  const [blur, setBlur] = useState(0);
  const [tipo, setTipo] = useState("sobel");
  const [loading, setLoading] = useState(false);

  return (
    <div className="blur-filter_container">
      <div className="brightness_filter">
        <span className="filter_title">Desfoque</span>
        <span className="filter_title">Tipo de Desfoque</span>
        <select        
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="sobel">Sobel</option>
          <option value="laplaciano">Laplaciano</option>
        </select>


        <Slider
          value={blur}
          setValue={setBlur}
          min={0}
          max={50}
          orientation="horizontal"
        />
      </div>
      <button
        className="apply_button button_red"
        disabled={loading}
        onClick={() => ApplyHighFilter(blur, tipo, activeTab, onApply, setLoading)}
      >
        {loading ? "Processando..." : "Aplicar Filtro"}
      </button>
    </div>
  );
}
export default HighFilter;
