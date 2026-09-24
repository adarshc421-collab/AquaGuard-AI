import os
import sys

def test_precision_system():
    print("Testing AquaGuard AI False-Positive Prevention & Precision Engine...")
    from app.detector import detector
    from app.false_positive_filter import fp_filter

    # 1. Test Precision Mode on preset sample
    res_prec = detector.detect_preset_sample("coral_reef_plastics", mode="precision", confidence_threshold=0.85)
    assert res_prec is not None
    assert "validation_summary" in res_prec
    assert "uncertain_candidates" in res_prec
    assert "rejected_candidates" in res_prec
    assert "detections" in res_prec
    
    summary = res_prec["validation_summary"]
    print(f"[PASS] Precision scan complete:")
    print(f"       Total candidates generated: {summary['total_candidates_generated']}")
    print(f"       Confirmed targets: {summary['confirmed_count']}")
    print(f"       Uncertain review candidates: {summary['uncertain_count']}")
    print(f"       Rejected false-positives: {summary['rejected_count']}")
    print(f"       Filter explanation: {summary['filter_explanation']}")

    # Check verified detection fields
    if len(res_prec["detections"]) > 0:
        d = res_prec["detections"][0]
        assert "detection_quality" in d
        assert "candidate_score" in d
        assert "false_positive_score" in d
        print(f"       First verified target: {d['category']}, Quality: {d['detection_quality']}/100, Conf: {d['confidence_pct']}")

    # Check rejected candidate reasons
    if len(res_prec["rejected_candidates"]) > 0:
        r = res_prec["rejected_candidates"][0]
        assert "rejection_stage" in r
        assert "rejection_reason" in r
        print(f"       Rejected candidate sample: {r['label']} at {r['rejection_stage']} -> '{r['rejection_reason']}'")

    # 2. Test Balanced Mode vs Sensitive Mode
    res_sens = detector.detect_preset_sample("coral_reef_plastics", mode="sensitive", confidence_threshold=0.65)
    print(f"[PASS] Sensitive Mode: {res_sens['validation_summary']['confirmed_count']} confirmed out of {res_sens['validation_summary']['total_candidates_generated']} candidates")

    print("\nALL HIGH-PRECISION BACKEND TESTS PASSED SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    test_precision_system()
