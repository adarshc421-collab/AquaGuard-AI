import React, { useState } from 'react';
import { CATEGORY_COLORS } from '../constants/debrisData';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Info, 
  Navigation, 
  Globe, 
  Check, 
  AlertCircle,
  Anchor,
  Flame,
  ShieldCheck,
  Wrench
} from 'lucide-react';

export default function DebrisMap2D({
  detections = [],
  hotspots = [],
  inspectionPlan = null,
  selectedDetId,
  setSelectedDetId,
  gpsInfo,
  locationName = "Survey Area Alpha",
  onUpdateLocation
}) {
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [customLoc, setCustomLoc] = useState('');
  const [customLat, setCustomLat] = useState('');
  const [customLon, setCustomLon] = useState('');
  const [showHotspots, setShowHotspots] = useState(true);
  const [showRoute, setShowRoute] = useState(true);

  const selectedDet = detections.find(d => d.id === selectedDetId) || detections[0];

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (onUpdateLocation) {
      onUpdateLocation({
        location: customLoc || locationName,
        lat: customLat ? parseFloat(customLat) : null,
        lon: customLon ? parseFloat(customLon) : null
      });
    }
    setShowLocationInput(false);
  };

  // Extract waypoints coordinates for drawing the inspection path
  const waypoints = inspectionPlan?.waypoints || [];

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-cyan-500/30 space-y-6">
      
      {/* Header with GPS / Relative Mode Badge & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              2D Underwater GIS Hotspot & Spatial Map
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            DBSCAN Spatial Hotspot clustering with autonomous AUV waypoint trajectory
          </p>
        </div>

        {/* GPS Status & Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 ${
            gpsInfo?.has_gps
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-ocean-900 text-cyan-300 border border-ocean-700'
          }`}>
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{gpsInfo?.has_gps ? `GPS: ${gpsInfo.latitude}, ${gpsInfo.longitude}` : 'Image-Relative Coordinate Plane'}</span>
          </div>

          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              showHotspots
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-ocean-900 text-slate-400 border border-ocean-800'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Hotspots</span>
          </button>

          {waypoints.length > 0 && (
            <button
              onClick={() => setShowRoute(!showRoute)}
              className={`text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                showRoute
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-ocean-900 text-slate-400 border border-ocean-800'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>AUV Route</span>
            </button>
          )}

          <button
            onClick={() => setShowLocationInput(!showLocationInput)}
            className="text-xs px-2.5 py-1 rounded-lg bg-ocean-800 hover:bg-ocean-700 text-slate-300 border border-ocean-700 transition-all"
          >
            {showLocationInput ? 'Cancel' : 'Set Anchor'}
          </button>
        </div>
      </div>

      {/* Optional Location Input Drawer */}
      {showLocationInput && (
        <form onSubmit={handleSaveLocation} className="p-4 rounded-xl bg-ocean-900/90 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Dive Location Name</label>
            <input
              type="text"
              placeholder="e.g. Malvan Marine Sanctuary Alpha"
              value={customLoc}
              onChange={(e) => setCustomLoc(e.target.value)}
              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Latitude (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 16.0583"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg p-2 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Longitude (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 73.4682"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              className="w-full bg-ocean-950 border border-ocean-700 rounded-lg p-2 text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full p-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-ocean-950 font-bold"
            >
              Apply Anchor
            </button>
          </div>
        </form>
      )}

      {/* Main Map Viewport & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Top-Down Map Canvas (Left 8 cols) */}
        <div className="lg:col-span-8 relative aspect-[4/3] rounded-2xl bg-ocean-950 border-2 border-cyan-500/30 overflow-hidden shadow-[inset_0_0_35px_rgba(0,10,25,0.9)] p-6 select-none flex flex-col justify-between">
          
          {/* Compass Rose Header */}
          <div className="flex items-center justify-between z-20">
            <div className="text-[11px] font-mono text-cyan-400/90 bg-ocean-900/90 px-3 py-1 rounded-lg border border-ocean-800 backdrop-blur-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SURVEY GRID: 100m x 100m • ACOUSTIC/OPTICAL OVERLAY</span>
            </div>
            
            {/* North Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-300 bg-ocean-900/95 px-3 py-1 rounded-full border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.25)]">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 -rotate-45" />
              <span>NORTH ↑</span>
            </div>
          </div>

          {/* Seabed Grid Lines & Quadrant Watermarks */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <div className="w-full h-full grid grid-cols-4 grid-rows-4 divide-x divide-y divide-cyan-400/40">
              <div /><div /><div /><div />
              <div /><div /><div /><div />
              <div /><div /><div /><div />
              <div /><div /><div /><div />
            </div>
          </div>

          {/* Quadrant Zone Labels */}
          <span className="absolute top-14 left-10 text-[11px] font-mono text-cyan-500/40 pointer-events-none font-bold">ZONE A (NW)</span>
          <span className="absolute top-14 right-10 text-[11px] font-mono text-cyan-500/40 pointer-events-none font-bold">ZONE B (NE)</span>
          <span className="absolute bottom-14 left-10 text-[11px] font-mono text-cyan-500/40 pointer-events-none font-bold">ZONE C (SW)</span>
          <span className="absolute bottom-14 right-10 text-[11px] font-mono text-cyan-500/40 pointer-events-none font-bold">ZONE D (SE)</span>

          {/* SVG Vector Overlay for AUV Inspection Waypoint Polyline & Hotspot Contours */}
          <svg className="absolute inset-8 w-[calc(100%-4rem)] h-[calc(100%-4rem)] pointer-events-none z-10 overflow-visible">
            {/* Hotspot Cluster Radii */}
            {showHotspots && hotspots.map((hp, idx) => {
              const cx = `${hp.centroid_x * 100}%`;
              const cy = `${hp.centroid_y * 100}%`;
              const r = Math.max(35, hp.target_count * 20);
              return (
                <g key={hp.hotspot_id || idx}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="rgba(244, 63, 94, 0.12)"
                    stroke="rgba(244, 63, 94, 0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={cx}
                    y={`calc(${cy} - ${r + 6}px)`}
                    fill="#fda4af"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {hp.name} ({hp.target_count} tgts)
                  </text>
                </g>
              );
            })}

            {/* AUV Inspection Trajectory Polyline */}
            {showRoute && waypoints.length > 1 && (
              <polyline
                points={waypoints.map(wp => {
                  const x = (wp.rel_x ?? 0.5) * 100;
                  const y = (wp.rel_y ?? 0.5) * 100;
                  return `${x}%,${y}%`;
                }).join(' ')}
                fill="none"
                stroke="#00f2fe"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                className="opacity-80"
              />
            )}
          </svg>

          {/* Interactive Debris Map Markers & Launch Station */}
          <div className="absolute inset-8">
            
            {/* Launch Station Marker */}
            <div 
              style={{ left: '10%', top: '10%' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            >
              <div className="p-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 shadow-lg backdrop-blur-md">
                <Anchor className="w-3 h-3 text-cyan-400" />
                <span>AUV LAUNCH</span>
              </div>
            </div>

            {/* Target Markers */}
            {detections.map((det) => {
              const cx = det.box ? (det.box.xmin + det.box.xmax) / 2.0 : (det.spatial?.rel_x_pct ? det.spatial.rel_x_pct / 100 : 0.5);
              const cy = det.box ? (det.box.ymin + det.box.ymax) / 2.0 : (det.spatial?.rel_y_pct ? det.spatial.rel_y_pct / 100 : 0.5);
              const leftPct = `${(cx * 100).toFixed(1)}%`;
              const topPct = `${(cy * 100).toFixed(1)}%`;
              const isSelected = selectedDetId === det.id;
              const col = CATEGORY_COLORS[det.category] || { hex: '#00e5ff' };

              return (
                <div
                  key={det.id}
                  onClick={() => setSelectedDetId(det.id)}
                  style={{ left: leftPct, top: topPct }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group"
                >
                  {/* Marker Pin Icon */}
                  <div className={`relative flex items-center justify-center transition-all duration-300 ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                  }`}>
                    {/* Pulsing ring on selection */}
                    {isSelected && (
                      <div
                        className="absolute w-12 h-12 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: col.hex }}
                      />
                    )}

                    {/* Target Pin Icon with ID */}
                    <div
                      className={`px-2 py-0.5 rounded-full border-2 flex items-center gap-1 shadow-2xl transition-all ${
                        isSelected ? 'ring-4 ring-white shadow-[0_0_20px_#00f2fe]' : ''
                      }`}
                      style={{ backgroundColor: col.hex, borderColor: '#ffffff' }}
                    >
                      <span className="text-[10px] font-black text-ocean-950 font-mono">
                        {det.id || 'TGT'}
                      </span>
                    </div>

                    {/* Label Tag on Hover / Selected */}
                    <div className={`absolute top-full mt-2 whitespace-nowrap px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-2xl backdrop-blur-md pointer-events-none transition-all ${
                      isSelected
                        ? 'bg-cyan-400 text-ocean-950 opacity-100 font-extrabold z-50'
                        : 'bg-ocean-950/95 text-white border border-ocean-700 opacity-0 group-hover:opacity-100'
                    }`}>
                      <div>{det.label || det.category} ({Math.round(det.confidence * 100)}%)</div>
                      <div className="text-[9px] text-ocean-900 font-mono">Score: {det.verification_score || 92}/100</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compass South Footer */}
          <div className="flex items-center justify-between z-20">
            <span className="text-xs font-bold text-slate-500 font-mono">WEST ←</span>
            <span className="text-xs font-bold text-slate-500 font-mono">SOUTH ↓</span>
            <span className="text-xs font-bold text-slate-500 font-mono">→ EAST</span>
          </div>

        </div>

        {/* Selected Object Detail Card (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedDet ? (
            <div className="p-5 rounded-2xl bg-ocean-900/95 border border-cyan-500/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-ocean-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/40">
                    {selectedDet.id || 'TGT-001'}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {selectedDet.label || selectedDet.category}
                  </h4>
                </div>
                <span className="font-mono text-xs text-cyan-400 font-bold">
                  {(selectedDet.confidence * 100).toFixed(1)}% Conf
                </span>
              </div>

              {/* Dynamic Metadata Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Position Sector</span>
                  <span className="font-bold text-cyan-300">{selectedDet.spatial?.position_label || 'Center Quadrant'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Relative Coordinates</span>
                  <span className="font-mono text-slate-200">
                    X: {selectedDet.spatial?.rel_x_pct ?? 50}% | Y: {selectedDet.spatial?.rel_y_pct ?? 50}%
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Estimated Depth</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {selectedDet.estimated_depth_m} m <span className="text-[10px] text-slate-400">[AI ESTIMATE]</span>
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Verification Score</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {selectedDet.verification_score || 92}/100 ({selectedDet.star_rating || '★★★★★'})
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-ocean-800/60">
                  <span className="text-slate-400">Degradation Lifespan</span>
                  <span className="font-bold text-amber-300">~{selectedDet.degradation_years} yrs</span>
                </div>

                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Ecological Hazard:</span>
                  <p className="text-[11px] text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 leading-relaxed font-medium">
                    {selectedDet.threat_level}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a marker on the map to inspect spatial coordinates.
            </div>
          )}

          {/* Map Legend */}
          <div className="p-3.5 rounded-xl bg-ocean-900/60 border border-ocean-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-300 uppercase block mb-1">Map Legend</span>
            <div className="grid grid-cols-2 gap-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Plastics (Cyan)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Ghost Nets (Green)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Metal Cans (Amber)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> Tires / Rubber (Purple)
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
