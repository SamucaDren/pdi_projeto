import { Stage, Layer, Rect, Image as KonvaImage } from "react-konva";
import React, { useEffect, useRef, useState } from "react";
import "./canvas.css";
import type { Tab } from "../index";

type CanvasProps = {
  setOpenFile: (fn: () => void) => void;
  addTab: (tab: Tab) => void;
  activeTab: Tab | undefined;
  zoom: number;
};

export default function Canvas({
  setOpenFile,
  addTab,
  activeTab,
  zoom,
}: CanvasProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // 🔹 expõe função pro Nav
  useEffect(() => {
    const open = () => {
      fileInputRef.current?.click();
    };

    setOpenFile(open);
  }, [setOpenFile]);

  // 🔹 resize
  useEffect(() => {
    const handleResize = () => {
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🔹 atalho teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🔹 grid
  const renderDots = () => {
    const dots = [];
    const spacing = 40;

    for (let x = -2000; x < 2000; x += spacing) {
      for (let y = -2000; y < 2000; y += spacing) {
        dots.push(
          <Rect
            key={`${x}-${y}`}
            x={x}
            y={y}
            width={2}
            height={2}
            fill="#363639"
          />,
        );
      }
    }

    return dots;
  };

  // 🔹 carregar imagem → cria aba
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      const scale = Math.min(500 / width, 400 / height, 1);

      width *= scale;
      height *= scale;

      addTab({
        id: Date.now(),
        name: file.name,
        image: img,
        width,
        height,
      });
    };

    e.target.value = "";
  };

  return (
    <>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable
        scaleX={zoom / 100}
        scaleY={zoom / 100}
        style={{ border: "1px solid #ccc" }}
      >
        {/* GRID */}
        <Layer listening={false}>{renderDots()}</Layer>

        {/* CONTEÚDO */}
        <Layer>
          {activeTab && (
            <KonvaImage
              image={activeTab.image}
              x={(stageSize.width - activeTab.width) / 2}
              y={(stageSize.height - activeTab.height) / 2}
              width={activeTab.width}
              height={activeTab.height}
              draggable
            />
          )}
        </Layer>
      </Stage>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFile}
        style={{ display: "none" }}
        accept="image/*"
      />
    </>
  );
}
