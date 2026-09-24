import React from 'react';
import { Eye, ShieldAlert, CheckCircle2, Sparkles, Sun, Contrast, Droplets } from 'lucide-react';

export default function ImageQualityCard({ quality }) {
  if (!quality) return null;

  const {
    overall_score = 82,
    visibility = "Good",
    brightness = "Moderate",
    contrast = "Good",
    haze = "Medium",
    readiness = "READY",
    warning = null
  } = quality;

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-cyan-500/30 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Image Quality & Optical Assessment
          </h3>
        </div>

        <div className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
          readiness === 'READY'
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }`}>
          {readiness === 'READY' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{readiness}</span>
        </div>
      </div>

      {/* Main Score & Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Overall Quality */}
        <div className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase font-medium">Quality Score</span>
          <p className="text-2xl font-black text-cyan-300 mt-0.5">
            {overall_score}%
          </p>
          <div className="w-full h-1.5 bg-ocean-950 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full"
              style={{ width: `${overall_score}%` }}
            />
          </div>
        </div>

        {/* Visibility */}
        <div className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" /> Visibility
          </span>
          <p className="text-sm font-bold text-white mt-1">{visibility}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Optical index</p>
        </div>

        {/* Brightness */}
        <div className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" /> Brightness
          </span>
          <p className="text-sm font-bold text-white mt-1">{brightness}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Luminance</p>
        </div>

        {/* Contrast */}
        <div className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
            <Contrast className="w-3 h-3 text-teal-400" /> Contrast
          </span>
          <p className="text-sm font-bold text-white mt-1">{contrast}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Dynamic range</p>
        </div>

        {/* Underwater Haze */}
        <div className="p-3 rounded-xl bg-ocean-900/90 border border-ocean-700/80 text-center">
          <span className="text-[10px] text-slate-400 uppercase font-medium flex items-center justify-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" /> Haze
          </span>
          <p className="text-sm font-bold text-white mt-1">{haze}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Turbidity</p>
        </div>
      </div>

      {/* Warning banner if visibility is low */}
      {warning && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}
