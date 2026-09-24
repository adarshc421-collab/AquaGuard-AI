import os
import sys
import numpy as np

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.detector.base_detector import TAXONOMY_CLASSES, BaseDetector
from app.detector.cv_detector import cv_detector
from app.sonar.preprocess import sonar_preprocessor


def test_standard_taxonomy_compliance():
    """Verify that only the official 9 classes exist in taxonomy."""
    assert len(TAXONOMY_CLASSES) == 9
    assert "Plastic Bottle" in TAXONOMY_CLASSES
    assert "Plastic Bag" in TAXONOMY_CLASSES
    assert "Fishing Net / Ghost Gear" in TAXONOMY_CLASSES
    assert "Unknown / Uncertain" in TAXONOMY_CLASSES
    print("[PASS] Taxonomy Compliance: 9 standard classes confirmed.")


def test_spatial_quadrant_calculation():
    """Verify image-relative spatial quadrant math."""
    pos1 = BaseDetector.calculate_spatial_position({"xmin": 0.1, "ymin": 0.1, "xmax": 0.3, "ymax": 0.3})
    assert pos1["sector_key"] == "A"
    assert "North-West" in pos1["sector"]

    pos2 = BaseDetector.calculate_spatial_position({"xmin": 0.7, "ymin": 0.1, "xmax": 0.9, "ymax": 0.3})
    assert pos2["sector_key"] == "B"
    assert "North-East" in pos2["sector"]

    pos3 = BaseDetector.calculate_spatial_position({"xmin": 0.1, "ymin": 0.7, "xmax": 0.3, "ymax": 0.9})
    assert pos3["sector_key"] == "C"
    assert "South-West" in pos3["sector"]

    pos4 = BaseDetector.calculate_spatial_position({"xmin": 0.7, "ymin": 0.7, "xmax": 0.9, "ymax": 0.9})
    assert pos4["sector_key"] == "D"
    assert "South-East" in pos4["sector"]
    print("[PASS] Spatial Quadrant Calculation verified.")


def test_optical_cv_candidate_generation():
    """Verify CV detector generates candidates with valid metadata on synthetic optical frame."""
    img = np.full((300, 400, 3), 100, dtype=np.uint8)
    # Bright target in center
    img[120:180, 160:240, :] = 250

    candidates = cv_detector.detect(img, is_sonar=False)
    assert len(candidates) >= 1
    c = candidates[0]
    assert "box" in c
    assert "category" in c
    assert c["category"] in TAXONOMY_CLASSES
    assert "confidence" in c
    assert 0.0 <= c["confidence"] <= 1.0
    print(f"[PASS] Optical CV Candidate Generation: Found {len(candidates)} valid candidate(s).")


def test_sonar_preprocessing():
    """Verify sonar preprocessing and shadow mask extraction."""
    sonar_img = np.full((300, 400, 3), 50, dtype=np.uint8)
    # Bright highlight
    sonar_img[100:140, 150:200, :] = 230
    # Acoustic shadow behind highlight
    sonar_img[140:220, 150:200, :] = 10

    prep_res = sonar_preprocessor.preprocess_sonar(sonar_img)
    assert "enhanced_bgr" in prep_res
    assert "shadow_mask" in prep_res
    assert "pipeline_applied" in prep_res
    print("[PASS] Sonar Preprocessing verified.")


if __name__ == "__main__":
    test_standard_taxonomy_compliance()
    test_spatial_quadrant_calculation()
    test_optical_cv_candidate_generation()
    test_sonar_preprocessing()
