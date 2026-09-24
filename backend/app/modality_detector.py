import cv2
import numpy as np
from typing import Dict, Any

class ImageModalityDetector:
    """
    Deterministically evaluates input underwater imagery to classify modality:
    - OPTICAL: Multi-channel color underwater imagery (dominated by cyan/green spectrum).
    - SONAR: Single-channel acoustic or side-scan sonar imagery (low saturation, high acoustic speckle).
    - UNKNOWN: Ambiguous images where user override is allowed.
    """

    @staticmethod
    def detect_modality(cv_img: np.ndarray) -> Dict[str, Any]:
        if cv_img is None or cv_img.size == 0:
            return {
                "modality": "OPTICAL",
                "is_sonar": False,
                "confidence": 0.50,
                "reason": "Default fallback (empty image)",
                "color_variance": 0.0,
                "mean_saturation": 0.0
            }

        # Check if 2D (grayscale) or 3D
        if len(cv_img.shape) == 2 or cv_img.shape[2] == 1:
            return {
                "modality": "SONAR",
                "is_sonar": True,
                "confidence": 0.98,
                "reason": "Single-channel grayscale matrix characteristic of acoustic sonar scans.",
                "color_variance": 0.0,
                "mean_saturation": 0.0
            }

        b, g, r = cv2.split(cv_img.astype(np.float32))
        
        # Calculate color channel differences
        diff_bg = np.mean(np.abs(b - g))
        diff_gr = np.mean(np.abs(g - r))
        diff_rb = np.mean(np.abs(r - b))
        mean_channel_diff = (diff_bg + diff_gr + diff_rb) / 3.0

        # Calculate HSV saturation
        hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
        sat = hsv[:, :, 1]
        mean_sat = float(np.mean(sat))
        sat_std = float(np.std(sat))

        # Check channel std
        b_mean = float(np.mean(b))
        g_mean = float(np.mean(g))
        r_mean = float(np.mean(r))
        channel_means = [b_mean, g_mean, r_mean]
        mean_spread = float(np.std(channel_means))

        # Decision heuristics
        # Sonar images have very low channel difference (< 4.0) and very low saturation (< 12.0)
        # Or grayscale-converted images with near-zero chromaticity
        if mean_channel_diff < 4.0 and mean_sat < 12.0:
            return {
                "modality": "SONAR",
                "is_sonar": True,
                "confidence": 0.95,
                "reason": f"Acoustic/monochromatic signal detected (Saturation: {mean_sat:.1f}/255, Channel Diff: {mean_channel_diff:.2f}).",
                "color_variance": round(mean_spread, 2),
                "mean_saturation": round(mean_sat, 2)
            }
        elif mean_channel_diff < 7.0 and mean_sat < 18.0:
            return {
                "modality": "SONAR",
                "is_sonar": True,
                "confidence": 0.85,
                "reason": f"Low chromatic variance indicating acoustic side-scan sonar profile.",
                "color_variance": round(mean_spread, 2),
                "mean_saturation": round(mean_sat, 2)
            }
        elif mean_sat >= 18.0 or mean_spread >= 8.0:
            return {
                "modality": "OPTICAL",
                "is_sonar": False,
                "confidence": 0.94,
                "reason": f"Optical RGB wavelength attenuation profile detected (Green/Blue variance: {mean_spread:.1f}).",
                "color_variance": round(mean_spread, 2),
                "mean_saturation": round(mean_sat, 2)
            }
        else:
            return {
                "modality": "UNKNOWN",
                "is_sonar": False,
                "confidence": 0.60,
                "reason": "Borderline chromatic values. Defaulting to Optical with operator override option.",
                "color_variance": round(mean_spread, 2),
                "mean_saturation": round(mean_sat, 2)
            }

modality_detector = ImageModalityDetector()
