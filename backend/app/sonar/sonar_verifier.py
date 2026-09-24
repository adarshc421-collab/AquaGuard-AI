import cv2
import numpy as np
from typing import Dict, Any

from app.sonar.shadow_detector import sonar_shadow_detector

class SonarVerifier:
    """
    Side-Scan Sonar Target Verification Engine.
    Combines acoustic highlight strength, target shape plausibility,
    local background separation, and acoustic shadow confirmation.
    """

    @staticmethod
    def verify_sonar_target(
        gray_img: np.ndarray,
        shadow_mask: np.ndarray,
        box: Dict[str, float],
        category: str = "Other Marine Debris",
        sensor_altitude_m: float = 4.0
    ) -> Dict[str, Any]:
        if gray_img is None:
            return {
                "acoustic_evidence": 50.0,
                "shadow_evidence": 50.0,
                "sonar_verification_score": 50.0,
                "status": "FAIL",
                "summary": "Missing sonar data"
            }

        h, w = gray_img.shape[:2]
        x1 = int(box.get("xmin", 0) * w)
        y1 = int(box.get("ymin", 0) * h)
        x2 = int(box.get("xmax", 1) * w)
        y2 = int(box.get("ymax", 1) * h)
        bw = max(1, x2 - x1)
        bh = max(1, y2 - y1)

        roi = gray_img[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
        roi_mean = float(np.mean(roi)) if roi.size > 0 else 128.0

        # Annular background
        pad_x, pad_y = int(bw * 0.3), int(bh * 0.3)
        bg_roi = gray_img[max(0, y1 - pad_y):min(h, y2 + pad_y), max(0, x1 - pad_x):min(w, x2 + pad_x)]
        bg_mean = float(np.mean(bg_roi)) if bg_roi.size > 0 else 128.0

        # 1. Acoustic Highlight Score
        contrast_delta = abs(roi_mean - bg_mean)
        acoustic_evidence = min(98.0, max(40.0, 55.0 + (contrast_delta / 25.0) * 40.0))

        # 2. Acoustic Shadow Analysis
        shadow_res = sonar_shadow_detector.analyze_target_shadow(
            gray_img, shadow_mask, box, sensor_altitude_m=sensor_altitude_m
        )
        shadow_evidence = shadow_res["shadow_score"]

        # 3. Shape & Geometry Plausibility
        ar = bw / float(bh)
        if category in ["Fishing Net / Ghost Gear", "Rope"] and ar > 1.8:
            shape_score = 92.0
        elif category in ["Tire", "Can / Metal"] and 0.7 <= ar <= 1.4:
            shape_score = 90.0
        elif 0.5 <= ar <= 2.2:
            shape_score = 82.0
        else:
            shape_score = 65.0

        # 4. Composite Sonar Verification Score (0 - 100)
        sonar_score = (
            0.40 * acoustic_evidence +
            0.35 * shadow_evidence +
            0.25 * shape_score
        )

        if sonar_score >= 82.0 and shadow_res["has_shadow"]:
            status = "PASS"
            summary = "Verified Sonar Target — Strong acoustic return paired with clear acoustic shadow."
        elif sonar_score >= 68.0:
            status = "BORDERLINE"
            summary = "Acoustic return detected with partial shadow support — Review recommended."
        else:
            status = "FAIL"
            summary = "Insufficient acoustic contrast and lacking supporting acoustic shadow."

        return {
            "acoustic_evidence": round(acoustic_evidence, 1),
            "shadow_evidence": round(shadow_evidence, 1),
            "shape_evidence": round(shape_score, 1),
            "sonar_verification_score": round(sonar_score, 1),
            "status": status,
            "summary": summary,
            "shadow_details": shadow_res
        }

sonar_verifier = SonarVerifier()
