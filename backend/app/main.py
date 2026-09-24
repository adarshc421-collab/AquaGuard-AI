import os
import io
import time
import shutil
import logging
from typing import Optional, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from PIL import Image

from app.detector import detector, DEBRIS_SPECS, TAXONOMY_CLASSES
from app.storage import storage
from app.report_generator import generate_pdf_report
from app.sample_data import SAMPLE_SCENARIOS
from app.modality_detector import modality_detector
from app.active_learning import active_learning_manager
from app.inspection_planner import inspection_planner
from app.hotspot_engine import hotspot_engine

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("aquaguard")

# Base directory setup (project-relative & cross-platform)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")
SAMPLES_DIR = os.path.join(STATIC_DIR, "samples")
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")
ENHANCED_DIR = os.path.join(STATIC_DIR, "enhanced")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(ENHANCED_DIR, exist_ok=True)

# Maximum upload payload limit (25 MB)
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024
ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

app = FastAPI(
    title="AquaGuard AI – Underwater Marine Debris Detection & Environmental Intelligence Platform",
    description="Multimodal Side-Scan Sonar & Optical Vision, Multi-Evidence Verification, DBSCAN Hotspots, Autonomous Inspection Planning",
    version="2.3.0"
)

# ----------------------------------------------------------------------
# CORS Configuration (Production & Development Safe)
# ----------------------------------------------------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

if FRONTEND_URL:
    for u in FRONTEND_URL.split(","):
        cleaned = u.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

if ALLOWED_ORIGINS_ENV:
    for u in ALLOWED_ORIGINS_ENV.split(","):
        cleaned = u.strip().rstrip("/")
        if cleaned and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

# Allow Vercel deployment domains (including branch preview URLs)
origin_regex = r"^https://.*\.vercel\.app$"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Mount static asset directory
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

class ValidateCandidateRequest(BaseModel):
    session_id: str
    candidate_id: str
    action: Optional[str] = None
    decision: Optional[str] = None
    category: Optional[str] = None
    true_category: Optional[str] = None
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None
    candidate_metadata: Optional[dict] = None

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "AquaGuard AI",
        "tagline": "DETECT → VERIFY → MAP → PRIORITIZE → ACT",
        "version": "2.3.0",
        "environment": ENVIRONMENT,
        "active_detector": detector.get_active_detector().name,
        "taxonomy": TAXONOMY_CLASSES,
        "core_capabilities": [
            "Multimodal Side-Scan Sonar & Optical Image Processing",
            "Multi-Evidence Target Verification (0-100 Score)",
            "3-Tier Detection Architecture (Confirmed vs Review vs Rejected)",
            "AI Abstention (Prefers No Detection over Wrong Detection)",
            "DBSCAN Spatial Hotspot Clustering",
            "Autonomous Inspection Route Planning (Waypoints, Battery, Transit Duration)",
            "Active Learning & Human-in-the-Loop Feedback Logger",
            "13-Section Environmental Audit PDF Generation"
        ]
    }

@app.get("/api/health")
def health_check():
    """
    Lightweight health endpoint.
    Does not depend on database or uploaded files.
    """
    active_det = detector.get_active_detector()
    return {
        "status": "ok",
        "service": "AquaGuard AI",
        "version": "2.3.0",
        "timestamp": int(time.time()),
        "model_status": "loaded",
        "detector_type": active_det.name,
        "is_yolo_available": getattr(active_det, "is_available", False),
        "default_mode": "Precision",
        "default_threshold": 0.82,
        "categories": TAXONOMY_CLASSES
    }

@app.get("/api/samples")
def get_samples():
    """Returns preset test scenarios."""
    results = []
    for s in SAMPLE_SCENARIOS:
        results.append({
            "id": s["id"],
            "title": s["title"],
            "location": s["location"],
            "depth_meters": s["depth_meters"],
            "description": s["description"],
            "image_filename": s["image_filename"],
            "image_url": f"/static/samples/{s['image_filename']}",
            "debris_count": len(s["detections"]),
            "categories": list(set(d["category"] for d in s["detections"]))
        })
    return {"samples": results}

