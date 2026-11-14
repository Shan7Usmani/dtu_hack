"""
NETRAKSHAK — AI DRIVER SAFETY & EMERGENCY RESPONSE SYSTEM
Production-Ready Flask Web, REST API & Emergency Response Server with Custom YouTube Alarm Audio.
"""

import time
import os
import platform
import uuid
from typing import Dict, Any, List

try:  # optional: host metrics fall back to null when psutil is unavailable
    import psutil
except ImportError:  # pragma: no cover
    psutil = None
import cv2
import numpy as np
from flask import Flask, Response, render_template, jsonify, request, send_from_directory

from core.camera import CameraManager
from core.face_detector import FaceDetector
from core.eye_detector import EyeDetector
from core.drowsiness_detector import DrowsinessDetector
from core.risk_engine import RiskEngine
from core.alarm_manager import AlarmManager
from core.accident_detector import AccidentDetector
from core.notification_service import EmergencyNotificationService
from core.phone_detector import PhoneDetector

from utils.helpers import format_duration, ensure_alarm_sound
from utils.logger import logger
import config

app = Flask(__name__, static_folder="frontend/dist/assets", template_folder="frontend/dist")

# Cross-origin support for split deploys (static frontend + remote API).
# Comma-separated list in ALLOWED_ORIGINS; defaults to same-origin only.
_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
if _origins:
    from flask_cors import CORS

    CORS(app, resources={r"/*": {"origins": _origins}})

# Core AI Engine Instances (100% Preserved Logic + Connected Phone Detector)
camera_manager = CameraManager()
face_detector = FaceDetector()
eye_detector = EyeDetector()
drowsiness_detector = DrowsinessDetector()
risk_engine = RiskEngine()
alarm_manager = AlarmManager()
phone_detector = PhoneDetector()

# Emergency Response Engines
accident_detector = AccidentDetector()
notification_service = EmergencyNotificationService()

# Global Application State & Telemetry Cache
is_monitoring = True
demo_mode = False
session_start_time: float = time.monotonic()
monitoring_duration: float = 0.0
fps_frame_count: int = 0
fps_start_time: float = time.monotonic()
current_fps: float = 0.0
camera_error: Any = None

# Alert Event Log Storage
alerts_db: List[Dict[str, Any]] = [
    {
        "id": "ALT-1001",
        "timestamp": time.strftime("%H:%M:%S", time.localtime(time.time() - 420)),
        "date": time.strftime("%Y-%m-%d"),
        "type": "System Check",
        "severity": "INFO",
        "message": "Netrakshak Edge AI Safety System initialized.",
        "acknowledged": True
    }
]

# Emergency System Databases
# The two seeded entries are placeholders shipped with the demo build so the
# dispatch flow has somewhere to send notifications. They are flagged
# is_sample=True and are never presented as real people. Contacts created
# through POST /api/emergency/contacts persist for the life of the process.
emergency_contacts_db: List[Dict[str, Any]] = [
    {
        "id": "CNT-001",
        "name": "Sample contact - primary",
        "relationship": "Placeholder (replace with a real contact)",
        "phone": "+91 90000 00001",
        "priority": 1,
        "active": True,
        "is_sample": True
    },
    {
        "id": "CNT-002",
        "name": "Sample contact - fleet desk",
        "relationship": "Placeholder (replace with a real contact)",
        "phone": "+91 90000 00002",
        "priority": 2,
        "active": True,
        "is_sample": True
    }
]

active_incident: Dict[str, Any] = None
incidents_db: List[Dict[str, Any]] = []

latest_telemetry: Dict[str, Any] = {
    "status": "AWAKE",
    "risk_level": "LOW",
    "risk_score": 15,
    "left_ear": 0.31,
    "right_ear": 0.30,
    "average_ear": 0.305,
    "is_eyes_closed": False,
    "closed_duration": 0.0,
    "drowsiness_events": 0,
    "phone_detected": False,
    "phone_status": "NOT_DETECTED",
    "longest_closure": 0.0,
    "session_avg_ear": 0.305,
    "monitoring_duration": 0.0,
    "monitoring_duration_formatted": "00:00:00",
    "fps": 30.0,
    "is_monitoring": True,
    "demo_mode": False
}

ensure_alarm_sound()


def camera_error_payload():
    """Human-readable camera problem for the UI, or None when healthy."""
    if camera_manager.is_opened() or demo_mode:
        return None
    return camera_error or (
        f"No webcam available at device index {config.CAMERA_INDEX}. "
        "Connect a camera or switch the dashboard to browser webcam mode."
    )


def calculate_numeric_risk_score(status: str, closed_dur: float, events: int, phone_detected: bool = False) -> int:
    if status == "NO_DRIVER":
        return 0
    score = 15
    if status == "CAUTION":
        score += 35 + int(closed_dur * 10)
    elif status == "DROWSY":
        score += 65 + int(closed_dur * 12) + (events * 5)
    elif status == "MULTIPLE_FACES":
        score += 25

    if phone_detected:
        score += 35

    return min(100, max(0, score))


