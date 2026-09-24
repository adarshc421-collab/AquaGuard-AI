import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SampleScenarios from './components/SampleScenarios';
import ImageUploader from './components/ImageUploader';
import ImageQualityCard from './components/ImageQualityCard';
import PrecisionSettingsBar from './components/PrecisionSettingsBar';
import DetectionViewer from './components/DetectionViewer';
import DebrisMap2D from './components/DebrisMap2D';
import UnderwaterScene3D from './components/UnderwaterScene3D';
import EnvironmentalRiskMap from './components/EnvironmentalRiskMap';
import InspectionPlanner from './components/InspectionPlanner';
import UncertainCandidatesDrawer from './components/UncertainCandidatesDrawer';
import VerificationAuditPanel from './components/VerificationAuditPanel';
import ZeroDetectionState from './components/ZeroDetectionState';
import MultiImageReconstruction from './components/MultiImageReconstruction';
import RovVideoScan from './components/RovVideoScan';
import BatchSurveyView from './components/BatchSurveyView';
import ResultsDashboard from './components/ResultsDashboard';
import ScanProgressModal from './components/ScanProgressModal';
import PresentationMode from './components/PresentationMode';
import HistoryModal from './components/HistoryModal';
import ReportModal from './components/ReportModal';
import ModelSpecsModal from './components/ModelSpecsModal';
import ValidationLabModal from './components/ValidationLabModal';
import Footer from './components/Footer';

import { SAMPLE_SCENARIOS } from './constants/debrisData';
import { fetchHealth, fetchStats, fetchHistory, predictDebris, validateCandidate } from './services/api';
import { Sparkles, Scan, FileDown, Layers, Compass, Box, ShieldCheck, AlertCircle, Navigation } from 'lucide-react';

