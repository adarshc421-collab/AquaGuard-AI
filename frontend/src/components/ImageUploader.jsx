import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  FileCheck, 
  MapPin, 
  Anchor, 
  Eye,
  Layers,
  ChevronDown
} from 'lucide-react';
import { getMediaUrl } from '../config/api';

export default function ImageUploader({
  selectedFile,
  previewUrl,
  onFileSelect,
  onClear,
  onAnalyze,
  isLoading,
  selectedSampleTitle,
  modality = 'OPTICAL',
  qualityScore,
  location,
  setLocation,
  depthMeters,
  setDepthMeters
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image (JPG, JPEG, PNG, or WebP).');
      return;
    }
    onFileSelect(file);
  };

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-ocean-700/80 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <span>Underwater Survey Image Upload</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Primary input for AI enhancement, false-positive filtered detection, and 2D/3D mapping
          </p>
        </div>

        {selectedFile && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {!previewUrl ? (
        /* Empty Drag & Drop Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : 'border-ocean-700 hover:border-cyan-500/50 bg-ocean-950/40 hover:bg-ocean-900/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-ocean-800/40 border border-cyan-400/30 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,242,254,0.15)] group-hover:scale-110 transition-transform">
            <UploadCloud className="w-6 h-6 text-cyan-400" />
          </div>

          <p className="text-sm font-bold text-slate-200">
            Drag & drop your underwater image here, or{' '}
            <span className="text-cyan-400 underline underline-offset-4 decoration-cyan-400/40 hover:decoration-cyan-400">
              browse files
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Accepts optical dive photos, benthic surveys, or side-scan sonar imagery (JPG, PNG, WebP)
          </p>
        </div>
      ) : (
        /* Image Preview with Modality & Quality Badges */
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-ocean-950 border border-cyan-500/30 max-h-[340px] flex items-center justify-center group">
            <img
              src={getMediaUrl(previewUrl)}
              alt="Underwater preview"
              className="max-h-[320px] w-auto max-w-full object-contain mx-auto"
            />

            {/* Top Badges: Modality & Quality */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                modality === 'SONAR' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {modality === 'SONAR' ? 'Acoustic Sonar Modality' : 'Optical RGB Modality'}
              </span>

              {qualityScore !== undefined && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-ocean-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md">
                  Quality: {qualityScore}/100 READY
                </span>
              )}
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-ocean-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-ocean-700 text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200 font-medium truncate">
                  {selectedFile ? selectedFile.name : selectedSampleTitle || 'Selected Underwater Survey'}
                </span>
                {selectedFile && (
                  <span className="text-slate-400 text-[11px] shrink-0">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Optional Survey Metadata Fields Toggle */}
          <div className="pt-1">
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Optional Survey Context (Location & Depth)</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showMetadata ? 'rotate-180' : ''}`} />
            </button>

            {showMetadata && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 p-3 rounded-xl bg-ocean-900/60 border border-ocean-800 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Dive / Station Location
                  </label>
                  <input
                    type="text"
                    value={location || ''}
                    onChange={(e) => setLocation && setLocation(e.target.value)}
                    placeholder="e.g. Reef Station Alpha-14"
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Sensor Depth (Meters)
                  </label>
                  <input
                    type="number"
                    value={depthMeters || ''}
                    onChange={(e) => setDepthMeters && setDepthMeters(e.target.value)}
                    placeholder="e.g. 14.5"
                    className="w-full bg-ocean-950 border border-ocean-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-ocean-850 hover:bg-ocean-800 text-slate-300 text-xs font-semibold border border-ocean-700 hover:border-cyan-500/30 transition-all flex items-center justify-center gap-2"
            >
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Choose Another Image</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
            />

            <button
              onClick={onAnalyze}
              disabled={isLoading}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-ocean-950 font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:shadow-[0_0_35px_rgba(0,242,254,0.7)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'AI Scanning Seabed...' : 'START PRECISION SCAN'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
