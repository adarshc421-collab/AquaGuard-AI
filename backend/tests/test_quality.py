import os
import sys
import numpy as np

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.image_quality import quality_analyzer


def test_optical_quality_metrics():
    """Verify optical image quality extraction (sharpness, haze, brightness, contrast)."""
    # Create sharp, high-contrast optical image
    sharp_img = np.zeros((300, 300, 3), dtype=np.uint8)
    sharp_img[:, :, 0] = 200  # Blue dominance
    sharp_img[:, :, 1] = 150  # Green
    sharp_img[:, :, 2] = 30   # Red
    # Add high frequency checkerboard pattern
    sharp_img[::20, ::20, :] = 255

    metrics = quality_analyzer.analyze(sharp_img)
    assert "sharpness" in metrics
    assert "haze" in metrics
    assert "brightness" in metrics
    assert "contrast" in metrics
    assert "overall_score" in metrics
    assert "readiness" in metrics
    assert 0 <= metrics["overall_score"] <= 100
    print(f"[PASS] Optical Quality: Score={metrics['overall_score']}/100, Sharpness={metrics['sharpness']}, Readiness={metrics['readiness']}")


def test_empty_or_dark_image_quality():
    """Verify quality analysis handles low luminance or empty input gracefully."""
    dark_img = np.zeros((200, 200, 3), dtype=np.uint8)
    metrics = quality_analyzer.analyze(dark_img)
    assert metrics["brightness"] == "Low"
    assert "overall_score" in metrics
    print(f"[PASS] Dark image handled: Score={metrics['overall_score']}, Brightness={metrics['brightness']}")


if __name__ == "__main__":
    test_optical_quality_metrics()
    test_empty_or_dark_image_quality()