export default function App() {
  // Navigation & Modals: default to 'dashboard'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isValidationLabOpen, setIsValidationLabOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Precision Mode Settings (Default: Precision, Threshold 0.85)
  const [detectionMode, setDetectionMode] = useState('precision');
  const [precisionThreshold, setPrecisionThreshold] = useState(0.85);
  const [isSonarMode, setIsSonarMode] = useState(false);

  // Survey metadata fields
  const [diveLocation, setDiveLocation] = useState('');
  const [sensorDepth, setSensorDepth] = useState('');

  // System & Stats
  const [stats, setStats] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online');

  // Active Detection & Image State (Isolated)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('/static/samples/coral_reef_plastics.jpg');
  const [enhancedUrl, setEnhancedUrl] = useState('/static/enhanced/enh_coral_reef_plastics.jpg');
  const [currentSampleId, setCurrentSampleId] = useState('coral_reef_plastics');
  const [selectedSampleTitle, setSelectedSampleTitle] = useState('Coral Reef Plastics');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Viewer & Spatial Selection State
  const [viewMode, setViewMode] = useState('detected');
  const [showSplitSlider, setShowSplitSlider] = useState(false);
  const [selectedDetId, setSelectedDetId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const analyzeSectionRef = useRef(null);

  // Initial Data Load
  useEffect(() => {
    loadInitialData();
    handleSelectSample('coral_reef_plastics', false);
  }, []);

  const loadInitialData = async () => {
    const health = await fetchHealth();
    setSystemStatus(health.status);

    const initialStats = await fetchStats();
    setStats(initialStats);

    const historyData = await fetchHistory();
    setHistoryList(historyData.history || []);
  };

  const scrollToAnalyze = () => {
    setActiveTab('analyze');
    setTimeout(() => {
      analyzeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Preset Sample Selection
  const handleSelectSample = async (sampleId, shouldScroll = true) => {
    const sample = SAMPLE_SCENARIOS.find(s => s.id === sampleId);
    if (!sample) return;

    setCurrentSampleId(sampleId);
    setSelectedSampleTitle(sample.title);
    setSelectedFile(null);
    setPreviewUrl(sample.image);
    setIsLoading(true);

    if (shouldScroll) {
      scrollToAnalyze();
    }

    try {
      const result = await predictDebris({
        sampleId,
        mode: detectionMode,
        confidenceThreshold: precisionThreshold,
        isSonar: isSonarMode
      });
      setAnalysisData(result);
      setEnhancedUrl(result.enhanced_image_url || result.image_url);
      setViewMode('detected');
      setShowSplitSlider(false);

      if (result.detections?.length > 0) {
        setSelectedDetId(result.detections[0].id);
      }

      if (result.severity === 'LOW') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f2fe', '#00e676', '#4facfe']
        });
      }
    } catch (err) {
      console.error('Error analyzing sample:', err);
    } finally {
      setIsLoading(false);
      const refreshedStats = await fetchStats();
      setStats(refreshedStats);
      const refreshedHistory = await fetchHistory();
      setHistoryList(refreshedHistory.history || []);
    }
  };

  // Custom File Selection
  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setCurrentSampleId(null);
    setSelectedSampleTitle(file.name);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAnalysisData(null);
    setEnhancedUrl(null);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEnhancedUrl(null);
    setCurrentSampleId(null);
    setSelectedSampleTitle('');
    setAnalysisData(null);
  };

  // Trigger Precision Scan
  const handleTriggerScan = () => {
    if (!selectedFile && !currentSampleId) return;
    setIsScanModalOpen(true);
  };

  // Apply updated precision settings and re-run prediction
  const handleApplyPrecisionSettings = async (mode, threshold, sonar) => {
    if (!selectedFile && !currentSampleId) return;
    setIsLoading(true);
    try {
      let result;
      if (selectedFile) {
        result = await predictDebris({
          file: selectedFile,
          mode,
          confidenceThreshold: threshold,
          isSonar: sonar,
          diveLocation: diveLocation || undefined
        });
      } else if (currentSampleId) {
        result = await predictDebris({
          sampleId: currentSampleId,
          mode,
          confidenceThreshold: threshold,
          isSonar: sonar,
          diveLocation: diveLocation || undefined
        });
      }

      setAnalysisData(result);
      setEnhancedUrl(result.enhanced_image_url || result.image_url);
      if (result.detections?.length > 0) {
        setSelectedDetId(result.detections[0].id);
      }
    } catch (err) {
      console.error('Precision update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Backend Analysis upon completion of scanning HUD animation
  const handleScanAnimationComplete = async () => {
    setIsScanModalOpen(false);
    setIsLoading(true);
    try {
      let result;
      if (selectedFile) {
        result = await predictDebris({
          file: selectedFile,
          mode: detectionMode,
          confidenceThreshold: precisionThreshold,
          isSonar: isSonarMode,
          diveLocation: diveLocation || undefined
        });
      } else if (currentSampleId) {
        result = await predictDebris({
          sampleId: currentSampleId,
          mode: detectionMode,
          confidenceThreshold: precisionThreshold,
          isSonar: isSonarMode,
          diveLocation: diveLocation || undefined
        });
      }

      setAnalysisData(result);
      setEnhancedUrl(result.enhanced_image_url || result.image_url);
      setViewMode('detected');
      setShowSplitSlider(false);

      if (result.detections?.length > 0) {
        setSelectedDetId(result.detections[0].id);
      }

      if (result.severity === 'LOW') {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f2fe', '#00e676', '#ffd600']
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Analysis failed: ' + err.message);
    } finally {
      setIsLoading(false);
      const refreshedStats = await fetchStats();
      setStats(refreshedStats);
      const refreshedHistory = await fetchHistory();
      setHistoryList(refreshedHistory.history || []);
    }
  };

  // Human-in-the-Loop Candidate Confirmation Handler
  const handleConfirmCandidate = async (candidate) => {
    if (!analysisData) return;
    const updatedUncertain = (analysisData.uncertain_candidates || []).filter(c => c.id !== candidate.id);
    const confirmedItem = { ...candidate, status: 'CONFIRMED (OPERATOR OVERRIDE)' };
    const updatedDetections = [...(analysisData.detections || []), confirmedItem];

    setAnalysisData({
      ...analysisData,
      detections: updatedDetections,
      uncertain_candidates: updatedUncertain,
      total_debris: updatedDetections.length
    });
    setSelectedDetId(confirmedItem.id);

    try {
      await validateCandidate({
        session_id: analysisData.session_id,
        candidate_id: candidate.id,
        decision: 'CONFIRM',
        true_category: candidate.category || 'Plastic Bottle',
        notes: 'Operator manual confirmation from UI'
      });
    } catch (e) {
      console.warn('Feedback logging error:', e);
    }
  };

  // Human-in-the-Loop Candidate Rejection Handler
  const handleRejectCandidate = async (candidate, reason) => {
    if (!analysisData) return;
    const updatedUncertain = (analysisData.uncertain_candidates || []).filter(c => c.id !== candidate.id);
    const rejectedItem = { ...candidate, status: 'REJECTED (HUMAN FEEDBACK)', rejection_reason: reason };
    const updatedRejected = [...(analysisData.rejected_candidates || []), rejectedItem];

    setAnalysisData({
      ...analysisData,
      uncertain_candidates: updatedUncertain,
      rejected_candidates: updatedRejected
    });

    try {
      await validateCandidate({
        session_id: analysisData.session_id,
        candidate_id: candidate.id,
        decision: 'REJECT',
        true_category: 'NON_DEBRIS',
        notes: reason || 'Operator marked as false positive background'
      });
    } catch (e) {
      console.warn('Feedback logging error:', e);
    }
  };

  const handleSelectHistoricalSession = (session) => {
    setAnalysisData(session);
    setPreviewUrl(session.image_url);
    setEnhancedUrl(session.enhanced_image_url || session.image_url);
    setSelectedFile(null);
    setCurrentSampleId(session.sample_id || null);
    setSelectedSampleTitle(session.title || session.image_filename);
    setViewMode('detected');
    setShowSplitSlider(false);
    if (session.detections?.length > 0) {
      setSelectedDetId(session.detections[0].id);
    }
    scrollToAnalyze();
  };

  const selectedTargetObject = 
    analysisData?.detections?.find(d => d.id === selectedDetId) || 
    analysisData?.uncertain_candidates?.find(c => c.id === selectedDetId) || 
    analysisData?.rejected_candidates?.find(r => r.id === selectedDetId) || 
    analysisData?.detections?.[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#020b14] text-slate-100 selection:bg-cyan-500 selection:text-black font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenValidationLab={() => setIsValidationLabOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-6">
        
        {/* ============================================================ */}
        {/* TAB 1: DASHBOARD (Overview, Action Card, Key KPIs, Scenarios) */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <HeroSection
              onAnalyzeClick={scrollToAnalyze}
              onSelectSample={(sId) => handleSelectSample(sId, true)}
              stats={stats}
            />

            {/* Results & Action Recommendation */}
            {analysisData && (
              <ResultsDashboard
                analysisData={analysisData}
                hoveredDetId={selectedDetId}
                setHoveredDetId={setSelectedDetId}
                onGenerateReport={() => setIsReportOpen(true)}
                onSwitchTo2DMap={() => setActiveTab('map')}
                onSwitchTo3DScene={() => setActiveTab('3d_scene')}
              />
            )}

            <SampleScenarios
              onSelectSample={(sId) => handleSelectSample(sId, true)}
              currentSampleId={currentSampleId}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ANALYZE (Upload, Quality Gate, 3-Way Viewer, Verification) */}
        {/* ============================================================ */}
        {activeTab === 'analyze' && (
          <div ref={analyzeSectionRef} className="space-y-6 animate-in fade-in duration-300">
            
            {/* Header & Scan Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ocean-800 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>Precision Debris Scanning Studio</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-stage optical/acoustic validation pipeline with deterministic false positive prevention
                </p>
              </div>

              {previewUrl && (
                <button
                  onClick={handleTriggerScan}
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-ocean-950 font-black text-xs shadow-[0_0_25px_rgba(0,242,254,0.4)] transition-all flex items-center gap-2 shrink-0"
                >
                  <Scan className="w-4 h-4" />
                  <span>RE-SCAN IMAGE</span>
                </button>
              )}
            </div>

            {/* 1. Precision Settings Control Bar */}
            <PrecisionSettingsBar
              detectionMode={detectionMode}
              setDetectionMode={setDetectionMode}
              precisionThreshold={precisionThreshold}
              setPrecisionThreshold={setPrecisionThreshold}
              isSonarMode={isSonarMode}
              setIsSonarMode={setIsSonarMode}
              onApplySettings={handleApplyPrecisionSettings}
              isLoading={isLoading}
            />

            {/* 2. Image Uploader */}
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              onAnalyze={handleTriggerScan}
              isLoading={isLoading}
              selectedSampleTitle={selectedSampleTitle}
              modality={analysisData?.modality || (isSonarMode ? 'SONAR' : 'OPTICAL')}
              qualityScore={analysisData?.quality?.overall_score}
              location={diveLocation}
              setLocation={setDiveLocation}
              depthMeters={sensorDepth}
              setDepthMeters={setSensorDepth}
            />

            {/* 3. Image Quality Card */}
            {analysisData?.quality && (
              <ImageQualityCard quality={analysisData.quality} />
            )}

            {/* 4. Zero-Detection Experience (Abstaining AI) */}
            {analysisData && analysisData.detections?.length === 0 && (
              <ZeroDetectionState
                onSwitchMode={(mode) => {
                  setDetectionMode(mode);
                  const th = mode === 'balanced' ? 0.75 : 0.65;
                  setPrecisionThreshold(th);
                  handleApplyPrecisionSettings(mode, th, isSonarMode);
                }}
                rejectedCount={analysisData.validation_summary?.rejected_count || 0}
              />
            )}

            {/* 5. Detection Viewer with 3-Way Mode (Original / Enhanced / Detected) */}
            {previewUrl && analysisData && analysisData.detections?.length > 0 && (
              <DetectionViewer
                imageUrl={previewUrl}
                enhancedUrl={enhancedUrl}
                detections={analysisData?.detections || []}
                uncertainCandidates={analysisData?.uncertain_candidates || []}
                rejectedCandidates={analysisData?.rejected_candidates || []}
                validationSummary={analysisData?.validation_summary}
                viewMode={viewMode}
                setViewMode={setViewMode}
                showSplitSlider={showSplitSlider}
                setShowSplitSlider={setShowSplitSlider}
                isLoading={isLoading}
                hoveredDetId={selectedDetId}
                setHoveredDetId={setSelectedDetId}
                confidenceThreshold={precisionThreshold}
                setConfidenceThreshold={setPrecisionThreshold}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onSelectTargetForInspection={(tgtId) => {
                  setSelectedDetId(tgtId);
                  setActiveTab('plan');
                }}
              />
            )}

            {/* 6. Uncertain Candidates Review Drawer */}
            {analysisData && (
              <UncertainCandidatesDrawer
                uncertainCandidates={analysisData.uncertain_candidates || []}
                rejectedCandidates={analysisData.rejected_candidates || []}
                sessionId={analysisData.session_id}
                onConfirmCandidate={handleConfirmCandidate}
                onRejectCandidate={handleRejectCandidate}
              />
            )}

            {/* 7. False-Positive Audit & Verification Panel */}
            {analysisData && (
              <VerificationAuditPanel
                selectedItem={selectedTargetObject}
                validationSummary={analysisData.validation_summary}
              />
            )}

            {/* 8. Results & Action Summary */}
            {analysisData && analysisData.detections?.length > 0 && (
              <ResultsDashboard
                analysisData={analysisData}
                hoveredDetId={selectedDetId}
                setHoveredDetId={setSelectedDetId}
                onGenerateReport={() => setIsReportOpen(true)}
                onSwitchTo2DMap={() => setActiveTab('map')}
                onSwitchTo3DScene={() => setActiveTab('3d_scene')}
              />
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SURVEY MAP (2D Spatial & Hotspot Sector Map) */}
        {/* ============================================================ */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <DebrisMap2D
              detections={analysisData?.detections || []}
              hotspots={analysisData?.hotspots || []}
              inspectionPlan={analysisData?.inspection_plan}
              selectedDetId={selectedDetId}
              setSelectedDetId={setSelectedDetId}
              gpsInfo={analysisData?.gps_info}
              locationName={analysisData?.location}
            />

            {analysisData && (
              <EnvironmentalRiskMap
                densityZones={analysisData?.density_zones}
                environmentalRisk={analysisData?.environmental_risk}
                cleanupPriorities={analysisData?.cleanup_priorities}
                totalDebris={analysisData?.total_debris}
              />
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: INSPECTION PLAN (Autonomous ROV Route & Waypoints) */}
        {/* ============================================================ */}
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <InspectionPlanner
              inspectionPlan={analysisData?.inspection_plan}
              confirmedTargets={analysisData?.detections || []}
              onSelectTarget={(tgtId) => {
                setSelectedDetId(tgtId);
                setActiveTab('map');
              }}
              onGenerateReport={() => setIsReportOpen(true)}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: REPORTS (Environmental Audit & 1-Click PDF Export) */}
        {/* ============================================================ */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="glass-panel p-6 rounded-2xl border border-ocean-700 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ocean-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">
                    Environmental Audit & Compliance Reports
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    13-Section verified documentation of marine debris classifications, coordinates, and remediation protocols
                  </p>
                </div>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-ocean-950 font-black text-xs shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  <span>PREVIEW & DOWNLOAD 13-SECTION PDF</span>
                </button>
              </div>

              {/* Environmental Threat Breakdown */}
              {analysisData && (
                <EnvironmentalRiskMap
                  densityZones={analysisData?.density_zones}
                  environmentalRisk={analysisData?.environmental_risk}
                  cleanupPriorities={analysisData?.cleanup_priorities}
                  totalDebris={analysisData?.total_debris}
                />
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ADVANCED VIEW 1: 3D SEAFLOOR SCENE */}
        {/* ============================================================ */}
        {activeTab === '3d_scene' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <UnderwaterScene3D
              detections={analysisData?.detections || []}
              selectedDetId={selectedDetId}
              setSelectedDetId={setSelectedDetId}
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* ADVANCED VIEW 2: BATCH SURVEY (5 FRAMES) */}
        {/* ============================================================ */}
        {activeTab === 'batch_survey' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <BatchSurveyView />
          </div>
        )}

        {/* ============================================================ */}
        {/* ADVANCED VIEW 3: MULTI-VIEW STEREO 3D */}
        {/* ============================================================ */}
        {activeTab === 'multi_view' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <MultiImageReconstruction />
          </div>
        )}

        {/* ============================================================ */}
        {/* ADVANCED VIEW 4: ROV VIDEO TRACKING SCAN */}
        {/* ============================================================ */}
        {activeTab === 'rov_scan' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <RovVideoScan />
          </div>
        )}

      </main>

      {/* MODALS */}
      <ScanProgressModal
        isOpen={isScanModalOpen}
        onComplete={handleScanAnimationComplete}
        currentSampleTitle={selectedSampleTitle}
      />

      <PresentationMode
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        analysisData={analysisData}
        previewUrl={previewUrl}
        enhancedUrl={enhancedUrl}
        onOpenReport={() => setIsReportOpen(true)}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={historyList}
        onSelectSession={handleSelectHistoricalSession}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        sessionData={analysisData}
      />

      <ModelSpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

      <ValidationLabModal
        isOpen={isValidationLabOpen}
        onClose={() => setIsValidationLabOpen(false)}
      />

      {/* Footer */}
      <Footer
        onOpenSpecs={() => setIsSpecsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

    </div>
  );
}
