import React from "react";
import "./pencil_bar.css";

function PencilBar() {
  return (
    <div className="pencil_bar_container">
      <div className="pencilOption">
        <span>Pincel</span>
      </div>
      <div className="pencilOption">
        <span>Borracha</span>
      </div>
      <div className="pencilOption">
        <span>Retangulo</span>
      </div>
    </div>
  );
}
export default PencilBar;
