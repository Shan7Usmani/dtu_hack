"""
NETRAKSHAK — AI DRIVER SAFETY MONITORING SYSTEM
Configuration Module
"""

import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent
ASSETS_DIR = BASE_DIR / "assets"
SOUNDS_DIR = ASSETS_DIR / "sounds"

# System Metadata
APP_NAME = "NETRAKSHAK"
APP_TAGLINE = "AI DRIVER SAFETY MONITOR"
APP_VERSION = "1.0.0"

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
FPS_TARGET = 30

# MediaPipe Face Landmark Indices (Standard 468 landmark model)
# Right Eye (6 points)
RIGHT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]
# Left Eye (6 points)
LEFT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]

# Full eye contour landmarks for visual overlay
RIGHT_EYE_CONTOUR = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
LEFT_EYE_CONTOUR = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

# Drowsiness Detection Thresholds
EAR_THRESHOLD = 0.22         # Eye Aspect Ratio threshold (below = closed)
BLINK_MAX_DURATION = 0.5     # Eye closure < 0.5s is considered a blink
CAUTION_DURATION = 1.0       # Eye closure >= 1.0s enters caution state
DROWSY_DURATION = 2.0        # Eye closure >= 2.0s triggers Drowsiness Alert

# Alarm Settings
ALARM_FILE = SOUNDS_DIR / "alarm.wav"
ALARM_FREQUENCY = 1200       # Beep frequency in Hz for fallback
ALARM_BEEP_DURATION = 300    # Beep duration in ms

# UI Color Palette (Executive Dark Theme)
BG_DARK = "#0F172A"          # Deep slate background
CARD_BG = "#1E293B"          # Dark blue-gray card background
CARD_BORDER = "#334155"      # Border color
TEXT_MAIN = "#F8FAFC"        # Primary white text
TEXT_MUTED = "#94A3B8"       # Muted gray text
ACCENT_BLUE = "#3B82F6"      # Primary action blue

# Status Colors
COLOR_AWAKE = "#10B981"      # Emerald Green
COLOR_CAUTION = "#F59E0B"    # Amber/Yellow
COLOR_DROWSY = "#EF4444"     # Bright Crimson Red
COLOR_NO_DRIVER = "#64748B"  # Muted Slate Gray
COLOR_MULTI_FACE = "#F97316" # Orange

# Modes
DEBUG_MODE = False
DEMO_MODE = False
