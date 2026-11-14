"""
FaceDetector using MediaPipe Face Mesh for single and multi-face analysis.
"""

from typing import Any, Dict, List, Optional, Tuple
import cv2
import mediapipe as mp
import numpy as np
from utils.logger import logger
import config


class FaceDetector:
    """
    Wrapper around MediaPipe Face Mesh.
    """

    def __init__(self, max_num_faces: int = 2, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=max_num_faces,
            refine_landmarks=True,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )

    def detect(self, frame_bgr: np.ndarray) -> Tuple[str, Optional[Any], Optional[Tuple[int, int, int, int]], int]:
        """
        Process frame and detect driver face landmarks.

        Returns:
            face_status: "SINGLE_FACE", "MULTIPLE_FACES", or "NO_DRIVER"
            face_landmarks: Primary face mesh landmark set
            bbox: (xmin, ymin, width, height) of primary face
            face_count: Total number of detected faces
        """
        if frame_bgr is None:
            return "NO_DRIVER", None, None, 0

        h, w, _ = frame_bgr.shape
        rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)

        if not results or not results.multi_face_landmarks:
            return "NO_DRIVER", None, None, 0

        face_count = len(results.multi_face_landmarks)

        # Select primary face (largest bounding box area)
        primary_landmarks = None
        primary_bbox = None
        max_area = -1.0

        for face_landmarks in results.multi_face_landmarks:
            # Calculate bounding box
            x_coords = [lm.x * w for lm in face_landmarks.landmark]
            y_coords = [lm.y * h for lm in face_landmarks.landmark]
            xmin, xmax = int(min(x_coords)), int(max(x_coords))
            ymin, ymax = int(min(y_coords)), int(max(y_coords))
            box_w = max(0, xmax - xmin)
            box_h = max(0, ymax - ymin)
            area = box_w * box_h

            if area > max_area:
                max_area = area
                primary_landmarks = face_landmarks
                primary_bbox = (xmin, ymin, box_w, box_h)

        status = "SINGLE_FACE" if face_count == 1 else "MULTIPLE_FACES"
        return status, primary_landmarks, primary_bbox, face_count

    def close(self):
        """
        Release MediaPipe resources.
        """
        try:
            self.face_mesh.close()
        except Exception as e:
            logger.error(f"Error closing FaceMesh: {e}")