def generate_mjpeg_frames():
    global is_monitoring, demo_mode, fps_frame_count, fps_start_time, current_fps, latest_telemetry, monitoring_duration, camera_error

    while True:
        if demo_mode:
            frame = np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8)
            frame[:] = (15, 23, 42)
            cv2.rectangle(frame, (20, 20), (620, 460), (59, 130, 246), 2)
            cv2.putText(frame, "DEMO MODE -- SIMULATED STREAM", (160, 220), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (59, 130, 246), 2)
            cv2.putText(frame, "Live camera monitoring active in background", (150, 260), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (148, 163, 184), 1)

            ret, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)
            continue

        if not is_monitoring:
            blank = np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8)
            blank[:] = (15, 23, 42)
            cv2.putText(blank, "MONITORING PAUSED", (180, 230), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (148, 163, 184), 2)
            cv2.putText(blank, "Click 'START MONITORING' to resume live stream", (130, 270), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (148, 163, 184), 1)

            ret, buffer = cv2.imencode('.jpg', blank)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.1)
            continue

        if not camera_manager.is_opened():
            cam_ok, cam_msg = camera_manager.start()
            camera_error = None if cam_ok else str(cam_msg)

        ret, frame = camera_manager.read_frame()
        if not ret or frame is None:
            if not camera_error:
                camera_error = (
                    f"Webcam unavailable at device index {config.CAMERA_INDEX}. "
                    "Connect a camera, or use the browser webcam mode in the UI."
                )
            blank = np.zeros((config.FRAME_HEIGHT, config.FRAME_WIDTH, 3), dtype=np.uint8)
            blank[:] = (15, 23, 42)
            cv2.putText(blank, "WEBCAM UNAVAILABLE", (150, 225), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (245, 158, 11), 2)
            cv2.putText(blank, "No readable camera device detected", (170, 262), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (148, 163, 184), 1)
            cv2.putText(blank, "Use browser webcam mode or reconnect device", (130, 300), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (100, 116, 139), 1)

            ret, buffer = cv2.imencode('.jpg', blank)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            time.sleep(0.5)
            continue

        camera_error = None

        h, w, _ = frame.shape

        fps_frame_count += 1
        now = time.monotonic()
        elapsed = now - fps_start_time
        if elapsed >= 1.0:
            current_fps = fps_frame_count / elapsed
            fps_frame_count = 0
            fps_start_time = now

        if session_start_time > 0:
            monitoring_duration = now - session_start_time

        # 1. Face Mesh Detection
        face_status, landmarks, bbox, face_count = face_detector.detect(frame)

        # 2. Eye Landmark & EAR Calculation
        eye_telemetry = eye_detector.analyze_eyes(landmarks, w, h)

        # 3. Drowsiness State Machine
        drowsy_telemetry = drowsiness_detector.update(eye_telemetry["average_ear"], face_status)

        # 4. Connected Mobile Phone Usage Detection
        phone_res = phone_detector.process_frame(frame, landmarks)
        phone_detected = phone_res["phone_detected"]

        combined = {
            **eye_telemetry,
            **drowsy_telemetry,
            "face_status": face_status,
            "face_bbox": bbox,
            "face_count": face_count,
            "phone_detected": phone_detected,
            "phone_status": phone_res["phone_status"]
        }

        risk_level = risk_engine.evaluate_risk(combined)
        risk_score = calculate_numeric_risk_score(
            drowsy_telemetry["status"],
            drowsy_telemetry["closed_duration"],
            drowsy_telemetry["drowsiness_events"],
            phone_detected=phone_detected
        )
        combined["risk_level"] = "HIGH" if phone_detected and risk_level != "CRITICAL" else risk_level
        combined["risk_score"] = risk_score

        # 5. Handle Alarm & Alert Generation for Drowsiness OR Phone Distraction
        if drowsy_telemetry["status"] == "DROWSY" or risk_level == "CRITICAL" or phone_detected:
            alarm_manager.start_alarm()

            if phone_detected:
                if not alerts_db or alerts_db[0]["type"] != "Phone Distraction" or not alerts_db[0]["timestamp"].startswith(time.strftime("%H:%M")):
                    alerts_db.insert(0, {
                        "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                        "timestamp": time.strftime("%H:%M:%S"),
                        "date": time.strftime("%Y-%m-%d"),
                        "type": "Phone Distraction",
                        "severity": "WARNING",
                        "message": "Mobile phone usage detected while driving! Keep hands on wheel.",
                        "acknowledged": False
                    })
            elif drowsy_telemetry["status"] == "DROWSY" or risk_level == "CRITICAL":
                if not alerts_db or alerts_db[0]["type"] != "Drowsiness Warning" or not alerts_db[0]["timestamp"].startswith(time.strftime("%H:%M")):
                    alerts_db.insert(0, {
                        "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                        "timestamp": time.strftime("%H:%M:%S"),
                        "date": time.strftime("%Y-%m-%d"),
                        "type": "Drowsiness Warning",
                        "severity": "CRITICAL" if risk_score >= 70 else "WARNING",
                        "message": f"Drowsiness detected! Eyes closed for {drowsy_telemetry['closed_duration']:.1f}s.",
                        "acknowledged": False
                    })
        else:
            alarm_manager.stop_alarm()

        latest_telemetry = {
            **combined,
            "monitoring_duration": monitoring_duration,
            "monitoring_duration_formatted": format_duration(monitoring_duration),
            "fps": current_fps,
            "is_monitoring": True,
            "demo_mode": demo_mode
        }

        # 6. Render HUD Overlay Graphics
        status = combined.get("status", "AWAKE")
        avg_ear = combined.get("average_ear", 0.0)
        left_ear = combined.get("left_ear", 0.0)
        right_ear = combined.get("right_ear", 0.0)
        left_pts = combined.get("left_contour_points", [])
        right_pts = combined.get("right_contour_points", [])

        status_colors = {
            "AWAKE": (129, 185, 16),
            "CAUTION": (11, 158, 245),
            "DROWSY": (68, 68, 239),
            "NO_DRIVER": (139, 116, 100),
            "MULTIPLE_FACES": (22, 115, 249)
        }
        theme_color = (68, 68, 239) if phone_detected else status_colors.get(status, (255, 255, 255))

        if left_pts:
            cv2.polylines(frame, [np.array(left_pts, dtype=np.int32)], True, theme_color, 2, cv2.LINE_AA)
        if right_pts:
            cv2.polylines(frame, [np.array(right_pts, dtype=np.int32)], True, theme_color, 2, cv2.LINE_AA)

        if bbox:
            x, y, bw, bh = bbox
            cv2.rectangle(frame, (x, y), (x + bw, y + bh), theme_color, 1, cv2.LINE_AA)

        if phone_res.get("bbox"):
            px, py, pbw, pbh = phone_res["bbox"]
            cv2.rectangle(frame, (px, py), (px + pbw, py + pbh), (0, 0, 255), 2)
            cv2.putText(frame, "MOBILE PHONE", (px, max(15, py - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        cv2.rectangle(frame, (10, 10), (280, 85), (15, 23, 42), -1)
        cv2.rectangle(frame, (10, 10), (280, 85), theme_color, 1)
        cv2.putText(frame, f"STATUS: {'PHONE DISTRACTED' if phone_detected else status}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, theme_color, 2, cv2.LINE_AA)
        cv2.putText(frame, f"EAR: {avg_ear:.3f} (L:{left_ear:.2f} R:{right_ear:.2f})", (20, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (248, 250, 252), 1, cv2.LINE_AA)
        cv2.putText(frame, f"PHONE: {'DETECTED (ALARM)' if phone_detected else 'NOT DETECTED'}", (20, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 255) if phone_detected else (16, 185, 129), 1, cv2.LINE_AA)

        if phone_detected:
            banner_y = h - 60
            cv2.rectangle(frame, (0, banner_y), (w, h), (0, 0, 220), -1)
            cv2.putText(frame, "PHONE USAGE DETECTED -- KEEP HANDS ON WHEEL!", (15, banner_y + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        elif status == "DROWSY":
            banner_y = h - 60
            cv2.rectangle(frame, (0, banner_y), (w, h), (68, 68, 239), -1)
            cv2.putText(frame, "DROWSINESS DETECTED - TAKE A BREAK!", (20, banner_y + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2, cv2.LINE_AA)

        ret, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
        time.sleep(0.015)


# Serve Audio Asset Route so Web Browsers can play custom YouTube alarm audio
@app.route("/audio/alarm.wav")
@app.route("/assets/alarm.wav")
def serve_alarm_audio():
    assets_dir = os.path.join(app.root_path, "assets")
    return send_from_directory(assets_dir, "alarm.wav", mimetype="audio/wav")


# ----------------------------------------------------
# REST API Endpoints
# ----------------------------------------------------

@app.route("/video_feed")
def video_feed():
    return Response(generate_mjpeg_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")


@app.route("/telemetry")
def telemetry():
    return jsonify(latest_telemetry)


@app.route("/api/health")
def api_health():
    return jsonify({
        "status": "ok",
        "app": config.APP_NAME,
        "app_version": config.APP_VERSION,
        "backend_version": "1.1.0",
        "system_status": "ONLINE",
        "camera_connected": camera_manager.is_opened(),
        "camera_error": camera_error_payload(),
        "ai_model_loaded": True,
        "is_monitoring": is_monitoring,
        "demo_mode": demo_mode,
        "fps": round(current_fps, 1),
        "server_time": time.time()
    })


@app.route("/api/camera")
def api_camera():
    connected = camera_manager.is_opened()
    return jsonify({
        "connected": connected,
        "camera_index": config.CAMERA_INDEX,
        "demo_mode": demo_mode,
        "is_monitoring": is_monitoring,
        "error": None if connected or demo_mode else (
            camera_error or "No webcam available. Use browser webcam mode or connect a camera."
        )
    })


@app.route("/api/status")
def api_status():
    """Real host/process metrics only. No invented device names or latencies."""
    cpu_percent = None
    memory_mb = None
    if psutil is not None:
        try:
            cpu_percent = psutil.cpu_percent(interval=None)
            memory_mb = round(psutil.Process(os.getpid()).memory_info().rss / (1024 * 1024), 1)
        except Exception as exc:  # psutil can be restricted on some hosts
            logger.warning(f"psutil metrics unavailable: {exc}")
    else:
        logger.warning("psutil is not installed; host metrics are reported as null.")

    return jsonify({
        "system_status": "ONLINE",
        "camera_connected": camera_manager.is_opened(),
        "camera_error": camera_error_payload(),
        "ai_model_loaded": bool(getattr(face_detector, "face_mesh", None)),
        "model_name": "MediaPipe FaceMesh (468 landmarks) + MediaPipe Hands",
        "backend_version": "1.2.0",
        "fps": round(current_fps, 1),
        "cpu_usage_percent": cpu_percent,
        "memory_usage_mb": memory_mb,
        "platform": f"{platform.system()} {platform.release()} ({platform.machine()})",
        "hostname": platform.node(),
        "monitoring": is_monitoring,
        "sensor_bus": "NOT CONNECTED",
        "gps": "NOT CONNECTED",
        "emergency_system": "ACTIVE_STANDBY" if not active_incident else active_incident["status"],
        "demo_mode": demo_mode
    })


@app.route("/api/risk")
def api_risk():
    return jsonify({
        "risk_score": latest_telemetry.get("risk_score", 15),
        "risk_level": latest_telemetry.get("risk_level", "LOW"),
        "status": latest_telemetry.get("status", "AWAKE"),
        "timestamp": time.strftime("%H:%M:%S")
    })


@app.route("/api/detections")
def api_detections():
    """Detector states backed by the live pipeline. Uninstrumented sensors are
    reported as disconnected rather than filled with plausible-looking values."""
    phone_det = latest_telemetry.get("phone_detected", False)
    face_count = latest_telemetry.get("face_count")
    return jsonify({
        "eyes": {
            "name": "Eye Aspect Ratio (EAR)",
            "status": "CLOSED" if latest_telemetry.get("is_eyes_closed") else "OPEN",
            "value": f"EAR {latest_telemetry.get('average_ear', 0.0):.3f}",
            "connected": True
        },
        "face": {
            "name": "Face & head presence",
            "status": latest_telemetry.get("status", "NO_DRIVER"),
            "value": f"{face_count} face(s) in frame" if face_count is not None else "Awaiting frames",
            "connected": True
        },
        "phone": {
            "name": "Phone usage detection",
            "status": "PHONE DETECTED" if phone_det else "NO PHONE DETECTED",
            "value": "Handheld device detected - alarm active" if phone_det else "No handheld device detected",
            "connected": True
        },
        "fatigue": {
            "name": "Drowsiness state machine",
            "status": latest_telemetry.get("status", "AWAKE"),
            "value": f"Closure {latest_telemetry.get('closed_duration', 0.0):.1f}s",
            "connected": True
        },
        "alcohol": {
            "name": "Alcohol impairment sensor",
            "status": "NOT CONNECTED",
            "value": "No breath sensor hardware attached",
            "connected": False
        },
        "vehicle": {
            "name": "Vehicle telemetry (speed, GPS)",
            "status": "NOT CONNECTED",
            "value": "No vehicle bus or GPS receiver attached",
            "connected": False
        }
    })


@app.route("/api/alerts")
def api_alerts():
    return jsonify(alerts_db)


@app.route("/api/alerts/<alert_id>/acknowledge", methods=["POST"])
def api_ack_alert(alert_id):
    for alert in alerts_db:
        if alert["id"] == alert_id:
            alert["acknowledged"] = True
            return jsonify({"status": "ok", "message": f"Alert {alert_id} acknowledged"})
    return jsonify({"status": "error", "message": "Alert ID not found"}), 404


@app.route("/api/analytics")
def api_analytics():
    """Aggregates the current session only. This server keeps no trip history,
    so no cross-day trend or 'safe driving %' is reported."""
    unacknowledged = len([a for a in alerts_db if not a.get("acknowledged")])
    return jsonify({
        "source": "live_session" if monitoring_duration > 0 else "no_session",
        "session_duration_seconds": round(monitoring_duration, 1),
        "session_duration": format_duration(monitoring_duration),
        "drowsiness_events": latest_telemetry.get("drowsiness_events", 0),
        "longest_closure_seconds": round(latest_telemetry.get("longest_closure", 0.0), 2),
        "closed_duration_seconds": round(latest_telemetry.get("closed_duration", 0.0), 2),
        "session_average_ear": round(latest_telemetry.get("session_avg_ear", 0.0), 3),
        "current_risk_score": latest_telemetry.get("risk_score", 0),
        "current_status": latest_telemetry.get("status", "AWAKE"),
        "phone_detected_now": bool(latest_telemetry.get("phone_detected", False)),
        "alerts_total": len(alerts_db),
        "alerts_unacknowledged": unacknowledged,
        "incidents_total": len(incidents_db),
        "incidents_critical": len([i for i in incidents_db if i.get("severity") == "CRITICAL"]),
        "history_persisted": False,
        "note": "Current session only. Trip history is not persisted by this build."
    })


@app.route("/api/driver")
def api_driver():
    """This build has no driver roster or vehicle database. Rather than
    inventing an identity, the endpoint reports that plainly."""
    return jsonify({
        "status": "not_configured",
        "driver": None,
        "vehicle": None,
        "note": "No driver or vehicle profile is configured. Netrakshak monitors the "
                "person in front of the camera; it does not store roster data."
    })


# ----------------------------------------------------
# EMERGENCY RESPONSE SYSTEM REST API ENDPOINTS
# ----------------------------------------------------

@app.route("/api/emergency/incidents")
def api_get_incidents():
    return jsonify(incidents_db)


@app.route("/api/emergency/incidents/active")
def api_get_active_incident():
    return jsonify({"active_incident": active_incident})


@app.route("/api/emergency/incidents/<incident_id>")
def api_get_incident_detail(incident_id):
    if active_incident and active_incident["incident_id"] == incident_id:
        return jsonify(active_incident)
    for inc in incidents_db:
        if inc["incident_id"] == incident_id:
            return jsonify(inc)
    return jsonify({"status": "error", "message": "Incident not found"}), 404


@app.route("/api/emergency/detect", methods=["POST"])
def api_emergency_detect():
    global active_incident

    data = request.get_json(silent=True) or {}
    if "g_force" not in data or "speed_drop_kmh" not in data:
        return jsonify({
            "status": "error",
            "message": "Sensor payload required. This build has no accelerometer or OBD bus, "
                       "so g_force and speed_drop_kmh must be supplied by the caller "
                       "(use /api/emergency/simulate for a labelled simulation)."
        }), 400

    g_force = float(data["g_force"])
    speed_drop = float(data["speed_drop_kmh"])
    rotation = float(data.get("rotation_deg_sec") or 0.0)
    driver_status = data.get("driver_status", latest_telemetry.get("status", "AWAKE"))
    eye_closed_dur = float(data.get("eye_closed_duration") or 0.0)
    cv_cue = bool(data.get("cv_collision_cue", False))

    sensor_payload = {
        "g_force": g_force,
        "speed_drop_kmh": speed_drop,
        "rotation_deg_sec": rotation,
        "driver_status": driver_status,
        "eye_closed_duration": eye_closed_dur,
        "cv_collision_cue": cv_cue
    }

    confidence_score, severity, driver_condition = accident_detector.calculate_accident_confidence(sensor_payload)
    inc_id = f"NTK-2026-{uuid.uuid4().hex[:6].upper()}"

    # Location is only recorded when the caller supplies it. No GPS is attached.
    location_obj = None
    if data.get("latitude") is not None and data.get("longitude") is not None:
        location_obj = {
            "latitude": float(data["latitude"]),
            "longitude": float(data["longitude"]),
            "address": data.get("address"),
            "source": data.get("location_source", "caller_supplied")
        }

    timeline = [
        {"time": time.strftime("%H:%M:%S"), "title": "Impact reported",
         "desc": f"G-force {g_force}g, speed drop {speed_drop} km/h, rotation {rotation} deg/s"},
        {"time": time.strftime("%H:%M:%S"), "title": "Confidence assessed",
         "desc": f"Confidence {confidence_score}% - severity {severity}"}
    ]
    if location_obj:
        timeline.append({
            "time": time.strftime("%H:%M:%S"),
            "title": "Location attached",
            "desc": f"{location_obj.get('address') or 'coords only'} "
                    f"({location_obj['latitude']}, {location_obj['longitude']}) - {location_obj['source']}"
        })
    else:
        timeline.append({
            "time": time.strftime("%H:%M:%S"),
            "title": "No location available",
            "desc": "No GPS receiver or caller coordinates were supplied."
        })

    active_incident = {
        "id": str(uuid.uuid4()),
        "incident_id": inc_id,
        "timestamp": time.strftime("%H:%M:%S"),
        "date": time.strftime("%Y-%m-%d"),
        "created_at": time.time(),
        "confidence": confidence_score,
        "severity": severity,
        "status": "CRITICAL_ACCIDENT" if confidence_score >= 90 else "VERIFYING",
        "driver_condition": driver_condition,
        "location": location_obj,
        "speed_before": data.get("speed_kmh"),
        "speed_after": data.get("speed_after_kmh"),
        "verification_seconds_remaining": 0 if confidence_score >= 90 else 15,
        "is_simulated": bool(data.get("is_simulated", False)),
        "timeline": timeline
    }

    if confidence_score >= 90:
        notifs = notification_service.dispatch_emergency_notifications(
            inc_id, severity, location_obj, emergency_contacts_db, is_simulated=active_incident["is_simulated"]
        )
        active_incident["status"] = "CONFIRMED"
        active_incident["notifications"] = notifs
        active_incident["timeline"].append({
            "time": time.strftime("%H:%M:%S"),
            "title": "Emergency Dispatch Initiated",
            "desc": f"Dispatched notifications to {len(notifs)} emergency channels"
        })

    incidents_db.insert(0, active_incident)
    logger.info(f"Accident event detected: Incident {inc_id} (Confidence: {confidence_score}%)")
    return jsonify({"status": "ok", "incident": active_incident})


@app.route("/api/emergency/incidents/<incident_id>/cancel", methods=["POST"])
def api_emergency_cancel(incident_id):
    global active_incident
    if active_incident and active_incident["incident_id"] == incident_id:
        active_incident["status"] = "CANCELLED"
        active_incident["resolved_at"] = time.time()
        active_incident["timeline"].append({
            "time": time.strftime("%H:%M:%S"),
            "title": "Incident Cancelled by Driver",
            "desc": "Driver confirmed 'I'M SAFE'. False alarm cancelled."
        })
        canceled_ref = active_incident
        active_incident = None
        return jsonify({"status": "ok", "message": "Emergency incident cancelled by driver", "incident": canceled_ref})

    for inc in incidents_db:
        if inc["incident_id"] == incident_id:
            inc["status"] = "CANCELLED"
            return jsonify({"status": "ok", "message": "Incident cancelled", "incident": inc})

    return jsonify({"status": "error", "message": "Incident not found"}), 404


@app.route("/api/emergency/incidents/<incident_id>/request_help", methods=["POST"])
def api_emergency_request_help(incident_id):
    global active_incident
    target_inc = active_incident if (active_incident and active_incident["incident_id"] == incident_id) else None

    if not target_inc:
        for inc in incidents_db:
            if inc["incident_id"] == incident_id:
                target_inc = inc
                break

    if target_inc:
        target_inc["status"] = "CONFIRMED"
        notifs = notification_service.dispatch_emergency_notifications(
            incident_id, target_inc["severity"], target_inc["location"], emergency_contacts_db, is_simulated=target_inc.get("is_simulated", False)
        )
        target_inc["notifications"] = notifs
        target_inc["timeline"].append({
            "time": time.strftime("%H:%M:%S"),
            "title": "Immediate Help Requested",
            "desc": f"Driver manually triggered immediate dispatch ({len(notifs)} channels notified)"
        })
        return jsonify({"status": "ok", "message": "Emergency notifications dispatched", "incident": target_inc})

    return jsonify({"status": "error", "message": "Incident not found"}), 404


@app.route("/api/emergency/incidents/<incident_id>/resolve", methods=["POST"])
def api_emergency_resolve(incident_id):
    global active_incident
    if active_incident and active_incident["incident_id"] == incident_id:
        active_incident["status"] = "RESOLVED"
        active_incident["resolved_at"] = time.time()
        active_incident["timeline"].append({
            "time": time.strftime("%H:%M:%S"),
            "title": "Incident Resolved",
            "desc": "Emergency response team on scene. Incident marked resolved."
        })
        resolved_ref = active_incident
        active_incident = None
        return jsonify({"status": "ok", "message": "Incident resolved", "incident": resolved_ref})

    return jsonify({"status": "error", "message": "Incident not found"}), 404


@app.route("/api/emergency/contacts", methods=["GET", "POST"])
def api_emergency_contacts():
    if request.method == "POST":
        data = request.get_json(silent=True) or {}
        new_cnt = {
            "id": f"CNT-{len(emergency_contacts_db) + 1:03d}",
            "name": data.get("name", "Emergency Contact"),
            "relationship": data.get("relationship", "Contact"),
            "phone": data.get("phone", ""),
            "priority": int(data.get("priority", 1)),
            "active": True,
            "is_sample": False
        }
        emergency_contacts_db.append(new_cnt)
        return jsonify({"status": "ok", "contact": new_cnt})

    return jsonify(emergency_contacts_db)


@app.route("/api/emergency/simulate", methods=["POST"])
def api_emergency_simulate():
    """Labelled simulation used by the UI demo. Coordinates are fixtures and are
    marked as such on the incident payload."""
    sim_data = {
        "g_force": 5.4,
        "speed_drop_kmh": 62.0,
        "rotation_deg_sec": 45.0,
        "driver_status": "DROWSY",
        "eye_closed_duration": 3.2,
        "cv_collision_cue": True,
        "is_simulated": True,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "address": "Simulated location (fixture coordinates, no GPS hardware)",
        "location_source": "simulated_fixture"
    }
    return api_emergency_detect_with_data(sim_data)


def api_emergency_detect_with_data(data: dict):
    global active_incident

    g_force = float(data.get("g_force", 5.4))
    speed_drop = float(data.get("speed_drop_kmh", 62.0))
    rotation = float(data.get("rotation_deg_sec", 45.0))
    driver_status = data.get("driver_status", "DROWSY")
    eye_closed_dur = float(data.get("eye_closed_duration", 3.2))
    cv_cue = bool(data.get("cv_collision_cue", True))

    sensor_payload = {
        "g_force": g_force,
        "speed_drop_kmh": speed_drop,
        "rotation_deg_sec": rotation,
        "driver_status": driver_status,
        "eye_closed_duration": eye_closed_dur,
        "cv_collision_cue": cv_cue
    }

    confidence_score, severity, driver_condition = accident_detector.calculate_accident_confidence(sensor_payload)
    inc_id = f"NTK-2026-{uuid.uuid4().hex[:6].upper()}"

    location_obj = {
        "latitude": float(data.get("latitude", 28.6139)),
        "longitude": float(data.get("longitude", 77.2090)),
        "address": data.get("address", "Simulated location (fixture coordinates, no GPS hardware)"),
        "source": data.get("location_source", "simulated_fixture")
    }

    notifs = notification_service.dispatch_emergency_notifications(
        inc_id, severity, location_obj, emergency_contacts_db, is_simulated=True
    )

    active_incident = {
        "id": str(uuid.uuid4()),
        "incident_id": inc_id,
        "timestamp": time.strftime("%H:%M:%S"),
        "date": time.strftime("%Y-%m-%d"),
        "created_at": time.time(),
        "confidence": confidence_score,
        "severity": severity,
        "status": "CONFIRMED",
        "driver_condition": driver_condition,
        "location": location_obj,
        "speed_before": None,
        "speed_after": None,
        "verification_seconds_remaining": 0,
        "is_simulated": True,
        "notifications": notifs,
        "timeline": [
            {"time": time.strftime("%H:%M:%S"), "title": "Simulated impact", "desc": f"Fixture deceleration {g_force}g, speed drop {speed_drop} km/h"},
            {"time": time.strftime("%H:%M:%S"), "title": "Confidence assessed", "desc": f"Confidence {confidence_score}% - severity {severity}"},
            {"time": time.strftime("%H:%M:%S"), "title": "Simulated location attached", "desc": location_obj['address']},
            {"time": time.strftime("%H:%M:%S"), "title": "Simulated dispatch", "desc": f"{len(notifs)} notification records generated by the simulated gateway"}
        ]
    }

    incidents_db.insert(0, active_incident)
    return jsonify({"status": "ok", "incident": active_incident})


@app.route("/api/emergency/test", methods=["POST"])
def api_emergency_test():
    """Genuine self-check. Each flag is read from the running process; nothing is
    asserted to pass unless it was actually verified here."""
    camera_ok = camera_manager.is_opened()
    results = {
        "checked_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "camera": {
            "ready": camera_ok,
            "demo_mode": demo_mode,
            "detail": f"device index {config.CAMERA_INDEX}" if camera_ok else camera_error_payload()
        },
        "face_mesh": {"ready": bool(getattr(face_detector, "face_mesh", None))},
        "hand_tracking": {"ready": bool(getattr(phone_detector, "hands", None))},
        "alarm_audio": {"ready": os.path.exists(config.ALARM_FILE), "path": str(config.ALARM_FILE)},
        "incident_engine": {"ready": callable(getattr(accident_detector, "calculate_accident_confidence", None))},
        "contacts_real": len([c for c in emergency_contacts_db if not c.get("is_sample")]),
        "contacts_sample": len([c for c in emergency_contacts_db if c.get("is_sample")]),
        "incidents_recorded": len(incidents_db),
        "gps": "NOT CONNECTED",
        "dispatch": "SIMULATED_GATEWAY - no SMS, telephony or webhook provider is configured",
    }
    return jsonify(results)


@app.route("/api/demo_mode", methods=["POST"])
def api_toggle_demo():
    global demo_mode, latest_telemetry
    data = request.get_json(silent=True) or {}
    if "enable" in data:
        demo_mode = bool(data["enable"])
    else:
        demo_mode = not demo_mode

    if demo_mode:
        latest_telemetry["status"] = "DROWSY"
        latest_telemetry["risk_score"] = 78
        latest_telemetry["risk_level"] = "HIGH"
        latest_telemetry["is_eyes_closed"] = True
        latest_telemetry["closed_duration"] = 2.4
        latest_telemetry["phone_detected"] = True
        latest_telemetry["phone_status"] = "PHONE_DETECTED"
        latest_telemetry["demo_mode"] = True
    else:
        latest_telemetry["demo_mode"] = False

    logger.info(f"Demo mode set to: {demo_mode}")
    return jsonify({"status": "ok", "demo_mode": demo_mode})


@app.route("/api/process_frame", methods=["POST"])
def api_process_frame():
    global is_monitoring, fps_frame_count, fps_start_time, current_fps, latest_telemetry, monitoring_duration

    import base64
    import numpy as np

    data = request.get_json(silent=True) or {}
    image_data = data.get("image", "")

    if not image_data:
        return jsonify({"status": "error", "message": "No image data provided"}), 400

    try:
        if "," in image_data:
            image_data = image_data.split(",")[1]

        img_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"status": "error", "message": "Invalid frame decode"}), 400

        h, w, _ = frame.shape

        fps_frame_count += 1
        now = time.monotonic()
        elapsed = now - fps_start_time
        if elapsed >= 1.0:
            current_fps = fps_frame_count / elapsed
            fps_frame_count = 0
            fps_start_time = now

        if session_start_time > 0:
            monitoring_duration = now - session_start_time

        face_status, landmarks, bbox, face_count = face_detector.detect(frame)
        eye_telemetry = eye_detector.analyze_eyes(landmarks, w, h)
        drowsy_telemetry = drowsiness_detector.update(eye_telemetry["average_ear"], face_status)
        phone_res = phone_detector.process_frame(frame, landmarks)
        phone_detected = phone_res["phone_detected"]

        combined = {
            **eye_telemetry,
            **drowsy_telemetry,
            "face_status": face_status,
            "face_bbox": bbox,
            "face_count": face_count,
            "phone_detected": phone_detected,
            "phone_status": phone_res["phone_status"]
        }
        risk_level = risk_engine.evaluate_risk(combined)
        risk_score = calculate_numeric_risk_score(
            drowsy_telemetry["status"],
            drowsy_telemetry["closed_duration"],
            drowsy_telemetry["drowsiness_events"],
            phone_detected=phone_detected
        )
        combined["risk_level"] = "HIGH" if phone_detected and risk_level != "CRITICAL" else risk_level
        combined["risk_score"] = risk_score

        if drowsy_telemetry["status"] == "DROWSY" or risk_level == "CRITICAL" or phone_detected:
            alarm_manager.start_alarm()
        else:
            alarm_manager.stop_alarm()

        latest_telemetry = {
            **combined,
            "monitoring_duration": monitoring_duration,
            "monitoring_duration_formatted": format_duration(monitoring_duration),
            "fps": current_fps,
            "is_monitoring": True,
            "demo_mode": demo_mode
        }

        status = combined.get("status", "AWAKE")
        avg_ear = combined.get("average_ear", 0.0)
        left_ear = combined.get("left_ear", 0.0)
        right_ear = combined.get("right_ear", 0.0)
        left_pts = combined.get("left_contour_points", [])
        right_pts = combined.get("right_contour_points", [])

        status_colors = {
            "AWAKE": (129, 185, 16),
            "CAUTION": (11, 158, 245),
            "DROWSY": (68, 68, 239),
            "NO_DRIVER": (139, 116, 100),
            "MULTIPLE_FACES": (22, 115, 249)
        }
        theme_color = (68, 68, 239) if phone_detected else status_colors.get(status, (255, 255, 255))

        if left_pts:
            cv2.polylines(frame, [np.array(left_pts, dtype=np.int32)], True, theme_color, 2, cv2.LINE_AA)
        if right_pts:
            cv2.polylines(frame, [np.array(right_pts, dtype=np.int32)], True, theme_color, 2, cv2.LINE_AA)

        if bbox:
            x, y, bw, bh = bbox
            cv2.rectangle(frame, (x, y), (x + bw, y + bh), theme_color, 1, cv2.LINE_AA)

        if phone_res.get("bbox"):
            px, py, pbw, pbh = phone_res["bbox"]
            cv2.rectangle(frame, (px, py), (px + pbw, py + pbh), (0, 0, 255), 2)
            cv2.putText(frame, "MOBILE PHONE", (px, max(15, py - 5)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        cv2.rectangle(frame, (10, 10), (280, 85), (15, 23, 42), -1)
        cv2.rectangle(frame, (10, 10), (280, 85), theme_color, 1)
        cv2.putText(frame, f"STATUS: {'PHONE DISTRACTED' if phone_detected else status}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.55, theme_color, 2, cv2.LINE_AA)
        cv2.putText(frame, f"EAR: {avg_ear:.3f} (L:{left_ear:.2f} R:{right_ear:.2f})", (20, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (248, 250, 252), 1, cv2.LINE_AA)
        cv2.putText(frame, f"PHONE: {'DETECTED (ALARM)' if phone_detected else 'NOT DETECTED'}", (20, 78), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 255) if phone_detected else (16, 185, 129), 1, cv2.LINE_AA)

        if phone_detected:
            banner_y = h - 60
            cv2.rectangle(frame, (0, banner_y), (w, h), (0, 0, 220), -1)
            cv2.putText(frame, "PHONE USAGE DETECTED -- KEEP HANDS ON WHEEL!", (15, banner_y + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)
        elif status == "DROWSY":
            banner_y = h - 60
            cv2.rectangle(frame, (0, banner_y), (w, h), (68, 68, 239), -1)
            cv2.putText(frame, "DROWSINESS DETECTED - TAKE A BREAK!", (20, banner_y + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2, cv2.LINE_AA)

        _, enc_buf = cv2.imencode('.jpg', frame)
        out_b64 = base64.b64encode(enc_buf).decode('utf-8')

        return jsonify({
            "status": "ok",
            "telemetry": latest_telemetry,
            "annotated_image": f"data:image/jpeg;base64,{out_b64}"
        })
    except Exception as e:
        logger.error(f"Error processing browser frame: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/start", methods=["POST"])
def api_start():
    global is_monitoring, session_start_time, fps_start_time, fps_frame_count, camera_error
    if not is_monitoring:
        success, msg = camera_manager.start()
        if not success:
            camera_error = str(msg)
            return jsonify({
                "status": "error",
                "message": msg,
                "camera_connected": False,
                "hint": "Connect a webcam or switch the dashboard to browser webcam mode."
            }), 400
        camera_error = None
        is_monitoring = True
        session_start_time = time.monotonic()
        fps_start_time = time.monotonic()
        fps_frame_count = 0
        logger.info("Monitoring started via API.")
    return jsonify({"status": "ok", "message": "Monitoring started"})


@app.route("/api/stop", methods=["POST"])
def api_stop():
    global is_monitoring, latest_telemetry
    if is_monitoring:
        is_monitoring = False
        camera_manager.stop()
        alarm_manager.stop_alarm()
        latest_telemetry["status"] = "OFFLINE"
        latest_telemetry["is_monitoring"] = False
        logger.info("Monitoring stopped via API.")
    return jsonify({"status": "ok", "message": "Monitoring stopped"})


@app.route("/api/reset", methods=["POST"])
def api_reset():
    global session_start_time, monitoring_duration
    drowsiness_detector.reset_session()
    phone_detector.reset()
    session_start_time = time.monotonic() if is_monitoring else 0.0
    monitoring_duration = 0.0
    logger.info("Session reset via API.")
    return jsonify({"status": "ok", "message": "Session reset"})


# Static Production App Serving Routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_production_app(path):
    dist_dir = os.path.join(app.root_path, "frontend", "dist")
    target_file = os.path.join(dist_dir, path)

    if path != "" and os.path.exists(target_file):
        return send_from_directory(dist_dir, path)

    index_html = os.path.join(dist_dir, "index.html")
    if os.path.exists(index_html):
        return send_from_directory(dist_dir, "index.html")

    return render_template("index.html")


if __name__ == "__main__":
    SERVER_HOST = os.environ.get("HOST", "127.0.0.1")
    try:
        SERVER_PORT = int(os.environ.get("PORT", "5000"))
    except ValueError:
        SERVER_PORT = 5000

    logger.info(f"Starting Netrakshak Production Web Server at http://{SERVER_HOST}:{SERVER_PORT} ...")
    print("\n" + "="*60)
    print("NETRAKSHAK AI DRIVER SAFETY & EMERGENCY RESPONSE SYSTEM")
    print(f"Web Server Running at: http://{SERVER_HOST}:{SERVER_PORT}")
    print("="*60 + "\n")
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=config.DEBUG_MODE, threaded=True)
