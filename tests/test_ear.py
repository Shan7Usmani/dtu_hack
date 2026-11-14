"""
Unit tests for Eye Aspect Ratio (EAR) calculation.
"""

import pytest
from utils.geometry import calculate_ear, euclidean_distance


def test_euclidean_distance():
    assert euclidean_distance((0, 0), (3, 4)) == 5.0
    assert euclidean_distance((1, 1), (1, 1)) == 0.0


def test_calculate_ear_open_eye():
    """
    Test EAR calculation with synthetic open eye coordinates.
    P1=(0,10), P2=(5,18), P3=(15,18), P4=(20,10), P5=(15,2), P6=(5,2)
    Vert1 = dist(P2, P6) = dist((5,18),(5,2)) = 16
    Vert2 = dist(P3, P5) = dist((15,18),(15,2)) = 16
    Horiz = dist(P1, P4) = dist((0,10),(20,10)) = 20
    EAR = (16 + 16) / (2 * 20) = 32 / 40 = 0.8
    """
    open_eye_points = [
        (0.0, 10.0),   # P1
        (5.0, 18.0),   # P2
        (15.0, 18.0),  # P3
        (20.0, 10.0),  # P4
        (15.0, 2.0),   # P5
        (5.0, 2.0)     # P6
    ]
    ear = calculate_ear(open_eye_points)
    assert pytest.approx(ear, 0.01) == 0.8


def test_calculate_ear_closed_eye():
    """
    Test EAR calculation with synthetic closed eye coordinates (very small vertical height).
    """
    closed_eye_points = [
        (0.0, 10.0),   # P1
        (5.0, 10.5),   # P2
        (15.0, 10.5),  # P3
        (20.0, 10.0),  # P4
        (15.0, 9.5),   # P5
        (5.0, 9.5)     # P6
    ]
    ear = calculate_ear(closed_eye_points)
    # Vert1 = 1.0, Vert2 = 1.0, Horiz = 20.0 -> EAR = 2 / 40 = 0.05
    assert pytest.approx(ear, 0.01) == 0.05


def test_calculate_ear_invalid_input():
    assert calculate_ear([]) == 0.0
    assert calculate_ear([(0, 0), (1, 1)]) == 0.0
