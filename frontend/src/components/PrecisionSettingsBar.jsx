import React from 'react';
import { ShieldCheck, SlidersHorizontal, Radio, Sparkles, AlertCircle, Info } from 'lucide-react';

export default function PrecisionSettingsBar({
  detectionMode,
  setDetectionMode,
  precisionThreshold,
  setPrecisionThreshold,
  isSonarMode,
  setIsSonarMode,
  onApplySettings,
  isLoading
}) {
  const modes = [
    { id: "precision", label: "Precision", desc: "Strict verification, highest reliability (Min 85% conf)", badge: "HIGH PRECISION" },
    { id: "balanced", label: "Balanced", desc: "Standard thresholds for general benthic surveys (Min 75% conf)", badge: "BALANCED" },
    { id: "sensitive", label: "Sensitive", desc: "Lower threshold, permits exploratory candidates (Min 65% conf)", badge: "EXPLORATORY" }
  ];

  return (
    <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 space-y-3">
      
      {/* Top Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-ocean-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>High-Precision False Positive Prevention</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
                ACTIVE
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Multi-stage shape, local contrast & background validation filter
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-ocean-950/80 p-1 rounded-xl border border-ocean-800">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setDetectionMode(m.id);
                if (m.id === 'precision') setPrecisionThreshold(0.85);
                else if (m.id === 'balanced') setPrecisionThreshold(0.75);
                else setPrecisionThreshold(0.65);
                onApplySettings(m.id, m.id === 'precision' ? 0.85 : (m.id === 'balanced' ? 0.75 : 0.65), isSonarMode);
              }}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                detectionMode === m.id
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 text-ocean-950 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                  : 'text-slate-400 hover:text-white hover:bg-ocean-900'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Row: Threshold Slider & Sonar Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Precision Threshold Slider */}
        <div className="flex items-center gap-3 bg-ocean-900/80 px-3.5 py-1.5 rounded-xl border border-ocean-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-medium">Detection Precision:</span>
          
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.70"
              max="0.95"
              step="0.05"
              value={precisionThreshold}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setPrecisionThreshold(val);
                onApplySettings(detectionMode, val, isSonarMode);
              }}
              className="w-24 accent-cyan-400 cursor-pointer h-1.5 bg-ocean-950 rounded-lg"
            />
            <span className="font-mono text-cyan-300 font-bold w-10 text-right">
              {Math.round(precisionThreshold * 100)}%
            </span>
          </div>
        </div>

        {/* Sonar Acoustic Mode Toggle */}
        <div className="flex items-center gap-2 bg-ocean-900/80 px-3.5 py-1.5 rounded-xl border border-ocean-800">
          <Radio className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-slate-300 font-medium">Acoustic Shadow Verification:</span>
          <button
            onClick={() => {
              const newSonar = !isSonarMode;
              setIsSonarMode(newSonar);
              onApplySettings(detectionMode, precisionThreshold, newSonar);
            }}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
              isSonarMode
                ? 'bg-teal-500 text-ocean-950 shadow-[0_0_10px_rgba(0,230,118,0.4)]'
                : 'bg-ocean-950 text-slate-400 border border-ocean-800'
            }`}
          >
            {isSonarMode ? 'SONAR ACTIVE' : 'OPTICAL (RGB)'}
          </button>
        </div>

        {/* Real-time Guidance Message */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            {detectionMode === 'precision'
              ? 'Precision mode shows only targets with strong supporting evidence.'
              : detectionMode === 'balanced'
              ? 'Balanced mode applies standard marine object validation.'
              : 'Sensitive mode shows exploratory anomalies with relaxed filters.'}
          </span>
        </div>

      </div>

    </div>
  );
}
