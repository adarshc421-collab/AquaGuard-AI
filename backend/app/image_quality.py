import cv2
import numpy as np
from typing import Dict, Any

class ImageQualityAnalyzer:
    """
    Evaluates underwater image optical parameters:
    Visibility, brightness, contrast, turbidity/haze, and detection readiness.
    """

    @staticmethod
    def analyze(cv_img: np.ndarray) -> Dict[str, Any]:
        if cv_img is None or cv_img.size == 0:
            return {
                "overall_score": 50,
                "visibility": "Moderate",
                "brightness": "Moderate",
                "contrast": "Moderate",
                "haze": "Medium",
                "readiness": "READY",
                "warning": None
            }

        # Convert to grayscale & HSV
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
        
        # 1. Brightness Calculation
        mean_brightness = float(np.mean(gray))
        if mean_brightness < 60:
            brightness_label = "Low"
            b_score = 60
        elif mean_brightness > 195:
            brightness_label = "High / Overexposed"
            b_score = 70
        else:
            brightness_label = "Moderate"
            b_score = 90

        # 2. Contrast Calculation (Standard Deviation of luminance)
        std_contrast = float(np.std(gray))
        if std_contrast < 28:
            contrast_label = "Low"
            c_score = 55
        elif std_contrast < 55:
            contrast_label = "Moderate"
            c_score = 78
        else:
            contrast_label = "Good"
            c_score = 92

        # 3. Sharpness / Blur estimation (Laplacian variance)
        lap_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        if lap_var < 50:
            sharpness_label = "Blurry"
            s_score = 55
        elif lap_var < 200:
            sharpness_label = "Moderate"
            s_score = 80
        else:
            sharpness_label = "Sharp"
            s_score = 95

        # 4. Underwater Haze / Turbidity (Dark Channel Estimation)
        min_channel = np.min(cv_img, axis=2)
        dark_channel_mean = float(np.mean(min_channel))
        if dark_channel_mean > 75:
            haze_label = "High"
            h_score = 55
        elif dark_channel_mean > 35:
            haze_label = "Medium"
            h_score = 80
        else:
            haze_label = "Low"
            h_score = 95

        # 5. Overall Image Quality Composite Score (0 - 100)
        overall_score = int(round(0.25 * b_score + 0.30 * c_score + 0.25 * s_score + 0.20 * h_score))
        overall_score = max(35, min(96, overall_score))

        # Visibility Label
        if overall_score >= 80:
            visibility_label = "Good"
        elif overall_score >= 60:
            visibility_label = "Moderate"
        else:
            visibility_label = "Poor"

        # Detection Readiness & Warning
        if overall_score < 60 or haze_label == "High" or contrast_label == "Low":
            readiness = "CAUTION"
            warning = "Low visibility may reduce detection accuracy."
        else:
            readiness = "READY"
            warning = None

        return {
            "overall_score": overall_score,
            "visibility": visibility_label,
            "brightness": brightness_label,
            "contrast": contrast_label,
            "sharpness": sharpness_label,
            "haze": haze_label,
            "readiness": readiness,
            "warning": warning,
            "laplacian_variance": round(lap_var, 1),
            "mean_luminance": round(mean_brightness, 1)
        }

quality_analyzer = ImageQualityAnalyzer()
