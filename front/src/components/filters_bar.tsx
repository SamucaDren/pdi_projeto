import "./filters_bar.css";
import type {
  //Tab,
  Filter,
  FilterAply,
} from "../types";
import BrightnessFilter from "./brightness_filter";
import BlurFilter from "./blur_filter";
import HighFilter from "./high_filter";
import AcneFilter from "./acne_filter";

type FiltersBarProps = {
  activeFilter: Filter | null;  
  filter: (filter: FilterAply) => void;  
};

function FiltersBar({
  activeFilter,  
  filter,
}: FiltersBarProps) {
  return (
    <div className="filters_bar">
      <span className="filters_title">Ajustes</span>
      <div className="line_divider"></div>

      {activeFilter === "brilho" && <BrightnessFilter filterAply={filter} />}
      {activeFilter === "desfoque" && <BlurFilter filterAply={filter} />}
      {activeFilter === "realce" && <HighFilter filterAply={filter} />}
      {activeFilter === "acne" && <AcneFilter filterAply={filter} />}
    </div>
  );
}
export default FiltersBar;
