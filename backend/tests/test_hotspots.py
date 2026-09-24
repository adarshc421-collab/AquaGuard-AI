import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.hotspot_engine import hotspot_engine


def test_hotspot_clustering_named_clusters():
    """Verify multiple clustered targets generate named hotspots (Alpha, Beta)."""
    detections = [
        # Cluster 1 (Northwest)
        {"id": "TGT-001", "spatial": {"center_x": 0.10, "center_y": 0.10}, "category": "Plastic Bottle", "confidence_pct": 92},
        {"id": "TGT-002", "spatial": {"center_x": 0.14, "center_y": 0.12}, "category": "Plastic Bag", "confidence_pct": 89},
        # Cluster 2 (Southeast)
        {"id": "TGT-003", "spatial": {"center_x": 0.85, "center_y": 0.80}, "category": "Fishing Net / Ghost Gear", "confidence_pct": 95},
        {"id": "TGT-004", "spatial": {"center_x": 0.88, "center_y": 0.82}, "category": "Rope", "confidence_pct": 91}
    ]

    hotspots = hotspot_engine.calculate_hotspots(detections, distance_threshold=0.25)
    assert len(hotspots) >= 2, f"Expected at least 2 clusters, got {len(hotspots)}"
    assert "Hotspot Alpha" in hotspots[0]["name"]
    assert "Hotspot Beta" in hotspots[1]["name"]
    assert "center_coords" in hotspots[0]
    assert "target_ids" in hotspots[0]
    print(f"[PASS] Hotspot Clustering: Generated {len(hotspots)} named cluster(s) with centroids.")


def test_empty_detections_hotspot():
    """Verify empty detections produce empty hotspot list without error."""
    hotspots = hotspot_engine.calculate_hotspots([])
    assert len(hotspots) == 0
    print("[PASS] Empty Hotspot Clustering verified.")


if __name__ == "__main__":
    test_hotspot_clustering_named_clusters()
    test_empty_detections_hotspot()
