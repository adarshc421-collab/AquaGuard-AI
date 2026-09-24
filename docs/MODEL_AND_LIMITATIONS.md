# AquaGuard AI — Model Architecture, Prototypes & Technical Disclosures
**Document Purpose**: Transparent declaration of active algorithms, prototype layers, depth estimation mechanics, and physical operational limitations.

---

## 1. Active Inference Engine vs. Deep Learning Extension

### Active Detection Engine (Computer Vision Fallback)
In the current MVP distribution, detection operates on a deterministic, classical **Computer Vision (CV) Feature Extraction Engine**:
- **Multi-Scale Gradient Edge Analysis**: Computes Sobel and Canny edge energy across color and luminance channels.
- **Morphological Component Analysis**: Identifies contiguous closed contours and measures geometric aspect ratios $\frac{W}{H}$, compactness $\frac{P^2}{4\pi A}$, and annular background contrast deltas.
- **Deterministic Classification Rules**: Matches physical contours to the 9-class taxonomy based on aspect ratio, texture standard deviation, and spatial footprint.
- **Zero Random Numbers**: `random.uniform()` and non-deterministic seeds are completely eliminated across the entire backend.

### YOLOv8 / Deep Learning Extension Interface
The backend implements an abstract `BaseDetector` architecture. A `yolo_detector.py` module is provided with dynamic weight detection (`best.pt`, `yolov8n.pt`, `yolov8x.pt`). When weight files are present, the factory seamlessly switches from the CV fallback engine to deep neural inference with zero code modifications.

---

## 2. Real Implementations vs. Experimental Prototypes

To maintain scientific integrity during hackathon and production evaluations, all system components are transparently categorized:

| Component / Feature | Implementation Status | Technical Methodology |
| :--- | :--- | :--- |
| **Optical Modality & Quality Analyzer** | **Real / Production** | Laplacian variance, Dark Channel Prior haze index, RGB variance. |
| **Adaptive Image Enhancer** | **Real / Production** | Optical Red-Channel restoration, LAB CLAHE, Bilateral filtering. |
| **7-Dimension Multi-Evidence Verifier**| **Real / Production** | Annular background delta, class geometry, texture difference, border check. |
| **Spatial Hotspot Engine** | **Real / Production** | DBSCAN / Centroid spatial clustering with localized bounding boxes. |
| **Autonomous AUV Inspection Planner** | **Real / Production** | Greedy TSP nearest-neighbor trajectory with battery and tooling estimation. |
| **13-Section PDF Audit Generator** | **Real / Production** | ReportLab canvas rendering with cryptographic SHA-256 session integrity. |
| **Active Learning Feedback Logger** | **Real / Production** | JSON-backed audit trail storing confirmed/rejected candidate decisions. |
| **Temporal Frame Consistency Tracker** | **Experimental Prototype** | Frame-by-frame persistence simulation across sequential video frames. |
| **Multi-View 3D Triangulation** | **Experimental Prototype** | Epipolar disparity simulation assuming calibrated $1.8\text{m}$ stereo baseline. |
| **Depth Estimation** | **Calibrated Visual Layer** | Image-relative vertical plane projection ($H_{\text{est}} = H_{\text{base}} + 1.5 y_{\text{min}}$). |

---

## 3. Depth Estimation Disclosure

> [!NOTE]
> Monocular optical cameras cannot calculate absolute Euclidean depth without hardware telemetry (e.g., pressure depth gauges, acoustic altimeters, or calibrated stereo baselines).

In AquaGuard AI, depth values are explicitly displayed in the UI as **`AI Estimated Visual Layer`**:
- **Base Range**: Assigned per material profile (e.g., buoyant plastic bags at $1.8\text{m}$, heavy seabed metal/tires at $4.1–4.5\text{m}$).
- **Perspective Modulation**: Linearly interpolated based on the bounding box vertical nadir coordinate ($y_{\text{min}}$).
- **Hardware Integration**: The inspection planner schema is fully prepared to ingest real MAVLink/ROS depth telemetry when connected to physical ROVs.

---

## 4. Environmental & Optical Limitations

1. **Extreme Turbidity / Black Water**: In zero-visibility water ($<0.5\text{m}$ optical range), optical detection automatically triggers a `CAUTION` warning. In these conditions, operators must switch to the **Side-Scan Sonar** processing pipeline.
2. **Dynamic Biota Obstruction**: Marine fauna (fish schools, turtles) swimming directly over debris may momentarily alter contour boundaries; the multi-evidence verifier filters transient spikes via texture discontinuity checks.
3. **Severe Bio-Fouling**: Debris covered entirely in heavy coral or calcified macroalgae will exhibit biological texture profiles and may be routed to the `REVIEW` queue for operator confirmation rather than automatic `CONFIRMED` status.
