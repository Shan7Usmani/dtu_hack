"""
Unit tests for RiskEngine classification rules.
"""

import pytest
from core.risk_engine import RiskEngine


def test_risk_evaluation():
    engine = RiskEngine()

    # Awake -> Low Risk
    assert engine.evaluate_risk({"status": "AWAKE", "face_status": "SINGLE_FACE"}) == "LOW"

    # Caution -> Medium Risk
    assert engine.evaluate_risk({"status": "CAUTION", "face_status": "SINGLE_FACE", "closed_duration": 1.2}) == "MEDIUM"

    # Drowsy -> High Risk
    assert engine.evaluate_risk({"status": "DROWSY", "face_status": "SINGLE_FACE", "closed_duration": 2.5, "drowsiness_events": 1}) == "HIGH"

    # Sustained Drowsy >= 4.0s -> Critical Risk
    assert engine.evaluate_risk({"status": "DROWSY", "face_status": "SINGLE_FACE", "closed_duration": 4.5, "drowsiness_events": 1}) == "CRITICAL"

    # Repeated events -> Critical Risk
    assert engine.evaluate_risk({"status": "DROWSY", "face_status": "SINGLE_FACE", "closed_duration": 2.1, "drowsiness_events": 4}) == "CRITICAL"

    # Missing driver -> Unknown
    assert engine.evaluate_risk({"status": "NO_DRIVER", "face_status": "NO_DRIVER"}) == "UNKNOWN"

    # Multiple faces -> Warning
    assert engine.evaluate_risk({"status": "AWAKE", "face_status": "MULTIPLE_FACES"}) == "WARNING"
