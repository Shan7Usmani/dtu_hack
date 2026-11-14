"""
Unit tests for DrowsinessDetector state machine and timing logic.
"""

import time
import pytest
from core.drowsiness_detector import DrowsinessDetector


def test_drowsiness_initial_state():
    detector = DrowsinessDetector(ear_threshold=0.22, blink_max=0.5, caution_dur=1.0, drowsy_dur=2.0)
    result = detector.update(0.30, "SINGLE_FACE")
    assert result["status"] == "AWAKE"
    assert result["is_eyes_closed"] is False
    assert result["drowsiness_events"] == 0


def test_blink_does_not_trigger_drowsiness():
    detector = DrowsinessDetector(ear_threshold=0.22, blink_max=0.5, caution_dur=1.0, drowsy_dur=2.0)

    # 1. Open eyes
    res1 = detector.update(0.30, "SINGLE_FACE")
    assert res1["status"] == "AWAKE"

    # 2. Close eyes briefly (< 0.5s)
    res2 = detector.update(0.15, "SINGLE_FACE")
    assert res2["status"] == "AWAKE"
    assert res2["is_eyes_closed"] is True

    # 3. Open eyes again
    res3 = detector.update(0.30, "SINGLE_FACE")
    assert res3["status"] == "AWAKE"
    assert res3["is_eyes_closed"] is False
    assert res3["drowsiness_events"] == 0


def test_caution_and_drowsy_transition(monkeypatch):
    detector = DrowsinessDetector(ear_threshold=0.22, blink_max=0.5, caution_dur=1.0, drowsy_dur=2.0)

    start_time = 100.0

    def mock_monotonic():
        return current_time

    import time
    monkeypatch.setattr(time, "monotonic", mock_monotonic)

    # Start at 100.0s (Eyes Open)
    current_time = start_time
    detector.update(0.30, "SINGLE_FACE")

    # Start closing eyes at 100.1s
    current_time = 100.1
    res_start = detector.update(0.15, "SINGLE_FACE")
    assert res_start["status"] == "AWAKE"

    # Advance to 101.3s (closed for 1.2s -> CAUTION)
    current_time = 101.3
    res_caution = detector.update(0.15, "SINGLE_FACE")
    assert res_caution["status"] == "CAUTION"
    assert res_caution["drowsiness_events"] == 0

    # Advance to 102.3s (closed for 2.2s -> DROWSY)
    current_time = 102.3
    res_drowsy = detector.update(0.15, "SINGLE_FACE")
    assert res_drowsy["status"] == "DROWSY"
    assert res_drowsy["drowsiness_events"] == 1

    # Eyes reopen at 103.0s -> AWAKE again
    current_time = 103.0
    res_awake = detector.update(0.30, "SINGLE_FACE")
    assert res_awake["status"] == "AWAKE"
    assert res_awake["is_eyes_closed"] is False
    assert res_awake["drowsiness_events"] == 1


def test_no_driver_status():
    detector = DrowsinessDetector()
    res = detector.update(0.0, "NO_DRIVER")
    assert res["status"] == "NO_DRIVER"


def test_reset_session():
    detector = DrowsinessDetector()
    detector.drowsiness_event_count = 5
    detector.longest_closure_duration = 3.5

    detector.reset_session()
    assert detector.drowsiness_event_count == 0
    assert detector.longest_closure_duration == 0.0
