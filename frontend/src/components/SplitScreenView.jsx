import React, { useState } from 'react';
import DetectionViewer from './DetectionViewer';
import DebrisMap2D from './DebrisMap2D';
import UnderwaterScene3D from './UnderwaterScene3D';
import { Columns2, Layers, Box, Compass } from 'lucide-react';

export default function SplitScreenView({
  imageUrl,
  enhancedUrl,
  detections = [],
  selectedDetId,
  setSelectedDetId,
  gpsInfo,
  locationName
}) {
  const [splitMode, setSplitMode] = useState('2d_map'); // '2d_map' | '3d_scene'
  const [viewMode, setViewMode] = useState('detected');

  return (
    <div className="space-y-4">
      {/* Top Split Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Columns2 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Synchronized Split-Screen Inspection
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSplitMode('2d_map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              splitMode === '2d_map'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                : 'text-slate-400 hover:text-white bg-ocean-900/60 border border-ocean-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Image + 2D Debris Map</span>
          </button>

          <button
            onClick={() => setSplitMode('3d_scene')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              splitMode === '3d_scene'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                : 'text-slate-400 hover:text-white bg-ocean-900/60 border border-ocean-700'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Image + 3D Scene</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid (50% / 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Side: Underwater Image with Bounding Boxes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
            <span>AI DETECTION IMAGE</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('original')}
                className={`px-2 py-0.5 rounded text-[11px] ${viewMode === 'original' ? 'bg-ocean-700 text-white' : 'text-slate-400'}`}
              >
                Original
              </button>
              <button
                onClick={() => setViewMode('enhanced')}
                className={`px-2 py-0.5 rounded text-[11px] ${viewMode === 'enhanced' ? 'bg-teal-700 text-white' : 'text-slate-400'}`}
              >
                Enhanced
              </button>
              <button
                onClick={() => setViewMode('detected')}
                className={`px-2 py-0.5 rounded text-[11px] ${viewMode === 'detected' ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400'}`}
              >
                Detection
              </button>
            </div>
          </div>

          <DetectionViewer
            imageUrl={viewMode === 'enhanced' && enhancedUrl ? enhancedUrl : imageUrl}
            detections={detections}
            viewMode={viewMode === 'enhanced' ? 'original' : viewMode}
            hoveredDetId={selectedDetId}
            setHoveredDetId={setSelectedDetId}
          />
        </div>

        {/* Right Side: 2D Spatial Map or 3D WebGL Scene */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 font-bold px-1">
            <span>{splitMode === '2d_map' ? '2D SPATIAL MAP' : '3D UNDERWATER SCENE'}</span>
            <span className="text-[11px] text-cyan-400 font-mono">SYNCHRONIZED SELECTION</span>
          </div>

          {splitMode === '2d_map' ? (
            <DebrisMap2D
              detections={detections}
              selectedDetId={selectedDetId}
              setSelectedDetId={setSelectedDetId}
              gpsInfo={gpsInfo}
              locationName={locationName}
            />
          ) : (
            <UnderwaterScene3D
              detections={detections}
              selectedDetId={selectedDetId}
              setSelectedDetId={setSelectedDetId}
            />
          )}
        </div>

      </div>
    </div>
  );
}
