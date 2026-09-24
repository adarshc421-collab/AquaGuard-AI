import os
import sys
import numpy as np
import cv2

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.detector.detector_factory import detector_factory


def test_determinism_on_synthetic_image():
    """Verify that running inference twice on identical images produces exact identical results."""
    np.random.seed(42)
    img = np.full((300, 400, 3), 120, dtype=np.uint8)
    img[:, :, 0] = 180  # Blue
    img[:, :, 1] = 140  # Green
    img[:, :, 2] = 50   # Red
    img[50:110, 80:160, :] = [230, 240, 250]
    img[180:190, 200:320, :] = [30, 40, 50]

    test_path = os.path.join(BACKEND_DIR, "static", "uploads", "test_determinism.png")
    os.makedirs(os.path.dirname(test_path), exist_ok=True)
    cv2.imwrite(test_path, img)

    # Run Pass 1
    res1 = detector_factory.detect_custom_image(
        file_path=test_path,
        filename="test_determinism.png",
        confidence_threshold=0.60,
        mode="precision"
    )

    # Run Pass 2
    res2 = detector_factory.detect_custom_image(
        file_path=test_path,
        filename="test_determinism.png",
        confidence_threshold=0.60,
        mode="precision"
    )

    # Assert strict deterministic equality
    assert res1["total_debris"] == res2["total_debris"], "Total debris count must be identical"
    assert res1["modality"] == res2["modality"], "Modality detection must be identical"
    assert res1["severity"] == res2["severity"], "Risk severity must be identical"
    assert len(res1["detections"]) == len(res2["detections"]), "Detections length must match"

    for d1, d2 in zip(res1["detections"], res2["detections"]):
        assert d1["id"] == d2["id"], f"Target ID mismatch: {d1['id']} != {d2['id']}"
        assert d1["category"] == d2["category"], f"Category mismatch: {d1['category']} != {d2['category']}"
        assert d1["detection_confidence_pct"] == d2["detection_confidence_pct"], f"Confidence mismatch"
        assert d1["bbox"] == d2["bbox"], f"Bounding box mismatch: {d1['bbox']} != {d2['bbox']}"
        assert d1["verification_score"] == d2["verification_score"], f"Verification score mismatch"
        assert d1["status"] == d2["status"], f"Verification status mismatch"

    # Verify inspection plan determinism
    assert len(res1["inspection_plan"]["waypoints"]) == len(res2["inspection_plan"]["waypoints"])
    assert res1["inspection_plan"]["total_distance_m"] == res2["inspection_plan"]["total_distance_m"]

    # Verify hotspot determinism
    assert len(res1["hotspots"]) == len(res2["hotspots"])

    print("[PASS] Test Determinism: 100% identical outputs on repeated inference runs.")


def test_determinism_on_preset_sample():
    """Verify determinism across sample presets."""
    res1 = detector_factory.detect_preset_sample("coral_reef_plastics", mode="precision")
    res2 = detector_factory.detect_preset_sample("coral_reef_plastics", mode="precision")

    assert res1["total_debris"] == res2["total_debris"]
    assert res1["severity"] == res2["severity"]
    assert [d["id"] for d in res1["detections"]] == [d["id"] for d in res2["detections"]]
    assert [d["category"] for d in res1["detections"]] == [d["category"] for d in res2["detections"]]
    print("[PASS] Test Sample Determinism: Preset sample produces consistent results.")


if __name__ == "__main__":
    test_determinism_on_synthetic_image()
    test_determinism_on_preset_sample()
