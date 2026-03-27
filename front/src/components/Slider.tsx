import "./slider.css";
import { useRef } from "react";

type SliderProps = {
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  defaultValue?: number;
  orientation?: "vertical" | "horizontal";
};

function Slider({
  value,
  setValue,
  min,
  max,
  orientation = "vertical",
}: SliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    let percent = 0;

    if (orientation === "vertical") {
      const offsetY = e.clientY - rect.top;
      percent = 1 - offsetY / rect.height;
    } else {
      const offsetX = e.clientX - rect.left;
      percent = offsetX / rect.width;
    }

    percent = Math.max(0, Math.min(1, percent));

    const newValue = Math.round(min + percent * (max - min));
    setValue(newValue);
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

  const percent = (value - min) / (max - min);

  const positionStyle =
    orientation === "vertical"
      ? { top: `${(1 - percent) * 100}%` }
      : { left: `${percent * 100}%` };

  return (
    <div
      ref={containerRef}
      className={`slider_container ${orientation}`}
      onClick={(e) => handleMove(e)}
    >
      <div
        className="slider_thumb"
        style={positionStyle}
        onMouseDown={handleMouseDown}
      />
      <span className="slider_label">{value}</span>
    </div>
  );
}

export default Slider;
