import React, { useState } from 'react';
import { 
  Layers3, 
  UploadCloud, 
  Sparkles, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  FileDown, 
  Image as ImageIcon,
  X
} from 'lucide-react';
import { runBatchSurvey, getMediaUrl } from '../services/api';

export default function BatchSurveyView({ onSelectFrame }) {
  const [files, setFiles] = useState([]);
  const [surveyArea, setSurveyArea] = useState('Transect Sector Alpha');
  const [isLoading, setIsLoading] = useState(false);
  const [batchData, setBatchData] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).slice(0, 5);
      setFiles(selected);
    }
  };

  const handleRemoveFile = (idx) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  const handleRunBatch = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    try {
      const data = await runBatchSurvey(files, surveyArea, 'precision');
      setBatchData(data);
    } catch (err) {
      console.error('Batch survey error:', err);
      alert('Batch survey failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-ocean-800 pb-3">
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Layers3 className="w-5 h-5 text-cyan-400" />
          <span>Multi-Image Survey Transect (Batch Scan)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Upload up to 5 consecutive ROV or diver survey frames to generate an aggregated regional hotspot assessment
        </p>
      </div>

      {/* Upload & Configuration Card */}
      <div className="glass-panel p-5 rounded-2xl border border-ocean-700/80 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Select Dive Transect Frames (Up to 5 images)
            </label>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="w-full bg-ocean-950 border border-ocean-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Survey Transect Name
            </label>
            <input
              type="text"
              value={surveyArea}
              onChange={(e) => setSurveyArea(e.target.value)}
              className="w-full bg-ocean-950 border border-ocean-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-ocean-800">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ocean-850 border border-ocean-700 text-xs text-slate-200">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button onClick={() => handleRemoveFile(idx)} className="text-slate-500 hover:text-rose-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunBatch}
            disabled={files.length === 0 || isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-ocean-950 font-extrabold text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Processing Transect Frames...' : `Analyze ${files.length} Survey Frames`}</span>
          </button>
        </div>
      </div>

      {/* Batch Results View */}
      {batchData && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Aggregate Overview Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-ocean-900 via-ocean-850 to-ocean-900 border-2 border-cyan-500/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ocean-850 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                  TRANSECT AGGREGATION COMPLETE
                </span>
                <h3 className="text-base font-extrabold text-white mt-0.5">
                  Regional Hotspot: {batchData.primary_hotspot_sector}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
                {batchData.frames_processed} Frames Analyzed ({batchData.total_debris_in_survey} Total Debris)
              </span>
            </div>

            <p className="text-xs text-slate-300">
              <b>Remediation Protocol:</b> {batchData.batch_recommendation}
            </p>

            {/* Sector Grid Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {Object.entries(batchData.sector_distribution || {}).map(([sec, count]) => (
                <div key={sec} className={`p-3 rounded-xl border text-center ${
                  sec === batchData.primary_hotspot_sector
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                    : 'bg-ocean-950/60 border-ocean-800 text-slate-300'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400">{sec}</span>
                  <p className="text-xl font-black mt-0.5">{count}</p>
                  <span className="text-[9px] text-slate-400">Total Targets</span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Frame Cards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Survey Frame Breakdown ({batchData.frame_results?.length} Frames)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {batchData.frame_results?.map((fr, idx) => (
                <div key={idx} className="glass-panel p-4 rounded-xl border border-ocean-700/80 space-y-3">
                  <div className="relative rounded-lg overflow-hidden bg-ocean-950 h-36 flex items-center justify-center">
                    <img src={getMediaUrl(fr.image_url)} alt={`Frame ${idx+1}`} className="h-full w-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-ocean-950/80 text-cyan-300 border border-ocean-700">
                      Frame #{idx + 1}
                    </span>
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-ocean-950/80 text-emerald-400 border border-emerald-500/40">
                      {fr.total_debris} Detections
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-xs truncate">{fr.image_filename}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Quality: {fr.quality?.overall_score}/100 • Risk: <span className="text-amber-400 font-bold">{fr.severity}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
