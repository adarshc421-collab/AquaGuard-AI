import abc
from typing import Dict, List, Any, Optional, Tuple
from PIL import Image, ExifTags

TAXONOMY_CLASSES = [
    "Plastic Bottle",
    "Plastic Bag",
    "Fishing Net / Ghost Gear",
    "Rope",
    "Can / Metal",
    "Tire",
    "Plastic Container",
    "Other Marine Debris",
    "Unknown / Uncertain"
]

DEBRIS_SPECS = {
    "Plastic Bottle": {
        "degradation_years": "450",
        "threat_level": "High - Fragmentation into toxic microplastics & ingestion by turtles",
        "color": "#00e5ff",
        "material": "PET / Polyethylene Terephthalate",
        "buoyancy": "Neutral / Suspended Subsurface",
        "default_size": "Medium",
        "base_depth": 2.4,
        "cleanup_tool": "Diver Collection Net / Skimmer"
    },
    "Plastic Bag": {
        "degradation_years": "20–500 (Micro)",
        "threat_level": "Critical - Fatal jellyfish mimicry, cetacean & turtle gut obstruction",
        "color": "#ff4081",
        "material": "LDPE / Polyethylene Film",
        "buoyancy": "Floating / Suspended Drifting",
        "default_size": "Medium",
        "base_depth": 1.8,
        "cleanup_tool": "Suction Sampler / Fine Mesh Net"
    },
    "Fishing Net / Ghost Gear": {
        "degradation_years": "600+",
        "threat_level": "Severe - Continuous ghost-fishing loop, turtle & seal strangulation",
        "color": "#00e676",
        "material": "Nylon Monofilament Grid",
        "buoyancy": "Submerged / Bedrock Snagged",
        "default_size": "Large",
        "base_depth": 3.8,
        "cleanup_tool": "ROV Mechanical Net Cutter & Heavy Winch"
    },
    "Rope": {
        "degradation_years": "300",
        "threat_level": "High - Fin wrapping and benthic coral anchoring barrier",
        "color": "#ffd600",
        "material": "Polypropylene Braided Fiber",
        "buoyancy": "Bottom Anchor",
        "default_size": "Medium",
        "base_depth": 3.2,
        "cleanup_tool": "Diver Shears / ROV Gripper"
    },
    "Can / Metal": {
        "degradation_years": "200",
        "threat_level": "Moderate - Heavy metal oxidation & sharp edge habitat disruption",
        "color": "#ffab00",
        "material": "Aluminum / Tin Alloy",
        "buoyancy": "Seabed Sunk",
        "default_size": "Small",
        "base_depth": 4.1,
        "cleanup_tool": "Magnetic Lifter / Diver Mesh Bag"
    },
    "Tire": {
        "degradation_years": "1000",
        "threat_level": "High - Toxic zinc, PAH compound leaching & benthic stifling",
        "color": "#7c4dff",
        "material": "Vulcanized Synthetic Rubber",
        "buoyancy": "Seabed Settled Heavy",
        "default_size": "Large",
        "base_depth": 4.5,
        "cleanup_tool": "Crane Basket / Lift Bag Rigging"
    },
    "Plastic Container": {
        "degradation_years": "400",
        "threat_level": "High - Rigid chemical container leaching contaminants",
        "color": "#00b0ff",
        "material": "HDPE High-Density Polyethylene",
        "buoyancy": "Suspended / Settled",
        "default_size": "Large",
        "base_depth": 2.9,
        "cleanup_tool": "ROV Basket / Diver Collection"
    },
    "Other Marine Debris": {
        "degradation_years": "350",
        "threat_level": "Moderate - Mixed synthetic composite debris particulate hazard",
        "color": "#ff5252",
        "material": "Polystyrene / Mixed Composites",
        "buoyancy": "Variable",
        "default_size": "Small",
        "base_depth": 3.0,
        "cleanup_tool": "General Manual Collection"
    },
    "Unknown / Uncertain": {
        "degradation_years": "Indeterminate",
        "threat_level": "Inconclusive - Requires closer ROV optical sweep or diver inspection",
        "color": "#94a3b8",
        "material": "Unverified Submerged Object",
        "buoyancy": "Variable / Subsurface",
        "default_size": "Medium",
        "base_depth": 2.5,
        "cleanup_tool": "Optical Verification Camera Sweep"
    }
}

