import React from 'react';
import { Eye, Layers, SlidersHorizontal, Image as ImageIcon } from 'lucide-react';

export default function BeforeAfterToggle({ 
  viewMode, 
  setViewMode, 
  showSplitSlider, 
  setShowSplitSlider,
  debrisCount 
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-ocean-900/90 border border-ocean-700/80 backdrop-blur-md">
      
      {/* View Mode Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => {
            setViewMode('original');
            setShowSplitSlider(false);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'original' && !showSplitSlider
              ? 'bg-ocean-700 text-white shadow-md border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800/60'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Original Raw Image</span>
        </button>

        <button
          onClick={() => {
            setViewMode('detected');
            setShowSplitSlider(false);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            viewMode === 'detected' && !showSplitSlider
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>AI Detection ({debrisCount})</span>
        </button>
      </div>

      {/* Interactive Split Slider Mode Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSplitSlider(!showSplitSlider)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showSplitSlider
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 shadow-[0_0_15px_rgba(0,242,254,0.3)]'
              : 'bg-ocean-800/60 hover:bg-ocean-800 text-slate-300 border border-ocean-700'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Interactive Split Slider</span>
        </button>
      </div>

    </div>
  );
}
