"""
Geometry utilities for distance and Eye Aspect Ratio (EAR) calculations.
"""

import math
from typing import List, Tuple, Union
import numpy as np


def euclidean_distance(pt1: Tuple[float, float], pt2: Tuple[float, float]) -> float:
    """
    Calculate 2D Euclidean distance between two points (x, y).
    """
    return math.sqrt((pt1[0] - pt2[0]) ** 2 + (pt1[1] - pt2[1]) ** 2)


def calculate_ear(eye_landmarks: List[Tuple[float, float]]) -> float:
    """
    Calculate Eye Aspect Ratio (EAR) using 6 landmark points.

    Points ordering:
    P1: Outer/Inner corner horizontal endpoint 1
    P2: Top landmark 1
    P3: Top landmark 2
    P4: Outer/Inner corner horizontal endpoint 2
    P5: Bottom landmark 2
    P6: Bottom landmark 1

    EAR = ( ||P2 - P6|| + ||P3 - P5|| ) / ( 2.0 * ||P1 - P4|| )
    """
    if not eye_landmarks or len(eye_landmarks) < 6:
        return 0.0

    p1, p2, p3, p4, p5, p6 = eye_landmarks[:6]

    # Vertical distances
    vert_1 = euclidean_distance(p2, p6)
    vert_2 = euclidean_distance(p3, p5)

    # Horizontal distance
    horiz = euclidean_distance(p1, p4)

    if horiz == 0:
        return 0.0

    ear = (vert_1 + vert_2) / (2.0 * horiz)
    return float(ear)
