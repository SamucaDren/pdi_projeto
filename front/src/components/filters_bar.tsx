import React from "react";
import "./filters_bar.css";
import type { Filter } from "../types";
import BrightnessFilter from "./brightness_filter";

type FiltersBarProps = {
  activeFilter: Filter | null;
};

function FiltersBar({ activeFilter }: FiltersBarProps) {
  return (
    <div className="filters_bar">
      <span className="filters_title">Ajustes</span>
      <div className="line_divider"></div>
      {activeFilter === "brilho" && <BrightnessFilter />}
    </div>
  );
}
export default FiltersBar;
