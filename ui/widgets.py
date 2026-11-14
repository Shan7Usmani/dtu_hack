"""
Custom UI widgets for Netrakshak (Eye Metrics, Session Statistics, Event Log).
"""

from datetime import datetime
from typing import Any, Dict
import customtkinter as ctk
from utils.helpers import format_duration
import config


class EyeMetricsPanel(ctk.CTkFrame):
    """
    Displays real-time eye aspect ratio breakdown.
    """

    def __init__(self, master, **kwargs):
        super().__init__(master, fg_color=config.CARD_BG, corner_radius=10, border_width=1, border_color=config.CARD_BORDER, **kwargs)

        # Title
        ctk.CTkLabel(self, text="EYE ASPECT RATIO (EAR) METRICS", font=("Helvetica", 12, "bold"), text_color=config.TEXT_MAIN).pack(anchor="w", padx=14, pady=(12, 8))

        # Grid container
        grid = ctk.CTkFrame(self, fg_color="transparent")
        grid.pack(fill="x", padx=14, pady=(0, 12))
        grid.grid_columnconfigure((0, 1, 2), weight=1)

        # Left EAR
        self.lbl_left = self._create_metric_box(grid, "Left EAR", "0.000", 0)
        # Right EAR
        self.lbl_right = self._create_metric_box(grid, "Right EAR", "0.000", 1)
        # Avg EAR
        self.lbl_avg = self._create_metric_box(grid, "Average EAR", "0.000", 2)

    def _create_metric_box(self, parent, label_text: str, default_val: str, col: int):
        box = ctk.CTkFrame(parent, fg_color=config.BG_DARK, corner_radius=8)
        box.grid(row=0, column=col, padx=4, pady=2, sticky="ew")

        ctk.CTkLabel(box, text=label_text, font=("Helvetica", 10), text_color=config.TEXT_MUTED).pack(pady=(6, 0))
        val_lbl = ctk.CTkLabel(box, text=default_val, font=("Helvetica", 16, "bold"), text_color=config.TEXT_MAIN)
        val_lbl.pack(pady=(0, 6))
        return val_lbl

    def update_metrics(self, telemetry: Dict[str, Any]):
        l_ear = telemetry.get("left_ear", 0.0)
        r_ear = telemetry.get("right_ear", 0.0)
        avg_ear = telemetry.get("average_ear", 0.0)

        self.lbl_left.configure(text=f"{l_ear:.3f}")
        self.lbl_right.configure(text=f"{r_ear:.3f}")
        self.lbl_avg.configure(text=f"{avg_ear:.3f}")


class SessionStatsPanel(ctk.CTkFrame):
    """
    Displays session metrics: duration, drowsiness event count, longest eye closure.
    """

    def __init__(self, master, on_reset_callback=None, **kwargs):
        super().__init__(master, fg_color=config.CARD_BG, corner_radius=10, border_width=1, border_color=config.CARD_BORDER, **kwargs)
        self.on_reset_callback = on_reset_callback

        # Header with Title + Reset Button
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=14, pady=(12, 6))

        ctk.CTkLabel(header, text="SESSION STATISTICS", font=("Helvetica", 12, "bold"), text_color=config.TEXT_MAIN).pack(side="left")

        self.btn_reset = ctk.CTkButton(
            header,
            text="RESET SESSION",
            width=110,
            height=26,
            font=("Helvetica", 10, "bold"),
            fg_color="#334155",
            hover_color="#475569",
            command=self._on_reset
        )
        self.btn_reset.pack(side="right")

        # Stats Rows
        self.lbl_time = self._create_stat_row("Monitoring Time:", "00:00:00")
        self.lbl_events = self._create_stat_row("Drowsiness Events:", "0")
        self.lbl_longest = self._create_stat_row("Longest Closure:", "0.00 sec")
        self.lbl_sess_ear = self._create_stat_row("Session Avg EAR:", "0.000")

    def _create_stat_row(self, title: str, default_val: str):
        row = ctk.CTkFrame(self, fg_color="transparent")
        row.pack(fill="x", padx=14, pady=3)

        ctk.CTkLabel(row, text=title, font=("Helvetica", 11), text_color=config.TEXT_MUTED).pack(side="left")
        val_lbl = ctk.CTkLabel(row, text=default_val, font=("Helvetica", 11, "bold"), text_color=config.TEXT_MAIN)
        val_lbl.pack(side="right")
        return val_lbl

    def _on_reset(self):
        if self.on_reset_callback:
            self.on_reset_callback()

    def update_stats(self, session_time: float, events: int, longest_closure: float, session_avg_ear: float):
        self.lbl_time.configure(text=format_duration(session_time))
        self.lbl_events.configure(text=str(events))
        self.lbl_longest.configure(text=f"{longest_closure:.2f} sec")
        self.lbl_sess_ear.configure(text=f"{session_avg_ear:.3f}")


class EventLogPanel(ctk.CTkFrame):
    """
    Displays real-time timestamped event log entries.
    """

    def __init__(self, master, max_events: int = 50, **kwargs):
        super().__init__(master, fg_color=config.CARD_BG, corner_radius=10, border_width=1, border_color=config.CARD_BORDER, **kwargs)
        self.max_events = max_events

        # Header
        ctk.CTkLabel(self, text="REAL-TIME EVENT LOG", font=("Helvetica", 12, "bold"), text_color=config.TEXT_MAIN).pack(anchor="w", padx=14, pady=(12, 6))

        # Scrollable Text View
        self.log_textbox = ctk.CTkTextbox(
            self,
            height=120,
            font=("Consolas", 10),
            fg_color=config.BG_DARK,
            text_color=config.TEXT_MAIN,
            corner_radius=8,
            activate_scrollbars=True
        )
        self.log_textbox.pack(fill="both", expand=True, padx=14, pady=(0, 12))
        self.log_textbox.configure(state="disabled")

        self.log_event("System initialized. Ready to start monitoring.")

    def log_event(self, message: str, level: str = "INFO"):
        now_str = datetime.now().strftime("%H:%M:%S")
        prefix = "•"
        if level == "WARNING":
            prefix = "⚠️"
        elif level == "ALERT":
            prefix = "🚨"

        formatted_line = f"[{now_str}] {prefix} {message}\n"

        self.log_textbox.configure(state="normal")
        self.log_textbox.insert("end", formatted_line)
        self.log_textbox.see("end")
        self.log_textbox.configure(state="disabled")

    def clear_log(self):
        self.log_textbox.configure(state="normal")
        self.log_textbox.delete("1.0", "end")
        self.log_textbox.configure(state="disabled")
        self.log_event("Event log cleared.")
