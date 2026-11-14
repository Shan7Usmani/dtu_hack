"""
Unit tests for Accident Detection Engine and Emergency Response workflow.
"""

from core.accident_detector import AccidentDetector


def test_normal_driving_confidence():
    detector = AccidentDetector()
    sensor_data = {
        "g_force": 1.1,
        "speed_drop_kmh": 5.0,
        "rotation_deg_sec": 0.0,
        "driver_status": "AWAKE",
        "eye_closed_duration": 0.1,
        "cv_collision_cue": False
    }
    score, severity, condition = detector.calculate_accident_confidence(sensor_data)
    assert score < 30
    assert severity == "LOW"
    assert condition == "RESPONSIVE"


def test_severe_accident_confidence():
    detector = AccidentDetector()
    sensor_data = {
        "g_force": 5.2,
        "speed_drop_kmh": 55.0,
        "rotation_deg_sec": 45.0,
        "driver_status": "DROWSY",
        "eye_closed_duration": 3.5,
        "cv_collision_cue": True
    }
    score, severity, condition = detector.calculate_accident_confidence(sensor_data)
    assert score >= 90
    assert severity == "CRITICAL"
    assert condition == "UNRESPONSIVE"


def test_moderate_impact_verification():
    detector = AccidentDetector()
    sensor_data = {
        "g_force": 3.2,
        "speed_drop_kmh": 25.0,
        "rotation_deg_sec": 10.0,
        "driver_status": "AWAKE",
        "eye_closed_duration": 0.2,
        "cv_collision_cue": False
    }
    score, severity, condition = detector.calculate_accident_confidence(sensor_data)
    assert 30 <= score < 90
    assert severity in ["MODERATE", "HIGH"]
    assert condition == "RESPONSIVE"
