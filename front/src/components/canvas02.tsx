import { useEffect, useRef, useState, useCallback } from "react";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Rect,
  Circle,
  Group,
} from "react-konva";
import Konva from "konva";
import type { Tab, PencilAply } from "../types";
import "./canvas.css";

type CanvasProps = {
  activeTab: Tab | undefined;
  activePencil?: PencilAply | null;
  zoom: number;
  onMaskChange?: (mask: boolean[][]) => void;
};

function Canvas02({
  activeTab,
  activePencil,
  zoom,
  onMaskChange,
}: CanvasProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);

  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const [rectPreview, setRectPreview] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const maskRef = useRef<Uint8Array | null>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const startRectRef = useRef<{ x: number; y: number } | null>(null);
  const [isRectDrawing, setIsRectDrawing] = useState(false);

  const [bounds, setBounds] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const isBrush =
    activePencil?.pencil === "pincel" || activePencil?.pencil === "borracha";

  const isRect = activePencil?.pencil === "retangulo";

  const isInteractionMode = isBrush || isRect;

  const drawMask = useCallback(() => {
    if (!activeTab || !maskRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = activeTab.width;
    canvas.height = activeTab.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.createImageData(activeTab.width, activeTab.height);

    for (let i = 0; i < maskRef.current.length; i++) {
      if (maskRef.current[i]) {
        imageData.data[i * 4 + 0] = 255;
        imageData.data[i * 4 + 3] = 120;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setMaskCanvas(canvas);
  }, [activeTab]);

  useEffect(() => {
    if (!activeTab?.previewUrl) return;

    const img = new Image();
    img.src = activeTab.previewUrl;

    img.onload = () => {
      const maxSize = 800;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);

      const width = img.width * scale;
      const height = img.height * scale;

      const x = (window.innerWidth - width) / 2;
      const y = (window.innerHeight - height) / 2;

      setBounds({ x, y, width, height });
      setImage(img);

      maskRef.current = new Uint8Array(activeTab.width * activeTab.height);

      if (activeTab.maskFilter) {
        for (let y = 0; y < activeTab.height; y++) {
          for (let x = 0; x < activeTab.width; x++) {
            if (activeTab.maskFilter[y]?.[x]) {
              maskRef.current[y * activeTab.width + x] = 1;
            }
          }
        }
        drawMask();
      } else {
        drawMask();
      }
    };
  }, [activeTab, drawMask]);

  const getPos = () => {
    const stage = stageRef.current;
    if (!stage || !bounds || !activeTab) return null;

    const p = stage.getPointerPosition();
    if (!p) return null;

    const scale = zoom / 100;

    return {
      x: ((p.x - bounds.x) / scale) * (activeTab.width / bounds.width),
      y: ((p.y - bounds.y) / scale) * (activeTab.height / bounds.height),
    };
  };

  const paintCircle = (cx: number, cy: number, erase = false) => {
    if (!activeTab || !maskRef.current) return;

    const radius = activePencil?.valor ?? 20;

    for (let x = -radius; x <= radius; x++) {
      for (let y = -radius; y <= radius; y++) {
        if (x * x + y * y > radius * radius) continue;

        const px = Math.floor(cx + x);
        const py = Math.floor(cy + y);

        if (
          px >= 0 &&
          py >= 0 &&
          px < activeTab.width &&
          py < activeTab.height
        ) {
          maskRef.current[py * activeTab.width + px] = erase ? 0 : 1;
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
    const dist = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(dist));

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      paintCircle(x0 + dx * t, y0 + dy * t, erase);
    }
  };

  const paintRect = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    erase = false,
  ) => {
    if (!activeTab || !maskRef.current) return;

    const minX = Math.floor(Math.min(x0, x1));
    const maxX = Math.floor(Math.max(x0, x1));
    const minY = Math.floor(Math.min(y0, y1));
    const maxY = Math.floor(Math.max(y0, y1));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (x < 0 || y < 0 || x >= activeTab.width || y >= activeTab.height)
          continue;

        maskRef.current[y * activeTab.width + x] = erase ? 0 : 1;
      }
    }
  };

  const handleMouseDown = () => {
    const pos = getPos();
    if (!pos) return;

    if (isBrush) {
      setIsDrawing(true);
      paintCircle(pos.x, pos.y, activePencil?.pencil === "borracha");
      drawMask();
      lastPointRef.current = pos;
      return;
    }

    if (isRect) {
      setIsRectDrawing(true);
      startRectRef.current = pos;
      return;
    }
  };

  const handleMouseMove = () => {
    const pos = getPos();
    if (!pos) return;

    setCursor(pos);

    if (isRectDrawing && startRectRef.current) {
      const start = startRectRef.current;

      setRectPreview({
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      });

      return;
    }

    if (!isDrawing || !lastPointRef.current) return;

    paintLine(
      lastPointRef.current.x,
      lastPointRef.current.y,
      pos.x,
      pos.y,
      activePencil?.pencil === "borracha",
    );

    lastPointRef.current = pos;
    drawMask();
  };

  const handleMouseUp = () => {
    const pos = getPos();

    if (isRectDrawing && startRectRef.current && pos) {
      const start = startRectRef.current;

      paintRect(
        start.x,
        start.y,
        pos.x,
        pos.y,
        activePencil?.pencil === "borracha",
      );

      drawMask();
    }

    setRectPreview(null);
    setIsDrawing(false);
    setIsRectDrawing(false);
    lastPointRef.current = null;
    startRectRef.current = null;

    if (!activeTab || !maskRef.current) return;

    const mask: boolean[][] = [];

    for (let y = 0; y < activeTab.height; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < activeTab.width; x++) {
        row.push(maskRef.current[y * activeTab.width + x] === 1);
      }
      mask.push(row);
    }

    onMaskChange?.(mask);
  };

  return (
    <Stage
      ref={stageRef}
      width={window.innerWidth}
      height={window.innerHeight}
      draggable={!isInteractionMode}
      scaleX={zoom / 100}
      scaleY={zoom / 100}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Layer listening={false}>{renderDots()}</Layer>

      <Layer>
        {image && bounds && (
          <Group x={bounds.x} y={bounds.y}>
            <KonvaImage
              image={image}
              width={bounds.width}
              height={bounds.height}
            />
            {maskCanvas && (
              <KonvaImage
                image={maskCanvas}
                width={bounds.width}
                height={bounds.height}
              />
            )}
          </Group>
        )}
      </Layer>

      {rectPreview && bounds && activeTab && (
        <Layer listening={false}>
          <Rect
            x={bounds.x + rectPreview.x * (bounds.width / activeTab.width)}
            y={bounds.y + rectPreview.y * (bounds.height / activeTab.height)}
            width={rectPreview.width * (bounds.width / activeTab.width)}
            height={rectPreview.height * (bounds.height / activeTab.height)}
            stroke="white"
            dash={[6, 4]}
            strokeWidth={2}
          />
        </Layer>
      )}

      {cursor && isBrush && bounds && activeTab && (
        <Layer listening={false}>
          <Circle
            x={bounds.x + cursor.x * (bounds.width / activeTab.width)}
            y={bounds.y + cursor.y * (bounds.height / activeTab.height)}
            radius={activePencil?.valor ?? 20}
            stroke="white"
            fill="rgba(255,0,0,0.15)"
          />
        </Layer>
      )}
    </Stage>
  );
}

export default Canvas02;

// fundo pontilhado
function renderDots() {
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
}
