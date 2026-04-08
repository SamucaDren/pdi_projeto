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
  setGetMask?: (fn: () => boolean[][] | undefined) => void;
  addTab: (tab: Tab) => void;
  activeTab: Tab | undefined;
  zoom: number;
  Pencil?: Pencil | null;
  pencilWeight?: number | null;
  onUpdateTab?: (tabUpdate: Partial<Tab>) => void;
};

export default function Canvas({
  setOpenFile,
  addTab,
  activeTab,
  zoom,
  Pencil,
  pencilWeight = 24,
  onUpdateTab,
  setGetMask,
}: CanvasProps) {
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [maskImage, setMaskImage] = useState<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const startRectRef = useRef<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

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
    const scale = zoom / 100;
    return { x: (pos.x - bounds.x) / scale, y: (pos.y - bounds.y) / scale };
  };

  const isInsideImage = (x: number, y: number) =>
    activeTab
      ? x >= 0 && y >= 0 && x <= activeTab.width && y <= activeTab.height
      : false;

  // Inicializa máscara
  useEffect(() => {
    if (!activeTab) return;
    maskRef.current = new Uint8Array(activeTab.width * activeTab.height);
  }, [activeTab]);

  // Desenha a máscara no canvas (somente visual)
  const drawMaskOnCanvas = () => {
    if (!activeTab || !maskRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = activeTab.width;
    canvas.height = activeTab.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(activeTab.width, activeTab.height);
    const data = imageData.data;

    for (let i = 0; i < maskRef.current.length; i++) {
      if (maskRef.current[i] === 1) {
        const idx = i * 4;
        data[idx] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
        data[idx + 3] = 120;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    setMaskImage(canvas);
  };

  // Envia a máscara para o pai (somente quando aplicar filtro)
  const sendMaskToParent = () => {
    if (!activeTab || !maskRef.current || !maskImage || !onUpdateTab) return;
    const mask2D: boolean[][] = [];
    for (let y = 0; y < activeTab.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < activeTab.width; x++) {
        row.push(maskRef.current[y * activeTab.width + x] === 1);
      }
      mask2D.push(row);
    }
    onUpdateTab({
      id: activeTab.id,
      maskFilter: mask2D,
      previewUrl: maskImage.toDataURL(),
    });
  };

  // Disponibiliza função para pegar máscara ao pai
  const getMaskForTab = (): boolean[][] | undefined => {
    if (!activeTab || !maskRef.current) return undefined;
    const mask2D: boolean[][] = [];
    for (let y = 0; y < activeTab.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < activeTab.width; x++) {
        row.push(maskRef.current[y * activeTab.width + x] === 1);
      }
      mask2D.push(row);
    }
    return mask2D;
  };

  useEffect(() => {
    if (setGetMask) setGetMask(() => getMaskForTab());
  }, [activeTab, maskRef]);

  // Pincel e borracha
  const paintCircle = (cx: number, cy: number, erase = false) => {
    if (!activeTab || !maskRef.current) return;
    const radius = pencilWeight ?? 20;
    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (x * x + y * y > radius * radius) continue;
        const dx = Math.floor(cx + x);
        const dy = Math.floor(cy + y);
        if (
          dx >= 0 &&
          dx < activeTab.width &&
          dy >= 0 &&
          dy < activeTab.height
        ) {
          maskRef.current[dy * activeTab.width + dx] = erase ? 0 : 1;
        }
      }
    }
  };

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
    const steps = Math.floor(distance);
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
    if (Pencil === "retangulo") {
      startRectRef.current = pos;
      setCurrentRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      return;
    }

    lastPointRef.current = pos;
    paintCircle(pos.x, pos.y, Pencil === "borracha");
    drawMaskOnCanvas();
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getRelativePosition(stage);
    if (!pos || !activeTab) return;
    setCursor(pos);

    if (Pencil === "retangulo" && startRectRef.current) {
      const x0 = startRectRef.current.x;
      const y0 = startRectRef.current.y;
      const x1 = pos.x;
      const y1 = pos.y;
      setCurrentRect({
        x: Math.min(x0, x1),
        y: Math.min(y0, y1),
        width: Math.abs(x1 - x0),
        height: Math.abs(y1 - y0),
      });
      return;
    }

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
    drawMaskOnCanvas();
  };

  const handleMouseUp = () => {
    if (
      Pencil === "retangulo" &&
      startRectRef.current &&
      currentRect &&
      activeTab
    ) {
      const xStart = currentRect.x;
      const yStart = currentRect.y;
      const xEnd = xStart + currentRect.width;
      const yEnd = yStart + currentRect.height;
      for (let x = Math.floor(xStart); x < xEnd; x++) {
        for (let y = Math.floor(yStart); y < yEnd; y++) {
          if (x >= 0 && x < activeTab.width && y >= 0 && y < activeTab.height) {
            maskRef.current![y * activeTab.width + x] = 1;
          }
        }
      }
      drawMaskOnCanvas();
      startRectRef.current = null;
      setCurrentRect(null);
    }
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
    setOpenFile(() => fileInputRef.current?.click());
  }, [setOpenFile]);

  useEffect(() => {
    const handleResize = () =>
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
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

  const isDrawingMode =
    Pencil === "pincel" || Pencil === "borracha" || Pencil === "retangulo";

  return (
    <>
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        draggable={!isDrawingMode}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer listening={false}>{renderDots()}</Layer>

        <Layer>
          {activeTab && imageObj && bounds && (
            <Group
              x={bounds.x}
              y={bounds.y}
              scaleX={zoom / 100}
              scaleY={zoom / 100}
              draggable={!isDrawingMode}
            >
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

        {isDrawingMode && (
          <Layer>
            {cursor && activeTab && bounds && Pencil !== "retangulo" && (
              <Group x={bounds.x} y={bounds.y}>
                <Circle
                  x={cursor.x}
                  y={cursor.y}
                  radius={pencilWeight ?? 20}
                  fill="rgba(255,0,0,0.2)"
                />
              </Group>
            )}

            {currentRect && activeTab && bounds && (
              <Group x={bounds.x} y={bounds.y}>
                <Rect
                  x={currentRect.x}
                  y={currentRect.y}
                  width={currentRect.width}
                  height={currentRect.height}
                  fill="rgba(255,0,0,0.2)"
                />
              </Group>
            )}
          </Layer>
        )}
      </Stage>

      <input
        type="file"
        placeholder="a"
        ref={fileInputRef}
        onChange={handleFile}
        style={{ display: "none" }}
        accept="image/*"
      />
    </>
  );
}
