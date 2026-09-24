# AquaGuard AI — Smart India Hackathon Demonstration Guide
**Duration**: 2 to 3 Minutes  
**Target Audience**: Smart India Hackathon Evaluators / Environmental & Defense Domain Judges  
**Guiding Principle**: `DETECT → VERIFY → MAP → PRIORITIZE → ACT`

---

## Pitch Narrative (30-Second Opening)

> *"Judges, over 14 million tons of plastic and derelict ghost gear pollute our oceans every year. Most detection tools show raw bounding boxes that misclassify coral and rocks as trash, leading to wasted dive expeditions.*
> 
> *AquaGuard AI is a precision-first environmental intelligence platform that converts noisy underwater optical and sonar data into verified, actionable cleanup missions. We don't just detect — we verify with multi-evidence filters, cluster into spatial hotspots, and generate complete autonomous AUV inspection routes with specialized tooling protocols."*

---

## Step-by-Step 2-Minute Demo Script

### Step 1: Select or Upload Survey Imagery (15 seconds)
1. Navigate to the **Analyze** tab.
2. Select **"Coral Reef Plastic Pollution"** or **"Side-Scan Sonar Shipwreck Debris"** from the sample scenario cards (or upload any test image via the dropzone).
3. Point to the **Modality Identifier**:
   - *"The system instantly detects whether the input is Optical RGB or Acoustic Sonar, and performs real-time optical quality analysis (measuring Laplacian variance for sharpness and Dark Channel Prior for underwater haze)."*

---

### Step 2: 3-Way Image Enhancement & Detection Split (30 seconds)
1. Toggle the **Original / Enhanced / Detected** view selector or use the interactive **Split Slider**.
2. Explain the enhancement:
   - *"Notice how the red-channel restoration and LAB CLAHE eliminate the heavy blue-green color cast, restoring edge visibility on the seabed."*
3. Highlight the **Stable Target IDs** (`TGT-001`, `TGT-002`):
   - *"Every verified target receives an immutable ID, 5-star evidence rating, material composition, estimated degradation timeline, and specific cleanup tool recommendation."*

---

### Step 3: False-Positive Prevention & Rejected Candidates Drawer (30 seconds)
1. Scroll down to the **"Why Not The Other Objects?"** rejected candidate drawer.
2. Click to expand and reveal `CAND-REJ-01` and `CAND-REJ-02`:
   - *"This is our core innovation: False-Positive Prevention. Notice that the system generated 5 initial candidate regions. It verified 2 as real debris, flagged 1 for operator review, and rejected 2 as natural seabed noise because one touched the camera border and the other lacked sufficient boundary contrast."*
   - *"Our system prefers NO detection over WRONG detection."*

---

### Step 4: Spatial GIS Hotspots & AUV Waypoint Trajectory (30 seconds)
1. Switch to the **Survey Map** tab (or scroll down to the 2D Coordinate Grid).
2. Point out **Hotspot Alpha** and **Hotspot Beta**:
   - *"Using DBSCAN spatial clustering, confirmed debris is grouped into named priority hotspots."*
3. Point out the **Green AUV Flight Polyline**:
   - *"The system solves an energy-optimized AUV mission path: starting at the surface launch vessel, traversing high-risk targets first, and returning to base. It calculates exact transit distance (75.4m), estimated mission duration (9.6 min), battery budget (3.9%), and selects required tools like hydraulic net cutters for ghost nets."*

---

### Step 5: Action Recommendation & ISO Environmental Audit PDF (15 seconds)
1. Switch to the **Reports** tab.
2. Point to the **"WHAT SHOULD I DO?" Operational Action Banner**:
   - *"Clear, actionable guidance for maritime authorities: equipment required, intervention timeframe, and operational protocol."*
3. Click **"Download Audit Report (PDF)"** to show the 13-section ISO-aligned formal audit document.

---

## Key Questions & Answers for Judges

### Q1: *"Is this running a real AI model or simulated rules?"*
> **Answer**: *"Our system has a unified factory architecture. Because we operate in zero-hallucination mode, when heavy pre-trained weights are not loaded, our deterministic Computer Vision fallback engine executes real Sobel gradient filters, Laplacian texture variance, and annular background separation. Every coordinate, score, and bounding box is computed deterministically from real image pixels with zero random numbers."*

### Q2: *"How do you prevent false positives on rocks and corals?"*
> **Answer**: *"Every candidate must pass our 7-dimension verification gate: boundary contrast delta, class-specific aspect ratio, texture standard deviation vs background, border margin check, and acoustic shadow geometry in sonar mode. Objects below 85% composite score are routed to our human-in-the-loop review queue or rejected entirely."*

### Q3: *"How is depth calculated?"*
> **Answer**: *"We explicitly label all depth metrics as 'AI Estimated Visual Layer'. In our optical prototype, depth is estimated from calibrated benthic baseline ranges ($2.0–4.5\text{ m}$) modulated by vertical image plane position ($y_{\text{min}}$). For hardware deployments, this connects to acoustic altimeter and pressure sensor feeds."*
