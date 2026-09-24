import os
import cv2
import numpy as np
from typing import Dict, List, Any, Optional

from app.detector.base_detector import BaseDetector, DEBRIS_SPECS, TAXONOMY_CLASSES

class YoloDetector(BaseDetector):
    """
    Ultralytics YOLO Integration Module.
    Dynamically loads trained YOLO marine debris weights (e.g., best.pt) if available.
    """

    def __init__(self, weights_path: Optional[str] = None):
        super().__init__(name="Ultralytics YOLO (Marine Debris Weights)")
        self.weights_path = weights_path
        self.model = None
        self.is_available = False
        self._initialize_model()

    def _initialize_model(self):
        try:
            from ultralytics import YOLO
            env_model_path = os.getenv("MODEL_PATH")
            possible_paths = [
                self.weights_path,
                env_model_path,
                os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "best.pt"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "best.pt"),
                "yolov8n.pt"
            ]
            valid_path = next((p for p in possible_paths if p and os.path.isfile(p)), None)
            if valid_path:
                self.model = YOLO(valid_path)
                self.is_available = True
                print(f"[AquaGuard] YOLO detector initialized successfully from {valid_path}")
            else:
                self.is_available = False
        except ImportError:
            self.is_available = False
        except Exception as e:
            print(f"[AquaGuard] YOLO detector init note: {e}")
            self.is_available = False

    def detect(self, cv_img: np.ndarray, confidence_threshold: float = 0.50, **kwargs) -> List[Dict[str, Any]]:
        if not self.is_available or self.model is None or cv_img is None:
            return []

        h, w = cv_img.shape[:2]
        results = self.model(cv_img, conf=confidence_threshold, verbose=False)
        candidates = []

        for r in results:
            boxes = r.boxes
            for idx, box in enumerate(boxes):
                xyxy = box.xyxy[0].tolist()
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = r.names.get(cls_id, "Other Marine Debris")

                # Map class name to standard 8-class taxonomy
                matched_category = "Other Marine Debris"
                for standard_cat in TAXONOMY_CLASSES:
                    if standard_cat.lower() in cls_name.lower() or cls_name.lower() in standard_cat.lower():
                        matched_category = standard_cat
                        break

                x1, y1, x2, y2 = xyxy
                norm_box = {
                    "xmin": round(max(0.0, x1 / w), 4),
                    "ymin": round(max(0.0, y1 / h), 4),
                    "xmax": round(min(1.0, x2 / w), 4),
                    "ymax": round(min(1.0, y2 / h), 4)
                }

                bw = max(1, x2 - x1)
                bh = max(1, y2 - y1)
                ar = bw / float(bh)

                ai_exp = BaseDetector.generate_ai_explanation(
                    category=matched_category,
                    contrast_delta=25.0,
                    edge_energy=35.0,
                    aspect_ratio=ar,
                    area_pct=((bw * bh) / (w * h)) * 100
                )

                candidates.append({
                    "id": f"yolo-cand-{idx+1}",
                    "label": matched_category,
                    "category": matched_category,
                    "confidence": round(conf, 3),
                    "box": norm_box,
                    "ai_explanation": ai_exp
                })

        return candidates

yolo_detector = YoloDetector()
