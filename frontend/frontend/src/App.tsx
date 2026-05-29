import { useState, useEffect } from "react";
import api from "./api";
import { usePaths } from "./usePaths";
import MapCanvas from "./mapCanvas";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./App.css";

interface Picture {
  id: number;
  filename: string;
  url: string;
}

function App() {
  const [pics, setPics] = useState<Picture[]>([]);
  const [activePic, setActivePic] = useState<Picture | null>(null);
  const [activeTab, setActiveTab] = useState<"map" | "draw">("map");
  const [canvasEnabled, setCanvasEnabled] = useState(false);

  const {
    paths,
    loadPaths,
    savePath,
    startNewPath,
    addNodeToPath,
  } = usePaths();

  // Load pictures on startup
  useEffect(() => {
    const load = async () => {
      const res = await api.get("/pictures");
      setPics(res.data);

      if (res.data.length > 0) {
        const first = res.data[0];
        setActivePic(first);
        loadPaths(first.id);
      }
    };

    load();
  }, []);

  // Auto-load paths when switching tabs
  useEffect(() => {
    if (activePic) loadPaths(activePic.id);
  }, [activeTab]);

  const handlePictureClick = async (pic: Picture) => {
    setActivePic(pic);
    await loadPaths(pic.id);
  };

  const handleCanvasClick = (x: number, y: number) => {
    addNodeToPath(x, y);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 p-4 overflow-y-auto border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Pictures</h2>

        {pics.map((pic) => (
          <div
            key={pic.id}
            onClick={() => handlePictureClick(pic)}
            className={`cursor-pointer mb-4 p-2 rounded transition ${
              activePic?.id === pic.id
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <img
              src={pic.url}
              alt={pic.filename}
              className="w-full h-32 object-cover rounded"
            />
            <p className="text-sm mt-2 text-center">{pic.filename}</p>
          </div>
        ))}
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP TABS */}
        <div className="flex bg-gray-800 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("map")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "map"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Map
          </button>

          <button
            onClick={() => setActiveTab("draw")}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "draw"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Draw
          </button>

          <button
            onClick={() => setCanvasEnabled((v) => !v)}
            className="ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            {canvasEnabled ? "Disable Canvas" : "Enable Canvas"}
          </button>

          <button
            onClick={startNewPath}
            className="ml-4 px-4 py-2 bg-green-700 hover:bg-green-600 rounded"
          >
            New Path
          </button>

          <button
            onClick={() => activePic && savePath(activePic.id)}
            className="ml-4 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
          >
            Save Path
          </button>
        </div>

        {/* MAP AREA */}
        <div className="flex-1 bg-black relative">
          {activePic && (
            <TransformWrapper>
              <TransformComponent>
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={activePic.url}
                    alt="Map"
                    className="max-w-full max-h-full object-contain"
                  />

                  <MapCanvas
                    paths={paths}
                    canvasEnabled={canvasEnabled}
                    onCanvasClick={handleCanvasClick}
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
