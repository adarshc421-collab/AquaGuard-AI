"""
AquaGuard AI Debris Detector Module (Backwards Compatibility Wrapper)
Forwards calls directly to the modular DetectorFactory.
"""
from app.detector.base_detector import DEBRIS_SPECS, TAXONOMY_CLASSES
from app.detector.detector_factory import detector_factory as detector, DetectorFactory

__all__ = ["detector", "DetectorFactory", "DEBRIS_SPECS", "TAXONOMY_CLASSES"]
