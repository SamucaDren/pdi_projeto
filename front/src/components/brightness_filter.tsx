import React, { useState } from "react";
import Slider from "./Slider";
import "./brightness_filter.css";

function BrightnessFilter() {
  const [brightness, setBrightness] = useState(0);

  return (
    <div className="container_brightness_filter">
      <div className="brightness_filter">
        <span className="filter_title">Brilho</span>

        <Slider
          value={brightness}
          setValue={setBrightness}
          min={-100}
          max={100}
          orientation="horizontal"
        />
      </div>
      <button className="apply_button button_red" onClick={() => {}}>
        Aplicar Filtro
      </button>
    </div>
  );
}

export default BrightnessFilter;
