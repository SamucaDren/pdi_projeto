import React from "react";
import "./filters_bar.css";
import type { Filter } from "../types";
import BrightnessFilter from "./brightness_filter";
import type { Tab } from "../types";

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
    </div>
  );
}
export default FiltersBar;
