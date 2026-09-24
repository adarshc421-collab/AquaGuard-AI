# AquaGuard AI — Production Deployment Guide
**Target Stack**:
- **Frontend**: React + Vite (Hosted on **Vercel**)
- **Backend**: Python 3.10+ FastAPI (Hosted on **Render**)
- **Production Architecture**: `Client (Vercel) → HTTPS CORS REST API → Python FastAPI (Render)`

---

## 1. Local Development Setup

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### Backend Setup
```bash
# 1. Navigate to backend directory
cd backend

# 2. (Optional) Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment configuration
cp .env.example .env

# 5. Start development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will be live at `http://127.0.0.1:8000` (API documentation at `http://127.0.0.1:8000/docs`).

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start Vite dev server
npm run dev
```
The frontend will be live at `http://localhost:5173`.

---

## 2. GitHub Repository Setup

1. Push your codebase to a private or public GitHub repository.
2. Ensure `.gitignore` is active so `.env`, `node_modules`, `dist`, and `__pycache__` are excluded from the repository.

```bash
git add .
git commit -m "feat: configure AquaGuard AI for production deployment on Render and Vercel"
git push origin main
```

---

## 3. Render Backend Deployment (FastAPI Web Service)

### Option A: 1-Click Render Blueprint (Recommended)
1. Log in to [Render](https://render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure the Python service.

### Option B: Manual Web Service Setup
1. On the Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name**: `aquaguard-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Region**: Oregon (or nearest to users)
   - **Branch**: `main`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/api/health`
4. Add the following **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.10.12` | Ensures compatible Python runtime |
   | `ENVIRONMENT` | `production` | Sets production mode |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your deployed Vercel domain |
   | `ALLOW_VERCEL_PREVIEWS` | `true` | Allows all `*.vercel.app` preview branches |
   | `MODEL_PATH` | *(Leave empty for CV Fallback)* | Optional path to custom `.pt` model weights |
5. Click **Deploy Web Service**.
6. Copy your assigned backend URL: `https://aquaguard-backend.onrender.com`.

---

## 4. Vercel Frontend Deployment (React + Vite SPA)

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | `https://YOUR-RENDER-BACKEND.onrender.com` |
   *(Replace with your actual Render backend URL from Step 3 without trailing slash)*
6. Click **Deploy**.
7. Vercel will build the frontend in ~1-2 minutes and provide your domain: `https://your-aquaguard-app.vercel.app`.

---

## 5. Environment Variables Reference

### Frontend (`frontend/.env.example`)
| Variable | Description | Local Dev Default | Production Example |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of backend FastAPI server | `http://localhost:8000` | `https://aquaguard-backend.onrender.com` |

### Backend (`backend/.env.example`)
| Variable | Description | Local Dev Default | Production Example |
| :--- | :--- | :--- | :--- |
| `PORT` | Web server listening port | `8000` | Provided automatically by `$PORT` |
| `HOST` | Network interface binding | `0.0.0.0` | `0.0.0.0` |
| `ENVIRONMENT` | Runtime environment | `development` | `production` |
| `FRONTEND_URL` | Allowed frontend origin for CORS | `http://localhost:5173` | `https://aquaguard-app.vercel.app` |
| `ALLOWED_ORIGINS` | Comma-separated additional CORS origins | `http://localhost:5173,http://localhost:3000` | `https://aquaguard-app.vercel.app` |
| `ALLOW_VERCEL_PREVIEWS` | Allow all `*.vercel.app` subdomains | `true` | `true` |
| `MODEL_PATH` | Path to custom `.pt` model weights | *(empty)* | `/path/to/weights.pt` |

---

## 6. CORS Configuration Details

In `backend/app/main.py`, CORS is dynamically initialized:
- Explicit origins: `FRONTEND_URL` and `ALLOWED_ORIGINS`.
- Wildcard regex for Vercel preview environments: `^https://.*\.vercel\.app$`.
- Exposed headers: `Content-Disposition` (enabling browser file downloads for PDF reports).

If you change your Vercel custom domain (e.g. `https://aquaguard.ai`), update `FRONTEND_URL` in the Render dashboard and trigger a redeployment.

---

## 7. Centralized API Architecture

All frontend network requests are routed through:
- Config: [frontend/src/config/api.js](file:///c:/Users/adars/OneDrive/Documents/Desktop/Underwater%20Marine%20Debris%20Detection/frontend/src/config/api.js)
- Service: [frontend/src/services/api.js](file:///c:/Users/adars/OneDrive/Documents/Desktop/Underwater%20Marine%20Debris%20Detection/frontend/src/services/api.js)

`getMediaUrl(path)` automatically prepends `VITE_API_URL` to relative paths like `/static/samples/...`, ensuring static assets and generated enhanced images load seamlessly across cross-origin deployments.

---

## 8. Production Verification Checklist

Once deployed, verify the live deployment:

1. **Backend Health Check**:
   ```bash
   curl -s https://YOUR-RENDER-BACKEND.onrender.com/api/health
   # Expected response: {"status":"ok","service":"AquaGuard AI","version":"2.3.0", ...}
   ```

2. **Backend Sample Scenarios**:
   ```bash
   curl -s https://YOUR-RENDER-BACKEND.onrender.com/api/samples
   # Expected response: {"samples":[ ... 5 scenarios ... ]}
   ```

3. **Frontend Browser Test**:
   - Open `https://YOUR-VERCEL-DOMAIN.vercel.app`.
   - Click any demo scenario (e.g., *Coral Reef Plastics*).
   - Verify image loads and detection boxes appear.
   - Verify PDF export downloads successfully.

---

## 9. Common Deployment Issues & Solutions

### 1. "libGL.so.1: cannot open shared object file" on Linux/Render
- **Cause**: Standard `opencv-python` requires X11/OpenGL system libraries not present on headless Linux servers.
- **Solution**: `opencv-python-headless` is already specified in [backend/requirements.txt](file:///c:/Users/adars/OneDrive/Documents/Desktop/Underwater%20Marine%20Debris%20Detection/backend/requirements.txt).

### 2. CORS Blocked on Vercel (`Access-Control-Allow-Origin`)
- **Cause**: `FRONTEND_URL` on Render does not match your Vercel URL.
- **Solution**: In Render dashboard → Environment Variables, set `FRONTEND_URL=https://your-project.vercel.app` and ensure `ALLOW_VERCEL_PREVIEWS=true`.

### 3. SPA Route Refresh 404 on Vercel
- **Cause**: Vercel tries to find physical HTML files for client-side routes.
- **Solution**: Handled by [frontend/vercel.json](file:///c:/Users/adars/OneDrive/Documents/Desktop/Underwater%20Marine%20Debris%20Detection/frontend/vercel.json) rewrite rule: `{"source": "/(.*)", "destination": "/index.html"}`.

### 4. Render Free Tier Cold Starts
- **Notice**: Render free tier web services spin down after 15 minutes of inactivity. First request may take 30-45 seconds to spin up. The frontend displays graceful fallback states while the backend wakes up.
- **Temporary Uploads Notice**: Render containers have ephemeral storage. Uploaded survey images are processed in-memory / temporary static storage during the active session.
