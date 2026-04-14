import type { FilterAply } from "../types";

type AcneFilterProps = {  
  getMask?: () => boolean[][] | undefined;
  filterAply: (filter: FilterAply) => void;
};

function AcneFilter({  
  filterAply,
}: AcneFilterProps) {  
  
  return (
    <div className="container_brightness_filter">
      <div className="brightness_filter">
        <span className="filter_title">Espinhas</span>
        <span className="line"></span>               
      </div>
      <button
        className="apply_button button_red"        
        onClick={() =>
          filterAply({
            filter: "acne"            
          })
        }
      >        
        Aplicar Filtro
      </button>
    </div>
  );
}

export default AcneFilter;
