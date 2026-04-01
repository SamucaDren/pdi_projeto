import "./filters_bar.css";
import type { Filter } from "../types";
import BrightnessFilter from "./brightness_filter";
import type { Tab } from "../types";
import BlurFilter from "./blur_filter";

type FiltersBarProps = {
  activeFilter: Filter | null;
  activeTab?: Tab;
  onApply: (url: string) => void;
};

function FiltersBar({ activeFilter, activeTab, onApply }: FiltersBarProps) {
  return (
    <div className="filters_bar">
      <span className="filters_title">Ajustes</span>
      <div className="line_divider"></div>

      {activeFilter === "brilho" && (
        <BrightnessFilter activeTab={activeTab} onApply={onApply} />
      )}
      {activeFilter === "desfoque" && (
        <BlurFilter activeTab={activeTab} onApply={onApply} />
      )}
    </div>
  );
}
export default FiltersBar;
