import type { FilterAply } from "../types";

type AcneFilterProps = {
  getMask?: () => boolean[][] | undefined;
  filterAply: (filter: FilterAply) => void;
};

function AcneFilter({ filterAply }: AcneFilterProps) {
  return (
    <div className="container_brightness_filter">
      <div className="brightness_filter">
        <span className="filter_title">Removedor de Espinhas</span>
        <span className="filter_subtitle">
          Remove imperfeições da pele a partir de uma área selecionada,
          suavizando a região de forma mais natural.
        </span>
        <span className="line"></span>
      </div>
      <button
        className="apply_button button_red"
        onClick={() =>
          filterAply({
            filter: "acne",
          })
        }
      >
        Aplicar Filtro
      </button>
    </div>
  );
}

export default AcneFilter;
