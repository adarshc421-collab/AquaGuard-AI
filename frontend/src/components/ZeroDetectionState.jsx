import React from 'react';
import { ShieldCheck, CheckCircle2, Sparkles, Filter, RefreshCcw } from 'lucide-react';

export default function ZeroDetectionState({
  onSwitchMode,
  rejectedCount = 0
}) {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-teal-500/30 text-center space-y-4 shadow-2xl animate-in fade-in duration-300 max-w-2xl mx-auto">
      
      <div className="relative flex items-center justify-center w-16 h-16 mx-auto">
        <div className="absolute w-20 h-20 rounded-full border border-teal-400/30 animate-ping" />
        <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,230,118,0.3)]">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 inline-block">
          ✓ SCAN ANALYZED SUCCESSFULLY
        </span>
        <h3 className="text-xl font-extrabold text-white">
          No Reliable Marine Debris Detected
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          High-Precision Mode actively filtered out {rejectedCount > 0 ? `${rejectedCount} weak anomalies` : 'low-confidence visual artifacts'} (rocks, sand ripples & lighting reflections) to guarantee zero false alarms.
        </p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center items-center gap-3">
        <button
          onClick={() => onSwitchMode('balanced')}
          className="px-4 py-2 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-200 border border-ocean-700 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Switch to Balanced Mode (75% Threshold)</span>
        </button>
      </div>

    </div>
  );
}
