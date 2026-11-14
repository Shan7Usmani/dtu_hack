# 🛡️ NETRAKSHAK — AI Driver Safety & Emergency Response System

> **Detect the Risk. Prevent the Crash.**

Netrakshak is a real-time AI-powered driver safety platform built for the **DTU Hackathon**. It uses computer vision and machine learning to detect drowsiness, phone usage while driving, and trigger emergency alerts — all from a standard webcam.

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 👁️ **Drowsiness Detection** | Monitors Eye Aspect Ratio (EAR) via MediaPipe FaceMesh; alerts if eyes closed > 3 seconds |
| 📱 **Phone Usage Detection** | Detects mobile phone near ear using MediaPipe Hands + facial proximity heuristics |
| 🚨 **Emergency Response** | Multi-sensor accident fusion engine with auto-dispatch to emergency contacts |
| 🔊 **Custom Alarm** | Plays a real alarm audio when drowsiness or phone usage is detected |
| 📊 **Live Analytics** | Real-time risk score, EAR graph, session stats |
| 🗺️ **GPS Integration** | Location tagging for emergency incidents |
| 💬 **Alert History** | Full log of all safety events with acknowledgement |

---

## 🏗️ Tech Stack

**Backend**
- Python 3.11 + Flask
- MediaPipe (FaceMesh 468 landmarks + Hands)
- OpenCV
- Pygame (audio)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Recharts (analytics)

---

## 📦 Project Structure

```
netrakshak/
├── server.py               # Main Flask server & REST API
├── config.py               # Configuration constants
├── core/
│   ├── camera.py           # Webcam manager
│   ├── face_detector.py    # MediaPipe FaceMesh
│   ├── eye_detector.py     # EAR calculation
│   ├── drowsiness_detector.py  # Drowsiness state machine
│   ├── phone_detector.py   # Phone usage detection
│   ├── risk_engine.py      # Risk scoring
│   ├── alarm_manager.py    # Audio alarm (Pygame)
│   ├── accident_detector.py    # Multi-sensor fusion
│   └── notification_service.py # Emergency notifications
├── utils/
│   ├── helpers.py
│   └── logger.py
├── assets/
│   └── alarm.wav           # Custom alarm sound
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
├── tests/                  # PyTest unit tests (15/15 passing)
└── requirements.txt
```

---

## ⚙️ Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/Priyanshiaggarwal21/DTU_Hackathon.git
cd DTU_Hackathon
```

### 2. Backend setup
```bash
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Run the server
```bash
python server.py
```

Open your browser at **http://127.0.0.1:5000** 🚀

---

## 🧪 Tests

```bash
pytest tests/ -v
```
All 15 unit tests pass ✅

---

## 👥 Team

Built with ❤️ for **DTU Hackathon 2026**

---

## 📄 License

MIT License
