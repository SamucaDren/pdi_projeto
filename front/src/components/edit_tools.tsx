import React from "react";
import "./edit_tools.css";
import SliderZoom from "./slider_zoom";

type EditToolsProps = {
  zoom: number;
  setZoom: (zoom: number) => void;
};

function EditTools({ zoom, setZoom }: EditToolsProps) {
  return (
    <div className="edit_tools_bar">
      <SliderZoom zoom={zoom} setZoom={setZoom} />
    </div>
  );
}
export default EditTools;
