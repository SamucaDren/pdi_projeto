import "./slider_zoom.css";
import { useRef } from "react";

type SliderProps = {
  zoom: number;
  setZoom: (zoom: number) => void;
};

function SliderZoom({ zoom, setZoom }: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;

    let percent = 1 - offsetY / rect.height;
    percent = Math.max(0, Math.min(1, percent));

    const newZoom = Math.round(50 + percent * 150); // 50–200
    setZoom(newZoom);
  };

  const handleMouseDown = () => {
    const move = (e: MouseEvent) => handleMove(e);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const percent = (zoom - 50) / 150;
  const top = `${(1 - percent) * 100}%`;

  return (
    <div
      ref={containerRef}
      className="slider_zoom_container"
      onClick={(e) => handleMove(e)}
    >
      <div
        className="slider_thumb"
        style={{ top }}
        onMouseDown={handleMouseDown}
      />
      <span className="slider_label">{zoom}%</span>
    </div>
  );
}

export default SliderZoom;
