import React, { useState } from 'react';
import { Video, Film, Play, Activity, Clock, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { getMediaUrl } from '../config/api';

export default function RovVideoScan() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(14);

  const tracks = [
    {
      id: "TRK-01",
      category: "Fishing Net",
      frames: "18 / 24 frames",
      persistence: "75.0%",
      motion: "Stationary / Snagged on coral bedrock",
      conf: "95.4%",
      threat: "Severe - Ghost Fishing Hazard",
      color: "border-emerald-500/40 text-emerald-300"
    },
    {
      id: "TRK-02",
      category: "Plastic Bottle",
      frames: "14 / 24 frames",
      persistence: "58.3%",
      motion: "Tidal Current Drift (0.12 m/s East)",
      conf: "92.8%",
      threat: "High - Turtle Ingestion",
      color: "border-cyan-500/40 text-cyan-300"
    },
    {
      id: "TRK-03",
      category: "Can",
      frames: "9 / 24 frames",
      persistence: "37.5%",
      motion: "Seabed Sunk Stationary",
      conf: "91.2%",
      threat: "Moderate - Metal Oxidation",
      color: "border-amber-500/40 text-amber-300"
    }
  ];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-cyan-500/30 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              ROV / Video Temporal Frame Tracking Scan (Experimental Prototype)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates multi-frame temporal persistence voting across sequential ROV video frames
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
            ● PROTOTYPE: Frame-Persistence Filter
          </span>
        </div>
      </div>

      {/* Main Video Telemetry Simulation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Video Frame Monitor (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative aspect-[16/9] rounded-2xl bg-ocean-950 border-2 border-cyan-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
            
            {/* Background Sample Image representing active video feed */}
            <img
              src={getMediaUrl("/static/samples/coral_reef_plastics.jpg")}
              alt="ROV Video Feed"
              className="w-full h-full object-cover"
            />

            {/* Video HUD Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-transparent to-ocean-950/60 pointer-events-none" />

            {/* Top Status Bar */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span className="flex items-center gap-1.5 bg-ocean-950/80 px-2.5 py-1 rounded border border-ocean-800">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                ROV LIVE FEED: CAM-01 [1080p @ 30FPS]
              </span>
              <span className="bg-ocean-950/80 px-2.5 py-1 rounded border border-ocean-800">
                FRAME: {currentFrame} / 24 [2.0 FPS Sampled]
              </span>
            </div>

            {/* Simulated Tracking Bounding Box */}
            <div className="absolute left-[30%] top-[65%] w-[12%] h-[26%] border-2 border-cyan-400 bg-cyan-500/20 rounded shadow-[0_0_15px_#00f2fe]">
              <span className="absolute -top-5 left-0 bg-cyan-400 text-ocean-950 text-[9px] font-extrabold px-1 rounded">
                TRK-02 Plastic Bottle (93%)
              </span>
            </div>

            {/* Bottom Scrubber */}
            <div className="absolute bottom-3 left-3 right-3 bg-ocean-950/90 backdrop-blur-md p-2.5 rounded-xl border border-ocean-800 flex items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-ocean-950 font-bold flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlaying ? 'Pause' : 'Play Stream'}</span>
              </button>

              <input
                type="range"
                min="1"
                max="24"
                value={currentFrame}
                onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
                className="w-full accent-cyan-400 h-1.5 bg-ocean-900 rounded-lg cursor-pointer"
              />

              <span className="font-mono text-cyan-300 shrink-0 text-xs">
                00:{currentFrame < 10 ? `0${currentFrame}` : currentFrame}s
              </span>
            </div>

          </div>
        </div>

        {/* Right: Temporal Object Tracks Table (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Persistent Debris Tracks ({tracks.length})
          </h4>

          <div className="space-y-2.5">
            {tracks.map((trk) => (
              <div
                key={trk.id}
                className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 space-y-1.5 text-xs hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="font-mono text-cyan-400">{trk.id}</span>
                    {trk.category}
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{trk.conf}</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Persistence:</span>
                  <span className="font-mono text-slate-200">{trk.frames} ({trk.persistence})</span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Motion Vector:</span>
                  <span className="text-slate-300 truncate max-w-[140px]">{trk.motion}</span>
                </div>

                <p className="text-[10px] text-rose-300 bg-rose-500/10 p-1.5 rounded border border-rose-500/20 font-medium">
                  {trk.threat}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
