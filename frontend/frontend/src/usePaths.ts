import { useState } from "react";
import api from "./api";

export interface NodePoint {
  id: number;
  x: number;
  y: number;
}

export interface Path {
  id: number;
  nodes: NodePoint[];
}

export function usePaths() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [activePathId, setActivePathId] = useState<number | null>(null);

  const loadPaths = async (pictureId: number) => {
    const res = await api.get(`/paths/${pictureId}`);
    setPaths(res.data);
    setActivePathId(null);
  };

  const savePath = async (pictureId: number) => {
    if (activePathId === null) return;

    const path = paths.find((p) => p.id === activePathId);
    if (!path) return;

    await api.post("/paths", {
      picture_id: pictureId,
      nodes: path.nodes.map((n) => ({ x: n.x, y: n.y })),
    });
  };

  const startNewPath = () => {
    const newId = Date.now();
    setPaths((prev) => [...prev, { id: newId, nodes: [] }]);
    setActivePathId(newId);
  };

  const addNodeToPath = (x: number, y: number) => {
    if (activePathId === null) return;

  const newNode: NodePoint = { id: Date.now(), x, y };

    setPaths((prev) =>
      prev.map((p) =>
        p.id === activePathId
          ? { ...p, nodes: [...p.nodes, newNode] }
          : p
      )
    );
  };

  return {
    paths,
    activePathId,
    setActivePathId,
    loadPaths,
    savePath,
    startNewPath,
    addNodeToPath,
  };
}
