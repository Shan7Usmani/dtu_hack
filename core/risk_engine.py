"""
RiskEngine for calculating driver risk level (LOW, MEDIUM, HIGH, CRITICAL).
Extensible for V2-V10 sensor inputs (yawning, distraction, speed, lane deviation, etc.).
"""

from typing import Dict, Any
import config


class RiskEngine:
    """
    Evaluates current metrics and outputs driver risk assessment.
    """

    def __init__(self):
        pass

    def evaluate_risk(self, telemetry: Dict[str, Any]) -> str:
        """
        Determine risk classification from telemetry dict.

        Returns: "LOW", "MEDIUM", "HIGH", "CRITICAL", or "UNKNOWN"
        """
        driver_status = telemetry.get("status", "AWAKE")
        closed_duration = telemetry.get("closed_duration", 0.0)
        events_count = telemetry.get("drowsiness_events", 0)
        face_status = telemetry.get("face_status", "SINGLE_FACE")

        if face_status == "NO_DRIVER":
            return "UNKNOWN"

        if face_status == "MULTIPLE_FACES":
            # Caution if extra passengers/faces interfere with driver camera
            if driver_status == "DROWSY":
                return "HIGH"
            return "WARNING"

        if driver_status == "DROWSY":
            # If closed for > 4.0s or repeated events in session, elevate to CRITICAL
            if closed_duration >= 4.0 or events_count >= 3:
                return "CRITICAL"
            return "HIGH"

        if driver_status == "CAUTION":
            return "MEDIUM"

        return "LOW"
