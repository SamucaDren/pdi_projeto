import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Group,
  Circle,
} from "react-konva";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import React, { useEffect, useRef, useState } from "react";
import "./canvas.css";
import type { Tab, Pencil } from "../types";

type CanvasProps = {
  setOpenFile: (fn: () => void) => void;
  addTab: (tab: Tab) => void;
  activeTab: Tab | undefined;
  zoom: number;
  Pencil?: Pencil | null;
  pencilWeight?: number | null;
};

export default function Canvas({
  setOpenFile,
  addTab,
  activeTab,
  zoom,
  Pencil,
  pencilWeight = 24,
}: CanvasProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const maskRef = useRef<Uint8Array | null>(null);

  const [stageSize, setStageSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const getImageBounds = () => {
    if (!activeTab) return null;

    const x = (stageSize.width - activeTab.width) / 2;
    const y = (stageSize.height - activeTab.height) / 2;

    return { x, y, width: activeTab.width, height: activeTab.height };
  };

  const bounds = getImageBounds();

  const getRelativePosition = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos || !bounds) return null;

    return {
      x: (pos.x - bounds.x) / (zoom / 100),
      y: (pos.y - bounds.y) / (zoom / 100),
    };
  };

  const isInsideImage = (x: number, y: number) => {
    if (!activeTab) return false;
    return x >= 0 && y >= 0 && x <= activeTab.width && y <= activeTab.height;
  };

  useEffect(() => {
    if (!activeTab) return;
    maskRef.current = new Uint8Array(activeTab.width * activeTab.height);
  }, [activeTab]);

  const updateMaskImage = () => {
    if (!activeTab || !maskRef.current) return;

    const width = activeTab.width;
    const height = activeTab.height;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < maskRef.current.length; i++) {
      if (maskRef.current[i] === 1) {
        const index = i * 4;
        data[index] = 255;
        data[index + 1] = 0;
        data[index + 2] = 0;
        data[index + 3] = 120;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setMaskImage(canvas);
  };

  const paintCircle = (cx: number, cy: number, erase = false) => {
    if (!activeTab || !maskRef.current) return;

    const width = activeTab.width;
    const height = activeTab.height;
    const mask = maskRef.current;
    const radius = pencilWeight ?? 20;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (x * x + y * y > radius * radius) continue;

        const dx = Math.floor(cx + x);
        const dy = Math.floor(cy + y);

        if (dx >= 0 && dx < width && dy >= 0 && dy < height) {
          const index = dy * width + dx;
          mask[index] = erase ? 0 : 1;
        }
      }
    }
  };

  // 🔥 NOVO: traço contínuo
  const paintLine = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    erase = false,
  ) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const step = 1; // quanto menor, mais suave
    const steps = Math.floor(distance / step);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + dx * t;
      const y = y0 + dy * t;
      paintCircle(x, y, erase);
    }
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!activeTab || !Pencil) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePosition(stage);
    if (!pos || !isInsideImage(pos.x, pos.y)) return;

    setIsDrawing(true);
    lastPointRef.current = pos;

    paintCircle(pos.x, pos.y, Pencil === "borracha");
    updateMaskImage();
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePosition(stage);
    if (!pos || !activeTab) return;

    setCursor(pos);

    if (!isDrawing || !lastPointRef.current) return;
    if (!isInsideImage(pos.x, pos.y)) return;

    paintLine(
      lastPointRef.current.x,
      lastPointRef.current.y,
      pos.x,
      pos.y,
      Pencil === "borracha",
    );

    lastPointRef.current = pos;

    updateMaskImage();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  useEffect(() => {
    if (!activeTab) return;

    const img = new Image();
    img.src = activeTab.previewUrl;
    img.onload = () => setImageObj(img);
  }, [activeTab]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = previewUrl;

    img.onload = () => {
      const scale = Math.min(500 / img.width, 400 / img.height, 1);

      addTab({
        id: Date.now(),
        name: file.name,
        file,
        previewUrl,
        width: img.width * scale,
        height: img.height * scale,
        filters: [],
      });
    };

    e.target.value = "";
  };

  useEffect(() => {
    setOpenFile(() => {
      fileInputRef.current?.click();
    });
  }, [setOpenFile]);

  useEffect(() => {
    const handleResize = () =>
      setStageSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const renderDots = () => {
    const spacing = 40;
    const dots = [];

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

  const isDrawingMode = Pencil === "pincel" || Pencil === "borracha";

  return (
    <>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable={!isDrawingMode}
        scaleX={zoom / 100}
        scaleY={zoom / 100}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer listening={false}>{renderDots()}</Layer>

        <Layer>
          {activeTab && imageObj && bounds && (
            <Group x={bounds.x} y={bounds.y} draggable={!isDrawingMode}>
              <KonvaImage
                image={imageObj}
                width={bounds.width}
                height={bounds.height}
              />

              {maskImage && (
                <KonvaImage
                  image={maskImage}
                  width={bounds.width}
                  height={bounds.height}
                />
              )}
            </Group>
          )}
        </Layer>

        <Layer>
          {cursor && activeTab && bounds && (
            <Group x={bounds.x} y={bounds.y}>
              <Circle
                x={cursor.x}
                y={cursor.y}
                radius={pencilWeight ?? 20}
                fill="rgba(255,0,0,0.2)"
              />
            </Group>
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
