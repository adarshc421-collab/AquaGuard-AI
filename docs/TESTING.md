# AquaGuard AI — Automated Testing & Verification Guide

This document details the automated test suite and verification harnesses built into AquaGuard AI.

---

## 1. Test Suite Overview

AquaGuard AI includes an automated testing harness (`backend/run_all_tests.py`) covering unit, integration, determinism, and API validation with **23 automated tests across 8 test modules**.

| Test Module | Test Coverage | Status |
| :--- | :--- | :--- |
| **`tests/test_determinism.py`** | Strict repeatability check: identical image input produces identical bounding boxes, categories, verification scores, risk index, and inspection plans. | ✅ **2/2 PASSED** |
| **`tests/test_detector.py`** | 9-class taxonomy compliance, spatial quadrant assignment ($A, B, C, D$), optical CV candidate extraction, and sonar preprocessing. | ✅ **4/4 PASSED** |
| **`tests/test_verification.py`** | 7-dimension verification scoring ($0–100$), `CONFIRMED` status, border artifact rejection, and speckle noise suppression. | ✅ **3/3 PASSED** |
| **`tests/test_quality.py`** | Optical sharpness (Laplacian variance), turbidity haze index (Dark Channel Prior), and dark image handling. | ✅ **2/2 PASSED** |
| **`tests/test_risk.py`** | Ghost gear lethality scoring, zero-debris clean baseline, metal oxidation scoring, and cleanup priority categorization. | ✅ **3/3 PASSED** |
| **`tests/test_hotspots.py`** | Spatial DBSCAN clustering into Named Hotspots (`Hotspot Alpha`, `Hotspot Beta`), centroid math, and empty input handling. | ✅ **2/2 PASSED** |
| **`tests/test_inspection_planner.py`** | AUV waypoint trajectory generation (`START → TGT → RETURN`), transit distance calculation, battery budgeting, and tooling selection. | ✅ **2/2 PASSED** |
| **`tests/test_api.py`** | FastAPI endpoints (`/`, `/api/health`, `/api/samples`, `/api/predict`, `/api/validate-candidate`). | ✅ **5/5 PASSED** |

**Total Summary**: **23 PASSED | 0 FAILED**

---

## 2. Running the Test Suite

To run all automated backend tests from the project root:

```bash
# Execute the full automated test suite
python backend/run_all_tests.py
```

### Running Specific Module Tests
You can also execute individual test files directly:

```bash
# Test determinism (100% identical outputs on repeated inference)
python backend/tests/test_determinism.py

# Test 7-dimension multi-evidence verifier
python backend/tests/test_verification.py

# Test spatial hotspots and DBSCAN clustering
python backend/tests/test_hotspots.py

# Test autonomous AUV inspection route planner
python backend/tests/test_inspection_planner.py

# Test FastAPI endpoints
python backend/tests/test_api.py
```

---

## 3. Frontend Verification & Production Build

To verify that the frontend compiles cleanly with zero syntax or bundling errors:

```bash
cd frontend
npm run build
```

Expected output:
```text
✓ built in ~1.5s
dist/index.html
dist/assets/index-[hash].css
dist/assets/index-[hash].js
```
