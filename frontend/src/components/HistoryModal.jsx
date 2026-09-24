import React from 'react';
import { X, History as HistoryIcon, FileDown, Layers, MapPin, Clock, ArrowRight } from 'lucide-react';
import { getReportUrl } from '../services/api';

export default function HistoryModal({ isOpen, onClose, history = [], onSelectSession }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl glass-panel border border-cyan-500/30 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-ocean-700/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-400/30">
              <HistoryIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Detection History Log</h3>
              <p className="text-xs text-slate-400">Previous underwater surveys and debris audit records</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-ocean-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <HistoryIcon className="w-10 h-10 mx-auto opacity-40 text-cyan-400" />
              <p className="text-sm">No detection history records yet.</p>
              <p className="text-xs text-slate-500">Analyze an image to populate the survey log.</p>
            </div>
          ) : (
            history.map((item, idx) => {
              const sevBadge = 
                item.severity === 'High' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                item.severity === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

              return (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-xl bg-ocean-900/80 border border-ocean-700/80 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-ocean-950 overflow-hidden shrink-0 border border-ocean-800">
                      <img
                        src={item.image_url}
                        alt="Survey Thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">
                          {item.image_filename || 'Survey Image'}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sevBadge}`}>
                          {item.severity} Severity
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3 text-cyan-400" />
                          {item.total_debris} Debris Detected
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {item.formatted_time || 'Recent'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={getReportUrl(item.id)}
                      download
                      className="p-2 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-cyan-300 border border-ocean-700 text-xs flex items-center gap-1 transition-all"
                      title="Download PDF Report"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-medium hidden sm:inline">PDF</span>
                    </a>

                    <button
                      onClick={() => {
                        onSelectSession(item);
                        onClose();
                      }}
                      className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-ocean-700/80 bg-ocean-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{history.length} Total Sessions Logged</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
