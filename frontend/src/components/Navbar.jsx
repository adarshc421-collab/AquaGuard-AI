import React, { useState, useRef, useEffect } from 'react';
import { 
  Waves, 
  LayoutDashboard,
  Sparkles, 
  Compass, 
  FileText,
  Box, 
  Layers, 
  Video, 
  History as HistoryIcon, 
  Presentation,
  ChevronDown,
  Layers3,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ShieldCheck,
  FlaskConical
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenHistory, 
  onOpenSpecs, 
  onOpenValidationLab,
  onOpenPresentation,
  systemStatus = 'online'
}) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const advancedRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (advancedRef.current && !advancedRef.current.contains(e.target)) {
        setIsAdvancedOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdvancedActive = ['3d_scene', 'batch_survey', 'multi_view', 'rov_scan'].includes(activeTab);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ocean-700/60 bg-ocean-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-ocean-600/30 border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all duration-300 shadow-[0_0_15px_rgba(0,242,254,0.2)]">
              <Waves className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  AquaGuard <span className="text-cyan-400">AI</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">
                  DETECT • VERIFY • MAP • ACT
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 font-medium tracking-wide">
                Underwater Debris Detection & Environmental Intelligence
              </p>
            </div>
          </div>

          {/* Primary 5-Tab Navigation Pipeline */}
          <nav className="flex items-center gap-1 sm:gap-1.5 py-1">
            
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* 2. Analyze (Detect & Verify) */}
            <button
              onClick={() => setActiveTab('analyze')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'analyze'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analyze</span>
            </button>

            {/* 3. Survey Map (Spatial Hotspots) */}
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'map'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Survey Map</span>
            </button>

            {/* 4. Inspection Plan (Autonomous Route) */}
            <button
              onClick={() => setActiveTab('plan')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'plan'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspection Plan</span>
            </button>

            {/* 5. Reports */}
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === 'reports'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Reports</span>
            </button>

            {/* Advanced Tools Dropdown */}
            <div className="relative" ref={advancedRef}>
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isAdvancedActive
                    ? 'bg-ocean-800 text-teal-300 border border-teal-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ocean-850/60'
                }`}
              >
                <span>Lab Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdvancedOpen ? 'rotate-180' : ''}`} />
              </button>

              {isAdvancedOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-ocean-900 border border-ocean-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => { setActiveTab('3d_scene'); setIsAdvancedOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-ocean-800 hover:text-cyan-300 text-left transition-colors"
                  >
                    <Box className="w-4 h-4 text-teal-400" />
                    <div>
                      <div>3D Seafloor Scene</div>
                      <div className="text-[10px] text-slate-400 font-normal">Interactive WebGL viewer</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { if (onOpenValidationLab) onOpenValidationLab(); setIsAdvancedOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-ocean-800 hover:text-cyan-300 text-left transition-colors"
                  >
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div>Validation Lab (Hard Negatives)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Test zero false-positive filters</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('batch_survey'); setIsAdvancedOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-ocean-800 hover:text-cyan-300 text-left transition-colors"
                  >
                    <Layers3 className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div>Batch Survey (5 Frames)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Dive transect aggregation</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('multi_view'); setIsAdvancedOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-ocean-800 hover:text-cyan-300 text-left transition-colors"
                  >
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div>Multi-View Stereo 3D</div>
                      <div className="text-[10px] text-slate-400 font-normal">Multi-camera triangulation</div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab('rov_scan'); setIsAdvancedOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-ocean-800 hover:text-cyan-300 text-left transition-colors"
                  >
                    <Video className="w-4 h-4 text-amber-400" />
                    <div>
                      <div>ROV Video Feed Scan</div>
                      <div className="text-[10px] text-slate-400 font-normal">Temporal frame tracking</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </nav>

          {/* Right Actions: Validation Lab, Specs, History & SIH Judge Mode */}
          <div className="flex items-center gap-2 shrink-0">
            
            {onOpenValidationLab && (
              <button
                onClick={onOpenValidationLab}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
                title="Open False-Positive Hard Negative Benchmark Lab"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>Validation Lab</span>
              </button>
            )}

            <button
              onClick={onOpenSpecs}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 hover:bg-ocean-850 border border-ocean-700/50 transition-all"
              title="Pipeline Architecture & Disclosures"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Specs</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-850 transition-all"
              title="Survey Audit History"
            >
              <HistoryIcon className="w-4 h-4" />
            </button>

            {/* SIH Presentation Mode Button */}
            <button
              onClick={onOpenPresentation}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-ocean-950 font-extrabold text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:shadow-[0_0_20px_rgba(0,242,254,0.5)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JUDGE MODE</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