class BaseDetector(abc.ABC):
    """
    Abstract Base Class for all AquaGuard Debris Detectors.
    """

    def __init__(self, name: str):
        self.name = name
        self.categories = TAXONOMY_CLASSES

    @abc.abstractmethod
    def detect(self, cv_img, **kwargs) -> List[Dict[str, Any]]:
        """Extracts candidate debris bounding boxes and classifications."""
        pass

    @staticmethod
    def extract_exif_gps(pil_img: Image.Image) -> Dict[str, Any]:
        """Extracts EXIF GPS coordinates if present."""
        try:
            exif_data = pil_img._getexif()
            if not exif_data:
                return {"has_gps": False, "status": "GPS unavailable – using image-relative mapping"}

            gps_info = {}
            for tag, value in exif_data.items():
                tag_name = ExifTags.TAGS.get(tag, tag)
                if tag_name == "GPSInfo":
                    for t in value:
                        sub_tag = ExifTags.GPSTAGS.get(t, t)
                        gps_info[sub_tag] = value[t]

            if "GPSLatitude" in gps_info and "GPSLongitude" in gps_info:
                lat = BaseDetector._convert_to_degrees(gps_info["GPSLatitude"])
                lon = BaseDetector._convert_to_degrees(gps_info["GPSLongitude"])
                if gps_info.get("GPSLatitudeRef") == "S":
                    lat = -lat
                if gps_info.get("GPSLongitudeRef") == "W":
                    lon = -lon
                return {
                    "has_gps": True,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "status": "GPS Coordinates Verified"
                }
        except Exception:
            pass
        return {"has_gps": False, "status": "GPS unavailable – using image-relative mapping"}

    @staticmethod
    def _convert_to_degrees(value):
        d = float(value[0])
        m = float(value[1])
        s = float(value[2])
        return d + (m / 60.0) + (s / 3600.0)

    @staticmethod
    def calculate_spatial_position(norm_box: Dict[str, float]) -> Dict[str, Any]:
        """Calculates image-relative spatial position and quadrant label."""
        cx = (norm_box["xmin"] + norm_box["xmax"]) / 2.0
        cy = (norm_box["ymin"] + norm_box["ymax"]) / 2.0

        rel_x_pct = round(cx * 100, 1)
        rel_y_pct = round(cy * 100, 1)

        h_pos = "Left" if cx < 0.35 else ("Right" if cx > 0.65 else "Center")
        v_pos = "Top" if cy < 0.35 else ("Bottom" if cy > 0.65 else "Center")

        if h_pos == "Center" and v_pos == "Center":
            pos_label = "Center"
        else:
            pos_label = f"{v_pos}-{h_pos}" if v_pos != "Center" else f"Center-{h_pos}"

        # Sector assignment (A: NW, B: NE, C: SW, D: SE)
        if cx < 0.5 and cy < 0.5:
            sector = "Sector A (North-West)"
            sector_key = "A"
        elif cx >= 0.5 and cy < 0.5:
            sector = "Sector B (North-East)"
            sector_key = "B"
        elif cx < 0.5 and cy >= 0.5:
            sector = "Sector C (South-West)"
            sector_key = "C"
        else:
            sector = "Sector D (South-East)"
            sector_key = "D"

        return {
            "rel_x_pct": rel_x_pct,
            "rel_y_pct": rel_y_pct,
            "position_label": pos_label,
            "sector": sector,
            "sector_key": sector_key,
            "center_x": round(cx, 4),
            "center_y": round(cy, 4)
        }

    @staticmethod
    def generate_ai_explanation(
        category: str,
        contrast_delta: float,
        edge_energy: float,
        aspect_ratio: float,
        area_pct: float
    ) -> str:
        """Generates clear, transparent optical reasoning for why this object was detected."""
        reasons = []
        
        if aspect_ratio > 2.0:
            reasons.append(f"Elongated aspect ratio ({aspect_ratio:.1f}:1)")
        elif aspect_ratio < 0.6:
            reasons.append(f"Vertical cylindrical profile (AR: {aspect_ratio:.2f})")
        elif 0.8 <= aspect_ratio <= 1.25:
            reasons.append(f"Compact geometric footprint ({aspect_ratio:.2f})")

        if contrast_delta > 20.0:
            reasons.append(f"sharp local contrast delta (+{contrast_delta:.1f} vs seabed)")
        elif contrast_delta > 12.0:
            reasons.append(f"moderate optical boundary separation ({contrast_delta:.1f})")

        if edge_energy > 30.0:
            reasons.append("high-frequency perimeter gradient")

        if "Net" in category:
            reasons.append("mesh texture signature consistent with derelict fishing net")
        elif "Bottle" in category:
            reasons.append("cylindrical specular reflection typical of PET polymer")
        elif "Bag" in category:
            reasons.append("flexible amorphous plastic film boundary")
        elif "Tire" in category:
            reasons.append("circular dark toroidal profile")
        elif "Can" in category:
            reasons.append("metallic boundary reflectance")

        reason_str = ", ".join(reasons) if reasons else "distinct optical contour differing from background"
        return f"Identified as {category} based on {reason_str}."
