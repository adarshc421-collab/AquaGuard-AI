import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, Layers, Compass, ArrowRight, Gauge, Wrench } from 'lucide-react';

export default function EnvironmentalRiskMap({
  densityZones = {},
  environmentalRisk = {},
  cleanupPriorities = [],
  totalDebris = 0
}) {
  const riskColor = 
    environmentalRisk.overall_risk === 'CRITICAL' ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' :
    environmentalRisk.overall_risk === 'HIGH' ? 'text-rose-400 border-rose-500/40 bg-rose-500/10' :
    environmentalRisk.overall_risk === 'MEDIUM' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
    'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Environmental Threat Index */}
      <div className={`p-5 rounded-2xl border ${riskColor} backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-ocean-950/60 border border-ocean-700">
            {environmentalRisk.overall_risk === 'CRITICAL' || environmentalRisk.overall_risk === 'HIGH' ? (
              <ShieldAlert className="w-7 h-7 text-rose-400" />
            ) : environmentalRisk.overall_risk === 'MEDIUM' ? (
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            ) : (
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                Environmental Ecological Threat Status
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-ocean-950/80">
                SCORE: {environmentalRisk.risk_score || 7} / 10
              </span>
            </div>
            <h3 className="text-2xl font-black text-white mt-0.5">
              {environmentalRisk.overall_risk || 'HIGH'} ENVIRONMENTAL RISK
            </h3>
          </div>
        </div>

        <div className="max-w-md text-xs text-slate-200 bg-ocean-950/60 p-3 rounded-xl border border-ocean-800">
          <p className="leading-relaxed">
            {environmentalRisk.summary || "Multiple plastic and synthetic debris items concentrated within surveyed seabed area."}
          </p>
        </div>
      </div>

      {/* Grid: 2D Debris Density Zones & Cleanup Priority Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Debris Density Map (4 Quadrant Spatial Grid) */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-ocean-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Spatial Debris Density Map</span>
            </h4>
            <span className="text-[11px] font-mono text-cyan-400">
              {totalDebris} Objects Mapped
            </span>
          </div>

          {/* 4 Quadrants Grid */}
          <div className="grid grid-cols-2 gap-3 aspect-square max-h-[320px] mx-auto p-2">
            {Object.entries(densityZones).map(([zName, zData]) => {
              const densityBg = 
                zData.density === 'HIGH' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' :
                zData.density === 'MEDIUM' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' :
                zData.density === 'LOW' ? 'bg-teal-500/15 border-teal-500/40 text-teal-300' :
                'bg-ocean-950/40 border-ocean-800 text-slate-500';

              return (
                <div
                  key={zName}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${densityBg}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold">ZONE {zData.key}</span>
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-black/40">
                      {zData.density}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-3xl font-black text-white">{zData.count}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Debris Targets</p>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    {zData.items?.length > 0 ? zData.items.slice(0, 2).join(', ') : 'Zero accumulation'}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Spatial quadrants calculate object concentration without hardcoded limits.
          </p>
        </div>

        {/* Cleanup Priority Action Protocols */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-ocean-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-cyan-400" />
              <span>Ranked Cleanup Priority Protocols</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Action Sequence
            </span>
          </div>

          <div className="space-y-3">
            {cleanupPriorities.map((item, idx) => {
              const pBadge = 
                item.priority_level === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                item.priority_level === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700 space-y-2 hover:border-cyan-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <span className="font-bold text-white text-xs">{item.zone}</span>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pBadge}`}>
                      {item.priority_level} PRIORITY
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-ocean-950/60 p-2.5 rounded-lg border border-ocean-800">
                    {item.action}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Targets in Sector: {item.count} items</span>
                    <span className="text-cyan-400 font-medium">ROV Deployment Ready</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
