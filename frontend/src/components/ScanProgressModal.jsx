import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Loader2, ShieldAlert, Cpu } from 'lucide-react';

export default function ScanProgressModal({ isOpen, onComplete, currentSampleTitle }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: "Initializing AI Scanner", desc: "Calibrating deep-sea optical baseline" },
    { title: "Checking Image Quality", desc: "Measuring visibility, turbidity & contrast metrics" },
    { title: "Enhancing Underwater Image", desc: "Applying LAB-space CLAHE & color constancy" },
    { title: "Detecting Underwater Objects", desc: "YOLOv8 marine debris localization & bounding boxes" },
    { title: "Analyzing Marine Debris", desc: "Categorizing plastics, ghost nets, tires & cans" },
    { title: "Mapping Detected Objects", desc: "Projecting 2D spatial coordinates & relative layout" },
    { title: "Generating 3D Spatial Model", desc: "Estimating depth & building WebGL 3D scene" },
    { title: "Environmental Risk & Cleanup Analysis", desc: "Computing density zones & intervention protocols" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 400);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-400/40 shadow-[0_0_50px_rgba(0,242,254,0.25)] space-y-6">
        
        {/* Animated Sonar Rings Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative flex items-center justify-center w-16 h-16">
            <div className="absolute w-20 h-20 rounded-full border border-cyan-400/30 animate-ping" />
            <div className="absolute w-14 h-14 rounded-full border border-teal-400/50 animate-ping" style={{ animationDelay: '0.3s' }} />
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-ocean-800/60 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)]">
              <Cpu className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              AI Underwater Scanning in Progress
            </h3>
            <p className="text-xs text-cyan-300/80 mt-1 font-mono">
              Target: {currentSampleTitle || 'Custom Underwater Frame'}
            </p>
          </div>
        </div>

        {/* Multi-Step Checklist */}
        <div className="space-y-2.5 bg-ocean-900/80 p-4 rounded-2xl border border-ocean-700/80">
          {steps.map((step, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div
                key={step.title}
                className={`flex items-center justify-between p-2 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                    : isDone
                    ? 'bg-ocean-950/40 opacity-90'
                    : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-600 block" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isCurrent ? 'text-cyan-200' : isDone ? 'text-slate-200' : 'text-slate-500'}`}>
                      {step.title}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">{step.desc}</p>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isDone ? 'text-emerald-400 bg-emerald-500/10' : isCurrent ? 'text-cyan-300 bg-cyan-500/10' : 'text-slate-600'
                }`}>
                  {isDone ? 'DONE' : isCurrent ? 'ACTIVE' : 'WAIT'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>PIPELINE PROGRESS</span>
            <span className="text-cyan-300 font-bold">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-ocean-950 rounded-full overflow-hidden border border-ocean-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300 shadow-[0_0_10px_#00f2fe]"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
