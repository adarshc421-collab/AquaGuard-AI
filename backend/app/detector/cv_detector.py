import cv2
import numpy as np
from typing import Dict, List, Any, Optional

from app.detector.base_detector import BaseDetector, DEBRIS_SPECS, TAXONOMY_CLASSES

class ComputerVisionDetector(BaseDetector):
    """
    Deterministic Computer Vision Fallback Engine.
    Uses multi-scale morphological edge extraction, local contrast gradient analysis,
    and geometric feature classification with zero artificial randomness.
    """

    def __init__(self):
        super().__init__(name="AquaGuard Computer Vision Fallback Engine")

    def detect(self, cv_img: np.ndarray, is_sonar: bool = False) -> List[Dict[str, Any]]:
        """
        Extracts candidate marine debris objects using deterministic computer vision algorithms.
        Never uses random numbers or array indices to assign classes.
        """
        if cv_img is None or cv_img.size == 0:
            return []

        h, w = cv_img.shape[:2]
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY) if len(cv_img.shape) == 3 else cv_img.copy()

        # Step 1: Pre-processing & Gradient Edge Extraction
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 35, 110)

        # Morphological close to bridge broken debris lines (nets, ropes, bags)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        closed = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel, iterations=2)
        dilated = cv2.dilate(closed, kernel, iterations=1)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        raw_candidates = []
        min_area = (w * h) * 0.003
        max_area = (w * h) * 0.55

        # Sort contours by area descending to process dominant objects first
        contours = sorted(contours, key=cv2.contourArea, reverse=True)

        for idx, c in enumerate(contours):
            area = cv2.contourArea(c)
            if area < min_area or area > max_area:
                continue

            bx, by, bw, bh = cv2.boundingRect(c)
            ar = bw / float(bh)
            area_ratio = area / float(w * h)

            # Extract local annular background for contrast evaluation
            pad_x = int(bw * 0.25)
            pad_y = int(bh * 0.25)
            bg_x1, bg_y1 = max(0, bx - pad_x), max(0, by - pad_y)
            bg_x2, bg_y2 = min(w, bx + bw + pad_x), min(h, by + bh + pad_y)

            roi = gray[by:by+bh, bx:bx+bw]
            bg_roi = gray[bg_y1:bg_y2, bg_x1:bg_x2]

            roi_mean = float(np.mean(roi)) if roi.size > 0 else 128.0
            roi_std = float(np.std(roi)) if roi.size > 0 else 20.0
            bg_mean = float(np.mean(bg_roi)) if bg_roi.size > 0 else 128.0
            contrast_delta = abs(roi_mean - bg_mean)

            sobel = cv2.Sobel(roi, cv2.CV_64F, 1, 1, ksize=3) if roi.size > 0 else np.zeros((1, 1))
            edge_energy = float(np.mean(np.abs(sobel))) if roi.size > 0 else 15.0

            # Deterministic Classification strictly from physical morphological & texture metrics
            if is_sonar:
                if ar > 2.2:
                    category = "Rope" if area_ratio < 0.07 else "Fishing Net / Ghost Gear"
                elif 0.75 <= ar <= 1.35 and area_ratio < 0.06:
                    category = "Can / Metal"
                elif 0.7 <= ar <= 1.4:
                    category = "Tire" if area_ratio > 0.09 else "Plastic Container"
                else:
                    category = "Other Marine Debris"
            else:
                if ar > 2.4:
                    category = "Rope" if area_ratio < 0.08 else "Fishing Net / Ghost Gear"
                elif ar < 0.55:
                    category = "Plastic Bottle"
                elif area_ratio > 0.14:
                    category = "Fishing Net / Ghost Gear" if ar > 1.2 else "Tire"
                elif 0.8 <= ar <= 1.25 and area_ratio < 0.045:
                    category = "Can / Metal"
                elif 0.60 <= ar <= 1.6:
                    # Differentiate thin plastic film from rigid polymer container via internal texture std
                    if roi_std < 18.0:
                        category = "Plastic Bag"
                    elif area_ratio > 0.06:
                        category = "Plastic Container"
                    else:
                        category = "Plastic Bottle"
                else:
                    category = "Other Marine Debris"

            # Deterministic confidence computation strictly from optical feature metrics
            norm_contrast = min(1.0, contrast_delta / 35.0)
            norm_edge = min(1.0, edge_energy / 40.0)
            conf = min(0.965, max(0.60, 0.68 + (norm_contrast * 0.16) + (norm_edge * 0.12)))

            box = {
                "xmin": round(bx / float(w), 4),
                "ymin": round(by / float(h), 4),
                "xmax": round((bx + bw) / float(w), 4),
                "ymax": round((by + bh) / float(h), 4)
            }

            ai_explanation = BaseDetector.generate_ai_explanation(
                category=category,
                contrast_delta=contrast_delta,
                edge_energy=edge_energy,
                aspect_ratio=ar,
                area_pct=area_ratio * 100
            )

            raw_candidates.append({
                "id": f"cv-cand-{idx+1}",
                "label": category,
                "category": category,
                "confidence": round(conf, 3),
                "box": box,
                "contrast_delta": round(contrast_delta, 1),
                "edge_energy": round(edge_energy, 1),
                "aspect_ratio": round(ar, 2),
                "ai_explanation": ai_explanation
            })

            if len(raw_candidates) >= 12:
                break

        return raw_candidates

cv_detector = ComputerVisionDetector()
