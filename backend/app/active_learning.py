import os
import json
import time
from typing import Dict, List, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
FEEDBACK_FILE = os.path.join(DATA_DIR, "feedback.json")
os.makedirs(DATA_DIR, exist_ok=True)

class ActiveLearningManager:
    """
    Active Learning & Human-in-the-Loop Dataset Curator.
    Stores operator verifications and rejections to build calibrated training/evaluation sets.
    """

    def __init__(self):
        self._ensure_file()

    def _ensure_file(self):
        if not os.path.exists(FEEDBACK_FILE):
            default_data = {
                "feedback_log": [
                    {
                        "id": "fb-init-01",
                        "timestamp": int(time.time()) - 86400 * 2,
                        "session_id": "coral_reef_plastics",
                        "candidate_id": "CAND-04",
                        "action": "REJECT",
                        "category": "Other Marine Debris",
                        "rejection_reason": "Seabed Rock / Calcified Formation",
                        "notes": "Natural limestone substrate without synthetic pigment."
                    },
                    {
                        "id": "fb-init-02",
                        "timestamp": int(time.time()) - 86400,
                        "session_id": "coral_reef_plastics",
                        "candidate_id": "CAND-05",
                        "action": "REJECT",
                        "category": "Plastic Bag",
                        "rejection_reason": "Sand Ripple / Lighting Caustic",
                        "notes": "Surface wave reflection caustic pattern."
                    },
                    {
                        "id": "fb-init-03",
                        "timestamp": int(time.time()) - 3600 * 4,
                        "session_id": "deep_ghost_net",
                        "candidate_id": "CAND-02",
                        "action": "CONFIRM",
                        "category": "Fishing Net / Ghost Gear",
                        "rejection_reason": None,
                        "notes": "Operator confirmed nylon mesh pattern snagged on deep ridge."
                    }
                ]
            }
            with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
                json.dump(default_data, f, indent=2)

    def record_feedback(
        self,
        session_id: str,
        candidate_id: str,
        action: str,
        category: Optional[str] = None,
        rejection_reason: Optional[str] = None,
        notes: Optional[str] = None,
        candidate_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        entry = {
            "id": f"fb-{int(time.time())}-{candidate_id}",
            "timestamp": int(time.time()),
            "session_id": session_id,
            "candidate_id": candidate_id,
            "action": action.upper(),
            "category": category or "Other Marine Debris",
            "rejection_reason": rejection_reason,
            "notes": notes,
            "candidate_metadata": candidate_metadata or {}
        }

        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {"feedback_log": []}

        data["feedback_log"].insert(0, entry)

        with open(FEEDBACK_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

        return entry

    def get_stats(self) -> Dict[str, Any]:
        try:
            with open(FEEDBACK_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                logs = data.get("feedback_log", [])
        except Exception:
            logs = []

        confirmed = sum(1 for e in logs if e.get("action") == "CONFIRM")
        rejected = sum(1 for e in logs if e.get("action") == "REJECT")
        
        reasons_count = {}
        for e in logs:
            r = e.get("rejection_reason")
            if r:
                reasons_count[r] = reasons_count.get(r, 0) + 1

        return {
            "total_curated_samples": len(logs),
            "confirmed_count": confirmed,
            "rejected_count": rejected,
            "rejection_reasons_breakdown": reasons_count,
            "training_ready": len(logs) >= 5,
            "recent_feedback": logs[:10]
        }

active_learning_manager = ActiveLearningManager()
