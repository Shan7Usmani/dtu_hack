"""
Unit tests for Phone Usage Detector.
"""

import numpy as np
from core.phone_detector import PhoneDetector


def test_phone_detector_initial_state():
    detector = PhoneDetector()
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    res = detector.process_frame(frame, landmarks=None)

    assert res["phone_detected"] is False
    assert res["phone_status"] == "NOT_DETECTED"
    assert res["confidence"] == 0.0


def test_phone_detector_reset():
    detector = PhoneDetector()
    detector.phone_detected_counter = 5
    detector.reset()
    assert detector.phone_detected_counter == 0
