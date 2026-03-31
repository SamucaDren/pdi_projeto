import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Line,
  Group,
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

type LineType = {
  points: number[];
  tool: "pincel" | "borracha";
};

export default function Canvas({
  setOpenFile,
  addTab,
  activeTab,
  zoom,
  Pencil,
  pencilWeight = 24,
}: CanvasProps) {
  const [lines, setLines] = useState<LineType[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const imageGroupRef = useRef<Konva.Group>(null);
  const drawGroupRef = useRef<Konva.Group>(null);

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

  // 🔥 pega posição relativa ao grupo de desenho
  const getRelativeToDrawGroup = (stage: Konva.Stage) => {
    const group = drawGroupRef.current;
    if (!group) return null;

    const transform = group.getAbsoluteTransform().copy();
    transform.invert();

    const pos = stage.getPointerPosition();
    return pos ? transform.point(pos) : null;
  };

  const isInsideImage = (x: number, y: number) => {
    if (!activeTab) return false;
    return x >= 0 && y >= 0 && x <= activeTab.width && y <= activeTab.height;
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (!activeTab || !Pencil) return;
    if (Pencil !== "pincel" && Pencil !== "borracha") return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativeToDrawGroup(stage);
    if (!pos || !isInsideImage(pos.x, pos.y)) return;

    setIsDrawing(true);
    setLines((prev) => [...prev, { points: [pos.x, pos.y], tool: Pencil }]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !activeTab) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const point = getRelativeToDrawGroup(stage);
    if (!point || !isInsideImage(point.x, point.y)) return;

    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;

      const updated = {
        ...last,
        points: [...last.points, point.x, point.y],
      };

      return [...prev.slice(0, -1), updated];
    });
  };

  const handleMouseUp = () => setIsDrawing(false);

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
        {/* GRID */}
        <Layer listening={false}>{renderDots()}</Layer>

        {/* IMAGEM */}
        <Layer>
          {activeTab && imageObj && bounds && (
            <Group
              ref={imageGroupRef}
              x={bounds.x}
              y={bounds.y}
              draggable={!isDrawingMode}
            >
              <KonvaImage
                image={imageObj}
                width={bounds.width}
                height={bounds.height}
              />
            </Group>
          )}
        </Layer>

        {/* DESENHO */}
        <Layer>
          {activeTab && bounds && (
            <Group
              ref={drawGroupRef}
              x={bounds.x}
              y={bounds.y}
              draggable={!isDrawingMode}
            >
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke="red"
                  strokeWidth={pencilWeight ?? 20}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
                  opacity={line.tool === "pincel" ? 0.3 : 1}
                  globalCompositeOperation={
                    line.tool === "borracha" ? "destination-out" : "source-over"
                  }
                />
              ))}
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
