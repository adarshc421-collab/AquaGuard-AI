import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Layers, 
  Box, 
  Compass, 
  ShieldAlert, 
  Wrench, 
  FileText, 
  CheckCircle2,
  ShieldCheck,
  Navigation,
  FileDown,
  Anchor,
  Layers3
} from 'lucide-react';
import DetectionViewer from './DetectionViewer';
import DebrisMap2D from './DebrisMap2D';
import UnderwaterScene3D from './UnderwaterScene3D';
import EnvironmentalRiskMap from './EnvironmentalRiskMap';
import ImageQualityCard from './ImageQualityCard';
import InspectionPlanner from './InspectionPlanner';
import { getMediaUrl } from '../config/api';

export default function PresentationMode({
  isOpen,
  onClose,
  analysisData,
  previewUrl,
  enhancedUrl,
  onOpenReport
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: "step1",
      stepNum: "01",
      title: "Problem Statement & Underwater Data Challenges",
      subtitle: "Turbidity, severe red-channel color attenuation, acoustic speckle, and complex seabed textures",
      icon: Sparkles
    },
    {
      id: "step2",
      stepNum: "02",
      title: "Modality Identification & Quality Gate",
      subtitle: "Autonomous optical RGB vs acoustic side-scan sonar detection with objective quality scoring",
      icon: CheckCircle2
    },
    {
      id: "step3",
      stepNum: "03",
      title: "Multimodal Preprocessing & Enhancement",
      subtitle: "LAB-space CLAHE color recovery for optical images & bilateral speckle filtering for sonar",
      icon: Sparkles
    },
    {
      id: "step4",
      stepNum: "04",
      title: "Candidate Generation & Multi-Evidence Verification",
      subtitle: "Precision-first architecture: 7-point evidence verification & deterministic false positive rejection",
      icon: ShieldCheck
    },
    {
      id: "step5",
      stepNum: "05",
      title: "2D GIS Hotspot Mapping & Quadrant Clustering",
      subtitle: "DBSCAN spatial clustering into Named Hotspots (Alpha/Beta) and image-relative/GPS coordinates",
      icon: Compass
    },
    {
      id: "step6",
      stepNum: "06",
      title: "Autonomous ROV Inspection & Tooling Route Planner",
      subtitle: "Nearest-neighbor waypoint trajectory sequencing, battery budget estimation, and tooling protocols",
      icon: Navigation
    },
    {
      id: "step7",
      stepNum: "07",
      title: "3D Seafloor Depth Scene & Interactive Spatial Profiling",
      subtitle: "Interactive WebGL 3D reconstruction with AI estimated depth positioning",
      icon: Box
    },
    {
      id: "step8",
      stepNum: "08",
      title: "13-Section Environmental Compliance Audit Report",
      subtitle: "Complete verifiable audit trail with coordinates, threat analysis, and downloadable PDF",
      icon: FileText
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const current = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#020b14] text-white overflow-hidden select-none">
      
      {/* Top Presentation Header */}
      <div className="h-16 px-6 border-b border-ocean-800/80 bg-ocean-950/95 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-bold font-mono">
            SMART INDIA HACKATHON • JUDGE DEMO MODE
          </div>
          <span className="text-sm font-extrabold text-white hidden md:inline">
            AquaGuard AI – DETECT → VERIFY → MAP → ACT
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-cyan-400 bg-ocean-900 px-3 py-1 rounded-lg border border-ocean-800">
            SLIDE {currentSlide + 1} / {slides.length}
          </span>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slide Content Stage */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between max-w-7xl mx-auto w-full">
        
        {/* Slide Title Banner */}
        <div className="space-y-1 mb-4">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-extrabold tracking-wider uppercase">
            <span>STAGE {current.stepNum}</span>
            <span>•</span>
            <span>{current.title}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {current.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {current.subtitle}
          </p>
        </div>

        {/* Dynamic Slide Body */}
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          
          {/* Slide 1: Raw Input & Challenges */}
          {currentSlide === 0 && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="rounded-2xl overflow-hidden bg-ocean-900 border border-cyan-500/30 p-2 shadow-2xl text-center">
                <img
                  src={getMediaUrl(previewUrl)}
                  alt="Raw Underwater"
                  className="max-h-[340px] w-auto mx-auto object-contain rounded-xl"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  Input Stream • Modality: {analysisData?.modality || 'OPTICAL RGB'}
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Why Underwater Debris Detection is Hard
                  </h4>
                  <ul className="text-slate-300 space-y-1 list-disc pl-4 text-[11px] leading-relaxed">
                    <li><b>Red Wavelength Attenuation:</b> Water absorbs red light within 3-5 meters depth.</li>
                    <li><b>High Turbidity & Backscatter:</b> Suspended particulate matter causes severe contrast loss.</li>
                    <li><b>Biological Biofouling:</b> Debris overgrown with algae matches natural reef textures.</li>
                    <li><b>Acoustic Speckle Noise:</b> Sonar exhibits high speckle noise requiring adaptive filtering.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
                  <p className="text-slate-200 text-[11px] font-medium leading-relaxed">
                    <strong className="text-cyan-300">AquaGuard AI Solution:</strong> A precision-first pipeline that separates raw candidate detection from multi-stage physical evidence verification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slide 2: Quality Assessment */}
          {currentSlide === 1 && (
            <div className="w-full max-w-4xl space-y-4">
              <ImageQualityCard quality={analysisData?.quality} />
              <div className="p-4 rounded-xl bg-ocean-900/80 border border-ocean-700 text-xs text-slate-300 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Autonomous Modality & Quality Gate
                </h4>
                <p className="text-[11px] leading-relaxed">
                  The system evaluates RGB channel variance and frequency spectral signatures to automatically classify images as <b>OPTICAL RGB</b> or <b>SIDE-SCAN ACOUSTIC SONAR</b>, routing them to specialized enhancement pipelines.
                </p>
              </div>
            </div>
          )}

          {/* Slide 3: Multimodal Enhancement */}
          {currentSlide === 2 && (
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-ocean-900 border border-ocean-700 text-center space-y-2">
                <span className="text-xs font-bold text-slate-400 block">Raw Underwater Input</span>
                <img src={getMediaUrl(previewUrl)} alt="Raw" className="h-56 object-contain mx-auto rounded-lg" />
                <p className="text-[10px] text-slate-400 font-mono">Original visibility & color cast</p>
              </div>
              <div className="p-4 rounded-xl bg-ocean-900 border border-cyan-500/40 text-center space-y-2">
                <span className="text-xs font-bold text-cyan-300 block">Enhanced (LAB CLAHE / Sonar Bilateral)</span>
                <img src={getMediaUrl(enhancedUrl || previewUrl)} alt="Enhanced" className="h-56 object-contain mx-auto rounded-lg" />
                <p className="text-[10px] text-teal-300 font-mono">Restored luminance & high-frequency edge contrast</p>
              </div>
            </div>
          )}

          {/* Slide 4: Multi-Evidence Verification */}
          {currentSlide === 3 && (
            <div className="w-full max-w-4xl space-y-4">
              <DetectionViewer
                imageUrl={previewUrl}
                enhancedUrl={enhancedUrl}
                detections={analysisData?.detections || []}
                uncertainCandidates={analysisData?.uncertain_candidates || []}
                rejectedCandidates={analysisData?.rejected_candidates || []}
                validationSummary={analysisData?.validation_summary}
                viewMode="detected"
              />
            </div>
          )}

          {/* Slide 5: 2D GIS Hotspot Mapping */}
          {currentSlide === 4 && (
            <div className="w-full max-w-4xl">
              <DebrisMap2D
                detections={analysisData?.detections || []}
                hotspots={analysisData?.hotspots || []}
                inspectionPlan={analysisData?.inspection_plan}
                selectedDetId={analysisData?.detections?.[0]?.id}
                setSelectedDetId={() => {}}
                gpsInfo={analysisData?.gps_info}
              />
            </div>
          )}

          {/* Slide 6: Autonomous Inspection Route */}
          {currentSlide === 5 && (
            <div className="w-full max-w-4xl">
              <InspectionPlanner
                inspectionPlan={analysisData?.inspection_plan}
                confirmedTargets={analysisData?.detections || []}
              />
            </div>
          )}

          {/* Slide 7: 3D Seafloor Scene */}
          {currentSlide === 6 && (
            <div className="w-full max-w-4xl">
              <UnderwaterScene3D
                detections={analysisData?.detections || []}
                selectedDetId={analysisData?.detections?.[0]?.id}
                setSelectedDetId={() => {}}
              />
            </div>
          )}

          {/* Slide 8: Compliance & Report */}
          {currentSlide === 7 && (
            <div className="w-full max-w-3xl p-8 rounded-2xl glass-panel border border-cyan-400/40 text-center space-y-5 shadow-2xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-2xl font-black text-white">
                Complete End-to-End Pipeline Verified
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                AquaGuard AI delivers a robust, precision-first system ready for Smart India Hackathon: from raw camera/sonar data to verified target classification, DBSCAN spatial hotspots, autonomous ROV inspection routes, and 13-section audit reports.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenReport) onOpenReport();
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-ocean-950 font-black text-xs shadow-[0_0_25px_rgba(0,242,254,0.4)] flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>PREVIEW & DOWNLOAD AUDIT PDF</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-bold text-xs border border-ocean-700"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-ocean-800">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ocean-850 hover:bg-ocean-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold transition-all border border-ocean-700"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentSlide
                    ? 'w-7 bg-cyan-400 shadow-[0_0_10px_#00f2fe]'
                    : 'w-2 bg-ocean-800 hover:bg-ocean-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-ocean-950 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)]"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
