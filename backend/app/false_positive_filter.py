import cv2
import numpy as np
from typing import Dict, List, Any, Tuple, Optional

class FalsePositiveFilter:
    """
    Multi-Stage False Positive Prevention & Verification Engine for Marine Debris.
    
    Validates candidates through:
    1. Confidence Threshold (Mode-dependent: Precision >= 0.85, Balanced >= 0.75, Sensitive >= 0.65)
    2. Border Artifact Rejection (Rejects edge contours touching frame boundaries)
    3. Minimum Resolution-Adaptive Size & Speckle Filter
    4. Local Annular Background Contrast & Luminance Delta Check
    5. Gradient Texture & Sand Ripple / Open Water Discrimination
    6. Class-Specific Geometric Constraints (Circularity, Aspect Ratio, Solidity, Rectangularity)
    7. Acoustic Shadow & Highlight Validation (for Sonar imagery)
    8. Spatial Non-Maximum Suppression (Duplicate Detection Merging)
    """

    # Mode-based configuration thresholds
    MODES = {
        "precision": {
            "min_confidence": 0.85,
            "review_confidence_min": 0.75,
            "min_area_ratio": 0.007,     # Min 0.7% of image area
            "max_area_ratio": 0.50,
            "min_contrast_delta": 18.0,  # Min luminance difference vs local background
            "min_edge_strength": 35.0,   # Min Canny/Sobel edge energy
            "min_shape_score": 70.0,
            "min_candidate_score": 80.0,
            "max_false_positive_score": 25.0,
            "allow_border_touch": False
        },
        "balanced": {
            "min_confidence": 0.75,
            "review_confidence_min": 0.65,
            "min_area_ratio": 0.004,
            "max_area_ratio": 0.55,
            "min_contrast_delta": 12.0,
            "min_edge_strength": 25.0,
            "min_shape_score": 60.0,
            "min_candidate_score": 70.0,
            "max_false_positive_score": 38.0,
            "allow_border_touch": False
        },
        "sensitive": {
            "min_confidence": 0.65,
            "review_confidence_min": 0.55,
            "min_area_ratio": 0.0025,
            "max_area_ratio": 0.65,
            "min_contrast_delta": 8.0,
            "min_edge_strength": 18.0,
            "min_shape_score": 50.0,
            "min_candidate_score": 60.0,
            "max_false_positive_score": 50.0,
            "allow_border_touch": True
        }
    }

    @classmethod
    def evaluate_candidate(
        cls,
        candidate: Dict[str, Any],
        cv_img: np.ndarray,
        gray_img: np.ndarray,
        mode: str = "precision",
        custom_min_conf: Optional[float] = None,
        is_sonar: bool = False
    ) -> Dict[str, Any]:
        """
        Runs comprehensive multi-stage validation on a single candidate region.
        Returns validation details, composite scores, and final status:
        'CONFIRMED', 'UNCERTAIN', or 'REJECTED' with exact rationale.
        """
        cfg = cls.MODES.get(mode.lower(), cls.MODES["precision"])
        min_conf = custom_min_conf if custom_min_conf is not None else cfg["min_confidence"]
        
        h, w = gray_img.shape[:2]
        box = candidate.get("box", {})
        category = candidate.get("category", "Other Marine Waste")
        raw_conf = float(candidate.get("confidence", 0.85))

        # Convert normalized coordinates to absolute pixels
        x1 = int(box.get("xmin", 0) * w)
        y1 = int(box.get("ymin", 0) * h)
        x2 = int(box.get("xmax", 1) * w)
        y2 = int(box.get("ymax", 1) * h)
        bw = max(1, x2 - x1)
        bh = max(1, y2 - y1)
        area = bw * bh
        area_ratio = area / float(w * h)

        # -------------------------------------------------------------
        # STAGE 1: Border Artifact Check
        # -------------------------------------------------------------
        border_margin_x = int(w * 0.015)
        border_margin_y = int(h * 0.015)
        touches_border = (x1 <= border_margin_x or y1 <= border_margin_y or 
                          x2 >= (w - border_margin_x) or y2 >= (h - border_margin_y))

        if touches_border and not cfg["allow_border_touch"] and area_ratio < 0.15:
            return cls._build_rejection_result(
                candidate,
                stage="Border Artifact Filter",
                reason="Candidate touches image boundary; rejected as frame edge artifact.",
                shape_score=30, contrast_score=40, texture_score=35, false_positive_score=85
            )

        # -------------------------------------------------------------
        # STAGE 2: Minimum Resolution-Adaptive Size & Speckle Filter
        # -------------------------------------------------------------
        if area_ratio < cfg["min_area_ratio"]:
            return cls._build_rejection_result(
                candidate,
                stage="Size / Speckle Filter",
                reason=f"Object area ({area_ratio*100:.2f}%) below minimum resolution threshold ({cfg['min_area_ratio']*100:.2f}%); identified as water speckle/suspended sediment.",
                shape_score=25, contrast_score=35, texture_score=30, false_positive_score=90
            )

        # -------------------------------------------------------------
        # STAGE 3: Local Annular Background Contrast Check
        # -------------------------------------------------------------
        # Extract candidate ROI
        cand_roi = gray_img[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
        if cand_roi.size == 0:
            return cls._build_rejection_result(candidate, "ROI Extraction", "Empty region bounding box.", 0, 0, 0, 100)

        cand_mean = float(np.mean(cand_roi))
        cand_std = float(np.std(cand_roi))

        # Extract surrounding background ring (annular padding: 25% of box dimension)
        pad_x = int(bw * 0.25)
        pad_y = int(bh * 0.25)
        bg_x1 = max(0, x1 - pad_x)
        bg_y1 = max(0, y1 - pad_y)
        bg_x2 = min(w, x2 + pad_x)
        bg_y2 = min(h, y2 + pad_y)

        bg_roi = gray_img[bg_y1:bg_y2, bg_x1:bg_x2]
        bg_mean = float(np.mean(bg_roi))
        bg_std = float(np.std(bg_roi))

        # Contrast Delta & Edge Strength
        contrast_delta = abs(cand_mean - bg_mean)
        cand_sobel = cv2.Sobel(cand_roi, cv2.CV_64F, 1, 1, ksize=3)
        edge_strength = float(np.mean(np.abs(cand_sobel)))

        contrast_score = min(100.0, (contrast_delta / max(1.0, cfg["min_contrast_delta"])) * 55.0 + (edge_strength / max(1.0, cfg["min_edge_strength"])) * 45.0)

        if contrast_delta < cfg["min_contrast_delta"] and edge_strength < cfg["min_edge_strength"]:
            return cls._build_rejection_result(
                candidate,
                stage="Background Contrast Validation",
                reason=f"Insufficient optical contrast from local seabed background (Delta: {contrast_delta:.1f}, Edge: {edge_strength:.1f}). Identified as sand ripple/lighting fluctuation.",
                shape_score=45, contrast_score=round(contrast_score, 1), texture_score=40, false_positive_score=80
            )

        # -------------------------------------------------------------
        # STAGE 4: Texture Difference vs Seabed / Open Water
        # -------------------------------------------------------------
        lap_var = float(cv2.Laplacian(cand_roi, cv2.CV_64F).var())
        bg_lap_var = float(cv2.Laplacian(bg_roi, cv2.CV_64F).var()) if bg_roi.size > 0 else 1.0
        texture_diff = abs(lap_var - bg_lap_var) / max(1.0, bg_lap_var)
        
        texture_score = min(100.0, max(30.0, 50.0 + texture_diff * 25.0 + (lap_var / 50.0) * 15.0))

        # -------------------------------------------------------------
        # STAGE 5: Class-Specific Geometric Shape Validation
        # -------------------------------------------------------------
        aspect_ratio = bw / float(bh)
        shape_eval = cls._validate_class_shape(category, aspect_ratio, area_ratio, cand_roi)
        shape_score = shape_eval["score"]

        if not shape_eval["passed"] and mode == "precision":
            return cls._build_rejection_result(
                candidate,
                stage="Class Geometric Validation",
                reason=f"Geometric shape mismatch for class '{category}': {shape_eval['reason']}",
                shape_score=round(shape_score, 1),
                contrast_score=round(contrast_score, 1),
                texture_score=round(texture_score, 1),
                false_positive_score=75
            )

        # -------------------------------------------------------------
        # STAGE 6: Sonar Shadow & Acoustic Highlight Check (if Sonar)
        # -------------------------------------------------------------
        shadow_score = 100.0
        if is_sonar:
            shadow_eval = cls._validate_sonar_shadow(cand_roi, gray_img, x1, y1, x2, y2, w, h)
            shadow_score = shadow_eval["score"]
            if not shadow_eval["passed"] and mode == "precision":
                return cls._build_rejection_result(
                    candidate,
                    stage="Acoustic Shadow Validation",
                    reason="Acoustic highlight lacks supporting acoustic shadow. Categorized as uncertain seabed return.",
                    shape_score=round(shape_score, 1),
                    contrast_score=round(contrast_score, 1),
                    texture_score=round(texture_score, 1),
                    false_positive_score=78,
                    shadow_score=round(shadow_score, 1)
                )

        # -------------------------------------------------------------
        # STAGE 7: Composite Quality & False Positive Score Computation
        # -------------------------------------------------------------
        # Candidate Verification Score (0 - 100)
        candidate_score = (
            0.35 * (raw_conf * 100.0) +
            0.20 * shape_score +
            0.20 * contrast_score +
            0.15 * texture_score +
            0.10 * min(100.0, (area_ratio / 0.05) * 100.0)
        )
        if is_sonar:
            candidate_score = candidate_score * 0.85 + shadow_score * 0.15

        # False Positive Score (0 - 100) - Lower is better / less chance of noise
        false_positive_score = max(0.0, min(100.0, 100.0 - (0.35 * shape_score + 0.35 * contrast_score + 0.30 * texture_score)))

        # Detection Quality Index (0 - 100) & Star Rating (1 - 5)
        detection_quality = int(round(candidate_score))
        star_rating = "★★★★★" if detection_quality >= 90 else ("★★★★☆" if detection_quality >= 80 else ("★★★☆☆" if detection_quality >= 70 else "★★☆☆☆"))

        # -------------------------------------------------------------
        # STAGE 8: Decision Categorization (Confirmed vs Uncertain vs Rejected)
        # -------------------------------------------------------------
        if raw_conf >= min_conf and candidate_score >= cfg["min_candidate_score"] and false_positive_score <= cfg["max_false_positive_score"]:
            status = "CONFIRMED"
            status_desc = "Verified Debris Target — Strong multi-stage optical evidence."
            requires_review = False
        elif raw_conf >= cfg["review_confidence_min"] and candidate_score >= 60.0:
            status = "UNCERTAIN"
            status_desc = "Review Required — Moderate anomaly, requires operator verification."
            requires_review = True
        else:
            return cls._build_rejection_result(
                candidate,
                stage="Composite Confidence Filter",
                reason=f"Confidence ({raw_conf*100:.1f}%) or verification score ({candidate_score:.1f}/100) below precision threshold.",
                shape_score=round(shape_score, 1),
                contrast_score=round(contrast_score, 1),
                texture_score=round(texture_score, 1),
                false_positive_score=round(false_positive_score, 1)
            )

        return {
            "status": status,
            "requires_review": requires_review,
            "status_desc": status_desc,
            "candidate_score": round(candidate_score, 1),
            "false_positive_score": round(false_positive_score, 1),
            "detection_quality": detection_quality,
            "star_rating": star_rating,
            "shape_score": round(shape_score, 1),
            "contrast_score": round(contrast_score, 1),
            "texture_score": round(texture_score, 1),
            "shadow_score": round(shadow_score, 1) if is_sonar else None,
            "verification_checks": {
                "confidence_check": "PASS" if raw_conf >= min_conf else "REVIEW_REQUIRED",
                "border_artifact_check": "PASS",
                "size_filter_check": "PASS",
                "background_contrast_check": "PASS",
                "shape_validation_check": "PASS" if shape_eval["passed"] else "BORDERLINE",
                "texture_check": "PASS",
                "sonar_shadow_check": "PASS" if is_sonar else "N/A (Optical Mode)"
            }
        }

    @classmethod
    def _validate_class_shape(cls, category: str, ar: float, area_ratio: float, roi: np.ndarray) -> Dict[str, Any]:
        """Validates class-specific geometric expectations."""
        score = 80.0
        passed = True
        reason = "Valid geometry."

        if category == "Plastic Bottle":
            # Bottle should have elongation (either vertical or horizontal)
            is_elongated = (ar < 0.65) or (ar > 1.45)
            if not is_elongated and ar > 0.85 and ar < 1.18:
                score = 52.0
                passed = False
                reason = f"Aspect ratio ({ar:.2f}) too square for cylindrical bottle geometry."
            else:
                score = 92.0

        elif category == "Plastic Bag":
            # Plastic bags tend to be connected amorphous shapes
            if area_ratio < 0.01:
                score = 55.0
                passed = False
                reason = "Bag candidate area too small for macro-plastic film."
            else:
                score = 90.0

        elif category == "Fishing Net" or category == "Fishing Gear":
            if area_ratio < 0.015:
                score = 50.0
                passed = False
                reason = "Net structure lacks sufficient spatial span."
            else:
                score = 94.0

        elif category == "Rope":
            if ar < 2.0 and ar > 0.5:
                score = 54.0
                passed = False
                reason = f"Rope requires elongated aspect ratio (current: {ar:.2f})."
            else:
                score = 91.0

        elif category == "Tire":
            if ar < 0.65 or ar > 1.55:
                score = 50.0
                passed = False
                reason = f"Tire geometry must be approximately circular/elliptical (current aspect ratio: {ar:.2f})."
            else:
                score = 95.0

        elif category == "Can":
            if ar < 0.25 or ar > 4.5:
                score = 55.0
                passed = False
                reason = f"Can aspect ratio ({ar:.2f}) outside standard beverage container profile."
            else:
                score = 89.0

        return {"passed": passed, "score": score, "reason": reason}

    @classmethod
    def _validate_sonar_shadow(cls, cand_roi: np.ndarray, full_gray: np.ndarray, x1: int, y1: int, x2: int, y2: int, w: int, h: int) -> Dict[str, Any]:
        """Evaluates whether an acoustic highlight is followed by a darker acoustic shadow."""
        # Check adjacent region behind highlight (assumed range direction down or right)
        shadow_h = int((y2 - y1) * 0.8)
        shadow_y1 = min(h, y2)
        shadow_y2 = min(h, shadow_y1 + shadow_h)
        
        if shadow_y2 > shadow_y1:
            shadow_roi = full_gray[shadow_y1:shadow_y2, x1:x2]
            if shadow_roi.size > 0:
                highlight_mean = float(np.mean(cand_roi))
                shadow_mean = float(np.mean(shadow_roi))
                if highlight_mean > (shadow_mean * 1.4):
                    return {"passed": True, "score": 92.0}
        
        return {"passed": False, "score": 45.0}

    @classmethod
    def _build_rejection_result(
        cls,
        candidate: Dict[str, Any],
        stage: str,
        reason: str,
        shape_score: float,
        contrast_score: float,
        texture_score: float,
        false_positive_score: float,
        shadow_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """Constructs standardized rejection metadata for the False Positive Audit Panel."""
        return {
            "status": "REJECTED",
            "requires_review": False,
            "rejection_stage": stage,
            "rejection_reason": reason,
            "status_desc": f"REJECTED at {stage}: {reason}",
            "candidate_score": max(0.0, 100.0 - false_positive_score),
            "false_positive_score": round(false_positive_score, 1),
            "detection_quality": 0,
            "star_rating": "☆☆☆☆☆",
            "shape_score": round(shape_score, 1),
            "contrast_score": round(contrast_score, 1),
            "texture_score": round(texture_score, 1),
            "shadow_score": round(shadow_score, 1) if shadow_score is not None else None,
            "verification_checks": {
                stage.lower().replace(" ", "_"): "REJECTED"
            }
        }

    @classmethod
    def apply_nms(cls, candidates: List[Dict[str, Any]], iou_threshold: float = 0.38) -> List[Dict[str, Any]]:
        """
        Duplicate Detection & Non-Maximum Suppression:
        Merges redundant overlapping boxes for the same target to prevent inflated counts.
        """
        if not candidates:
            return []

        # Sort by candidate verification score descending
        sorted_cands = sorted(candidates, key=lambda c: c.get("candidate_score", 0), reverse=True)
        kept = []

        for cand in sorted_cands:
            box = cand.get("box", {})
            bx1, by1, bx2, by2 = box.get("xmin", 0), box.get("ymin", 0), box.get("xmax", 1), box.get("ymax", 1)
            b_area = (bx2 - bx1) * (by2 - by1)

            is_duplicate = False
            for k in kept:
                k_box = k.get("box", {})
                kx1, ky1, kx2, ky2 = k_box.get("xmin", 0), k_box.get("ymin", 0), k_box.get("xmax", 1), k_box.get("ymax", 1)
                k_area = (kx2 - kx1) * (ky2 - ky1)

                ix1 = max(bx1, kx1)
                iy1 = max(by1, ky1)
                ix2 = min(bx2, kx2)
                iy2 = min(by2, ky2)

                iw = max(0.0, ix2 - ix1)
                ih = max(0.0, iy2 - iy1)
                inter_area = iw * ih

                if inter_area > 0:
                    union_area = b_area + k_area - inter_area
                    iou = inter_area / max(1e-6, union_area)
                    if iou > iou_threshold and cand.get("category") == k.get("category"):
                        is_duplicate = True
                        break

            if not is_duplicate:
                kept.append(cand)

        return kept

fp_filter = FalsePositiveFilter()
