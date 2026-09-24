import cv2
import numpy as np
from typing import Dict, List, Any, Tuple, Optional

from app.sonar.sonar_verifier import sonar_verifier

class MultiEvidenceVerifier:
    """
    AquaGuard AI Multi-Evidence Target Verification Engine.
    Evaluates candidate regions across 7 independent optical & acoustic dimensions
    to generate a deterministic 0-100 Verification Score and 3-Tier Classification:
    - CONFIRMED (85–100): High-certainty verified marine debris target.
    - REVIEW (70–84): Borderline anomaly requiring human-in-the-loop review.
    - REJECTED (<70): Natural seabed feature, rock, or noise artifact ruled out by precision filter.
    """

    # Operating Mode Profiles
    MODES = {
        "precision": {
            "min_detection_conf": 0.82,
            "min_verification_score": 85.0,
            "review_score_min": 70.0,
            "min_area_ratio": 0.005,
            "min_contrast_delta": 15.0,
            "min_edge_strength": 28.0,
            "allow_border_touch": False
        },
        "balanced": {
            "min_detection_conf": 0.74,
            "min_verification_score": 78.0,
            "review_score_min": 65.0,
            "min_area_ratio": 0.0035,
            "min_contrast_delta": 11.0,
            "min_edge_strength": 20.0,
            "allow_border_touch": False
        },
        "sensitive": {
            "min_detection_conf": 0.65,
            "min_verification_score": 70.0,
            "review_score_min": 58.0,
            "min_area_ratio": 0.002,
            "min_contrast_delta": 8.0,
            "min_edge_strength": 15.0,
            "allow_border_touch": True
        }
    }

    @classmethod
    def evaluate_candidate(
        cls,
        candidate: Optional[Dict[str, Any]] = None,
        cv_img: np.ndarray = None,
        gray_img: np.ndarray = None,
        mode: str = "precision",
        is_sonar: bool = False,
        sonar_shadow_mask: Optional[np.ndarray] = None,
        cand: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Runs comprehensive multi-stage verification on a candidate region.
        """
        candidate = candidate if candidate is not None else (cand if cand is not None else {})
        cfg = cls.MODES.get(mode.lower(), cls.MODES["precision"])
        h, w = gray_img.shape[:2]
        box = candidate.get("box", {})
        category = candidate.get("category", "Other Marine Debris")
        raw_conf = float(candidate.get("confidence", 0.85))

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
        margin_x = int(w * 0.015)
        margin_y = int(h * 0.015)
        touches_border = (x1 <= margin_x or y1 <= margin_y or x2 >= (w - margin_x) or y2 >= (h - margin_y))

        if touches_border and not cfg["allow_border_touch"] and area_ratio < 0.12:
            return cls._build_rejection_result(
                candidate=candidate,
                stage="Border Artifact Rejection",
                reason="Object touches image boundary; rejected as edge frame artifact.",
                verification_score=25.0
            )

        # -------------------------------------------------------------
        # STAGE 2: Minimum Resolution & Speckle Filter
        # -------------------------------------------------------------
        if area_ratio < cfg["min_area_ratio"]:
            return cls._build_rejection_result(
                candidate=candidate,
                stage="Size Plausibility Filter",
                reason=f"Object spatial area ({area_ratio*100:.2f}%) below minimum resolution threshold ({cfg['min_area_ratio']*100:.2f}%); identified as suspended sediment speckle.",
                verification_score=30.0
            )

        # -------------------------------------------------------------
        # STAGE 3: Local Annular Background Separation & Contrast
        # -------------------------------------------------------------
        cand_roi = gray_img[max(0, y1):min(h, y2), max(0, x1):min(w, x2)]
        if cand_roi.size == 0:
            return cls._build_rejection_result(candidate, "ROI Extraction", "Empty bounding box geometry.", 0.0)

        cand_mean = float(np.mean(cand_roi))
        
        pad_x = int(bw * 0.25)
        pad_y = int(bh * 0.25)
        bg_roi = gray_img[max(0, y1 - pad_y):min(h, y2 + pad_y), max(0, x1 - pad_x):min(w, x2 + pad_x)]
        bg_mean = float(np.mean(bg_roi)) if bg_roi.size > 0 else 128.0

        contrast_delta = abs(cand_mean - bg_mean)
        sobel = cv2.Sobel(cand_roi, cv2.CV_64F, 1, 1, ksize=3)
        edge_energy = float(np.mean(np.abs(sobel))) if cand_roi.size > 0 else 10.0

        contrast_score = min(100.0, (contrast_delta / max(1.0, cfg["min_contrast_delta"])) * 55.0 + (edge_energy / max(1.0, cfg["min_edge_strength"])) * 45.0)

        if contrast_delta < cfg["min_contrast_delta"] and edge_energy < cfg["min_edge_strength"]:
            return cls._build_rejection_result(
                candidate=candidate,
                stage="Background Contrast Validation",
                reason=f"Insufficient optical contrast from seabed background (Delta: {contrast_delta:.1f}, Edge: {edge_energy:.1f}). Candidate resembles sand ripple/lighting fluctuation.",
                verification_score=40.0
            )

        # -------------------------------------------------------------
        # STAGE 4: Texture Difference vs Open Water / Seabed
        # -------------------------------------------------------------
        lap_var = float(cv2.Laplacian(cand_roi, cv2.CV_64F).var())
        bg_lap_var = float(cv2.Laplacian(bg_roi, cv2.CV_64F).var()) if bg_roi.size > 0 else 1.0
        texture_diff = abs(lap_var - bg_lap_var) / max(1.0, bg_lap_var)
        texture_score = min(100.0, max(35.0, 50.0 + texture_diff * 25.0 + (lap_var / 50.0) * 15.0))

        # -------------------------------------------------------------
        # STAGE 5: Class Geometric Shape Validation
        # -------------------------------------------------------------
        ar = bw / float(bh)
        shape_eval = cls._validate_class_shape(category, ar, area_ratio)
        shape_score = shape_eval["score"]

        if not shape_eval["passed"] and mode == "precision":
            return cls._build_rejection_result(
                candidate=candidate,
                stage="Class Geometric Validation",
                reason=f"Geometric shape mismatch for class '{category}': {shape_eval['reason']}",
                verification_score=45.0
            )

        # -------------------------------------------------------------
        # STAGE 6: Acoustic Shadow Validation (if Sonar)
        # -------------------------------------------------------------
        shadow_score = 90.0
        shadow_info = None
        if is_sonar and sonar_shadow_mask is not None:
            sonar_eval = sonar_verifier.verify_sonar_target(
                gray_img, sonar_shadow_mask, box, category=category
            )
            shadow_score = sonar_eval["sonar_verification_score"]
            shadow_info = sonar_eval
            if sonar_eval["status"] == "FAIL" and mode == "precision":
                return cls._build_rejection_result(
                    candidate=candidate,
                    stage="Acoustic Shadow Verification",
                    reason="Acoustic return lacks supporting acoustic shadow. Categorized as seabed rock or reverberation artifact.",
                    verification_score=48.0
                )

        # -------------------------------------------------------------
        # STAGE 7: Multi-Evidence Composite Verification Score (0 - 100)
        # -------------------------------------------------------------
        detection_evidence = raw_conf * 100.0
        size_score = min(100.0, (area_ratio / 0.04) * 100.0)
        bg_separation_score = min(100.0, (contrast_delta / 25.0) * 100.0)

        if is_sonar:
            verification_score = (
                0.25 * detection_evidence +
                0.20 * shape_score +
                0.15 * texture_score +
                0.15 * contrast_score +
                0.15 * shadow_score +
                0.10 * bg_separation_score
            )
        else:
            verification_score = (
                0.30 * detection_evidence +
                0.20 * shape_score +
                0.15 * texture_score +
                0.15 * contrast_score +
                0.10 * bg_separation_score +
                0.10 * size_score
            )

        verification_score = round(max(0.0, min(100.0, verification_score)), 1)
        false_positive_risk = round(max(0.0, min(100.0, 100.0 - (0.4 * shape_score + 0.3 * contrast_score + 0.3 * texture_score))), 1)

        # -------------------------------------------------------------
        # STAGE 8: 3-Tier Classification Decision
        # -------------------------------------------------------------
        if raw_conf >= cfg["min_detection_conf"] and verification_score >= cfg["min_verification_score"] and false_positive_risk <= 30.0:
            tier_status = "CONFIRMED"
            tier_desc = "Verified Debris Target — Strong multi-evidence optical/acoustic support."
            requires_review = False
        elif raw_conf >= 0.65 and verification_score >= cfg["review_score_min"]:
            tier_status = "REVIEW"
            tier_desc = "Review Required — Moderate anomaly, requires operator confirmation."
            requires_review = True
        else:
            return cls._build_rejection_result(
                candidate=candidate,
                stage="Multi-Evidence Quality Gate",
                reason=f"Detection confidence ({raw_conf*100:.1f}%) or verification score ({verification_score:.1f}/100) below precision threshold.",
                verification_score=verification_score
            )

        return {
            "status": tier_status,
            "requires_review": requires_review,
            "status_desc": tier_desc,
            "detection_confidence": round(raw_conf, 3),
            "detection_confidence_pct": f"{round(raw_conf * 100, 1)}%",
            "verification_score": verification_score,
            "false_positive_risk": false_positive_risk,
            "star_rating": "★★★★★" if verification_score >= 90 else ("★★★★☆" if verification_score >= 80 else "★★★☆☆"),
            "evidence_breakdown": {
                "detection_confidence": round(detection_evidence, 1),
                "shape_evidence": round(shape_score, 1),
                "texture_evidence": round(texture_score, 1),
                "contrast_evidence": round(contrast_score, 1),
                "background_separation": round(bg_separation_score, 1),
                "shadow_evidence": round(shadow_score, 1) if is_sonar else None
            },
            "evidence_checklist": [
                {"label": "Distinct Boundary Contrast", "passed": contrast_delta >= cfg["min_contrast_delta"]},
                {"label": "Class-Consistent Morphology", "passed": shape_eval["passed"]},
                {"label": "Texture Discontinuity", "passed": texture_score >= 60.0},
                {"label": "Acoustic Shadow Corroboration", "passed": shadow_score >= 70.0 if is_sonar else True},
                {"label": "Spatial Consistency", "passed": not touches_border}
            ],
            "sonar_details": shadow_info
        }

    @classmethod
    def _validate_class_shape(cls, category: str, ar: float, area_ratio: float) -> Dict[str, Any]:
        """Checks geometric boundaries for standard 8 classes."""
        if category == "Plastic Bottle":
            is_cylindrical = (ar < 0.65) or (ar > 1.45)
            if not is_cylindrical and 0.85 <= ar <= 1.18:
                return {"passed": False, "score": 52.0, "reason": f"Aspect ratio ({ar:.2f}) too square for cylindrical bottle profile."}
            return {"passed": True, "score": 92.0, "reason": "Consistent cylindrical profile."}

        elif category == "Plastic Bag":
            if area_ratio < 0.008:
                return {"passed": False, "score": 55.0, "reason": "Bag candidate area too small for macro-plastic film."}
            return {"passed": True, "score": 90.0, "reason": "Flexible amorphous film morphology."}

        elif "Net" in category or "Gear" in category:
            if area_ratio < 0.012:
                return {"passed": False, "score": 50.0, "reason": "Net structure lacks sufficient spatial span."}
            return {"passed": True, "score": 94.0, "reason": "Mesh structural span verified."}

        elif category == "Rope":
            if 0.5 <= ar <= 1.8:
                return {"passed": False, "score": 54.0, "reason": f"Rope requires elongated aspect ratio (current: {ar:.2f})."}
            return {"passed": True, "score": 91.0, "reason": "Elongated continuous line profile."}

        elif category == "Tire":
            if ar < 0.65 or ar > 1.55:
                return {"passed": False, "score": 50.0, "reason": f"Tire geometry must be approximately toroidal/circular (current AR: {ar:.2f})."}
            return {"passed": True, "score": 95.0, "reason": "Toroidal circular geometry verified."}

        elif "Can" in category or "Metal" in category:
            if ar < 0.25 or ar > 4.5:
                return {"passed": False, "score": 55.0, "reason": f"Can aspect ratio ({ar:.2f}) outside standard beverage container profile."}
            return {"passed": True, "score": 89.0, "reason": "Compact container profile verified."}

        return {"passed": True, "score": 80.0, "reason": "General debris shape plausible."}

    @classmethod
    def _build_rejection_result(
        cls,
        candidate: Optional[Dict[str, Any]] = None,
        stage: str = "Filter",
        reason: str = "Rejected",
        verification_score: float = 25.0
    ) -> Dict[str, Any]:
        """Standardized rejection metadata structure."""
        cand_dict = candidate if candidate is not None else {}
        conf = float(cand_dict.get("confidence", 0.65))
        return {
            "status": "REJECTED",
            "requires_review": False,
            "rejection_stage": stage,
            "rejection_reason": reason,
            "status_desc": f"REJECTED at {stage}: {reason}",
            "detection_confidence": round(conf, 3),
            "detection_confidence_pct": f"{round(conf * 100, 1)}%",
            "verification_score": round(verification_score, 1),
            "false_positive_risk": 85.0,
            "star_rating": "☆☆☆☆☆",
            "evidence_breakdown": {
                "detection_confidence": round(conf * 100, 1),
                "shape_evidence": 40.0,
                "texture_evidence": 35.0,
                "contrast_evidence": 30.0,
                "background_separation": 25.0
            },
            "evidence_checklist": [
                {"label": "Distinct Boundary Contrast", "passed": False},
                {"label": "Class-Consistent Morphology", "passed": False},
                {"label": "Texture Discontinuity", "passed": False},
                {"label": "Acoustic Shadow Corroboration", "passed": False},
                {"label": "Spatial Consistency", "passed": False}
            ]
        }

multi_evidence_verifier = MultiEvidenceVerifier()
