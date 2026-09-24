import os
import time

def test_full_system():
    print("Testing AquaGuard AI backend functions directly...")
    from app.detector import detector
    from app.storage import storage
    from app.report_generator import generate_pdf_report
    
    # 1. Test preset sample detection
    sample_res = detector.detect_preset_sample("coral_reef_plastics")
    assert sample_res is not None
    assert sample_res["total_debris"] == 3
    assert sample_res["severity"] == "Medium"
    print("[PASS] Preset sample detection verified (3 debris items, Medium severity)")

    # 2. Test severity threshold logic
    sev_low, _, _ = detector.calculate_severity(1)
    sev_med, _, _ = detector.calculate_severity(4)
    sev_high, _, _ = detector.calculate_severity(8)
    assert sev_low == "Low"
    assert sev_med == "Medium"
    assert sev_high == "High"
    print("[PASS] Severity calculation logic verified (Low <=2, Med 3-5, High 6+)")

    # 3. Test PDF generation
    pdf_stream = generate_pdf_report(sample_res)
    pdf_bytes = pdf_stream.getvalue()
    assert len(pdf_bytes) > 1000
    print(f"[PASS] PDF report generated successfully ({len(pdf_bytes)} bytes)")

    # 4. Test storage
    storage.add_session(sample_res)
    history = storage.get_history()
    assert len(history) > 0
    stats = storage.get_stats()
    assert stats["images_analyzed"] > 0
    print(f"[PASS] Storage verified: {stats['images_analyzed']} images analyzed, {stats['debris_detected']} debris detected")

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_system()
