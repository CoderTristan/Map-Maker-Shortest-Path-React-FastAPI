import { useState, useEffect } from "react";
import api from "./api";
import "./App.css";

interface Picture {
  id: number;
  filename: string;
  url: string;
}

function App() {
  const [pics, setPics] = useState<Picture[]>([]);
  const [activePic, setActivePic] = useState<Picture | null>(null);
  const [activeTab, setActiveTab] = useState<"draw" | "map">("draw");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchPics = async () => {
    const response = await api.get<Picture[]>("/pictures");
    setPics(response.data);

    if (!activePic && response.data.length > 0) {
      setActivePic(response.data[0]);
    }
  };

  useEffect(() => {
    fetchPics();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);
    await api.post("/add-pic", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    setUploading(false);

    fetchPics();
  };

  return (
    <div className="flex h-screen">

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div className="w-64 bg-gray-900 text-white p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Pictures</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Upload Button */}
          <label className="block mb-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded">
            {uploading ? "Uploading..." : "Add Image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>

          {/* Image List */}
          {pics.map((pic) => (
            <div
              key={pic.id}
              className={`cursor-pointer mb-3 p-2 rounded ${
                activePic?.id === pic.id ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setActivePic(pic)}
            >
              <img src={pic.url} alt={pic.filename} className="w-full rounded" />
              <p className="text-sm mt-1">{pic.filename}</p>
            </div>
          ))}
        </div>
      )}

      {/* SIDEBAR OPEN BUTTON */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-gray-800 text-white px-3 py-2 m-2 rounded hover:bg-gray-700"
        >
          ☰ Pictures
        </button>
      )}

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP TABS */}
        <div className="flex bg-gray-800 text-white">
          <button
            className={`px-6 py-3 ${
              activeTab === "draw" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("draw")}
          >
            Draw Lanes
          </button>

          <button
            className={`px-6 py-3 ${
              activeTab === "map" ? "bg-blue-600" : "bg-gray-700"
            }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-black flex items-center justify-center">
          {activePic ? (
            <img
              src={activePic.url}
              alt="Selected Map"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <p className="text-white">No image selected</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
