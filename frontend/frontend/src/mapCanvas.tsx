import { useEffect, useRef, useState } from "react";

interface CanvasNode {
  id: number;
  x: number;
  y: number;
}

interface CanvasPath {
  id: number;
  nodes: CanvasNode[];
}

interface Props {
  paths: CanvasPath[];
  canvasEnabled: boolean;
  onCanvasClick: (x: number, y: number) => void;
}

export default function MapCanvas({ paths, canvasEnabled, onCanvasClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hoveredPathId, setHoveredPathId] = useState<number | null>(null);
  const [selectedPathId, setSelectedPathId] = useState<number | null>(null);
  const [shortest, setShortest] = useState<{ pathId: number; midX: number; midY: number } | null>(null);

  // Detect hover over a path
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let foundPath: number | null = null;

    for (const path of paths) {
      const pts = path.nodes;

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        if (isNearLine(x, y, a.x, a.y, b.x, b.y)) {
          foundPath = path.id;
          break;
        }
      }

      if (foundPath) break;
    }

    if (foundPath !== hoveredPathId) {
      setHoveredPathId(foundPath);
    }
  };

  // Click to lock highlight
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasEnabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (hoveredPathId !== null) {
      setSelectedPathId(hoveredPathId);
      return;
    }

    onCanvasClick(x, y);
  };

  // Helper: distance from point to line segment
  const isNearLine = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let t = dot / lenSq;

    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * C;
    const closestY = y1 + t * D;

    const dist = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);

    return dist < 10;
  };

  // Compute shortest path + midpoint
  useEffect(() => {
    if (paths.length === 0) {
      setShortest(null);
      return;
    }

    let best = null;
    let bestLength = Infinity;

    for (const path of paths) {
      const pts = path.nodes;
      if (pts.length < 2) continue;

      let length = 0;
      let midX = 0;
      let midY = 0;

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        const segLen = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        length += segLen;

        if (i === Math.floor((pts.length - 1) / 2)) {
          midX = (a.x + b.x) / 2;
          midY = (a.y + b.y) / 2;
        }
      }

      if (length < bestLength) {
        bestLength = length;
        best = { pathId: path.id, midX, midY };
      }
    }

    setShortest(best);
  }, [paths]);

  // Draw paths
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach((path) => {
      const pts = path.nodes;

      const isHovered = path.id === hoveredPathId;
      const isSelected = path.id === selectedPathId;
      const isShortest = shortest && shortest.pathId === path.id;

      ctx.strokeStyle = isSelected
        ? "cyan"
        : isHovered
        ? "orange"
        : isShortest
        ? "lime"
        : "yellow";

      ctx.lineWidth = isSelected || isHovered || isShortest ? 6 : 3;

      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      pts.forEach((node) => drawNode(ctx, node.x, node.y));
    });
  }, [paths, hoveredPathId, selectedPathId, shortest]);

  const drawNode = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - 20, x, y - 30);
    ctx.quadraticCurveTo(x - 10, y - 20, x, y);
    ctx.fill();
  };

  return (
    <>
      {shortest && (
        <div
          style={{
            position: "absolute",
            top: shortest.midY - 20,
            left: shortest.midX + 15,
            background: "rgba(0,0,0,0.85)",
            padding: "4px 8px",
            borderRadius: "4px",
            color: "white",
            fontSize: "11px",
            pointerEvents: "none",
            transform: "translate(-50%, -50%)",
          }}
        >
          ➤ Shortest Path
        </div>
      )}

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        className="absolute top-0 left-0 pointer-events-auto w-full h-full"
      />
    </>
  );
}
