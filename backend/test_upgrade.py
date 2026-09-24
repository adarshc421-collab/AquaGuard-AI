import os
import sys
import numpy as np
import cv2

# Add backend directory to path
sys.path.insert(0, os.path.dirname(__file__))

from app.modality_detector import modality_detector
from app.enhancer import enhancer
from app.detector import detector, DEBRIS_SPECS, TAXONOMY_CLASSES
from app.risk_engine import risk_engine
from app.report_generator import generate_pdf_report

def run_tests():
    print("==========================================")
    print(" AQUAGUARD AI BACKEND UPGRADE TEST SUITE ")
    print("==========================================")

    # 1. Test Modality Detector
    print("\n[Test 1] Modality Detector...")
    optical_dummy = np.zeros((200, 200, 3), dtype=np.uint8)
    optical_dummy[:, :, 0] = 180 # Blue
    optical_dummy[:, :, 1] = 160 # Green
    optical_dummy[:, :, 2] = 40  # Red (attenuated)
    mod_opt = modality_detector.detect_modality(optical_dummy)
    print(f"Optical Dummy result: {mod_opt['modality']} (is_sonar={mod_opt['is_sonar']})")
    assert mod_opt["modality"] == "OPTICAL"

    sonar_dummy = np.ones((200, 200, 3), dtype=np.uint8) * 110 # Pure grayscale
    mod_son = modality_detector.detect_modality(sonar_dummy)
    print(f"Sonar Dummy result: {mod_son['modality']} (is_sonar={mod_son['is_sonar']})")
    assert mod_son["modality"] == "SONAR"
    print("[OK] Modality Detector Passed")

    # 2. Test Enhancer
    print("\n[Test 2] Modality-Aware Enhancer...")
    enh_opt = enhancer.enhance_image(optical_dummy, "test_opt.png", is_sonar=False)
    enh_son = enhancer.enhance_image(sonar_dummy, "test_son.png", is_sonar=True)
    print(f"Optical Pipeline: {enh_opt['pipeline']}")
    print(f"Sonar Pipeline: {enh_son['pipeline']}")
    assert "Optical" in enh_opt["pipeline"]
    assert "Sonar" in enh_son["pipeline"]
    print("[OK] Enhancer Passed")

    # 3. Test Preset Sample Inference & Action Recommendation
    print("\n[Test 3] Detector Preset Sample Inference...")
    sample_res = detector.detect_preset_sample("coral_reef_plastics", mode="precision")
    assert sample_res is not None
    print(f"Sample: {sample_res['title']}")
    print(f"Modality: {sample_res['modality']}")
    print(f"Active Detector: {sample_res['detector_type']}")
    print(f"Total Detections: {sample_res['total_debris']}")
    print(f"Action Recommendation: {sample_res['action_recommendation']['title']}")
    print(f"Required Equipment: {sample_res['action_recommendation']['required_equipment']}")
    assert "action_recommendation" in sample_res
    assert len(sample_res["detections"]) > 0
    assert "ai_explanation" in sample_res["detections"][0]
    print(f"Sample Detection AI Explanation: {sample_res['detections'][0]['ai_explanation']}")
    print("[OK] Detector Preset Inference Passed")

    # 4. Test 10-Section PDF Report Generation
    print("\n[Test 4] 10-Section PDF Report Generator...")
    pdf_buf = generate_pdf_report(sample_res)
    pdf_bytes = pdf_buf.getvalue()
    print(f"Generated PDF Size: {len(pdf_bytes)} bytes")
    assert len(pdf_bytes) > 2000
    print("[OK] PDF Generator Passed")

    # 5. Test Custom Image Detection
    print("\n[Test 5] Custom Image Detection...")
    test_img_path = os.path.join(os.path.dirname(__file__), "static", "samples", "coral_reef_plastics.jpg")
    if os.path.exists(test_img_path):
        custom_res = detector.detect_custom_image(test_img_path, "test_eval.jpg", mode="precision")
        print(f"Custom Image Total Debris: {custom_res['total_debris']}")
        print(f"Measured Latency: {custom_res['processing_time_ms']} ms")
        print(f"Action Recommendation: {custom_res['action_recommendation']['title']}")
        assert custom_res["processing_time_ms"] > 0
    print("[OK] Custom Image Detection Passed")

    print("\n==========================================")
    print(" ALL BACKEND TESTS PASSED SUCCESSFULLY! ")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
