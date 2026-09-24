import React from 'react';
import { Waves, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer({ onOpenSpecs, onOpenHistory }) {
  return (
    <footer className="w-full border-t border-ocean-800/80 bg-ocean-950/90 py-10 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Waves className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">
                AquaGuard <span className="text-cyan-400">AI</span>
              </p>
              <p className="text-[11px] text-slate-400">
                AI Underwater Marine Debris Detection & Ecosystem Protection System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={onOpenSpecs}
              className="hover:text-cyan-300 transition-colors"
            >
              Model Architecture
            </button>
            <span>•</span>
            <button
              onClick={onOpenHistory}
              className="hover:text-cyan-300 transition-colors"
            >
              Survey History
            </button>
            <span>•</span>
            <span className="text-emerald-400 font-mono">
              SIH Hackathon Ready
            </span>
          </div>

        </div>

        <div className="border-t border-ocean-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <p>© 2026 AquaGuard AI • Automated Computer Vision for Ocean Cleanups.</p>
          <p className="flex items-center gap-1">
            Built for Smart India Hackathon with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Ocean Ecology
          </p>
        </div>
      </div>
    </footer>
  );
}
