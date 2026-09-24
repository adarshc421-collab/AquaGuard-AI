import os
import cv2
import numpy as np
from typing import Optional, Dict, Any

from app.modality_detector import modality_detector

ENHANCED_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static", "enhanced")
os.makedirs(ENHANCED_DIR, exist_ok=True)

class UnderwaterImageEnhancer:
    """
    Applies adaptive modality-aware underwater enhancement:
    - OPTICAL: Red-Channel Restoration, LAB CLAHE, and de-blurring.
    - SONAR: Grayscale CLAHE, Bilateral Speckle Noise Filter (no red compensation).
    """

    @classmethod
    def enhance_image(
        cls,
        cv_img: np.ndarray,
        output_filename: str,
        is_sonar: Optional[bool] = None
    ) -> Dict[str, Any]:
        if cv_img is None or cv_img.size == 0:
            return {"enhanced_url": "", "modality": "OPTICAL", "pipeline": "None"}

        img = cv_img.copy()

        # Step 1: Modality Determination
        if is_sonar is None:
            mod_info = modality_detector.detect_modality(img)
            effective_is_sonar = mod_info["is_sonar"]
            modality_label = mod_info["modality"]
        else:
            effective_is_sonar = is_sonar
            modality_label = "SONAR" if is_sonar else "OPTICAL"

        # Step 2: Modality-Specific Enhancement Pipeline
        if effective_is_sonar:
            # -------------------------------------------------------------
            # SONAR PIPELINE (No red shift, bilateral speckle filter + CLAHE)
            # -------------------------------------------------------------
            if len(img.shape) == 3 and img.shape[2] == 3:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            else:
                gray = img.copy()

            # Bilateral filter removes high-frequency acoustic speckle noise while keeping sharp edges
            denoised = cv2.bilateralFilter(gray, d=7, sigmaColor=50, sigmaSpace=50)
            
            # CLAHE on sonar acoustic response
            clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
            clahe_sonar = clahe.apply(denoised)

            # Convert back to 3-channel BGR for consistent UI display
            final_img = cv2.cvtColor(clahe_sonar, cv2.COLOR_GRAY2BGR)
            pipeline_desc = "Sonar Grayscale CLAHE + Bilateral Speckle Reduction"
        else:
            # -------------------------------------------------------------
            # OPTICAL PIPELINE (Red-channel recovery + LAB CLAHE + Unsharp)
            # -------------------------------------------------------------
            b, g, r = cv2.split(img.astype(np.float32))
            r_mean = np.mean(r)
            g_mean = np.mean(g)

            if g_mean > 0:
                # Compensate red based on green channel intensity
                r_comp = r + 0.45 * (g_mean - r_mean) * (1.0 - (r / 255.0))
                r = np.clip(r_comp, 0, 255)

            balanced = cv2.merge([b, g, r]).astype(np.uint8)

            # LAB Color-Space CLAHE Contrast Equalization
            lab = cv2.cvtColor(balanced, cv2.COLOR_BGR2LAB)
            l, a, b_lab = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.8, tileGridSize=(8, 8))
            l_clahe = clahe.apply(l)
            enhanced_lab = cv2.merge([l_clahe, a, b_lab])
            enhanced_bgr = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

            # Subtle Unsharp Masking for Submerged Net & Plastic Edges
            gaussian = cv2.GaussianBlur(enhanced_bgr, (0, 0), 2.0)
            unsharp = cv2.addWeighted(enhanced_bgr, 1.35, gaussian, -0.35, 0)
            final_img = np.clip(unsharp, 0, 255).astype(np.uint8)
            pipeline_desc = "Optical Red-Channel Restoration + LAB CLAHE + Unsharp Mask"

        # Save to enhanced static directory
        out_path = os.path.join(ENHANCED_DIR, output_filename)
        cv2.imwrite(out_path, final_img)

        return {
            "enhanced_url": f"/static/enhanced/{output_filename}",
            "modality": modality_label,
            "pipeline": pipeline_desc
        }

enhancer = UnderwaterImageEnhancer()
