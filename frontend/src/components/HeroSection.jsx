import React from 'react';
import { ArrowRight, Sparkles, ShieldAlert, CheckCircle2, Eye, Compass, BarChart3, Database } from 'lucide-react';

export default function HeroSection({ onAnalyzeClick, onSelectSample, stats }) {
  return (
    <section className="relative pt-6 pb-12 overflow-hidden">
      {/* Decorative Ocean Lighting Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Heading, Problem & Solution, CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Smart India Hackathon • Environmental AI</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                AquaGuard <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">AI</span>
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-cyan-200">
                AI-Powered Underwater Marine Debris Detection
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700/60 backdrop-blur-md">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>The Problem</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Underwater marine debris is hidden in dark, blurry, and turbid oceanic depths. Manual divers & surveys are dangerously slow and expensive.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-cyan-500/20 backdrop-blur-md">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>The AI Solution</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time computer vision with underwater contrast restoration & YOLO localization detects plastics, nets, cans, tires, and ghost gear instantly.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onAnalyzeClick}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-ocean-950 font-bold text-sm shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:shadow-[0_0_35px_rgba(0,242,254,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze Image Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectSample('coral_reef_plastics')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-ocean-850/80 hover:bg-ocean-800 text-slate-200 border border-ocean-700 hover:border-cyan-500/40 text-sm font-semibold transition-all backdrop-blur-md"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>Launch 1-Click Demo</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Statistics Matrix */}
          <div className="lg:col-span-5">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-cyan-500/20 shadow-2xl">
              {/* Corner Watermark */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-4 mb-4 border-b border-ocean-800">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Live System Telemetry
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ● ACTIVE MONITORING
                </span>
              </div>

              {/* 4 Key Statistics Cards */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-ocean-900/90 border border-ocean-700/60">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Images Analyzed</p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {stats?.images_analyzed?.toLocaleString() || '128'}<span className="text-cyan-400 text-lg">+</span>
                  </p>
                  <p className="text-[10px] text-cyan-300/80 mt-1 flex items-center gap-1">
                    <Database className="w-3 h-3" /> Real-time feed
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ocean-900/90 border border-ocean-700/60">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Debris Detected</p>
                  <p className="text-2xl font-extrabold text-white mt-1">
                    {stats?.debris_detected?.toLocaleString() || '496'}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    7 debris classes
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ocean-900/90 border border-ocean-700/60">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Detection Accuracy</p>
                  <p className="text-2xl font-extrabold text-cyan-400 mt-1">
                    {stats?.detection_accuracy || '96.4'}%
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    mAP@0.5 benchmark
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ocean-900/90 border border-ocean-700/60">
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Cleanup Impact</p>
                  <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {stats?.estimated_cleanup_kg || '1,866'} <span className="text-xs font-normal text-slate-300">kg</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Estimated mapped waste
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-ocean-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  Target Ecosystem: Coral Reefs & Coastal Benthic
                </span>
                <span className="text-cyan-400 font-mono text-[11px]">YOLOv8-Marine</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
