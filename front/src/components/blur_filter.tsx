import { useState } from "react";
import Slider from "./Slider";
import "./blur_filter.css";
import type { FilterAply } from "../types";

type BlurFilterProps = {
  // activeTab?: Tab;
  // onApply: (url: string) => void;

  filterAply: (filter: FilterAply) => void;
};

/*
async function ApplyBlurFilter(
  desfoque: number,
  tipo: string,
  activeTab: Tab | undefined,
  onApply: (tab: string) => void,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
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
}*/

function BlurFilter({
  //activeTab,
  filterAply,
  //  onApply
}: BlurFilterProps) {
  const [blur, setBlur] = useState(0);
  const [tipo, setTipo] = useState("media");
  // const [loading, setLoading] = useState(false);

  return (
    <div className="blur-filter_container">
      <div className="brightness_filter">
        <span className="filter_title">Desfoque</span>
        <span className="line"></span>
        <span className="filter_subtitle">Tipo de Desfoque</span>
        <select
          className="selectType"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="media">Média</option>
          <option value="gaussiano">Gaussiano</option>
        </select>

        <span className="filter_subtitle">Peso:</span>
        <Slider
          value={blur}
          setValue={setBlur}
          min={0}
          max={100}
          orientation="horizontal"
        />
      </div>
      <button
        className="apply_button button_red"
        //disabled={loading}
        onClick={() =>
          filterAply({
            filter: "desfoque",
            valor: blur,
            type:
              tipo === "gaussiano"
                ? "gaussiano"
                : tipo === "media"
                  ? "media"
                  : undefined,
          })
        }
      >
        {/*loading ? "Processando..." : "Aplicar Filtro"*/}
        Aplicar Filtro
      </button>
    </div>
  );
}
export default BlurFilter;
