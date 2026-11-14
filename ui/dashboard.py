"""
DashboardWindow — Main Netrakshak Dashboard Application Window.
Assembles header, video view, status panel, telemetry widgets, and control toolbar.
"""

import queue
import threading
import time
from typing import Optional
import customtkinter as ctk
import cv2
import numpy as np

import config
from core.alarm_manager import AlarmManager
from core.camera import CameraManager
from core.drowsiness_detector import DrowsinessDetector
from core.eye_detector import EyeDetector
from core.face_detector import FaceDetector
from core.risk_engine import RiskEngine
from ui.camera_view import CameraView
from ui.status_panel import StatusPanel
from ui.widgets import EventLogPanel, EyeMetricsPanel, SessionStatsPanel
from utils.logger import logger

# Set CustomTkinter theme
ctk.set_appearance_mode("Dark")
ctk.set_default_color_theme("blue")


class NetrakshakDashboard(ctk.CTk):
    """
    Main Netrakshak Application Window.
    """

    def __init__(self):
        super().__init__()

        self.title(f"{config.APP_NAME} — {config.APP_TAGLINE}")
        self.geometry("1100x720")
        self.minsize(980, 650)
        self.configure(fg_color=config.BG_DARK)

        # Core Engines
        self.camera_manager = CameraManager()
        self.face_detector = FaceDetector()
        self.eye_detector = EyeDetector()
        self.drowsiness_detector = DrowsinessDetector()
        self.risk_engine = RiskEngine()
        self.alarm_manager = AlarmManager()

        # Threading & State Control
        self.is_monitoring = False
        self.worker_thread: Optional[threading.Thread] = None
        self.telemetry_queue = queue.Queue(maxsize=2)

        # FPS & Timing Trackers
        self.session_start_time: float = 0.0
        self.monitoring_duration: float = 0.0
        self.fps_frame_count: int = 0
        self.fps_start_time: float = time.monotonic()
        self.current_fps: float = 0.0
        self.last_logged_status: str = ""

        # Build UI layout
        self._build_ui()

        # Bind window close event
        self.protocol("WM_DELETE_WINDOW", self.on_exit)

        logger.info("Netrakshak Dashboard UI initialized.")

    def _build_ui(self):
        # 1. Header Banner
        header = ctk.CTkFrame(self, fg_color=config.CARD_BG, corner_radius=0, height=65)
        header.pack(fill="x", side="top")
        header.pack_propagate(False)

        # Title & Subtitle Container
        title_box = ctk.CTkFrame(header, fg_color="transparent")
        title_box.pack(side="left", padx=20, pady=10)

        ctk.CTkLabel(
            title_box,
            text=f"🛡️ {config.APP_NAME}",
            font=("Helvetica", 20, "bold"),
            text_color=config.TEXT_MAIN
        ).pack(side="left")

        ctk.CTkLabel(
            title_box,
            text=f" |  {config.APP_TAGLINE}",
            font=("Helvetica", 13),
            text_color=config.TEXT_MUTED
        ).pack(side="left", padx=(5, 0))

        # System Status Badge (Top Right)
        self.lbl_system_status = ctk.CTkLabel(
            header,
            text="SYSTEM READY",
            font=("Helvetica", 11, "bold"),
            text_color=config.COLOR_AWAKE,
            fg_color="#064E3B",
            corner_radius=6,
            padx=12,
            pady=4
        )
        self.lbl_system_status.pack(side="right", padx=20)

        # 2. Main Content Grid (Left: Camera Stream, Right: Dashboard Cards)
        main_container = ctk.CTkFrame(self, fg_color="transparent")
        main_container.pack(fill="both", expand=True, padx=16, pady=12)

        main_container.grid_columnconfigure(0, weight=6)
        main_container.grid_columnconfigure(1, weight=5)
        main_container.grid_rowconfigure(0, weight=1)

        # Left Side — Camera Stream Frame
        left_box = ctk.CTkFrame(main_container, fg_color="transparent")
        left_box.grid(row=0, column=0, sticky="nsew", padx=(0, 8))

        self.camera_view = CameraView(left_box, width=config.FRAME_WIDTH, height=config.FRAME_HEIGHT)
        self.camera_view.pack(fill="both", expand=True)

        # Right Side — Safety Analytics Panels
        right_box = ctk.CTkFrame(main_container, fg_color="transparent")
        right_box.grid(row=0, column=1, sticky="nsew", padx=(8, 0))

        # Status Cards Panel (Top)
        self.status_panel = StatusPanel(right_box)
        self.status_panel.pack(fill="x", pady=(0, 8))

        # Eye EAR Metrics Panel
        self.eye_panel = EyeMetricsPanel(right_box)
        self.eye_panel.pack(fill="x", pady=4)

        # Session Stats Panel
        self.session_panel = SessionStatsPanel(right_box, on_reset_callback=self.on_reset_session)
        self.session_panel.pack(fill="x", pady=4)

        # Real-time Event Log
        self.event_log = EventLogPanel(right_box)
        self.event_log.pack(fill="both", expand=True, pady=(4, 0))

        # 3. Control Footer Toolbar
        footer = ctk.CTkFrame(self, fg_color=config.CARD_BG, corner_radius=0, height=65)
        footer.pack(fill="x", side="bottom")
        footer.pack_propagate(False)

        btn_container = ctk.CTkFrame(footer, fg_color="transparent")
        btn_container.pack(side="right", padx=20, pady=12)

        self.btn_start = ctk.CTkButton(
            btn_container,
            text="▶  START MONITORING",
            font=("Helvetica", 12, "bold"),
            fg_color="#059669",
            hover_color="#10B981",
            width=160,
            height=38,
            command=self.start_monitoring
        )
        self.btn_start.pack(side="left", padx=6)

        self.btn_stop = ctk.CTkButton(
            btn_container,
            text="⏹  STOP MONITORING",
            font=("Helvetica", 12, "bold"),
            fg_color="#475569",
            hover_color="#64748B",
            width=160,
            height=38,
            state="disabled",
            command=self.stop_monitoring
        )
        self.btn_stop.pack(side="left", padx=6)

        self.btn_reset_main = ctk.CTkButton(
            btn_container,
            text="🔄  RESET SESSION",
            font=("Helvetica", 12, "bold"),
            fg_color="#334155",
            hover_color="#475569",
            width=140,
            height=38,
            command=self.on_reset_session
        )
        self.btn_reset_main.pack(side="left", padx=6)

        self.btn_exit = ctk.CTkButton(
            btn_container,
            text="✕  EXIT",
            font=("Helvetica", 12, "bold"),
            fg_color="#991B1B",
            hover_color="#DC2626",
            width=100,
            height=38,
            command=self.on_exit
        )
        self.btn_exit.pack(side="left", padx=6)

    def start_monitoring(self):
        """
        Start camera stream and processing worker thread.
        """
        if self.is_monitoring:
            return

        success, err_msg = self.camera_manager.start()
        if not success:
            self.event_log.log_event(f"Camera failure: {err_msg}", level="WARNING")
            self.camera_view.update_placeholder(f"CAMERA UNAVAILABLE\n{err_msg}")
            return

        self.is_monitoring = True
        self.session_start_time = time.monotonic()
        self.fps_start_time = time.monotonic()
        self.fps_frame_count = 0

        # Update Buttons & Status Badge
        self.btn_start.configure(state="disabled", fg_color="#064E3B")
        self.btn_stop.configure(state="normal", fg_color="#DC2626")
        self.lbl_system_status.configure(text="SYSTEM ACTIVE", text_color="#10B981", fg_color="#064E3B")

        self.event_log.log_event("Driver safety monitoring started.", level="INFO")

        # Launch Background Worker Thread
        self.worker_thread = threading.Thread(target=self._processing_worker, daemon=True)
        self.worker_thread.start()

        # Start Tkinter Poll Loop
        self.after(20, self._poll_queue)

    def stop_monitoring(self):
        """
        Stop monitoring and release camera stream safely.
        """
        if not self.is_monitoring:
            return

        self.is_monitoring = False
        self.camera_manager.stop()
        self.alarm_manager.stop_alarm()

        # Update Buttons & Status Badge
        self.btn_start.configure(state="normal", fg_color="#059669")
        self.btn_stop.configure(state="disabled", fg_color="#475569")
        self.lbl_system_status.configure(text="SYSTEM STANDBY", text_color="#F59E0B", fg_color="#78350F")

        self.camera_view.update_placeholder("MONITORING STOPPED\nClick 'START MONITORING' to resume")

        # Reset Status Cards
        offline_telemetry = {"status": "OFFLINE", "risk_level": "LOW", "is_eyes_closed": False}
        self.status_panel.update_metrics(offline_telemetry, 0.0)

        self.event_log.log_event("Driver safety monitoring stopped.", level="INFO")

    def on_reset_session(self):
        """
        Reset session timers and counters.
        """
        self.drowsiness_detector.reset_session()
        self.session_start_time = time.monotonic() if self.is_monitoring else 0.0
        self.monitoring_duration = 0.0
        self.session_panel.update_stats(0.0, 0, 0.0, 0.0)
        self.event_log.log_event("Session statistics reset.", level="INFO")

    def _processing_worker(self):
        """
        Background thread executing Computer Vision pipeline.
        """
        while self.is_monitoring:
            ret, frame = self.camera_manager.read_frame()
            if not ret or frame is None:
                time.sleep(0.01)
                continue

            h, w, _ = frame.shape

            # 1. Face Mesh Detection
            face_status, landmarks, bbox, face_count = self.face_detector.detect(frame)

            # 2. Eye Landmark & EAR Calculation
            eye_telemetry = self.eye_detector.analyze_eyes(landmarks, w, h)

            # 3. Drowsiness Time State Machine
            drowsy_telemetry = self.drowsiness_detector.update(
                eye_telemetry["average_ear"],
                face_status
            )

            # 4. Risk Engine Assessment
            combined_telemetry = {
                **eye_telemetry,
                **drowsy_telemetry,
                "face_status": face_status,
                "face_bbox": bbox,
                "face_count": face_count
            }
            risk_level = self.risk_engine.evaluate_risk(combined_telemetry)
            combined_telemetry["risk_level"] = risk_level

            # 5. Handle Alarm State
            if drowsy_telemetry["status"] == "DROWSY" or risk_level == "CRITICAL":
                self.alarm_manager.start_alarm()
            else:
                self.alarm_manager.stop_alarm()

            # Push to UI queue (drop oldest frame if queue full)
            if self.telemetry_queue.full():
                try:
                    self.telemetry_queue.get_nowait()
                except queue.Empty:
                    pass
            self.telemetry_queue.put((frame, combined_telemetry))

            # FPS Control (~30 FPS max loop)
            time.sleep(0.015)

    def _poll_queue(self):
        """
        Main Tkinter UI loop polling processed telemetry from queue.
        """
        if not self.is_monitoring:
            return

        # 1. Update Session Duration Timer
        if self.session_start_time > 0:
            self.monitoring_duration = time.monotonic() - self.session_start_time

        # 2. Calculate FPS
        self.fps_frame_count += 1
        now = time.monotonic()
        elapsed = now - self.fps_start_time
        if elapsed >= 1.0:
            self.current_fps = self.fps_frame_count / elapsed
            self.fps_frame_count = 0
            self.fps_start_time = now

        # 3. Process latest queued frame
        try:
            while not self.telemetry_queue.empty():
                frame, telemetry = self.telemetry_queue.get_nowait()

                # Render Video HUD
                self.camera_view.render_frame(frame, telemetry)

                # Update Status Panel Cards
                self.status_panel.update_metrics(telemetry, self.current_fps)

                # Update Eye EAR Metrics
                self.eye_panel.update_metrics(telemetry)

                # Update Session Stats
                self.session_panel.update_stats(
                    self.monitoring_duration,
                    telemetry.get("drowsiness_events", 0),
                    telemetry.get("longest_closure", 0.0),
                    telemetry.get("session_avg_ear", 0.0)
                )

                # Log State Transitions in Event Log
                status = telemetry.get("status", "AWAKE")
                if status != self.last_logged_status:
                    if status == "DROWSY":
                        self.event_log.log_event("DROWSINESS WARNING DETECTED! Alarm triggered.", level="ALERT")
                    elif status == "CAUTION":
                        self.event_log.log_event("Caution: Driver eyes closed for > 1 sec.", level="WARNING")
                    elif status == "AWAKE" and self.last_logged_status in ["DROWSY", "CAUTION"]:
                        self.event_log.log_event("Driver eyes reopened. Driver Awake.", level="INFO")
                    elif status == "NO_DRIVER":
                        self.event_log.log_event("Warning: No driver detected in camera frame.", level="WARNING")
                    elif status == "MULTIPLE_FACES":
                        self.event_log.log_event("Warning: Multiple faces visible in camera.", level="WARNING")
                    self.last_logged_status = status

        except queue.Empty:
            pass

        # Reschedule next poll cycle (~50 FPS UI refresh)
        if self.is_monitoring:
            self.after(20, self._poll_queue)

    def on_exit(self):
        """
        Clean shutdown of all threads, camera streams, and UI.
        """
        logger.info("Shutting down Netrakshak application...")
        self.stop_monitoring()
        self.alarm_manager.shutdown()
        self.face_detector.close()
        self.destroy()
