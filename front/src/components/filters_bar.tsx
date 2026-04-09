import "./filters_bar.css";
import type { Filter, FilterAply } from "../types";
import BrightnessFilter from "./brightness_filter";
import type { Tab } from "../types";
import BlurFilter from "./blur_filter";
import HighFilter from "./high_filter";

type FiltersBarProps = {
  activeFilter: Filter | null;
  activeTab?: Tab;
  onApply: (url: string) => void;
  filter: (filter: FilterAply) => void;
  getMaskFromCanvas?: (() => boolean[][] | undefined) | null; // novo
};

function FiltersBar({
  activeFilter,
  activeTab,
  onApply,
  getMaskFromCanvas,
  filter,
}: FiltersBarProps) {
  return (
    <div className="filters_bar">
      <span className="filters_title">Ajustes</span>
      <div className="line_divider"></div>

      {activeFilter === "brilho" && (
        <BrightnessFilter
          activeTab={activeTab}
          //          onApply={onApply, }
          filterAply={filter}
          getMask={getMaskFromCanvas ?? undefined} // <-- aqui
        />
      )}
      {activeFilter === "desfoque" && (
        <BlurFilter activeTab={activeTab} onApply={onApply} />
      )}
      {activeFilter === "realce" && (
        <HighFilter activeTab={activeTab} onApply={onApply} />
      )}
    </div>
  );
}
export default FiltersBar;
