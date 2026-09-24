import React from 'react';
import { 
  Navigation, 
  Battery, 
  Clock, 
  MapPin, 
  Wrench, 
  ShieldCheck, 
  Anchor, 
  ArrowRight,
  Compass,
  CheckCircle2,
  FileDown
} from 'lucide-react';

export default function InspectionPlanner({ 
  inspectionPlan, 
  confirmedTargets = [],
  onSelectTarget,
  onGenerateReport
}) {
  if (!inspectionPlan || !inspectionPlan.waypoints || inspectionPlan.waypoints.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-ocean-700 text-center space-y-3">
        <Navigation className="w-10 h-10 text-cyan-400 mx-auto opacity-60" />
        <h3 className="text-base font-bold text-white">Autonomous Inspection Planner</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No verified targets currently loaded. Upload an underwater scan or select a sample scenario in the Analyze tab to generate an autonomous inspection mission.
        </p>
      </div>
    );
  }

  const {
    mission_status = 'OPTIMIZED',
    total_distance_m = 142.5,
    estimated_duration_min = 18.4,
    battery_consumption_pct = '14.2%',
    waypoints = [],
    disclaimer
  } = inspectionPlan;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              AUTONOMOUS MISSION PROFILE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {waypoints.length} Total Waypoints
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <span>ROV Autonomous Inspection & Remediation Route</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Optimized nearest-neighbor transit trajectory prioritizing high-threat ghost gear and benthic contamination
          </p>
        </div>

        <button
          onClick={onGenerateReport}
          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <FileDown className="w-4 h-4" />
          <span>Export Route Plan</span>
        </button>
      </div>

      {/* 4 Core Mission KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Route Distance</span>
          <p className="text-2xl font-black text-cyan-300 mt-1">{total_distance_m} m</p>
          <span className="text-[10px] text-slate-400">Surface to Recovery</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-teal-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Duration</span>
          <p className="text-2xl font-black text-teal-300 mt-1">{estimated_duration_min} min</p>
          <span className="text-[10px] text-slate-400">Cruising @ 0.8 m/s</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Battery Budget</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{battery_consumption_pct}</p>
          <span className="text-[10px] text-slate-400">Propulsion & Manipulation</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 text-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Targets Sequenced</span>
          <p className="text-2xl font-black text-amber-300 mt-1">{confirmedTargets.length}</p>
          <span className="text-[10px] text-slate-400">Verified Waypoints</span>
        </div>

      </div>

      {/* Waypoint Route Flow Timeline */}
      <div className="glass-panel p-5 rounded-2xl border border-ocean-700/80 space-y-4">
        <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Inspection Trajectory Sequence</span>
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            {mission_status}
          </span>
        </div>

        {/* Step-by-Step Waypoint Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-ocean-850 text-slate-300 font-bold border-b border-ocean-700 text-[11px]">
                <th className="p-3">Step</th>
                <th className="p-3">Waypoint / Target</th>
                <th className="p-3">Leg Distance</th>
                <th className="p-3">Cumulative</th>
                <th className="p-3">Tooling Protocol</th>
                <th className="p-3">Action Instruction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ocean-800/60 font-medium">
              {waypoints.map((wp) => {
                const isTarget = wp.type === 'TARGET_INSPECTION';
                return (
                  <tr 
                    key={wp.step} 
                    onClick={() => isTarget && onSelectTarget && onSelectTarget(wp.target_id)}
                    className={`transition-colors ${isTarget ? 'hover:bg-ocean-800/60 cursor-pointer' : 'bg-ocean-950/40'}`}
                  >
                    <td className="p-3 font-mono text-cyan-400 font-bold">
                      #{wp.step}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {wp.type === 'LAUNCH_POINT' && <Anchor className="w-3.5 h-3.5 text-cyan-400" />}
                        {wp.type === 'RECOVERY_POINT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isTarget && <MapPin className="w-3.5 h-3.5 text-rose-400" />}
                        <span className={`font-bold ${isTarget ? 'text-white' : 'text-slate-300'}`}>
                          {wp.label}
                        </span>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-slate-300">
                      +{wp.leg_distance_m} m
                    </td>

                    <td className="p-3 font-mono text-cyan-300 font-bold">
                      {wp.cumulative_distance_m} m
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-ocean-800 text-slate-300 border border-ocean-700">
                        {wp.tool_required}
                      </span>
                    </td>

                    <td className="p-3 text-slate-300 text-[11px] leading-relaxed max-w-xs">
                      {wp.action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-2 text-[11px] text-slate-400 italic">
          * {disclaimer || "Simulated ROV mission profile. Cross-correlate with live vessel positioning before deployment."}
        </div>
      </div>

    </div>
  );
}
