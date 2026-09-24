import React from 'react';
import { X, Cpu, Eye, Zap, Layers, CheckCircle2, Sliders, Shield, ShieldCheck } from 'lucide-react';

export default function ModelSpecsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ocean-700/80 bg-ocean-950/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AquaGuard AI – System Architecture & Specifications</h3>
              <p className="text-xs text-slate-400">Technical Details for Smart India Hackathon (SIH) Evaluation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* Pipeline Flowchart */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Multi-Stage Inference & Verification Pipeline</span>
            </h4>
            <div className="p-4 rounded-xl bg-ocean-900/80 border border-ocean-700 grid grid-cols-1 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-ocean-950 border border-ocean-800">
                <span className="text-[10px] font-mono text-cyan-400">STAGE 1</span>
                <p className="font-bold text-white mt-1">Modality & Quality</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Optical vs Sonar Gate</p>
              </div>

              <div className="p-2.5 rounded-lg bg-ocean-950 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-teal-400">STAGE 2</span>
                <p className="font-bold text-white mt-1">Adaptive Enhance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">LAB CLAHE / Bilateral</p>
              </div>

              <div className="p-2.5 rounded-lg bg-ocean-950 border border-cyan-500/30">
                <span className="text-[10px] font-mono text-cyan-400">STAGE 3</span>
                <p className="font-bold text-white mt-1">Dual-Engine Detect</p>
                <p className="text-[10px] text-slate-400 mt-0.5">YOLO / CV Fallback</p>
              </div>

              <div className="p-2.5 rounded-lg bg-ocean-950 border border-emerald-500/30">
                <span className="text-[10px] font-mono text-emerald-400">STAGE 4</span>
                <p className="font-bold text-white mt-1">False-Positive Gate</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Annular contrast & NMS</p>
              </div>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-ocean-900/60 border border-ocean-700 text-center">
              <span className="text-slate-400 text-[10px] uppercase">Detector Engine</span>
              <p className="text-sm font-black text-cyan-300 mt-1">Dual-Mode</p>
              <p className="text-[10px] text-slate-400">YOLO + CV Fallback</p>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/60 border border-ocean-700 text-center">
              <span className="text-slate-400 text-[10px] uppercase">Verification</span>
              <p className="text-sm font-black text-emerald-400 mt-1">Multi-Stage</p>
              <p className="text-[10px] text-slate-400">Precision FP Filter</p>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/60 border border-ocean-700 text-center">
              <span className="text-slate-400 text-[10px] uppercase">Taxonomy</span>
              <p className="text-sm font-black text-white mt-1">8 Standard</p>
              <p className="text-[10px] text-slate-400">Marine Debris Classes</p>
            </div>

            <div className="p-3 rounded-xl bg-ocean-900/60 border border-ocean-700 text-center">
              <span className="text-slate-400 text-[10px] uppercase">Modality Support</span>
              <p className="text-sm font-black text-teal-300 mt-1">Optical & Sonar</p>
              <p className="text-[10px] text-slate-400">RGB & Acoustic Scans</p>
            </div>
          </div>

          {/* Supported Debris Classes Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Marine Debris Taxonomy & Degradation Timelines
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-cyan-500/20">
                <span className="font-bold text-white block">Plastic Bottle</span>
                <span className="text-cyan-300 text-[10px]">~450 yrs (PET)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-pink-500/20">
                <span className="font-bold text-white block">Plastic Bag</span>
                <span className="text-pink-300 text-[10px]">~500 yrs (LDPE)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-emerald-500/20">
                <span className="font-bold text-white block">Fishing Net / Ghost Gear</span>
                <span className="text-emerald-300 text-[10px]">~600+ yrs (Nylon)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-yellow-500/20">
                <span className="font-bold text-white block">Rope</span>
                <span className="text-yellow-300 text-[10px]">~300 yrs (Polypropylene)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-amber-500/20">
                <span className="font-bold text-white block">Can / Metal</span>
                <span className="text-amber-300 text-[10px]">~200 yrs (Aluminum)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-purple-500/20">
                <span className="font-bold text-white block">Tire</span>
                <span className="text-purple-300 text-[10px]">~1000 yrs (Rubber)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-sky-500/20">
                <span className="font-bold text-white block">Plastic Container</span>
                <span className="text-sky-300 text-[10px]">~400 yrs (HDPE)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-ocean-900/70 border border-rose-500/20">
                <span className="font-bold text-white block">Other Marine Debris</span>
                <span className="text-rose-300 text-[10px]">~350 yrs (Mixed)</span>
              </div>
            </div>
          </div>

          {/* Technical Disclosures */}
          <div className="p-4 rounded-xl bg-ocean-900/80 border border-ocean-700 space-y-1.5 leading-relaxed">
            <h5 className="font-bold text-white">Technical Honesty & Calibration Disclosure</h5>
            <p className="text-slate-300">
              Depth indications represent <strong>AI-estimated visual relative layers</strong> calculated from vertical scene perspective and bounding box geometry. Real-world ROV operations should cross-reference with onboard acoustic altimeters. All latencies are computed from real elapsed inference runtime with zero synthetic randomizers.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ocean-700/80 bg-ocean-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">Compatible with ROV, AUV & Diver-mounted camera feeds</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
