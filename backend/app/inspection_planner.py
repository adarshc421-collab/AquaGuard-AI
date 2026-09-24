import numpy as np
from typing import List, Dict, Any, Tuple

class AutonomousInspectionPlanner:
    """
    Autonomous Inspection & Remediation Route Planner.
    Generates an optimized inspection waypoint route for underwater ROVs / AUVs:
    START (Vessel/Launch) → [Prioritized Targets] → RETURN (Vessel).
    Estimates transit distances, mission duration, battery budget, and required tooling per waypoint.
    """

    @staticmethod
    def plan_inspection_mission(
        confirmed_targets: List[Dict[str, Any]],
        start_point: Tuple[float, float] = (0.5, 0.0) # Surface launch point
    ) -> Dict[str, Any]:
        if not confirmed_targets:
            return {
                "mission_status": "NO_TARGETS",
                "total_distance_m": 0.0,
                "estimated_duration_min": 0.0,
                "battery_consumption_pct": "0.0%",
                "waypoints": [],
                "summary": "No verified debris targets requiring ROV inspection."
            }

        # Prioritize targets: Priority 1 (Ghost Nets, Tires) visited first, then nearest neighbors
        unvisited = list(confirmed_targets)
        
        # Sort priority: Give heavy priority boost to nets and high-threat items
        def get_priority_weight(target):
            cat = target.get("category", "")
            threat = target.get("threat_level", "")
            weight = 1.0
            if "Net" in cat or "Gear" in cat:
                weight = 3.0
            elif "Tire" in cat:
                weight = 2.0
            elif "Critical" in threat or "Severe" in threat:
                weight = 2.5
            return weight

        curr_x, curr_y = start_point
        waypoints = []
        cum_dist = 0.0
        step = 1

        # Add START point
        waypoints.append({
            "step": step,
            "type": "LAUNCH_POINT",
            "target_id": "START",
            "label": "ROV Launch Point (Surface Station)",
            "coords": {"x": curr_x, "y": curr_y},
            "leg_distance_m": 0.0,
            "cumulative_distance_m": 0.0,
            "action": "Deploy ROV umbilical & calibrate acoustic sensors.",
            "tool_required": "System Initialization"
        })

        while unvisited:
            # Pick best next target balancing distance and threat weight
            best_idx = 0
            best_score = float('inf')

            for idx, cand in enumerate(unvisited):
                cx = cand.get("spatial", {}).get("center_x", 0.5)
                cy = cand.get("spatial", {}).get("center_y", 0.5)
                # Distance in survey units (1.0 = ~40 meters real scale)
                dist_m = np.sqrt((cx - curr_x)**2 + (cy - curr_y)**2) * 42.0
                p_weight = get_priority_weight(cand)
                
                # Weighted score: Lower is better
                score = dist_m / p_weight
                if score < best_score:
                    best_score = score
                    best_idx = idx

            chosen = unvisited.pop(best_idx)
            t_cx = chosen.get("spatial", {}).get("center_x", 0.5)
            t_cy = chosen.get("spatial", {}).get("center_y", 0.5)
            leg_m = round(np.sqrt((t_cx - curr_x)**2 + (t_cy - curr_y)**2) * 42.0, 1)
            cum_dist += leg_m
            step += 1

            cat = chosen.get("category", "Debris")
            t_id = chosen.get("id", f"TGT-{step-1}")
            tool = chosen.get("cleanup_tool", "Standard Collection Sack")
            depth = chosen.get("estimated_depth_m", 2.0)

            if "Net" in cat:
                action_text = f"Anchor at depth {depth}m. Sever snagged bedrock mesh using hydraulic net cutter."
            elif "Tire" in cat:
                action_text = f"Position over target at depth {depth}m. Rig 100kg recovery lift bag for crane ascent."
            elif "Bottle" in cat or "Bag" in cat:
                action_text = f"Execute visual verification sweep and collect via manipulator mesh sack."
            else:
                action_text = f"Photograph optical profile and retrieve with mechanical gripper."

            waypoints.append({
                "step": step,
                "type": "TARGET_INSPECTION",
                "target_id": t_id,
                "label": f"{t_id}: {cat}",
                "category": cat,
                "coords": {"x": t_cx, "y": t_cy},
                "depth_m": depth,
                "leg_distance_m": leg_m,
                "cumulative_distance_m": round(cum_dist, 1),
                "action": action_text,
                "tool_required": tool,
                "verification_score": chosen.get("verification_score", 92.0)
            })

            curr_x, curr_y = t_cx, t_cy

        # Add RETURN waypoint
        return_leg_m = round(np.sqrt((start_point[0] - curr_x)**2 + (start_point[1] - curr_y)**2) * 42.0, 1)
        cum_dist += return_leg_m
        step += 1

        waypoints.append({
            "step": step,
            "type": "RECOVERY_POINT",
            "target_id": "RETURN",
            "label": "Support Vessel Recovery Station",
            "coords": {"x": start_point[0], "y": start_point[1]},
            "leg_distance_m": return_leg_m,
            "cumulative_distance_m": round(cum_dist, 1),
            "action": "Ascend along recovery guide wire and secure payload on deck.",
            "tool_required": "Vessel Recovery Winch"
        })

        # Calculate transit duration (assuming ROV cruising speed 0.8 m/s + 4 mins per target inspection)
        transit_sec = cum_dist / 0.8
        inspection_sec = len(confirmed_targets) * 240.0
        total_duration_min = round((transit_sec + inspection_sec) / 60.0, 1)

        # Battery estimate (approx 0.15% battery per min transit + 0.25% per min manipulation)
        battery_consumed = min(95.0, round((transit_sec / 60.0) * 0.18 + (len(confirmed_targets) * 1.8), 1))

        return {
            "mission_status": "OPTIMIZED (Simulated Autonomous Inspection Route)",
            "total_distance_m": round(cum_dist, 1),
            "estimated_duration_min": total_duration_min,
            "battery_consumption_pct": f"{battery_consumed}%",
            "target_count": len(confirmed_targets),
            "waypoints": waypoints,
            "route_polyline": [{"x": wp["coords"]["x"], "y": wp["coords"]["y"]} for wp in waypoints],
            "disclaimer": "Simulated ROV mission profile. Connects with onboard MAVLink/ROS autopilot for hardware execution."
        }

inspection_planner = AutonomousInspectionPlanner()
