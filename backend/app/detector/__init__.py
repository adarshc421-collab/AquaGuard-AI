"""
AquaGuard AI Modular Detector Package
Includes Base Detector, Computer Vision Fallback Engine, YOLO Detector, and Detector Factory.
"""
from app.detector.base_detector import BaseDetector, DEBRIS_SPECS, TAXONOMY_CLASSES
from app.detector.cv_detector import ComputerVisionDetector, cv_detector
from app.detector.yolo_detector import YoloDetector, yolo_detector
from app.detector.detector_factory import DetectorFactory, detector_factory

detector = detector_factory

__all__ = [
    "BaseDetector",
    "DEBRIS_SPECS",
    "TAXONOMY_CLASSES",
    "ComputerVisionDetector",
    "cv_detector",
    "YoloDetector",
    "yolo_detector",
    "DetectorFactory",
    "detector_factory",
    "detector"
]
