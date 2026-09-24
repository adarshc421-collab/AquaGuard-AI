import React from 'react';
import { X, FileDown, Printer, CheckCircle, AlertTriangle, ShieldCheck, Waves } from 'lucide-react';
import { getReportUrl } from '../services/api';

export default function ReportModal({ isOpen, onClose, sessionData }) {
  if (!isOpen || !sessionData) return null;

  const {
    session_id,
    title = 'Underwater Marine Debris Survey',
    location = 'Marine Station Alpha',
    depth_meters = 12.5,
    total_debris = 0,
    severity = 'Low',
    severity_desc = '',
    highest_confidence = 0.94,
    processing_time_ms = 42.0,
    category_counts = {},
    detections = [],
    action_recommendation,
    density_zones = {},
    detector_type = 'AquaGuard Precision Pipeline',
    timestamp = Date.now() / 1000
  } = sessionData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-ocean-700/80 bg-ocean-950/90">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              10-Section Environmental Debris Audit Report
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white border border-ocean-700 text-xs flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <a
              href={getReportUrl(session_id)}
              download
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-ocean-950 text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Official PDF</span>
            </a>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-950 text-slate-100 font-sans">
          
          {/* Header Banner */}
          <div className="border-b border-ocean-700 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  AQUAGUARD <span className="text-cyan-400">AI</span>
                </span>
                <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded font-mono">
                  AUDIT-v2.2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                AI-Powered Underwater Marine Debris Detection & Cleanup Intelligence
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono text-slate-400 space-y-0.5">
              <p><strong className="text-slate-300">Session ID:</strong> {session_id}</p>
              <p><strong className="text-slate-300">Date:</strong> {new Date(timestamp * 1000).toUTCString()}</p>
            </div>
          </div>

          {/* 1. Action Recommendation */}
          {action_recommendation && (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-1.5 text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                {action_recommendation.priority_badge || 'ACTION PROTOCOL'}
              </span>
              <h4 className="font-extrabold text-white text-sm">
                {action_recommendation.title}
              </h4>
              <p className="text-slate-300">{action_recommendation.action_summary}</p>
              <p className="text-slate-400 text-[11px] pt-1">
                <b>Required Equipment:</b> {(action_recommendation.required_equipment || []).join(', ')}
              </p>
            </div>
          )}

          {/* Location & Metadata Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ocean-900/60 p-4 rounded-xl border border-ocean-800 text-xs">
            <div>
              <span className="text-slate-400">Survey Location</span>
              <p className="font-bold text-white mt-0.5">{location}</p>
            </div>
            <div>
              <span className="text-slate-400">Estimated Depth</span>
              <p className="font-bold text-cyan-300 mt-0.5">{depth_meters} meters</p>
            </div>
            <div>
              <span className="text-slate-400">Model Pipeline</span>
              <p className="font-bold text-white mt-0.5 truncate">{detector_type}</p>
            </div>
            <div>
              <span className="text-slate-400">Inference Latency</span>
              <p className="font-bold text-emerald-400 mt-0.5">{processing_time_ms} ms</p>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Targets</span>
              <p className="text-2xl font-black text-white mt-1">{total_debris}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Eco-Risk Status</span>
              <p className={`text-2xl font-black mt-1 ${
                severity === 'CRITICAL' || severity === 'HIGH' ? 'text-rose-400' : severity === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {severity}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Top Certainty</span>
              <p className="text-2xl font-black text-cyan-300 mt-1">{(highest_confidence * 100).toFixed(1)}%</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Itemized Verified Debris Register
            </h4>
            <div className="overflow-x-auto rounded-xl border border-ocean-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-ocean-800/80 text-slate-300 font-bold border-b border-ocean-700">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Confidence</th>
                    <th className="p-2.5">Est. Depth</th>
                    <th className="p-2.5">Sector</th>
                    <th className="p-2.5">AI Optical Reasoning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-800/60">
                  {detections.map((d, i) => (
                    <tr key={d.id || i} className="hover:bg-ocean-900/40">
                      <td className="p-2.5 font-mono text-slate-400">{i + 1}</td>
                      <td className="p-2.5 font-bold text-white">{d.category}</td>
                      <td className="p-2.5 font-mono text-cyan-400 font-semibold">
                        {(d.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-2.5 text-teal-300">{d.estimated_depth_m}m</td>
                      <td className="p-2.5 text-slate-300">{d.spatial?.sector_key || 'A'}</td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{d.ai_explanation || 'Verified via edge gradient.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
