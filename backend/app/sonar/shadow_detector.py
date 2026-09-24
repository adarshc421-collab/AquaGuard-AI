import cv2
import numpy as np
from typing import Dict, Any, Optional

class SonarShadowDetector:
    """
    Acoustic Shadow & Highlight Analysis Module for Side-Scan Sonar.
    Detects supporting acoustic shadow regions behind highlights,
    calculating shadow length, target width, and estimated relative target height.
    """

    @staticmethod
    def analyze_target_shadow(
        gray_img: np.ndarray,
        shadow_mask: np.ndarray,
        box: Dict[str, float],
        sensor_altitude_m: Optional[float] = None
    ) -> Dict[str, Any]:
        if gray_img is None or shadow_mask is None:
            return {
                "has_shadow": False,
                "shadow_score": 50.0,
                "shadow_length_px": 0,
                "relative_height_m": None,
                "height_label": "Height unavailable – insufficient shadow geometry",
                "reason": "Missing sonar data"
            }

        h, w = gray_img.shape[:2]
        x1 = int(box.get("xmin", 0) * w)
        y1 = int(box.get("ymin", 0) * h)
        x2 = int(box.get("xmax", 1) * w)
        y2 = int(box.get("ymax", 1) * h)
        bw = max(1, x2 - x1)
        bh = max(1, y2 - y1)

        # Highlight ROI
        highlight_roi = gray_img[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
        highlight_mean = float(np.mean(highlight_roi)) if highlight_roi.size > 0 else 128.0

        # Look in range direction (downward from highlight in standard side-scan waterfall)
        shadow_search_h = int(bh * 1.5)
        sy1 = min(h, y2)
        sy2 = min(h, sy1 + shadow_search_h)
        sx1 = max(0, x1 - int(bw * 0.1))
        sx2 = min(w, x2 + int(bw * 0.1))

        if sy2 <= sy1 or sx2 <= sx1:
            return {
                "has_shadow": False,
                "shadow_score": 45.0,
                "shadow_length_px": 0,
                "relative_height_m": None,
                "height_label": "Height unavailable – edge boundary clipped",
                "reason": "Target at image boundary"
            }

        shadow_roi = gray_img[sy1:sy2, sx1:sx2]
        shadow_mask_roi = shadow_mask[sy1:sy2, sx1:sx2]

        shadow_mean = float(np.mean(shadow_roi)) if shadow_roi.size > 0 else highlight_mean
        shadow_pixel_count = int(np.sum(shadow_mask_roi > 0))
        shadow_area_ratio = shadow_pixel_count / max(1.0, float(shadow_roi.size))

        # Acoustic shadow validation: Shadow region should be significantly darker than highlight
        # and darker than surrounding mean
        contrast_ratio = highlight_mean / max(1.0, shadow_mean)
        has_shadow = contrast_ratio > 1.35 and shadow_area_ratio > 0.20

        # Calculate shadow length in pixels
        shadow_length_px = 0
        if has_shadow and shadow_mask_roi.size > 0:
            # Find vertical extent of shadow
            row_sums = np.sum(shadow_mask_roi, axis=1)
            active_rows = np.where(row_sums > (sx2 - sx1) * 0.15)[0]
            shadow_length_px = int(len(active_rows)) if len(active_rows) > 0 else int(bh * 0.6)

        # Compute Shadow Evidence Score (0 - 100)
        if has_shadow:
            shadow_score = min(98.0, 75.0 + (contrast_ratio - 1.35) * 20.0 + (shadow_area_ratio * 15.0))
        else:
            shadow_score = max(30.0, 60.0 - (1.35 - contrast_ratio) * 25.0)

        # Estimate Target Height (Geometric calculation: H_t = H_sensor * (L_shadow / (R_slant + L_shadow)))
        relative_height_m = None
        height_label = "Height unavailable – insufficient shadow geometry"

        if has_shadow and shadow_length_px >= 3:
            # Use baseline 3.5m altitude if not specified by telemetry
            alt_m = sensor_altitude_m if sensor_altitude_m is not None else 4.0
            # Pixel-to-metric scaling based on standard 0.05m/pixel side-scan resolution
            metric_shadow_len = shadow_length_px * 0.045
            est_h = round(alt_m * (metric_shadow_len / (alt_m * 2.5 + metric_shadow_len)), 2)
            relative_height_m = max(0.15, min(2.5, est_h))
            height_label = f"{relative_height_m:.2f} m [Estimated via Acoustic Shadow]"

        return {
            "has_shadow": bool(has_shadow),
            "shadow_score": round(shadow_score, 1),
            "shadow_length_px": shadow_length_px,
            "target_width_px": bw,
            "contrast_ratio": round(contrast_ratio, 2),
            "relative_height_m": relative_height_m,
            "height_label": height_label,
            "reason": "Acoustic highlight paired with distinct acoustic shadow" if has_shadow else "No supporting acoustic shadow detected"
        }

sonar_shadow_detector = SonarShadowDetector()
