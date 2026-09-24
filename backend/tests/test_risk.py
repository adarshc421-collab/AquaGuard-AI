import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.risk_engine import risk_engine


def test_ghost_gear_high_risk():
    """Verify Fishing Net / Ghost Gear triggers high ecological threat index."""
    detections = [
        {
            "id": "TGT-001",
            "category": "Fishing Net / Ghost Gear",
            "confidence_pct": 94,
            "verification_tier": "CONFIRMED",
            "verification_score": 88,
            "box": {"xmin": 0.1, "ymin": 0.1, "xmax": 0.4, "ymax": 0.4}
        }
    ]

    assessment = risk_engine.calculate_environmental_risk(detections)
    assert assessment["overall_risk"] in ["HIGH", "CRITICAL"], f"Expected HIGH or CRITICAL, got {assessment['overall_risk']}"
    assert assessment["risk_score"] >= 4

    zones = risk_engine.calculate_density_zones(detections)
    assert "Zone A (North-West)" in zones
    assert zones["Zone A (North-West)"]["count"] == 1

    priorities = risk_engine.calculate_cleanup_priorities(zones, detections)
    assert len(priorities) > 0
    assert priorities[0]["priority_level"] == "HIGH"

    action = risk_engine.generate_action_recommendation(detections, zones, priorities)
    assert "Ghost Gear" in action["title"] or "URGENT" in action["priority_badge"]
    print(f"[PASS] Ghost gear risk assessment: Risk={assessment['overall_risk']}, Action={action['title']}")


def test_empty_detections_clean_status():
    """Verify zero detections yields low risk score and routine monitoring."""
    assessment = risk_engine.calculate_environmental_risk([])
    assert assessment["overall_risk"] == "LOW"
    assert assessment["risk_score"] == 0

    zones = risk_engine.calculate_density_zones([])
    priorities = risk_engine.calculate_cleanup_priorities(zones, [])
    action = risk_engine.generate_action_recommendation([], zones, priorities)
    assert action["priority_badge"] == "MONITORING"
    print("[PASS] Zero detections assessment: Minimal risk verified.")


def test_metal_can_risk():
    """Verify Can / Metal triggers oxidation assessment."""
    detections = [
        {
            "id": "TGT-001",
            "category": "Can",
            "confidence_pct": 90,
            "box": {"xmin": 0.6, "ymin": 0.6, "xmax": 0.7, "ymax": 0.7}
        }
    ]
    assessment = risk_engine.calculate_environmental_risk(detections)
    assert assessment["risk_score"] >= 1
    assert any("oxidation" in r.lower() or "metal" in r.lower() for r in assessment["reasons"])
    print(f"[PASS] Metal debris risk assessment: Score={assessment['risk_score']}/10")


if __name__ == "__main__":
    test_ghost_gear_high_risk()
    test_empty_detections_clean_status()
    test_metal_can_risk()
