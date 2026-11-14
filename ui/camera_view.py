"""
CameraView widget for live OpenCV video stream rendering with HUD landmark overlays.
"""

import time
from typing import Any, Dict, Optional, Tuple
import cv2
import numpy as np
from PIL import Image, ImageTk
import customtkinter as ctk
import tkinter as tk
from utils.logger import logger
import config


class CameraView(ctk.CTkFrame):
    """
    Renders OpenCV frame with real-time HUD overlays (landmarks, EAR metrics, alert borders).
    """

    def __init__(self, master, width: int = config.FRAME_WIDTH, height: int = config.FRAME_HEIGHT, **kwargs):
        super().__init__(master, fg_color=config.CARD_BG, corner_radius=12, border_width=2, border_color=config.CARD_BORDER, **kwargs)
        self.width = width
        self.height = height

        # Inner video display label
        self.video_label = ctk.CTkLabel(self, text="", width=self.width, height=self.height)
        self.video_label.pack(padx=10, pady=10, fill="both", expand=True)

        self._blank_image = self._create_placeholder_image("CAMERA STANDBY\nClick 'START MONITORING' to launch")
        self.update_placeholder("CAMERA STANDBY\nClick 'START MONITORING' to launch")

        # Flashing state for drowsy warning border
        self.flash_state = False
        self.last_flash_time = time.monotonic()

    def _create_placeholder_image(self, message: str) -> ImageTk.PhotoImage:
        """
        Create a dark placeholder image with centered error/info message.
        """
        img = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        img[:] = (15, 23, 42)  # BG_DARK (BGR)

        # Draw grid accent lines
        for y in range(0, self.height, 40):
            cv2.line(img, (0, y), (self.width, y), (30, 41, 59), 1)
        for x in range(0, self.width, 40):
            cv2.line(img, (x, 0), (x, self.height), (30, 41, 59), 1)

        # Draw centered message text
        lines = message.split("\n")
        y_start = self.height // 2 - (len(lines) * 20)
        for i, line in enumerate(lines):
            text_size = cv2.getTextSize(line, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            x_pos = (self.width - text_size[0]) // 2
            y_pos = y_start + (i * 35)
            cv2.putText(img, line, (x_pos, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (148, 163, 184), 2, cv2.LINE_AA)

        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        return ImageTk.PhotoImage(image=pil_img)

    def update_placeholder(self, message: str):
        """
        Display static placeholder text on canvas.
        """
        img_tk = self._create_placeholder_image(message)
        self.video_label.configure(image=img_tk, text="")
        self.video_label.image = img_tk

    def render_frame(self, frame_bgr: np.ndarray, telemetry: Dict[str, Any]):
        """
        Draw HUD graphics over BGR camera frame and display in GUI label.
        """
        if frame_bgr is None:
            return

        frame = frame_bgr.copy()
        h, w, _ = frame.shape

        status = telemetry.get("status", "AWAKE")
        face_status = telemetry.get("face_status", "SINGLE_FACE")
        avg_ear = telemetry.get("average_ear", 0.0)
        left_ear = telemetry.get("left_ear", 0.0)
        right_ear = telemetry.get("right_ear", 0.0)
        left_pts = telemetry.get("left_contour_points", [])
        right_pts = telemetry.get("right_contour_points", [])
        face_bbox = telemetry.get("face_bbox", None)

        # Color mapping
        status_colors = {
            "AWAKE": (129, 185, 16),      # Green (BGR)
            "CAUTION": (11, 158, 245),    # Yellow/Amber (BGR)
            "DROWSY": (68, 68, 239),      # Red (BGR)
            "NO_DRIVER": (139, 116, 100), # Gray (BGR)
            "MULTIPLE_FACES": (22, 115, 249) # Orange (BGR)
        }
        theme_color = status_colors.get(status, (255, 255, 255))

        # 1. Draw Eye Contours
        if left_pts:
            pts_arr = np.array(left_pts, dtype=np.int32)
            cv2.polylines(frame, [pts_arr], isClosed=True, color=theme_color, thickness=2, lineType=cv2.LINE_AA)
        if right_pts:
            pts_arr = np.array(right_pts, dtype=np.int32)
            cv2.polylines(frame, [pts_arr], isClosed=True, color=theme_color, thickness=2, lineType=cv2.LINE_AA)

        # 2. Draw Face Bounding Box
        if face_bbox:
            x, y, bw, bh = face_bbox
            cv2.rectangle(frame, (x, y), (x + bw, y + bh), theme_color, 1, cv2.LINE_AA)

        # 3. HUD Telemetry Banner Overlay (Top Left)
        cv2.rectangle(frame, (10, 10), (240, 75), (15, 23, 42), -1)  # Solid dark background card
        cv2.rectangle(frame, (10, 10), (240, 75), theme_color, 1)

        cv2.putText(frame, f"STATUS: {status}", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, theme_color, 2, cv2.LINE_AA)
        cv2.putText(frame, f"EAR: {avg_ear:.3f} (L:{left_ear:.2f} R:{right_ear:.2f})", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (248, 250, 252), 1, cv2.LINE_AA)

        # 4. Handle Drowsy Flashing Alert Overlay
        if status == "DROWSY":
            now = time.monotonic()
            if now - self.last_flash_time > 0.4:
                self.flash_state = not self.flash_state
                self.last_flash_time = now

            if self.flash_state:
                # Heavy Red Border
                cv2.rectangle(frame, (0, 0), (w - 1, h - 1), (68, 68, 239), 8)

            # Prominent Red Warning Banner at bottom of video feed
            banner_y = h - 60
            cv2.rectangle(frame, (0, banner_y), (w, h), (68, 68, 239), -1)
            cv2.putText(frame, "DROWSINESS DETECTED - TAKE A BREAK!", (20, banner_y + 38), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (255, 255, 255), 2, cv2.LINE_AA)

        elif face_status == "NO_DRIVER":
            banner_y = h - 50
            cv2.rectangle(frame, (0, banner_y), (w, h), (139, 116, 100), -1)
            cv2.putText(frame, "NO DRIVER DETECTED", (w // 2 - 110, banner_y + 32), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2, cv2.LINE_AA)

        elif face_status == "MULTIPLE_FACES":
            banner_y = h - 50
            cv2.rectangle(frame, (0, banner_y), (w, h), (22, 115, 249), -1)
            cv2.putText(frame, "WARNING: MULTIPLE FACES DETECTED", (w // 2 - 170, banner_y + 32), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)

        # Convert OpenCV BGR to RGB for Pillow
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        pil_img = Image.fromarray(rgb)
        img_tk = ImageTk.PhotoImage(image=pil_img)

        # Render on label
        self.video_label.configure(image=img_tk, text="")
        self.video_label.image = img_tk
