import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, UserCheck, ShieldAlert, Layers } from 'lucide-react';
import { validateCandidate } from '../services/api';

export default function UncertainCandidatesDrawer({
  uncertainCandidates = [],
  rejectedCandidates = [],
  sessionId,
  onConfirmCandidate,
  onRejectCandidate
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedForReject, setSelectedForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('Rock / Calcified formation');
  const [customNotes, setCustomNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (uncertainCandidates.length === 0 && rejectedCandidates.length === 0) {
    return null;
  }

  const handleConfirm = async (cand) => {
    try {
      await validateCandidate({
        session_id: sessionId || 'current',
        candidate_id: cand.id,
        action: 'CONFIRM',
        category: cand.category,
        notes: 'Operator manual confirmation'
      });
      onConfirmCandidate?.(cand);
    } catch (e) {
      console.error(e);
      onConfirmCandidate?.(cand);
    }
  };

  const handleExecuteReject = async () => {
    if (!selectedForReject) return;
    setIsSubmitting(true);
    try {
      await validateCandidate({
        session_id: sessionId || 'current',
        candidate_id: selectedForReject.id,
        action: 'REJECT',
        category: selectedForReject.category,
        rejection_reason: rejectionReason,
        notes: customNotes
      });
      onRejectCandidate?.(selectedForReject, rejectionReason);
      setSelectedForReject(null);
    } catch (e) {
      console.error(e);
      onRejectCandidate?.(selectedForReject, rejectionReason);
      setSelectedForReject(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel border border-amber-500/30 overflow-hidden space-y-0">
      
      {/* Drawer Toggle Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-amber-500/10 hover:bg-amber-500/15 cursor-pointer flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Uncertain Candidates ({uncertainCandidates.length}) & Filtered Rejections ({rejectedCandidates.length})
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-ocean-950">
                REVIEW REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Precision mode isolates high-ambiguity regions from the main debris count for manual operator verification
            </p>
          </div>
        </div>

        <button className="p-1.5 rounded-lg bg-ocean-950/60 text-slate-300 hover:text-white border border-ocean-800">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Candidates List */}
      {isOpen && (
        <div className="p-5 bg-ocean-950/80 border-t border-ocean-800 space-y-4">
          
          {uncertainCandidates.length > 0 ? (
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>Requires Human Operator Review</span>
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {uncertainCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-xl bg-ocean-900/90 border border-amber-500/40 space-y-3 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{cand.label}</span>
                        <span className="text-[10px] font-mono bg-ocean-950 px-2 py-0.5 rounded text-amber-300 border border-ocean-700">
                          {cand.confidence_pct || `${Math.round(cand.confidence * 100)}%`} Conf
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{cand.spatial?.position_label}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-ocean-950 p-2 rounded-lg border border-ocean-800">
                      <strong>AI Flag:</strong> {cand.status_desc || "Confidence/Contrast falls in borderline review tier. Operator confirmation requested."}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-ocean-800">
                      <button
                        onClick={() => setSelectedForReject(cand)}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject as Noise</span>
                      </button>

                      <button
                        onClick={() => handleConfirm(cand)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Target</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Zero uncertain candidates pending review.</p>
          )}

          {/* Rejected Candidates Audit Log */}
          {rejectedCandidates.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-ocean-800">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Filtered Noise Anomalies ({rejectedCandidates.length} Rejected by Precision Engine)
              </h5>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {rejectedCandidates.map((rej, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-ocean-900/60 border border-ocean-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-300">{rej.label}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {rej.rejection_stage}: {rej.rejection_reason}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                      FILTERED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Structured Rejection Feedback Modal (Human-in-the-Loop) */}
      {selectedForReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ocean-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md p-6 rounded-2xl glass-panel border border-rose-500/40 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Manual Rejection Feedback</span>
            </h4>
            <p className="text-xs text-slate-300">
              Why should <strong>{selectedForReject.label}</strong> be rejected? This feedback improves the precision model dataset.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block font-semibold">Select Anomaly Category:</label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-ocean-900 border border-ocean-700 text-white rounded-lg p-2 text-xs focus:border-cyan-400"
              >
                <option value="Rock / Calcified formation">Rock / Natural Benthic Formation</option>
                <option value="Sand ripple / Sediment pattern">Sand Ripple / Sediment Drift Pattern</option>
                <option value="Lighting reflection / Caustic ray">Lighting Reflection / Caustic Ray</option>
                <option value="Water particle / Algae speckle">Water Particle / Algae Speckle</option>
                <option value="Duplicate bounding box">Duplicate Bounding Box</option>
                <option value="Other non-debris artifact">Other Non-Debris Artifact</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 block font-semibold">Operator Notes (Optional):</label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Calcified reef structure mistaken for container"
                rows={2}
                className="w-full bg-ocean-900 border border-ocean-700 text-white rounded-lg p-2 text-xs focus:border-cyan-400 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-ocean-800">
              <button
                onClick={() => setSelectedForReject(null)}
                className="px-3.5 py-1.5 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleExecuteReject}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow transition-all"
              >
                {isSubmitting ? 'Logging...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
