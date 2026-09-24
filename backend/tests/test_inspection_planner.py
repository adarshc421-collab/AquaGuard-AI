import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.inspection_planner import inspection_planner


def test_inspection_planner_trajectory():
    """Verify inspection planner builds start -> targets -> return trajectory."""
    detections = [
        {
            "id": "TGT-001",
            "category": "Fishing Net / Ghost Gear",
            "spatial": {"center_x": 0.2, "center_y": 0.3},
            "threat_level": "Critical",
            "verification_score": 94
        },
        {
            "id": "TGT-002",
            "category": "Plastic Bottle",
            "spatial": {"center_x": 0.7, "center_y": 0.6},
            "threat_level": "Medium",
            "verification_score": 90
        }
    ]

    plan = inspection_planner.plan_inspection_mission(detections, start_point=(0.5, 0.0))
    assert "waypoints" in plan
    assert len(plan["waypoints"]) >= 4  # Start, TGT-1, TGT-2, Return
    assert plan["waypoints"][0]["type"] == "LAUNCH_POINT"
    assert plan["waypoints"][-1]["type"] == "RECOVERY_POINT"
    assert plan["total_distance_m"] > 0
    assert "battery_consumption_pct" in plan
    print(f"[PASS] Inspection Plan: {len(plan['waypoints'])} waypoints, {plan['total_distance_m']}m transit, {plan['battery_consumption_pct']} battery.")


def test_inspection_planner_tooling_selection():
    """Verify tool selection logic maps correctly to target categories."""
    net_target = [
        {
            "id": "TGT-001",
            "category": "Fishing Net / Ghost Gear",
            "spatial": {"center_x": 0.5, "center_y": 0.5},
            "threat_level": "Critical"
        }
    ]
    plan_net = inspection_planner.plan_inspection_mission(net_target)
    target_wp = [wp for wp in plan_net["waypoints"] if wp["type"] == "TARGET_INSPECTION"][0]
    assert "cutter" in target_wp["action"].lower() or "net" in target_wp["action"].lower()
    print("[PASS] Tooling Selection Logic verified.")


if __name__ == "__main__":
    test_inspection_planner_trajectory()
    test_inspection_planner_tooling_selection()
