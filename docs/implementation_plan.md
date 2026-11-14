# Implementation Plan - Netrakshak Production-Ready AI Driver Safety Website

This plan details the full-stack architecture, frontend design system, API expansion, AI integration rules, testing strategy, and execution steps to upgrade Netrakshak from a desktop prototype into an executive automotive safety product website and command dashboard.

## User Review Required

> [!IMPORTANT]
> All existing working AI code (`core/camera.py`, `core/face_detector.py`, `core/eye_detector.py`, `core/drowsiness_detector.py`, `core/risk_engine.py`, `core/alarm_manager.py`) and Pytest unit tests will be 100% preserved and integrated into the new web server.
>
> Un-implemented AI features (Alcohol sensor, Phone detection model) will be clearly marked as **NOT CONNECTED** or **COMING SOON** to enforce strict AI integrity. A prominent **DEMO MODE — SIMULATED DATA** toggle will be provided for presentation purposes when physical cameras are offline.

---

## 🏗️ Architecture & Component Design

```
netrakshak/
│
├── main.py                     # CLI launcher & fallback runner
├── server.py                   # Production Flask REST & streaming API server
├── config.py                   # Centralized threshold & system configuration
├── requirements.txt            # Python dependencies (opencv, mediapipe, flask, etc.)
│
├── core/                       # Preserved core AI computer vision engines
│   ├── camera.py               # CameraManager
│   ├── face_detector.py        # MediaPipe FaceMesh
│   ├── eye_detector.py         # Landmark mapping & EAR math
│   ├── drowsiness_detector.py  # Monotonic time state machine
│   ├── risk_engine.py          # Risk evaluation engine
│   └── alarm_manager.py        # Audio alert daemon
│
├── frontend/                   # Modern React + Vite + Tailwind CSS Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx             # React Router container
│   │   ├── components/         # Shared executive UI components
│   │   │   ├── Navbar.jsx      # Header banner with Logo, status, & Demo toggle
│   │   │   ├── Footer.jsx      # Executive dark footer
│   │   │   ├── RiskGauge.jsx   # Radial risk score (0-100) gauge
│   │   │   ├── CameraStream.jsx# Dual-mode stream (OpenCV backend + HTML5 Chrome webcam)
│   │   │   ├── DetectionCards.jsx# Live AI state cards (Eyes, Attention, Phone, Speed)
│   │   │   ├── AlertCenter.jsx # Real-time scrolling alert feed with Acknowledge
│   │   │   └── EmergencyModal.jsx # Critical risk alert popover
│   │   ├── pages/              # Main application routes
│   │   │   ├── Home.jsx        # Public Product Landing Page
│   │   │   ├── Dashboard.jsx   # Live Driver Safety Command Center (/dashboard)
│   │   │   ├── Analytics.jsx   # Driver behavior analytics & charts (/analytics)
│   │   │   ├── AlertsPage.jsx  # Complete alert history table (/alerts)
│   │   │   ├── SystemPage.jsx  # System health & telemetry (/system)
│   │   │   ├── DriverPage.jsx  # Driver profile & vehicle info (/driver)
│   │   │   └── Technology.jsx  # Deep-dive tech architecture & formula (/technology)
│   │   └── services/           # REST API & polling client layer
│   │       └── api.js
│
├── static/                     # Built frontend assets served by Flask in production
└── templates/                  # Flask HTML entry point (index.html)
```

---

## 🔌 Expanded Backend REST API Specification (`server.py`)

1. `GET /api/status`: System connectivity, camera state, AI model health, FPS, CPU/RAM usage.
2. `GET /api/telemetry`: Real-time driver telemetry (EAR, closed duration, state, risk level).
3. `GET /api/risk`: Current risk score ($0-100$), risk level (`SAFE`, `WARNING`, `CRITICAL`), active triggers.
4. `GET /api/detections`: Detailed breakdown of all 6 safety detection channels.
5. `GET /api/alerts`: List of generated alert events (timestamp, type, severity, message, acknowledged state).
6. `POST /api/alerts/<id>/acknowledge`: Mark specific alert as acknowledged.
7. `GET /api/analytics`: Driving analytics, trip safe percentage, hourly event breakdown.
8. `GET /api/driver`: Driver ID `DRV-8842`, vehicle details, total trips, safety score.
9. `POST /api/process_frame`: Base64 frame input for HTML5 Chrome webcam mode.
10. `POST /api/demo_mode`: Toggle simulated presentation demo data mode.

---

## 🎨 Visual Design System

- **Color Palette**: Executive Dark Theme (`#0F172A` Slate Background, `#1E293B` Card Surface, `#334155` Glass Borders).
- **Status Colors**: Emerald Green (`#10B981` Safe), Amber Yellow (`#F59E0B` Warning), Crimson Red (`#EF4444` Critical), Muted Slate (`#64748B` Offline/Not Connected).
- **Typography**: Inter for UI prose, JetBrains Mono for telemetry numbers & timestamps.
- **Branding Logo**: Eye + Road motif icon with clean bold Netrakshak wordmark.

---

## 🎯 Verification & Testing Strategy

1. **Automated Unit Tests**: Re-run PyTest suite (`pytest tests/ -v`) to confirm 100% test pass.
2. **Frontend Build & Lint**: Execute `npm run build` in `frontend/` to generate static bundle.
3. **Backend API Testing**: Execute HTTP checks against all new REST endpoints.
4. **Dual Camera Verification**: Verify OpenCV server stream and HTML5 Chrome browser webcam feed.
5. **Demo Mode Verification**: Verify presentation Demo Mode toggles smoothly without breaking real AI pipeline.
6. **Responsive Layout Check**: Validate layouts at 375px, 768px, 1024px, 1440px, and 1920px.
