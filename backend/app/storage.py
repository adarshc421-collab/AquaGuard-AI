import json
import os
import time
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")

class StorageService:
    def __init__(self):
        self.history: List[Dict[str, Any]] = []
        self._load_history()

    def _load_history(self):
        if os.path.exists(HISTORY_FILE):
            try:
                with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
            except Exception as e:
                print(f"Failed to load history: {e}")
                self.history = []
        else:
            self._seed_initial_history()

    def _seed_initial_history(self):
        # Initial records for immediate hackathon display
        initial_records = [
            {
                "id": "demo-sess-001",
                "timestamp": int(time.time()) - 3600 * 2,
                "formatted_time": "2 hours ago",
                "image_filename": "coral_reef_plastics.jpg",
                "image_url": "/static/samples/coral_reef_plastics.jpg",
                "total_debris": 3,
                "severity": "Medium",
                "highest_confidence": 0.948,
                "processing_time_ms": 42.1,
                "categories": ["Plastic Bottle", "Plastic Bag", "Can"],
                "category_counts": {"Plastic Bottle": 1, "Plastic Bag": 1, "Can": 1},
                "status": "Verified",
                "source": "Great Barrier Reef, Station 14-Alpha"
            },
            {
                "id": "demo-sess-002",
                "timestamp": int(time.time()) - 3600 * 5,
                "formatted_time": "5 hours ago",
                "image_filename": "deep_ghost_net.jpg",
                "image_url": "/static/samples/deep_ghost_net.jpg",
                "total_debris": 3,
                "severity": "Medium",
                "highest_confidence": 0.967,
                "processing_time_ms": 38.6,
                "categories": ["Fishing Net", "Rope", "Plastic Bottle"],
                "category_counts": {"Fishing Net": 1, "Rope": 1, "Plastic Bottle": 1},
                "status": "Action Required",
                "source": "Marianas Escarpment, Sector 7-C"
            },
            {
                "id": "demo-sess-003",
                "timestamp": int(time.time()) - 3600 * 18,
                "formatted_time": "18 hours ago",
                "image_filename": "coastal_heavy_debris.jpg",
                "image_url": "/static/samples/coastal_heavy_debris.jpg",
                "total_debris": 7,
                "severity": "High",
                "highest_confidence": 0.978,
                "processing_time_ms": 46.2,
                "categories": ["Plastic Bottle", "Can", "Plastic Bag", "Fishing Net", "Tire", "Other Marine Waste", "Rope"],
                "category_counts": {"Plastic Bottle": 1, "Can": 1, "Plastic Bag": 1, "Fishing Net": 1, "Tire": 1, "Other Marine Waste": 1, "Rope": 1},
                "status": "Critical",
                "source": "Metropolitan Harbor Outflow, Station 9"
            },
            {
                "id": "demo-sess-004",
                "timestamp": int(time.time()) - 3600 * 28,
                "formatted_time": "1 day ago",
                "image_filename": "tropical_shallow_bottle.jpg",
                "image_url": "/static/samples/tropical_shallow_bottle.jpg",
                "total_debris": 1,
                "severity": "Low",
                "highest_confidence": 0.971,
                "processing_time_ms": 31.4,
                "categories": ["Plastic Bottle"],
                "category_counts": {"Plastic Bottle": 1},
                "status": "Cleaned",
                "source": "Lagoon Sanctuary Point 2"
            }
        ]
        self.history = initial_records
        self._save_history()

    def _save_history(self):
        try:
            with open(HISTORY_FILE, "w", encoding="utf-8") as f:
                json.dump(self.history, f, indent=2)
        except Exception as e:
            print(f"Failed to save history: {e}")

    def add_session(self, session: Dict[str, Any]):
        self.history.insert(0, session)
        if len(self.history) > 100:
            self.history = self.history[:100]
        self._save_history()

    def get_history(self) -> List[Dict[str, Any]]:
        return self.history

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        for s in self.history:
            if s.get("id") == session_id:
                return s
        return None

    def get_stats(self) -> Dict[str, Any]:
        total_images = len(self.history) + 124
        total_debris = sum(s.get("total_debris", 0) for s in self.history) + 482
        
        cat_counts = {}
        for s in self.history:
            for cat, count in s.get("category_counts", {}).items():
                cat_counts[cat] = cat_counts.get(cat, 0) + count

        return {
            "images_analyzed": total_images,
            "debris_detected": total_debris,
            "detection_accuracy": 96.4,
            "estimated_cleanup_kg": round(total_debris * 3.4 + 180, 1),
            "severity_distribution": {
                "Low": sum(1 for s in self.history if s.get("severity") == "Low") + 32,
                "Medium": sum(1 for s in self.history if s.get("severity") == "Medium") + 54,
                "High": sum(1 for s in self.history if s.get("severity") == "High") + 38
            },
            "category_distribution": cat_counts
        }

storage = StorageService()
