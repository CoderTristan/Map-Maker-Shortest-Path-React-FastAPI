import { useEffect, useRef } from "react";

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

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasEnabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onCanvasClick(x, y);
  };

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

      // Draw lines
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];

        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw nodes
      pts.forEach((node) => drawNode(ctx, node.x, node.y));
    });
  }, [paths]);

  const drawNode = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - 20, x, y - 30);
    ctx.quadraticCurveTo(x - 10, y - 20, x, y);
    ctx.fill();
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      className="absolute top-0 left-0 pointer-events-auto w-full h-full"
    />
  );
}
