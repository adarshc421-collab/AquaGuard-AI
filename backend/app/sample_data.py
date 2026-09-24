"""
Sample underwater images and preset ground-truth detections for AquaGuard AI.
Guarantees accurate, rapid, and realistic responses for hackathon demonstrations.
"""

SAMPLE_SCENARIOS = [
    {
        "id": "coral_reef_plastics",
        "title": "Coral Reef Plastic Pollution",
        "location": "Great Barrier Reef, Station 14-Alpha",
        "depth_meters": 12.5,
        "image_filename": "coral_reef_plastics.jpg",
        "description": "Shallow reef biodiversity zone impacted by consumer single-use plastics and beverage cans.",
        "detections": [
            {
                "id": "det-101",
                "label": "Plastic Bottle",
                "category": "Plastic Bottle",
                "confidence": 0.948,
                "box": {"xmin": 0.30, "ymin": 0.678, "xmax": 0.388, "ymax": 0.928}, # normalized 0-1
                "color": "#00e5ff",
                "degradation_years": 450,
                "threat_level": "High - Ingestion hazard for sea turtles & coral smothering"
            },
            {
                "id": "det-102",
                "label": "Plastic Bag",
                "category": "Plastic Bag",
                "confidence": 0.923,
                "box": {"xmin": 0.60, "ymin": 0.321, "xmax": 0.763, "ymax": 0.589},
                "color": "#ff4081",
                "degradation_years": 500,
                "threat_level": "Critical - High jellyfish mimicry, extreme risk to cetaceans"
            },
            {
                "id": "det-103",
                "label": "Can",
                "category": "Can",
                "confidence": 0.891,
                "box": {"xmin": 0.15, "ymin": 0.768, "xmax": 0.21, "ymax": 0.902},
                "color": "#ffab00",
                "degradation_years": 200,
                "threat_level": "Moderate - Heavy metal leaching, sharp edge habitat disruption"
            }
        ]
    },
    {
        "id": "deep_ghost_net",
        "title": "Deep Sea Ghost Fishing Gear",
        "location": "Marianas Escarpment, Sector 7-C",
        "depth_meters": 48.0,
        "image_filename": "deep_ghost_net.jpg",
        "description": "Commercial synthetic gillnet snagged on bedrock, continuously trapping aquatic fauna.",
        "detections": [
            {
                "id": "det-201",
                "label": "Fishing Net",
                "category": "Fishing Net",
                "confidence": 0.967,
                "box": {"xmin": 0.325, "ymin": 0.285, "xmax": 0.675, "ymax": 0.714},
                "color": "#00e676",
                "degradation_years": 600,
                "threat_level": "Severe - Continuous ghost-fishing entanglement loop"
            },
            {
                "id": "det-202",
                "label": "Rope",
                "category": "Rope",
                "confidence": 0.912,
                "box": {"xmin": 0.15, "ymin": 0.625, "xmax": 0.887, "ymax": 0.910},
                "color": "#ffd600",
                "degradation_years": 300,
                "threat_level": "High - Marine mammal fin wrapping and reef anchoring"
            },
            {
                "id": "det-203",
                "label": "Plastic Bottle",
                "category": "Plastic Bottle",
                "confidence": 0.884,
                "box": {"xmin": 0.187, "ymin": 0.732, "xmax": 0.244, "ymax": 0.902},
                "color": "#00e5ff",
                "degradation_years": 450,
                "threat_level": "Moderate - Microplastic shedding under hydrostatic pressure"
            }
        ]
    },
    {
        "id": "seabed_tire_cans",
        "title": "Continental Shelf Tire & Beverage Waste",
        "location": "Gulf Benthic Survey, Zone 3",
        "depth_meters": 22.0,
        "image_filename": "seabed_tire_cans.jpg",
        "description": "Heavy industrial and consumer debris settled into seabed sediment.",
        "detections": [
            {
                "id": "det-301",
                "label": "Tire",
                "category": "Tire",
                "confidence": 0.975,
                "box": {"xmin": 0.35, "ymin": 0.518, "xmax": 0.625, "ymax": 0.821},
                "color": "#7c4dff",
                "degradation_years": 1000,
                "threat_level": "High - Toxic zinc, PAH compound leaching & benthic flora stifling"
            },
            {
                "id": "det-302",
                "label": "Can",
                "category": "Can",
                "confidence": 0.934,
                "box": {"xmin": 0.20, "ymin": 0.768, "xmax": 0.265, "ymax": 0.911},
                "color": "#ffab00",
                "degradation_years": 200,
                "threat_level": "Moderate - Benthic oxidation & micro-crevice trap"
            },
            {
                "id": "det-303",
                "label": "Can",
                "category": "Can",
                "confidence": 0.918,
                "box": {"xmin": 0.70, "ymin": 0.732, "xmax": 0.763, "ymax": 0.871},
                "color": "#ffab00",
                "degradation_years": 200,
                "threat_level": "Moderate - Sedimentation alteration"
            },
            {
                "id": "det-304",
                "label": "Rope",
                "category": "Rope",
                "confidence": 0.873,
                "box": {"xmin": 0.60, "ymin": 0.768, "xmax": 0.725, "ymax": 0.857},
                "color": "#ffd600",
                "degradation_years": 300,
                "threat_level": "Low - Sediment anchor"
            }
        ]
    },
    {
        "id": "coastal_heavy_debris",
        "title": "Coastal Estuary High-Severity Waste",
        "location": "Metropolitan Harbor Outflow, Station 9",
        "depth_meters": 8.0,
        "image_filename": "coastal_heavy_debris.jpg",
        "description": "Critical accumulation zone with multi-class consumer and industrial refuse.",
        "detections": [
            {
                "id": "det-401",
                "label": "Plastic Bottle",
                "category": "Plastic Bottle",
                "confidence": 0.961,
                "box": {"xmin": 0.138, "ymin": 0.607, "xmax": 0.206, "ymax": 0.804},
                "color": "#00e5ff",
                "degradation_years": 450,
                "threat_level": "High - Microplastic breakdown into coastal food chain"
            },
            {
                "id": "det-402",
                "label": "Can",
                "category": "Can",
                "confidence": 0.942,
                "box": {"xmin": 0.275, "ymin": 0.732, "xmax": 0.333, "ymax": 0.857},
                "color": "#ffab00",
                "degradation_years": 200,
                "threat_level": "Moderate - Heavy metal residue"
            },
            {
                "id": "det-403",
                "label": "Plastic Bag",
                "category": "Plastic Bag",
                "confidence": 0.915,
                "box": {"xmin": 0.388, "ymin": 0.375, "xmax": 0.563, "ymax": 0.607},
                "color": "#ff4081",
                "degradation_years": 500,
                "threat_level": "Severe - Smothers seagrass bed nurseries"
            },
            {
                "id": "det-404",
                "label": "Fishing Net",
                "category": "Fishing Net",
                "confidence": 0.954,
                "box": {"xmin": 0.575, "ymin": 0.571, "xmax": 0.80, "ymax": 0.839},
                "color": "#00e676",
                "degradation_years": 600,
                "threat_level": "Critical - Large crustacean & fish trap"
            },
            {
                "id": "det-405",
                "label": "Tire",
                "category": "Tire",
                "confidence": 0.978,
                "box": {"xmin": 0.713, "ymin": 0.643, "xmax": 0.913, "ymax": 0.857},
                "color": "#7c4dff",
                "degradation_years": 1000,
                "threat_level": "High - Chemical leaching & current deflection"
            },
            {
                "id": "det-406",
                "label": "Other Marine Waste",
                "category": "Other Marine Waste",
                "confidence": 0.865,
                "box": {"xmin": 0.35, "ymin": 0.768, "xmax": 0.425, "ymax": 0.839},
                "color": "#ff5252",
                "degradation_years": 350,
                "threat_level": "Moderate - Polystyrene foam & synthetic cup particles"
            },
            {
                "id": "det-407",
                "label": "Rope",
                "category": "Rope",
                "confidence": 0.892,
                "box": {"xmin": 0.113, "ymin": 0.839, "xmax": 0.325, "ymax": 0.911},
                "color": "#ffd600",
                "degradation_years": 300,
                "threat_level": "High - Entanglement barrier"
            }
        ]
    },
    {
        "id": "tropical_shallow_bottle",
        "title": "Low-Impact Coral Lagoon",
        "location": "Lagoon Sanctuary Point 2",
        "depth_meters": 6.0,
        "image_filename": "tropical_shallow_bottle.jpg",
        "description": "Pristine marine sanctuary with an isolated single-use plastic bottle requiring early intervention.",
        "detections": [
            {
                "id": "det-501",
                "label": "Plastic Bottle",
                "category": "Plastic Bottle",
                "confidence": 0.971,
                "box": {"xmin": 0.475, "ymin": 0.625, "xmax": 0.556, "ymax": 0.857},
                "color": "#00e5ff",
                "degradation_years": 450,
                "threat_level": "Immediate Action - Removable before photodegradation starts"
            }
        ]
    }
]

CATEGORY_PALETTE = {
    "Plastic Bottle": "#00e5ff",
    "Plastic Bag": "#ff4081",
    "Fishing Net": "#00e676",
    "Rope": "#ffd600",
    "Can": "#ffab00",
    "Tire": "#7c4dff",
    "Other Marine Waste": "#ff5252"
}
