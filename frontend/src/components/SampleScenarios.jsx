import React from 'react';
import { SAMPLE_SCENARIOS } from '../constants/debrisData';
import { Sparkles, MapPin, Gauge, Layers } from 'lucide-react';
import { getMediaUrl } from '../config/api';

export default function SampleScenarios({ onSelectSample, currentSampleId, isLoading }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Hackathon Demo Scenarios (1-Click Test Drive)
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          Instant pre-calibrated underwater tests
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SAMPLE_SCENARIOS.map((sample) => {
          const isSelected = currentSampleId === sample.id;
          return (
            <button
              key={sample.id}
              disabled={isLoading}
              onClick={() => onSelectSample(sample.id)}
              className={`group relative text-left rounded-xl p-2.5 transition-all duration-300 border ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.25)] ring-1 ring-cyan-400'
                  : 'bg-ocean-900/60 hover:bg-ocean-850 border-ocean-700/60 hover:border-cyan-500/40'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2 bg-ocean-950">
                <img
                  src={getMediaUrl(sample.image)}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/80 via-transparent to-transparent" />
                
                {/* Severity pill */}
                <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  sample.severity === 'High' 
                    ? 'bg-rose-500/90 text-white' 
                    : sample.severity === 'Medium'
                    ? 'bg-amber-500/90 text-black font-extrabold'
                    : 'bg-emerald-500/90 text-black font-extrabold'
                }`}>
                  {sample.severity}
                </span>

                <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold text-cyan-300 flex items-center gap-1 bg-ocean-950/70 px-1.5 py-0.5 rounded backdrop-blur-sm">
                  <Layers className="w-3 h-3" />
                  {sample.badge}
                </span>
              </div>

              {/* Title & metadata */}
              <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                {sample.title}
              </h4>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{sample.depth}</span>
                </span>
                <span className="text-cyan-400 font-medium">Select →</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