@app.post("/api/predict")
async def predict_debris(
    file: Optional[UploadFile] = File(None),
    sample_id: Optional[str] = Form(None),
    dive_location: Optional[str] = Form(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    mode: Optional[str] = Form("precision"),
    confidence_threshold: Optional[float] = Form(0.82),
    is_sonar: Optional[bool] = Form(None)
):
    """
    Main Multimodal Analysis Endpoint:
    Quality scan -> Modality Gate -> Adaptive Enhancement -> Detection -> Multi-Evidence Verification -> Hotspots -> Inspection Planner.
    """
    try:
        detection_mode = mode.lower() if mode else "precision"
        min_conf = confidence_threshold if confidence_threshold is not None else 0.82

        if sample_id:
            res = detector.detect_preset_sample(
                sample_id,
                dive_location=dive_location,
                mode=detection_mode,
                confidence_threshold=min_conf,
                is_sonar=is_sonar
            )
            if not res:
                raise HTTPException(status_code=404, detail=f"Sample scenario '{sample_id}' not found.")
            storage.add_session(res)
            return res

        elif file:
            # File validation
            if not file.filename:
                raise HTTPException(status_code=400, detail="Empty filename provided.")

            ext = os.path.splitext(file.filename)[1].lower()
            if ext not in ALLOWED_IMAGE_EXTS:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file format '{ext}'. Supported formats: {', '.join(ALLOWED_IMAGE_EXTS)}"
                )

            # Check file size & image integrity
            content = await file.read()
            if len(content) > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large ({len(content)/(1024*1024):.1f}MB). Maximum allowed size is 25MB."
                )

            try:
                test_img = Image.open(io.BytesIO(content))
                test_img.verify()
            except Exception:
                raise HTTPException(status_code=400, detail="Corrupted or invalid image file.")

            unique_name = f"{int(time.time())}_{os.path.basename(file.filename).replace(' ', '_')}"
            dest_path = os.path.join(UPLOADS_DIR, unique_name)

            with open(dest_path, "wb") as buffer:
                buffer.write(content)

            res = detector.detect_custom_image(
                dest_path,
                unique_name,
                dive_location=dive_location,
                user_lat=latitude,
                user_lon=longitude,
                mode=detection_mode,
                confidence_threshold=min_conf,
                is_sonar=is_sonar
            )
            storage.add_session(res)
            return res

        else:
            raise HTTPException(status_code=400, detail="Must provide an image file or sample_id.")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inference error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Underwater detection pipeline encountered an unexpected error.")

@app.post("/api/batch-survey")
async def batch_survey(
    files: List[UploadFile] = File(...),
    survey_area: Optional[str] = Form("Transect Sector Alpha"),
    mode: Optional[str] = Form("precision")
):
    """
    Multi-Image Survey Transect Endpoint:
    Accepts up to 5 survey frames and merges cross-image targets.
    """
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No files uploaded for batch survey.")

    results = []
    total_batch_debris = 0
    aggregate_categories = {}
    sector_counts = {"Sector A": 0, "Sector B": 0, "Sector C": 0, "Sector D": 0}

    for idx, f in enumerate(files[:5]):
        if not f.filename:
            continue
        ext = os.path.splitext(f.filename)[1].lower()
        if ext not in ALLOWED_IMAGE_EXTS:
            continue

        content = await f.read()
        if len(content) > MAX_FILE_SIZE_BYTES:
            continue

        uname = f"batch_{int(time.time())}_{idx}_{os.path.basename(f.filename).replace(' ', '_')}"
        dpath = os.path.join(UPLOADS_DIR, uname)
        with open(dpath, "wb") as buffer:
            buffer.write(content)

        single_res = detector.detect_custom_image(dpath, uname, dive_location=survey_area, mode=mode or "precision")
        results.append(single_res)
        total_batch_debris += single_res["total_debris"]

        for d in single_res["detections"]:
            c = d["category"]
            aggregate_categories[c] = aggregate_categories.get(c, 0) + 1
            sec_key = d["spatial"].get("sector_key", "A")
            sec_name = f"Sector {sec_key}"
            sector_counts[sec_name] = sector_counts.get(sec_name, 0) + 1

    highest_sector = max(sector_counts.items(), key=lambda x: x[1])[0]

    return {
        "status": "success",
        "survey_area": survey_area,
        "frames_processed": len(results),
        "total_debris_in_survey": total_batch_debris,
        "category_breakdown": aggregate_categories,
        "sector_distribution": sector_counts,
        "primary_hotspot_sector": highest_sector,
        "frame_results": results,
        "batch_recommendation": f"Concentrate cleanup recovery operations in {highest_sector} ({sector_counts[highest_sector]} targets verified)."
    }

@app.post("/api/validate-candidate")
def validate_candidate(req: ValidateCandidateRequest):
    """
    Active Learning / Human-in-the-Loop Feedback Endpoint:
    Stores verified/rejected candidate decisions to local feedback database.
    """
    eff_action = req.action or req.decision or "CONFIRM"
    eff_category = req.category or req.true_category or "Other Marine Debris"
    entry = active_learning_manager.record_feedback(
        session_id=req.session_id,
        candidate_id=req.candidate_id,
        action=eff_action,
        category=eff_category,
        rejection_reason=req.rejection_reason,
        notes=req.notes,
        candidate_metadata=req.candidate_metadata
    )
    return {
        "status": "success",
        "message": f"Candidate {req.candidate_id} recorded as {eff_action.upper()}",
        "feedback_entry": entry,
        "active_learning_stats": active_learning_manager.get_stats()
    }

@app.get("/api/active-learning-stats")
def get_active_learning_stats():
    """Returns active learning dataset curation statistics."""
    return active_learning_manager.get_stats()

@app.get("/api/audit-log")
def get_audit_log():
    return {"audit_log": active_learning_manager.get_stats().get("recent_feedback", [])}

@app.get("/api/history")
def get_detection_history():
    return {"history": storage.get_history()}

@app.get("/api/stats")
def get_aggregate_stats():
    return storage.get_stats()

@app.get("/api/report/{session_id}")
def download_report(session_id: str):
    session = storage.get_session(session_id)
    if not session:
        session = detector.detect_preset_sample("coral_reef_plastics")

    try:
        pdf_buffer = generate_pdf_report(session)
        filename = f"AquaGuard_Audit_Report_{session_id}.pdf"

        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Report generation error for session {session_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate PDF compliance report.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting AquaGuard AI FastAPI server on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)
