import React, { useState } from 'react';
import { Layers, UploadCloud, Sparkles, CheckCircle2, ShieldCheck, Box, RefreshCw } from 'lucide-react';

export default function MultiImageReconstruction() {
  const [images, setImages] = useState([
    { id: 1, name: "Reef_Angle_01.jpg", angle: "0° (Nadir)", status: "Loaded" },
    { id: 2, name: "Reef_Angle_02.jpg", angle: "+25° (Stereo Right)", status: "Loaded" },
    { id: 3, name: "Reef_Angle_03.jpg", angle: "-25° (Stereo Left)", status: "Loaded" },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reconstructed, setReconstructed] = useState(true);

  const handleRunReconstruction = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setReconstructed(true);
    }, 1200);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              Multi-View 3D Triangulation & Disparity (Experimental Prototype)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cross-correlates multi-angle camera perspectives for geometric verification and depth estimation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            ● PROTOTYPE: Epipolar Geometry Simulator
          </span>
        </div>
      </div>

      {/* Multi-Image Upload Slot Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {images.map((img) => (
          <div
            key={img.id}
            className="p-4 rounded-xl bg-ocean-900/80 border border-ocean-700/80 space-y-3 relative group hover:border-cyan-400/50 transition-all"
          >
            <div className="aspect-[4/3] rounded-lg bg-ocean-950 flex flex-col items-center justify-center border border-ocean-800 text-slate-500 text-xs">
              <Box className="w-8 h-8 text-cyan-400 mb-1" />
              <span>Camera View #{img.id}</span>
              <span className="text-[10px] text-slate-400">{img.angle}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white truncate">{img.name}</span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reconstruction Action Bar */}
      <div className="p-4 rounded-xl bg-ocean-900/90 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300">
          <strong className="text-white">Multi-View Triangulation:</strong> Computes optical disparity across 3 viewpoints to eliminate monocular depth ambiguity.
        </div>

        <button
          onClick={handleRunReconstruction}
          disabled={isProcessing}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-ocean-950 font-bold text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center gap-2 shrink-0"
        >
          <Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>{isProcessing ? 'Triangulating Views...' : 'Execute Multi-View 3D Fusion'}</span>
        </button>
      </div>

      {/* Triangulation Telemetry Matrix */}
      {reconstructed && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-700">
            <span className="text-[10px] text-slate-400 uppercase">Stereo Baseline</span>
            <p className="text-xl font-bold text-cyan-300 mt-1">1.8 meters</p>
            <p className="text-[10px] text-slate-500">Camera separation</p>
          </div>

          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-700">
            <span className="text-[10px] text-slate-400 uppercase">Epipolar Alignment</span>
            <p className="text-xl font-bold text-emerald-400 mt-1">Calibrated</p>
            <p className="text-[10px] text-slate-500">Ray intersection match</p>
          </div>

          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-700">
            <span className="text-[10px] text-slate-400 uppercase">Triangulated Objects</span>
            <p className="text-xl font-bold text-white mt-1">3 Targets</p>
            <p className="text-[10px] text-slate-500">Confirmed across 3 views</p>
          </div>

          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-700">
            <span className="text-[10px] text-slate-400 uppercase">Depth Validation</span>
            <p className="text-xl font-bold text-teal-300 mt-1">Multi-View</p>
            <p className="text-[10px] text-slate-500">Disparity verified</p>
          </div>
        </div>
      )}

    </div>
  );
}
