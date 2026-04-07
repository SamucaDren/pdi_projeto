import { useState } from "react";
import Slider from "./Slider";
import "./blur_filter.css";
import type { Tab } from "../types";

type BlurFilterProps = {
  activeTab?: Tab;
  onApply: (url: string) => void;
};

async function ApplyBlurFilter(
  desfoque: number,
  tipo : string,
  activeTab: Tab | undefined,  
  onApply: (tab: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (!activeTab) return;

  setLoading(true);

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
  activeTab.previewUrl = url;
  activeTab.filters.push({ filter: "desfoque", valor: desfoque });
  onApply(url);
  setLoading(false);
}

function BlurFilter({ activeTab, onApply }: BlurFilterProps) {
  const [blur, setBlur] = useState(0);
  const [tipo, setTipo] = useState("media");
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
          <option value="media">Média</option>
          <option value="gaussiano">Gaussiano</option>
        </select>


        <Slider
          value={blur}
          setValue={setBlur}
          min={0}
          max={30}
          orientation="horizontal"
        />
      </div>
      <button
        className="apply_button button_red"
        disabled={loading}
        onClick={() => ApplyBlurFilter(blur, tipo, activeTab, onApply, setLoading)}
      >
        {loading ? "Processando..." : "Aplicar Filtro"}
      </button>
    </div>
  );
}
export default BlurFilter;
