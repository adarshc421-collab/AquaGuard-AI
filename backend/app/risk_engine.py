from typing import List, Dict, Any, Optional

class EnvironmentalRiskEngine:
    """
    Environmental Threat & Cleanup Intelligence Engine.
    Computes spatial debris density, benthic ecological risk score,
    ranked intervention priorities, and actionable cleanup instructions ("WHAT SHOULD I DO?").
    """

    @staticmethod
    def calculate_density_zones(detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Divides the scene into 4 spatial quadrants:
        Zone A (North-West), Zone B (North-East), Zone C (South-West), Zone D (South-East)
        """
        zones = {
            "Zone A (North-West)": {"key": "A", "count": 0, "items": [], "density": "NONE"},
            "Zone B (North-East)": {"key": "B", "count": 0, "items": [], "density": "NONE"},
            "Zone C (South-West)": {"key": "C", "count": 0, "items": [], "density": "NONE"},
            "Zone D (South-East)": {"key": "D", "count": 0, "items": [], "density": "NONE"}
        }

        for det in detections:
            box = det.get("box", {})
            cx = (box.get("xmin", 0) + box.get("xmax", 1)) / 2.0
            cy = (box.get("ymin", 0) + box.get("ymax", 1)) / 2.0

            if cx < 0.5 and cy < 0.5:
                zone_name = "Zone A (North-West)"
            elif cx >= 0.5 and cy < 0.5:
                zone_name = "Zone B (North-East)"
            elif cx < 0.5 and cy >= 0.5:
                zone_name = "Zone C (South-West)"
            else:
                zone_name = "Zone D (South-East)"

            zones[zone_name]["count"] += 1
            zones[zone_name]["items"].append(det.get("category", "Other Marine Debris"))

        for z_name, z_data in zones.items():
            count = z_data["count"]
            if count == 0:
                z_data["density"] = "NONE"
            elif count == 1:
                z_data["density"] = "LOW"
            elif count in [2, 3]:
                z_data["density"] = "MEDIUM"
            else:
                z_data["density"] = "HIGH"

        return zones

    @staticmethod
    def calculate_environmental_risk(detections: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes multi-factor environmental risk based on category threats,
        persistence, and debris concentration.
        """
        total = len(detections)
        categories = [d.get("category", "") for d in detections]

        has_ghost_net = any("Net" in c or "Gear" in c for c in categories)
        has_bag = any("Bag" in c for c in categories)
        has_bottle = any("Bottle" in c or "Container" in c for c in categories)
        has_tire = any("Tire" in c for c in categories)
        has_rope = any("Rope" in c for c in categories)
        has_metal = any("Can" in c or "Metal" in c for c in categories)

        risk_score = 0
        reasons = []

        if has_ghost_net:
            risk_score += 4
            reasons.append("Derelict ghost net detected: presents immediate active entanglement hazard to sea turtles, marine mammals, and reef fish.")
        if has_bag:
            risk_score += 3
            reasons.append("Plastic bag film mimics jellyfish prey, posing fatal ingestion and gastrointestinal blockage risk.")
        if has_tire:
            risk_score += 3
            reasons.append("Submerged synthetic tire smothers benthic substrate and leaches toxic zinc and polycyclic aromatic hydrocarbons (PAHs).")
        if has_bottle:
            risk_score += 2
            reasons.append("Rigid polymers undergo physical fragmentation into persistent microplastics (450+ year degradation timeline).")
        if has_rope:
            risk_score += 1
            reasons.append("Synthetic braided rope acts as an anchor barrier damaging fragile coral branches.")
        if has_metal:
            risk_score += 1
            reasons.append("Metallic debris causes oxidation staining and sharp substrate disruption.")

        if total >= 6:
            risk_score += 3
            reasons.append(f"High debris density ({total} items) exceeds benthic natural recovery threshold.")
        elif total >= 3:
            risk_score += 1

        if risk_score >= 7 or (total >= 5 and has_ghost_net):
            overall_risk = "CRITICAL"
            color = "rose"
        elif risk_score >= 4 or total >= 3:
            overall_risk = "HIGH"
            color = "rose"
        elif risk_score >= 2 or total >= 1:
            overall_risk = "MEDIUM"
            color = "amber"
        else:
            overall_risk = "LOW"
            color = "emerald"

        if not reasons:
            reasons.append("No active marine debris threats detected in current survey sector.")

        return {
            "overall_risk": overall_risk,
            "color": color,
            "risk_score": min(10, risk_score),
            "reasons": reasons,
            "summary": " ".join(reasons)
        }

    @staticmethod
    def calculate_cleanup_priorities(zones: Dict[str, Any], detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ranks spatial sectors by intervention urgency.
        """
        priorities = []
        
        sorted_zones = sorted(
            zones.items(),
            key=lambda x: (
                x[1]["count"] + 
                (4 if any("Net" in k for k in x[1]["items"]) else 0) +
                (3 if any("Tire" in k for k in x[1]["items"]) else 0)
            ),
            reverse=True
        )

        for rank, (zone_name, z_data) in enumerate(sorted_zones, start=1):
            if z_data["count"] == 0:
                continue

            items = z_data["items"]
            has_net = any("Net" in i or "Gear" in i for i in items)
            has_tire = any("Tire" in i for i in items)

            if rank == 1 and (z_data["count"] >= 3 or has_net or has_tire):
                p_level = "HIGH"
                action = "Deploy ROV with mechanical net cutters / heavy retrieval winch immediately."
            elif rank <= 2 and z_data["count"] >= 1:
                p_level = "MEDIUM"
                action = "Schedule targeted diver sweep with collection mesh bags within 48 hours."
            else:
                p_level = "LOW"
                action = "Log GPS sector coordinates for routine monitoring during next scheduled benthic transect."

            priorities.append({
                "rank": rank,
                "zone": zone_name,
                "key": z_data["key"],
                "count": z_data["count"],
                "items": items,
                "priority_level": p_level,
                "action": action
            })

        if not priorities:
            priorities.append({
                "rank": 1,
                "zone": "All Survey Sectors",
                "key": "A",
                "count": 0,
                "items": [],
                "priority_level": "LOW",
                "action": "No immediate cleanup intervention required. Maintain routine marine observation."
            })

        return priorities

    @staticmethod
    def generate_action_recommendation(
        detections: List[Dict[str, Any]],
        zones: Dict[str, Any],
        cleanup_priorities: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Generates clear, top-level operational instructions answering "WHAT SHOULD I DO?".
        """
        if not detections:
            return {
                "priority_badge": "MONITORING",
                "badge_color": "emerald",
                "title": "Seabed Clean – Maintain Routine Survey",
                "action_summary": "No marine debris detected above verification threshold. Log survey coordinates to marine monitoring database.",
                "target_sector": "All Sectors (Clean)",
                "required_equipment": ["Standard Telemetry Logger"],
                "timeframe": "Next routine survey cycle",
                "operational_protocol": "Record survey telemetry and continue standard ROV transect."
            }

        top_priority = cleanup_priorities[0] if cleanup_priorities else None
        target_sector = top_priority["zone"] if top_priority else "Primary Sector"
        categories = [d.get("category", "") for d in detections]

        has_net = any("Net" in c or "Gear" in c for c in categories)
        has_tire = any("Tire" in c for c in categories)
        has_macro_plastics = any("Bottle" in c or "Bag" in c or "Container" in c for c in categories)

        if has_net:
            return {
                "priority_badge": "PRIORITY 1 (URGENT)",
                "badge_color": "rose",
                "title": "Emergency Ghost Gear Extraction Required",
                "action_summary": f"Derelict fishing gear identified in {target_sector}. Immediate extraction is required to prevent continuous ghost-fishing entrapment.",
                "target_sector": target_sector,
                "required_equipment": [
                    "ROV Mechanical Net Cutters",
                    "Heavy Recovery Winch",
                    "Surface Tagging Buoy",
                    "Tandem Safety Diver Team"
                ],
                "timeframe": "Immediate / Within 12–24 Hours",
                "operational_protocol": "1. Dispatch ROV to anchor coordinates. 2. Sever snagged anchor lines using hydraulic net cutters. 3. Secure lifting sling and winch to support vessel."
            }
        elif has_tire:
            return {
                "priority_badge": "PRIORITY 1 (HIGH)",
                "badge_color": "rose",
                "title": "Benthic Smothering Debris Retrieval",
                "action_summary": f"Heavy synthetic rubber debris detected in {target_sector}. Substrate smothering requires mechanical crane or lift bag rigging.",
                "target_sector": target_sector,
                "required_equipment": [
                    "Lift Bag Rigging (100kg+ capacity)",
                    "ROV Gripper Arm",
                    "Recovery Basket"
                ],
                "timeframe": "Within 24–48 Hours",
                "operational_protocol": "Attach diver lift bag, inflate to initiate buoyant ascent, and retrieve via vessel deck crane."
            }
        elif has_macro_plastics:
            return {
                "priority_badge": "PRIORITY 2 (ELEVATED)",
                "badge_color": "amber",
                "title": "Targeted Macro-Plastic Diver Cleanup Sweep",
                "action_summary": f"Concentration of {len(detections)} plastic items detected across {target_sector}. Retrieval recommended before tidal current dispersion and microplastic shedding.",
                "target_sector": target_sector,
                "required_equipment": [
                    "Fine Mesh Collection Bags",
                    "Diver Hand Grabbers",
                    "GPS Surface Tracker"
                ],
                "timeframe": "Within 48–72 Hours",
                "operational_protocol": "Deploy 2-diver sweep team with collection sacks following the top-down sector coordinates."
            }
        else:
            return {
                "priority_badge": "PRIORITY 3 (ROUTINE)",
                "badge_color": "cyan",
                "title": "Scheduled Marine Waste Removal",
                "action_summary": f"Minor debris detected in {target_sector}. Include in upcoming scheduled regional cleanup mission.",
                "target_sector": target_sector,
                "required_equipment": ["Standard Diver Mesh Sacks"],
                "timeframe": "Next scheduled cleanup window",
                "operational_protocol": "Queue coordinates into regional marine remediation backlog."
            }

risk_engine = EnvironmentalRiskEngine()
