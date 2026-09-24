import cv2
import numpy as np
from typing import Dict, Any, Tuple

class SonarPreprocessor:
    """
    Side-Scan & Forward-Looking Sonar Preprocessing Module.
    Performs grayscale intensity normalization, bilateral acoustic speckle suppression,
    adaptive CLAHE contrast equalization, and highlight/shadow extraction.
    """

    @staticmethod
    def preprocess_sonar(cv_img: np.ndarray) -> Dict[str, Any]:
        """
        Applies dedicated acoustic signal conditioning to sonar imagery.
        """
        if cv_img is None or cv_img.size == 0:
            return {"enhanced_bgr": None, "gray": None, "highlights": None, "shadows": None}

        # Convert to single-channel grayscale if not already
        if len(cv_img.shape) == 3 and cv_img.shape[2] == 3:
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        else:
            gray = cv_img.copy()

        # Step 1: Grayscale Normalization to full dynamic range [0, 255]
        norm_gray = cv2.normalize(gray, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)

        # Step 2: Bilateral Speckle Noise Filter
        # Filters high-frequency acoustic speckle while preserving sharp obstacle edges
        denoised = cv2.bilateralFilter(norm_gray, d=7, sigmaColor=45, sigmaSpace=45)

        # Step 3: Adaptive CLAHE Contrast Equalization on Sonar Response
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        clahe_sonar = clahe.apply(denoised)

        # Step 4: Local Background Mean & Dynamic Range
        bg_blur = cv2.GaussianBlur(clahe_sonar, (31, 31), 0)
        diff_from_bg = cv2.subtract(clahe_sonar, bg_blur)

        # Step 5: Acoustic Highlight & Shadow Segmentation
        # Highlights: High acoustic reflectivity (> mean + 1.2 * std)
        mean_val = float(np.mean(clahe_sonar))
        std_val = float(np.std(clahe_sonar))
        
        highlight_thresh = min(240, int(mean_val + 1.2 * std_val))
        _, highlight_mask = cv2.threshold(clahe_sonar, highlight_thresh, 255, cv2.THRESH_BINARY)

        # Shadows: Low acoustic return (< mean - 0.9 * std)
        shadow_thresh = max(15, int(mean_val - 0.9 * std_val))
        _, shadow_mask = cv2.threshold(clahe_sonar, shadow_thresh, 255, cv2.THRESH_BINARY_INV)

        # 3-channel output for UI display
        enhanced_bgr = cv2.cvtColor(clahe_sonar, cv2.COLOR_GRAY2BGR)

        return {
            "enhanced_bgr": enhanced_bgr,
            "gray": clahe_sonar,
            "highlight_mask": highlight_mask,
            "shadow_mask": shadow_mask,
            "mean_intensity": round(mean_val, 1),
            "dynamic_range_std": round(std_val, 1),
            "pipeline_applied": "Sonar Grayscale Normalization + Bilateral Speckle Suppression + Adaptive CLAHE"
        }

sonar_preprocessor = SonarPreprocessor()
