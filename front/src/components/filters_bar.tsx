import "./filters_bar.css";
import type {
  //Tab,
  Filter,
  FilterAply,
} from "../types";
import BrightnessFilter from "./brightness_filter";
import BlurFilter from "./blur_filter";
import HighFilter from "./high_filter";

type FiltersBarProps = {
  activeFilter: Filter | null;
  //activeTab?: Tab;
  // onApply?: (url: string) => void;
  filter: (filter: FilterAply) => void;
  // getMaskFromCanvas?: (() => boolean[][] | undefined) | null; // novo
};

function FiltersBar({
  activeFilter,
  //activeTab,
  //onApply,
  // getMaskFromCanvas,
  filter,
}: FiltersBarProps) {
  return (
    <div className="filters_bar">
      <span className="filters_title">Ajustes</span>
      <div className="line_divider"></div>

      {activeFilter === "brilho" && <BrightnessFilter filterAply={filter} />}
      {activeFilter === "desfoque" && <BlurFilter filterAply={filter} />}
      {activeFilter === "realce" && <HighFilter filterAply={filter} />}
    </div>
  );
}
export default FiltersBar;
