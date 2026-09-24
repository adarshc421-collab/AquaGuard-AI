export const CATEGORY_COLORS = {
  "Plastic Bottle": {
    hex: "#00e5ff",
    bg: "rgba(0, 229, 255, 0.15)",
    border: "rgba(0, 229, 255, 0.8)",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    icon: "bottle"
  },
  "Plastic Bag": {
    hex: "#ff4081",
    bg: "rgba(255, 64, 129, 0.15)",
    border: "rgba(255, 64, 129, 0.8)",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    icon: "bag"
  },
  "Fishing Net / Ghost Gear": {
    hex: "#00e676",
    bg: "rgba(0, 230, 118, 0.15)",
    border: "rgba(0, 230, 118, 0.8)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: "net"
  },
  "Fishing Net": {
    hex: "#00e676",
    bg: "rgba(0, 230, 118, 0.15)",
    border: "rgba(0, 230, 118, 0.8)",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    icon: "net"
  },
  "Rope": {
    hex: "#ffd600",
    bg: "rgba(255, 214, 0, 0.15)",
    border: "rgba(255, 214, 0, 0.8)",
    badge: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    icon: "rope"
  },
  "Can / Metal": {
    hex: "#ffab00",
    bg: "rgba(255, 171, 0, 0.15)",
    border: "rgba(255, 171, 0, 0.8)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: "can"
  },
  "Can": {
    hex: "#ffab00",
    bg: "rgba(255, 171, 0, 0.15)",
    border: "rgba(255, 171, 0, 0.8)",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    icon: "can"
  },
  "Tire": {
    hex: "#7c4dff",
    bg: "rgba(124, 77, 255, 0.15)",
    border: "rgba(124, 77, 255, 0.8)",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    icon: "tire"
  },
  "Plastic Container": {
    hex: "#00b0ff",
    bg: "rgba(0, 176, 255, 0.15)",
    border: "rgba(0, 176, 255, 0.8)",
    badge: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    icon: "container"
  },
  "Other Marine Debris": {
    hex: "#ff5252",
    bg: "rgba(255, 82, 82, 0.15)",
    border: "rgba(255, 82, 82, 0.8)",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    icon: "other"
  },
  "Unknown / Uncertain": {
    hex: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.15)",
    border: "rgba(148, 163, 184, 0.8)",
    badge: "bg-slate-500/20 text-slate-300 border-slate-500/40",
    icon: "help"
  }
};

export const SAMPLE_SCENARIOS = [
  {
    id: "coral_reef_plastics",
    title: "Coral Reef Plastics",
    badge: "2 Debris Items",
    depth: "12.5m",
    location: "Great Barrier Reef, Station Alpha-14",
    image: "/static/samples/coral_reef_plastics.jpg",
    description: "Shallow biodiversity zone impacted by single-use bottles and plastic bags.",
    severity: "Medium",
  },
  {
    id: "deep_ghost_net",
    title: "Deep Sea Ghost Net",
    badge: "1 Debris Item",
    depth: "48.0m",
    location: "Marianas Escarpment, 7-C",
    image: "/static/samples/deep_ghost_net.jpg",
    description: "Derelict commercial synthetic gillnet snagged on deep benthic reef substrate.",
    severity: "Critical",
  },
  {
    id: "coastal_heavy_debris",
    title: "Coastal Heavy Influx",
    badge: "3 Debris Items",
    depth: "8.0m",
    location: "Metropolitan Harbor Outflow",
    image: "/static/samples/coastal_heavy_debris.jpg",
    description: "Multi-category macro-plastic, rubber, and metallic debris accumulation.",
    severity: "High",
  },
  {
    id: "seabed_tire_cans",
    title: "Continental Shelf Tires",
    badge: "2 Debris Items",
    depth: "22.0m",
    location: "Gulf Benthic Zone 3",
    image: "/static/samples/seabed_tire_cans.jpg",
    description: "Industrial vulcanized rubber tire and aluminum cans settled in seafloor sediment.",
    severity: "High",
  },
  {
    id: "tropical_shallow_bottle",
    title: "Tropical Lagoon",
    badge: "1 Debris Item",
    depth: "6.0m",
    location: "Lagoon Sanctuary Point 2",
    image: "/static/samples/tropical_shallow_bottle.jpg",
    description: "Floating single-use beverage container detected before mechanical fragmentation.",
    severity: "Low",
  },
];
