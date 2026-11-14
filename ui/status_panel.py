"""
StatusPanel widget for displaying primary driver safety indicators (Status, Risk Level, Eye State, FPS).
"""

from typing import Any, Dict
import customtkinter as ctk
import config


class StatusCard(ctk.CTkFrame):
    """
    Individual KPI card component with title, main value, and status color badge.
    """

    def __init__(self, master, title: str, default_value: str = "--", default_color: str = config.TEXT_MUTED, **kwargs):
        super().__init__(master, fg_color=config.CARD_BG, corner_radius=10, border_width=1, border_color=config.CARD_BORDER, **kwargs)

        self.title_label = ctk.CTkLabel(self, text=title.upper(), font=("Helvetica", 11, "bold"), text_color=config.TEXT_MUTED)
        self.title_label.pack(anchor="w", padx=14, pady=(10, 2))

        self.value_label = ctk.CTkLabel(self, text=default_value, font=("Helvetica", 20, "bold"), text_color=default_color)
        self.value_label.pack(anchor="w", padx=14, pady=(0, 10))

    def update_card(self, value: str, color: str = config.TEXT_MAIN):
        self.value_label.configure(text=value, text_color=color)


class StatusPanel(ctk.CTkFrame):
    """
    Grid container holding key safety cards: Driver Status, Risk Level, Eye Status, and FPS.
    """

    def __init__(self, master, **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)

        # Configure 4 columns
        self.grid_columnconfigure((0, 1, 2, 3), weight=1, uniform="status_group")

        self.card_status = StatusCard(self, title="DRIVER STATUS", default_value="OFFLINE", default_color=config.COLOR_NO_DRIVER)
        self.card_status.grid(row=0, column=0, padx=6, pady=4, sticky="ew")

        self.card_risk = StatusCard(self, title="RISK LEVEL", default_value="LOW", default_color=config.COLOR_AWAKE)
        self.card_risk.grid(row=0, column=1, padx=6, pady=4, sticky="ew")

        self.card_eye = StatusCard(self, title="EYE STATUS", default_value="OPEN", default_color=config.COLOR_AWAKE)
        self.card_eye.grid(row=0, column=2, padx=6, pady=4, sticky="ew")

        self.card_fps = StatusCard(self, title="FRAME RATE", default_value="0 FPS", default_color=config.ACCENT_BLUE)
        self.card_fps.grid(row=0, column=3, padx=6, pady=4, sticky="ew")

    def update_metrics(self, telemetry: Dict[str, Any], fps: float):
        status = telemetry.get("status", "OFFLINE")
        risk = telemetry.get("risk_level", "LOW")
        is_closed = telemetry.get("is_eyes_closed", False)
        closed_duration = telemetry.get("closed_duration", 0.0)

        # Color mapping for Status
        status_colors = {
            "AWAKE": config.COLOR_AWAKE,
            "CAUTION": config.COLOR_CAUTION,
            "DROWSY": config.COLOR_DROWSY,
            "NO_DRIVER": config.COLOR_NO_DRIVER,
            "MULTIPLE_FACES": config.COLOR_MULTI_FACE,
            "OFFLINE": config.TEXT_MUTED
        }
        status_color = status_colors.get(status, config.TEXT_MAIN)
        self.card_status.update_card(status, status_color)

        # Color mapping for Risk
        risk_colors = {
            "LOW": config.COLOR_AWAKE,
            "MEDIUM": config.COLOR_CAUTION,
            "HIGH": config.COLOR_DROWSY,
            "CRITICAL": config.COLOR_DROWSY,
            "UNKNOWN": config.COLOR_NO_DRIVER,
            "WARNING": config.COLOR_MULTI_FACE
        }
        risk_color = risk_colors.get(risk, config.TEXT_MAIN)
        self.card_risk.update_card(risk, risk_color)

        # Eye Card Text
        if is_closed:
            eye_text = f"CLOSED ({closed_duration:.1f}s)"
            eye_color = config.COLOR_DROWSY if closed_duration >= 2.0 else config.COLOR_CAUTION
        else:
            eye_text = "OPEN"
            eye_color = config.COLOR_AWAKE

        if status == "NO_DRIVER":
            eye_text = "--"
            eye_color = config.COLOR_NO_DRIVER

        self.card_eye.update_card(eye_text, eye_color)

        # FPS Card Text
        self.card_fps.update_card(f"{int(round(fps))} FPS", config.ACCENT_BLUE if fps > 15 else config.COLOR_CAUTION)
