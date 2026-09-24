import os
import sys
import asyncio

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import (
    root,
    health_check,
    get_samples,
    predict_debris,
    validate_candidate,
    get_active_learning_stats,
    get_aggregate_stats,
    ValidateCandidateRequest
)


def test_api_root():
    """Verify root endpoint metadata and capabilities."""
    res = root()
    assert res["status"] in ["ok", "online"]
    assert "AquaGuard AI" in res["service"]
    assert len(res["core_capabilities"]) >= 5
    assert len(res["taxonomy"]) == 9
    print("[PASS] Root endpoint metadata verified.")


def test_api_health():
    """Verify health check endpoint returns active detector and ok/healthy status."""
    res = health_check()
    assert res["status"] in ["ok", "healthy"]
    assert res["service"] == "AquaGuard AI"
    assert "detector_type" in res
    assert res["default_mode"] == "Precision"
    print(f"[PASS] Health check verified: service={res['service']}, detector={res['detector_type']}")


def test_api_samples():
    """Verify samples endpoint returns scenarios."""
    res = get_samples()
    assert "samples" in res
    assert len(res["samples"]) >= 3
    print(f"[PASS] Samples endpoint returned {len(res['samples'])} scenario(s).")


def test_api_predict_sample():
    """Verify predict endpoint handles preset sample inference."""
    res = asyncio.run(predict_debris(
        file=None,
        sample_id="coral_reef_plastics",
        dive_location="Test Location",
        latitude=None,
        longitude=None,
        mode="precision",
        confidence_threshold=0.82,
        is_sonar=False
    ))
    assert res is not None
    assert "detections" in res
    assert "total_debris" in res
    assert "environmental_risk" in res
    assert "inspection_plan" in res
    assert "action_recommendation" in res
    print(f"[PASS] Predict sample verified: {res['total_debris']} debris, Risk={res['environmental_risk']['overall_risk']}")


def test_api_validate_candidate_feedback():
    """Verify active learning feedback recording."""
    req = ValidateCandidateRequest(
        session_id="test_sess_01",
        candidate_id="TGT-TEST-01",
        action="CONFIRM",
        category="Plastic Bottle",
        notes="Verified human check"
    )
    res = validate_candidate(req)
    assert res["status"] == "success"
    assert "feedback_entry" in res
    print("[PASS] Validate candidate feedback endpoint verified.")


if __name__ == "__main__":
    test_api_root()
    test_api_health()
    test_api_samples()
    test_api_predict_sample()
    test_api_validate_candidate_feedback()
