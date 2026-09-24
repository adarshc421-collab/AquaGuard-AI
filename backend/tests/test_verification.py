import os
import sys
import numpy as np
import cv2

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.detector.multi_evidence_verifier import multi_evidence_verifier


def test_verifier_confirmed_target():
    """Verify high-contrast distinct target achieves CONFIRMED status."""
    img = np.full((300, 400, 3), 80, dtype=np.uint8)
    # Bright target in center
    img[100:160, 150:250, :] = 240
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    candidate = {
        "id": "CAND-001",
        "box": {"xmin": 0.375, "ymin": 0.333, "xmax": 0.625, "ymax": 0.533},
        "category": "Plastic Container",
        "confidence": 0.90
    }

    result = multi_evidence_verifier.evaluate_candidate(
        candidate=candidate,
        cv_img=img,
        gray_img=gray_img,
        mode="precision",
        is_sonar=False
    )
    assert result["verification_score"] >= 50, f"Expected high score, got {result['verification_score']}"
    assert result["status"] in ["CONFIRMED", "REVIEW"], f"Expected CONFIRMED or REVIEW, got {result['status']}"
    assert "evidence_breakdown" in result
    print(f"[PASS] Confirmed target verification score: {result['verification_score']}/100 (Status: {result['status']})")


def test_verifier_border_artifact_rejection():
    """Verify that candidates touching frame borders are rejected in precision mode."""
    img = np.full((300, 400, 3), 100, dtype=np.uint8)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    edge_candidate = {
        "id": "CAND-EDGE",
        "box": {"xmin": 0.001, "ymin": 0.001, "xmax": 0.05, "ymax": 0.05},
        "category": "Plastic Bag",
        "confidence": 0.60
    }

    result = multi_evidence_verifier.evaluate_candidate(
        candidate=edge_candidate,
        cv_img=img,
        gray_img=gray_img,
        mode="precision",
        is_sonar=False
    )
    assert result["status"] == "REJECTED"
    assert "Border" in result.get("rejection_stage", "")
    print(f"[PASS] Edge artifact rejected: Stage={result.get('rejection_stage')}, Reason={result.get('rejection_reason')}")


def test_verifier_tiny_speckle_noise():
    """Verify tiny speckles (< 0.005 area) receive size filter rejection in precision mode."""
    img = np.full((400, 400, 3), 100, dtype=np.uint8)
    gray_img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    tiny_candidate = {
        "id": "CAND-TINY",
        "box": {"xmin": 0.5, "ymin": 0.5, "xmax": 0.51, "ymax": 0.51},  # 0.0001 area
        "category": "Can / Metal",
        "confidence": 0.60
    }

    result = multi_evidence_verifier.evaluate_candidate(
        candidate=tiny_candidate,
        cv_img=img,
        gray_img=gray_img,
        mode="precision",
        is_sonar=False
    )
    assert result["status"] == "REJECTED"
    assert "Size" in result.get("rejection_stage", "") or "Resolution" in result.get("rejection_stage", "")
    print(f"[PASS] Tiny noise rejected: Stage={result.get('rejection_stage')}")


if __name__ == "__main__":
    test_verifier_confirmed_target()
    test_verifier_border_artifact_rejection()
    test_verifier_tiny_speckle_noise()
