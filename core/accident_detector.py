"""
NETRAKSHAK — ACCIDENT DETECTION ENGINE
Multi-sensor fusion module evaluating visual, motion, speed, and driver state signals.
"""

from typing import Dict, Any, Tuple


class AccidentDetector:
    """
    Evaluates multi-sensor inputs to compute an Accident Confidence Score (0–100)
    and classify severity (LOW, MODERATE, HIGH, CRITICAL).
    """

    def __init__(self, confidence_threshold: int = 60, critical_threshold: int = 81):
        self.confidence_threshold = confidence_threshold
        self.critical_threshold = critical_threshold

    def calculate_accident_confidence(self, sensor_data: Dict[str, Any]) -> Tuple[int, str, str]:
        """
        Calculates confidence score (0-100), severity, and driver condition.
        Score Thresholds per Spec Section 5:
        0-30: Normal (LOW)
        31-60: Suspicious Event (MODERATE)
        61-80: Probable Accident (HIGH)
        81-100: Critical Accident (CRITICAL)
        """
        score = 0

        g_force = sensor_data.get("g_force", 1.0)
        speed_drop = sensor_data.get("speed_drop_kmh", 0.0)
        rotation = sensor_data.get("rotation_deg_sec", 0.0)
        driver_status = sensor_data.get("driver_status", "AWAKE")
        eye_closed_dur = sensor_data.get("eye_closed_duration", 0.0)
        cv_collision = sensor_data.get("cv_collision_cue", False)

        # 1. Accelerometer / G-Force Impact Evaluation
        if g_force >= 5.0:
            score += 45
        elif g_force >= 3.5:
            score += 35
        elif g_force >= 2.5:
            score += 25
        elif g_force >= 1.5:
            score += 10

        # 2. Sudden Speed Deceleration
        if speed_drop >= 50.0:
            score += 30
        elif speed_drop >= 30.0:
            score += 20
        elif speed_drop >= 15.0:
            score += 15

        # 3. Gyroscope Rollover / Rotation
        if rotation >= 180.0:
            score += 25
        elif rotation >= 45.0:
            score += 15

        # 4. Driver Post-Impact State
        driver_condition = "RESPONSIVE"
        if driver_status == "DROWSY" and eye_closed_dur >= 3.0:
            score += 20
            driver_condition = "UNRESPONSIVE"
        elif driver_status == "NO_DRIVER" or driver_status == "UNRESPONSIVE":
            score += 25
            driver_condition = "UNRESPONSIVE"

        # 5. Computer Vision Collision Cue
        if cv_collision:
            score += 15

        # Clamp total score between 0 and 100
        total_score = min(100, max(0, score))

        # Severity Classification per Spec Section 5 & 11
        if total_score >= 81:
            severity = "CRITICAL"
        elif total_score >= 61:
            severity = "HIGH"
        elif total_score >= 31:
            severity = "MODERATE"
        else:
            severity = "LOW"

        return total_score, severity, driver_condition
