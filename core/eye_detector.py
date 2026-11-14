"""
EyeDetector for extracting left/right eye landmarks and computing EAR metrics.
"""

from typing import Any, Dict, List, Tuple
import numpy as np
from utils.geometry import calculate_ear
import config


class EyeDetector:
    """
    Extracts eye coordinates from MediaPipe FaceMesh and calculates EAR metrics.
    """

    def __init__(self,
                 right_eye_indices: List[int] = config.RIGHT_EYE_LANDMARKS,
                 left_eye_indices: List[int] = config.LEFT_EYE_LANDMARKS,
                 right_contour_indices: List[int] = config.RIGHT_EYE_CONTOUR,
                 left_contour_indices: List[int] = config.LEFT_EYE_CONTOUR):
        self.right_eye_indices = right_eye_indices
        self.left_eye_indices = left_eye_indices
        self.right_contour_indices = right_contour_indices
        self.left_contour_indices = left_contour_indices

    def analyze_eyes(self, face_landmarks: Any, image_width: int, image_height: int) -> Dict[str, Any]:
        """
        Extract eye coordinates and calculate EAR for left, right, and average.
        """
        if face_landmarks is None or image_width <= 0 or image_height <= 0:
            return {
                "left_ear": 0.0,
                "right_ear": 0.0,
                "average_ear": 0.0,
                "left_eye_points": [],
                "right_eye_points": [],
                "left_contour_points": [],
                "right_contour_points": []
            }

        landmarks = face_landmarks.landmark

        def extract_points(indices: List[int]) -> List[Tuple[int, int]]:
            pts = []
            for idx in indices:
                if idx < len(landmarks):
                    lm = landmarks[idx]
                    pts.append((int(lm.x * image_width), int(lm.y * image_height)))
            return pts

        right_eye_pts = extract_points(self.right_eye_indices)
        left_eye_pts = extract_points(self.left_eye_indices)

        right_contour_pts = extract_points(self.right_contour_indices)
        left_contour_pts = extract_points(self.left_contour_indices)

        right_ear = calculate_ear(right_eye_pts)
        left_ear = calculate_ear(left_eye_pts)
        average_ear = float((left_ear + right_ear) / 2.0)

        return {
            "left_ear": left_ear,
            "right_ear": right_ear,
            "average_ear": average_ear,
            "left_eye_points": left_eye_pts,
            "right_eye_points": right_eye_pts,
            "left_contour_points": left_contour_pts,
            "right_contour_points": right_contour_pts
        }
