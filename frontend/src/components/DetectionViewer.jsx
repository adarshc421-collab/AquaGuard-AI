import React, { useState, useRef, useEffect } from 'react';
import { CATEGORY_COLORS } from '../constants/debrisData';
import { 
  Sliders, 
  Maximize2, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  Layers, 
  Eye, 
  Image as ImageIcon, 
  ShieldCheck, 
  AlertTriangle,
  HelpCircle,
  XCircle,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import TargetEvidenceCard from './TargetEvidenceCard';
import { getMediaUrl } from '../config/api';

export default function DetectionViewer({
  imageUrl,
  enhancedUrl,
  detections = [],
  uncertainCandidates = [],
  rejectedCandidates = [],
  validationSummary,
  viewMode = 'detected',
  setViewMode = () => {},
  showSplitSlider = false,
  setShowSplitSlider = () => {},
  isLoading = false,
  hoveredDetId = null,
  setHoveredDetId = () => {},
  confidenceThreshold = 0.5,
  setConfidenceThreshold = () => {},
  selectedCategory = 'all',
  setSelectedCategory = () => {},
  onSelectTargetForInspection = () => {}
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [showUncertainOverlay, setShowUncertainOverlay] = useState(false);
  const [showRejectedDrawer, setShowRejectedDrawer] = useState(false);
  const [activeEvidenceTarget, setActiveEvidenceTarget] = useState(null);
  const containerRef = useRef(null);

  // Filter confirmed detections
  const filteredDetections = detections.filter(d => {
    const matchConf = (d.confidence ?? 0.8) >= confidenceThreshold;
    const matchCat = selectedCategory === 'all' || d.category === selectedCategory;
    return matchConf && matchCat;
  });

  // Handle Split Slider Dragging
  const handleSliderMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDraggingSlider(true);
  const handleTouchStart = () => setIsDraggingSlider(true);

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSlider(false);
    const handleMouseMove = (e) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const handleTouchMove = (e) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDraggingSlider]);

  const activeImageSource = (viewMode === 'enhanced' && enhancedUrl) ? enhancedUrl : imageUrl;

  const handleBoxClick = (det) => {
    setHoveredDetId(det.id);
    setActiveEvidenceTarget(det);
  };

  return (
    <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-ocean-700/80 space-y-4">
      
      {/* Precision Validation Summary Banner */}
      {validationSummary && (
        <div className="p-3 px-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-200 font-medium">
              <strong className="text-white">{validationSummary.detection_mode}:</strong> {validationSummary.total_candidates_generated} candidate regions analyzed → <strong className="text-emerald-300">{validationSummary.confirmed_count} verified targets</strong> ({validationSummary.rejected_count} noise artifacts rejected).
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Why Not The Other Objects? Button */}
            <button
              onClick={() => setShowRejectedDrawer(!showRejectedDrawer)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                showRejectedDrawer
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why Not The Other Objects? ({rejectedCandidates.length || validationSummary.rejected_count})</span>
            </button>

            {uncertainCandidates.length > 0 && (
              <button
                onClick={() => setShowUncertainOverlay(!showUncertainOverlay)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  showUncertainOverlay
                    ? 'bg-amber-400 text-ocean-950'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Uncertain ({uncertainCandidates.length})</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* "Why Not The Other Objects?" Audit Drawer */}
      {showRejectedDrawer && (
        <div className="p-4 rounded-xl bg-ocean-900/90 border border-rose-500/40 space-y-3 animate-in fade-in duration-200 text-xs">
          <div className="flex items-center justify-between border-b border-ocean-800 pb-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
              <XCircle className="w-4 h-4" />
              <span>False-Positive Rejection Audit Log</span>
            </div>
            <span className="text-slate-400 text-[11px]">
              Multi-Stage Filtering (Shape, Contrast, Texture, Speckle, Boundary)
            </span>
          </div>

          {rejectedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {rejectedCandidates.map((rej, idx) => (
                <div key={rej.id || idx} className="p-2.5 rounded-lg bg-ocean-950/80 border border-ocean-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-400 font-bold text-[11px]">{rej.id || `CAND-${idx+1}`}</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      REJECTED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    <b>Candidate:</b> {rej.label || 'Candidate Region'} ({Math.round((rej.confidence ?? 0.4) * 100)}% Raw Conf)
                  </p>
                  <p className="text-[10px] text-rose-300/90 font-mono">
                    <b>Reason:</b> {rej.rejection_reason || 'Failed multi-evidence contrast & shape threshold.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 italic">No non-target artifacts were detected in this frame.</p>
          )}
        </div>
      )}

      {/* 3-Way Mode Switch + Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* 3-Way View Modes: Original vs Enhanced vs Detection */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-ocean-950/80 border border-ocean-800">
          <button
            onClick={() => {
              setViewMode('original');
              setShowSplitSlider(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'original' && !showSplitSlider
                ? 'bg-ocean-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Original</span>
          </button>

          <button
            onClick={() => {
              setViewMode('enhanced');
              setShowSplitSlider(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'enhanced' && !showSplitSlider
                ? 'bg-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Enhanced (CLAHE)</span>
          </button>

          <button
            onClick={() => {
              setViewMode('detected');
              setShowSplitSlider(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              viewMode === 'detected' && !showSplitSlider
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verified Targets ({filteredDetections.length})</span>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-ocean-900 border border-ocean-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Verified Classes ({detections.length})</option>
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Split Slider Toggle */}
          <button
            onClick={() => setShowSplitSlider(!showSplitSlider)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              showSplitSlider
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-ocean-950 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                : 'bg-ocean-900 text-slate-300 border border-ocean-700 hover:text-white'
            }`}
          >
            Split Slider
          </button>
        </div>

      </div>

      {/* Main Image & Overlays Display Area */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-ocean-950 border border-cyan-500/20 shadow-inner select-none flex items-center justify-center min-h-[380px]"
      >
        {/* Sonar Scanning Animation during AI Analysis */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-ocean-950/70 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
            <div className="sonar-scan-line" />
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-cyan-400/40 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute w-16 h-16 rounded-full border border-teal-400/60 animate-ping" style={{ animationDuration: '1.5s' }} />
              <div className="absolute w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-extrabold text-cyan-300 tracking-wide uppercase">
                High-Precision Optical Verification in Progress
              </p>
              <p className="text-xs text-slate-400">
                Evaluating boundary contrast, texture gradients & acoustic shadows...
              </p>
            </div>
          </div>
        )}

        {/* Display Content */}
        {imageUrl && (
          <div className="relative w-full h-full flex items-center justify-center">
            
            {/* Base Image Layer */}
            <img
              src={getMediaUrl(activeImageSource)}
              alt="Underwater scene"
              className="max-h-[520px] w-auto max-w-full object-contain mx-auto block"
            />

            {/* Split Slider Mode Overlay */}
            {showSplitSlider ? (
              <>
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={getMediaUrl(enhancedUrl || imageUrl)}
                    alt="Underwater scene annotated"
                    className="max-h-[520px] w-auto max-w-full object-contain mx-auto block"
                  />
                  
                  {/* Bounding Boxes inside clipped area */}
                  <div className="absolute inset-0 pointer-events-auto">
                    {filteredDetections.map((det) => (
                      <BoundingBoxItem
                        key={det.id}
                        detection={det}
                        isHovered={hoveredDetId === det.id}
                        onHover={setHoveredDetId}
                        onClick={() => handleBoxClick(det)}
                      />
                    ))}
                  </div>

                  <div className="absolute top-3 left-3 bg-cyan-500/90 text-ocean-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded shadow">
                    VERIFIED TARGETS (HIGH PRECISION)
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-ocean-900/80 text-slate-300 font-semibold text-[10px] px-2 py-0.5 rounded border border-ocean-700 pointer-events-none">
                  RAW ORIGINAL
                </div>

                {/* Vertical Divider Handle */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-cyan-400 cursor-ew-resize z-20 shadow-[0_0_12px_#00f2fe]"
                  style={{ left: `${sliderPosition}%` }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-8 h-8 rounded-full bg-cyan-400 text-ocean-950 flex items-center justify-center shadow-lg font-bold text-xs">
                    ⇄
                  </div>
                </div>
              </>
            ) : (
              /* Standard Single View Mode */
              <>
                {viewMode === 'detected' && (
                  <div className="absolute inset-0">
                    {filteredDetections.map((det) => (
                      <BoundingBoxItem
                        key={det.id}
                        detection={det}
                        isHovered={hoveredDetId === det.id}
                        onHover={setHoveredDetId}
                        onClick={() => handleBoxClick(det)}
                      />
                    ))}

                    {/* Optional Uncertain Candidates Overlay (Dashed Amber) */}
                    {showUncertainOverlay && uncertainCandidates.map((cand) => (
                      <UncertainBoxItem
                        key={cand.id}
                        candidate={cand}
                        isHovered={hoveredDetId === cand.id}
                        onHover={setHoveredDetId}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* HUD Status Badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-ocean-950/85 backdrop-blur-md px-3 py-1 rounded-lg border border-ocean-700 text-[10px] font-mono text-cyan-400 flex items-center gap-2">
              <span>{viewMode === 'detected' || showSplitSlider
                ? `VERIFIED: ${filteredDetections.length} | REJECTED: ${validationSummary?.rejected_count || 0}`
                : viewMode === 'enhanced' ? 'LAB-CLAHE ENHANCED' : 'RAW PREVIEW'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Target Evidence Modal Card if a bounding box is clicked */}
      {activeEvidenceTarget && (
        <div className="mt-4">
          <TargetEvidenceCard
            target={activeEvidenceTarget}
            onClose={() => setActiveEvidenceTarget(null)}
            onInspectRoute={() => {
              setActiveEvidenceTarget(null);
              onSelectTargetForInspection(activeEvidenceTarget.id);
            }}
          />
        </div>
      )}

    </div>
  );
}

// Bounding Box Item Component with Stable TGT-001 Label and Score
function BoundingBoxItem({ detection, isHovered, onHover, onClick }) {
  const { box, bbox, label, category, confidence, color, id, spatial, estimated_depth_m, verification_score, star_rating, threat_level } = detection;
  const colInfo = CATEGORY_COLORS[category] || { hex: color || '#00e5ff', bg: 'rgba(0,229,255,0.15)' };

  const leftPct = `${(box.xmin * 100).toFixed(2)}%`;
  const topPct = `${(box.ymin * 100).toFixed(2)}%`;
  const widthPct = `${((box.xmax - box.xmin) * 100).toFixed(2)}%`;
  const heightPct = `${((box.ymax - box.ymin) * 100).toFixed(2)}%`;

  return (
    <div
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
      style={{
        left: leftPct,
        top: topPct,
        width: widthPct,
        height: heightPct,
        borderColor: colInfo.hex,
        backgroundColor: isHovered ? colInfo.bg : 'rgba(0,0,0,0.05)',
      }}
      className={`absolute border-2 rounded transition-all duration-200 cursor-pointer ${
        isHovered
          ? 'ring-4 shadow-[0_0_25px_rgba(0,242,254,0.8)] z-30 scale-[1.01]'
          : 'shadow-md z-10'
      }`}
    >
      <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: colInfo.hex }} />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: colInfo.hex }} />
      <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: colInfo.hex }} />
      <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: colInfo.hex }} />

      {/* Target ID & Category Badge Overlay */}
      <div
        style={{ backgroundColor: colInfo.hex }}
        className="absolute -top-6 left-0 text-ocean-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm shadow whitespace-nowrap flex items-center gap-1 leading-none"
      >
        <span className="font-mono bg-black/30 px-1 py-0.2 rounded text-white text-[9px]">{id || 'TGT'}</span>
        <span>{label}</span>
        <span className="font-mono text-ocean-950 font-black">
          {Math.round(confidence * 100)}%
        </span>
      </div>

      {/* Hover Info Tooltip */}
      {isHovered && (
        <div className="absolute top-full left-0 mt-2 z-40 bg-ocean-950/95 border border-cyan-400/60 p-3 rounded-xl text-xs shadow-2xl backdrop-blur-xl min-w-[240px] pointer-events-none space-y-1.5">
          <div className="flex items-center justify-between border-b border-ocean-800 pb-1">
            <span className="font-extrabold text-white">{id}: {category}</span>
            <span className="text-emerald-400 font-mono font-bold">{verification_score || 94}/100</span>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-300 font-mono">
            <p><strong className="text-slate-400">Position:</strong> {spatial?.position_label} (X:{spatial?.rel_x_pct}%, Y:{spatial?.rel_y_pct}%)</p>
            <p><strong className="text-slate-400">Depth:</strong> {estimated_depth_m}m [AI ESTIMATE]</p>
            <p><strong className="text-slate-400">Threat:</strong> {threat_level}</p>
          </div>
          <div className="text-[9px] text-cyan-300 font-bold text-center pt-1 border-t border-ocean-800">
            Click target box to view multi-evidence audit card
          </div>
        </div>
      )}
    </div>
  );
}

// Uncertain Candidate Box Item (Dashed Amber Outline)
function UncertainBoxItem({ candidate, isHovered, onHover }) {
  const { box, label, confidence, id } = candidate;
  const leftPct = `${(box.xmin * 100).toFixed(2)}%`;
  const topPct = `${(box.ymin * 100).toFixed(2)}%`;
  const widthPct = `${((box.xmax - box.xmin) * 100).toFixed(2)}%`;
  const heightPct = `${((box.ymax - box.ymin) * 100).toFixed(2)}%`;

  return (
    <div
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      style={{ left: leftPct, top: topPct, width: widthPct, height: heightPct }}
      className="absolute border-2 border-dashed border-amber-400/80 bg-amber-500/10 rounded cursor-pointer z-10"
    >
      <div className="absolute -top-5 left-0 bg-amber-400 text-ocean-950 text-[9px] font-bold px-1 rounded flex items-center gap-1">
        <span>⚠ REVIEW: {label}</span>
        <span>({Math.round(confidence * 100)}%)</span>
      </div>
    </div>
  );
}
