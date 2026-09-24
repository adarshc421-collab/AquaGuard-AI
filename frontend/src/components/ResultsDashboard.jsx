import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../constants/debrisData';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Zap, 
  FileDown, 
  BarChart2, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Layers,
  Compass,
  Box,
  Droplets,
  Anchor,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';

export default function ResultsDashboard({
  analysisData,
  hoveredDetId,
  setHoveredDetId,
  onGenerateReport,
  onSwitchTo2DMap,
  onSwitchTo3DScene,
  onOpenAuditPanel
}) {
  const [selectedExpId, setSelectedExpId] = useState(null);

  if (!analysisData) return null;

  const {
    total_debris = 0,
    plastic_objects = 0,
    fishing_gear = 0,
    other_debris = 0,
    average_confidence = 0.917,
    average_confidence_pct = "91.7%",
    estimated_depth_range = "1.5–4.2 m",
    severity = 'Low',
    severity_desc = '',
    highest_confidence = 0.95,
    processing_time_ms = 42.0,
    category_counts = {},
    detections = [],
    uncertain_candidates = [],
    rejected_candidates = [],
    validation_summary,
    cleanup_priorities = [],
    action_recommendation,
    density_zones = {},
    session_id
  } = analysisData;

  // High Risk Count calculation
  const highRiskCount = detections.filter(d => 
    (d.threat_level && (d.threat_level.includes('Critical') || d.threat_level.includes('Severe') || d.threat_level.includes('High'))) ||
    d.category.includes('Net') || d.category.includes('Tire')
  ).length;

  const topPriorityLevel = cleanup_priorities[0]?.priority_level || (severity === 'CRITICAL' || severity === 'HIGH' ? 'HIGH' : 'MEDIUM');

  // Sector hotspot calculation
  const dominantZone = Object.entries(density_zones).sort((a, b) => b[1].count - a[1].count)[0];
  const hotspotText = dominantZone && dominantZone[1].count > 0
    ? `${dominantZone[1].count} objects concentrated in ${dominantZone[0]}`
    : "Debris evenly distributed across survey area";

  return (
    <div className="space-y-6">
      
      {/* 1. Top 4 Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        {/* Metric 1: Verified Total Objects */}
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total Objects</span>
          <p className="text-3xl font-black text-emerald-400 mt-1">{total_debris}</p>
          <span className="text-[11px] text-emerald-300/80 font-medium">Verified Targets</span>
        </div>

        {/* Metric 2: High Risk Count */}
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">High Eco-Threat</span>
          <p className="text-3xl font-black text-rose-400 mt-1">{highRiskCount}</p>
          <span className="text-[11px] text-slate-400">Critical / Severe Targets</span>
        </div>

        {/* Metric 3: Ghost Gear Count */}
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Ghost Gear Hazard</span>
          <p className="text-3xl font-black text-amber-400 mt-1">{fishing_gear}</p>
          <span className="text-[11px] text-slate-400">Nets & Snagged Ropes</span>
        </div>

        {/* Metric 4: Cleanup Priority */}
        <div className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
          topPriorityLevel === 'HIGH' ? 'bg-rose-500/10 border-rose-500/40' :
          'bg-cyan-500/10 border-cyan-500/40'
        }`}>
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Intervention Level</span>
          <p className={`text-3xl font-black mt-1 ${topPriorityLevel === 'HIGH' ? 'text-rose-400' : 'text-cyan-400'}`}>
            {topPriorityLevel === 'HIGH' ? 'PRIORITY 1' : 'PRIORITY 2'}
          </p>
          <span className="text-[11px] text-slate-300 font-medium">ROV Deployment Plan</span>
        </div>

      </div>

      {/* 2. Prominent "WHAT SHOULD I DO?" Action Recommendation Card */}
      {action_recommendation && (
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border-2 border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,254,0.15)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-ocean-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {action_recommendation.priority_badge || 'OPERATIONAL ACTION'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Timeframe: {action_recommendation.timeframe || 'Immediate'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-1">
                  WHAT SHOULD I DO? — {action_recommendation.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onGenerateReport}
              className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 self-start md:self-auto"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Action PDF</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 text-xs">
            
            {/* Action Summary */}
            <div className="lg:col-span-2 space-y-2">
              <p className="text-slate-200 leading-relaxed font-medium">
                {action_recommendation.action_summary}
              </p>
              <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span><b>Primary Target Sector:</b> {action_recommendation.target_sector}</span>
                <span>•</span>
                <span><b>Hotspot Status:</b> {hotspotText}</span>
              </div>
            </div>

            {/* Required Equipment */}
            <div className="bg-ocean-950/60 p-3.5 rounded-xl border border-ocean-800 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Required Intervention Equipment
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(action_recommendation.required_equipment || ['Diver Mesh Bags']).map((eq, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-ocean-850 text-cyan-300 border border-cyan-500/30">
                    {eq}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Jump 1: 2D Survey Map */}
        <div
          onClick={onSwitchTo2DMap}
          className="glass-panel p-4 rounded-xl border border-ocean-700 hover:border-cyan-400/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                2D Spatial Sector Map →
              </h5>
              <p className="text-[11px] text-slate-400">
                View 4-quadrant debris concentration
              </p>
            </div>
          </div>
        </div>

        {/* Jump 2: 3D Seafloor Scene */}
        <div
          onClick={onSwitchTo3DScene}
          className="glass-panel p-4 rounded-xl border border-ocean-700 hover:border-teal-400/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-400/30 group-hover:scale-110 transition-transform">
              <Box className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                3D Seafloor Scene →
              </h5>
              <p className="text-[11px] text-slate-400">
                Interactive WebGL depth visualization
              </p>
            </div>
          </div>
        </div>

        {/* Jump 3: Full Environmental Audit */}
        <div
          onClick={onGenerateReport}
          className="glass-panel p-4 rounded-xl border border-ocean-700 hover:border-cyan-400/50 cursor-pointer transition-all group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/30 group-hover:scale-110 transition-transform">
              <FileDown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                Download Audit PDF Report →
              </h5>
              <p className="text-[11px] text-slate-400">
                10-section verified compliance document
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Itemized Verified Debris Register with "Why detected?" Explanation */}
      <div className="glass-panel p-5 rounded-2xl border border-ocean-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Itemized Verified Debris Register
            </h4>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {detections.length} targets verified
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {detections.map((det, idx) => {
            const isHovered = hoveredDetId === det.id;
            const isExpOpen = selectedExpId === det.id;

            return (
              <div
                key={det.id}
                onMouseEnter={() => setHoveredDetId(det.id)}
                onMouseLeave={() => setHoveredDetId(null)}
                className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-ocean-800 border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                    : 'bg-ocean-900/70 border-ocean-700/70 hover:border-ocean-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-slate-400 font-bold">#{idx + 1}</span>
                    <span className="font-bold text-white text-xs">{det.label}</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-xs font-bold">
                    {(det.confidence * 100).toFixed(1)}%
                  </span>
                </div>

                {/* AI Optical Explanation */}
                <div className="mt-2 text-[11px] text-slate-300 bg-ocean-950/60 p-2 rounded-lg border border-ocean-800/80">
                  <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">Why detected:</span>
                  <p className="leading-snug text-slate-300">
                    {det.ai_explanation || `Verified ${det.label} via local edge contrast and geometric shape constraint.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-ocean-800 text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500">Sector:</span> {det.spatial?.sector_key || 'A'} ({det.spatial?.position_label})
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Depth:</span> {det.estimated_depth_m}m
                  </div>
                  <div>
                    <span className="text-slate-500">Tool:</span> {det.cleanup_tool || 'Manual Bag'}
                  </div>
                  <div className="text-right text-slate-300">
                    ~{det.degradation_years || 400} yrs
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
