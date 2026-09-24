import numpy as np
from typing import List, Dict, Any

class SpatialHotspotEngine:
    """
    Spatial Hotspot & Debris Cluster Engine for AquaGuard AI.
    Groups confirmed marine debris targets into spatial clusters (Hotspot Alpha, Beta, etc.)
    and calculates cluster density, dominant waste category, and localized risk.
    """

    @staticmethod
    def calculate_hotspots(detections: List[Dict[str, Any]], distance_threshold: float = 0.35) -> List[Dict[str, Any]]:
        if not detections:
            return []

        # Simple & robust spatial clustering (Euclidean centroid clustering)
        clusters: List[List[Dict[str, Any]]] = []
        
        for det in detections:
            spatial = det.get("spatial", {})
            cx = spatial.get("center_x", 0.5)
            cy = spatial.get("center_y", 0.5)

            assigned = False
            for cluster in clusters:
                # Calculate cluster center
                c_cx = np.mean([d["spatial"]["center_x"] for d in cluster])
                c_cy = np.mean([d["spatial"]["center_y"] for d in cluster])
                dist = np.sqrt((cx - c_cx)**2 + (cy - c_cy)**2)

                if dist < distance_threshold:
                    cluster.append(det)
                    assigned = True
                    break

            if not assigned:
                clusters.append([det])

        # Sort clusters by target count descending
        clusters = sorted(clusters, key=lambda c: len(c), reverse=True)

        hotspot_letters = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon"]
        hotspots = []

        for idx, cluster in enumerate(clusters):
            letter = hotspot_letters[idx] if idx < len(hotspot_letters) else f"Sector-{idx+1}"
            target_ids = [d.get("id", f"TGT-{i+1}") for i, d in enumerate(cluster)]
            categories = [d.get("category", "Debris") for d in cluster]

            # Determine dominant category
            cat_counts = {}
            for c in categories:
                cat_counts[c] = cat_counts.get(c, 0) + 1
            dominant_category = max(cat_counts.items(), key=lambda x: x[1])[0]

            # Compute cluster centroid
            c_x = round(float(np.mean([d["spatial"]["center_x"] for d in cluster])), 4)
            c_y = round(float(np.mean([d["spatial"]["center_y"] for d in cluster])), 4)

            # Determine sector label
            h_label = "Left" if c_x < 0.35 else ("Right" if c_x > 0.65 else "Center")
            v_label = "North" if c_y < 0.35 else ("South" if c_y > 0.65 else "Central")
            sector_name = f"{v_label}-{h_label}" if v_label != "Central" else f"Central-{h_label}"

            has_net = any("Net" in c or "Gear" in c for c in categories)
            has_tire = any("Tire" in c for c in categories)

            if len(cluster) >= 3 or has_net:
                risk_level = "CRITICAL" if has_net else "HIGH"
                priority_num = 1
                rec_action = "Deploy ROV with mechanical net cutters / heavy retrieval winch immediately."
            elif len(cluster) >= 2 or has_tire:
                risk_level = "HIGH"
                priority_num = 1 if has_tire else 2
                rec_action = "Schedule targeted diver sweep with collection mesh bags within 48 hours."
            else:
                risk_level = "MEDIUM"
                priority_num = 3
                rec_action = "Log coordinate sector for routine monitoring during next scheduled benthic survey."

            hotspots.append({
                "hotspot_id": f"HOTSPOT-{idx+1}",
                "name": f"Hotspot {letter} ({sector_name})",
                "letter": letter,
                "sector_name": sector_name,
                "target_count": len(cluster),
                "target_ids": target_ids,
                "dominant_category": dominant_category,
                "category_breakdown": cat_counts,
                "risk_level": risk_level,
                "cleanup_priority": priority_num,
                "center_coords": {"x": c_x, "y": c_y},
                "recommended_action": rec_action,
                "summary": f"{len(cluster)} verified targets clustered in {sector_name} (Dominant: {dominant_category})."
            })

        return hotspots

hotspot_engine = SpatialHotspotEngine()
