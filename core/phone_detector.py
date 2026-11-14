"""
NETRAKSHAK — PHONE USAGE DETECTION MODULE
Detects mobile phone usage while driving using facial landmark proximity,
hand pose, and object bounding box analysis.
"""

from typing import Dict, Any, Tuple, Optional
import cv2
import numpy as np
import mediapipe as mp
from core.base_detector import BaseDetector
from utils.logger import logger


class PhoneDetector(BaseDetector):
    """
    Detects phone usage near the driver's head/ear/cheek area or in front of the steering wheel zone.
    Integrates MediaPipe Hands and facial landmark ear/cheek zone proximity.
    """

    def __init__(self, proximity_threshold_px: float = 85.0):
        super().__init__("PhoneDetector")
        self.proximity_threshold = proximity_threshold_px
        self.phone_detected_counter = 0
        self.trigger_threshold = 3  # ~0.3 - 0.4 sec persistence
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            max_num_hands=2,
            min_detection_confidence=0.4,
            min_tracking_confidence=0.4
        )

    def process_frame(self, frame: np.ndarray, landmarks: Any = None, **kwargs) -> Dict[str, Any]:
        """
        Processes frame and facial landmarks to evaluate mobile phone distraction.

        Returns:
            {
                "phone_detected": bool,
                "phone_status": "PHONE_DETECTED" or "NOT_DETECTED",
                "confidence": float,
                "bbox": Optional[Tuple[int, int, int, int]],
                "zone": "LEFT_EAR", "RIGHT_EAR", or "NONE"
            }
        """
        if frame is None:
            return {"phone_detected": False, "phone_status": "NOT_DETECTED", "confidence": 0.0, "zone": "NONE"}

        h, w, _ = frame.shape
        phone_detected = False
        confidence = 0.0
        detected_zone = "NONE"
        detected_bbox = None

        # Extract ear/cheek landmarks from FaceMesh if provided
        left_ear_pts = []
        right_ear_pts = []

        if landmarks and hasattr(landmarks, "landmark"):
            # Left ear/cheek landmark indices: 127, 234, 93, 132
            # Right ear/cheek landmark indices: 356, 454, 323, 361
            left_ear_indices = [127, 234, 93, 132]
            right_ear_indices = [356, 454, 323, 361]

            left_ear_pts = [(int(landmarks.landmark[idx].x * w), int(landmarks.landmark[idx].y * h)) for idx in left_ear_indices]
            right_ear_pts = [(int(landmarks.landmark[idx].x * w), int(landmarks.landmark[idx].y * h)) for idx in right_ear_indices]

        # 1. Evaluate Hand Landmark Proximity near Left/Right Ear/Cheek Zone
        try:
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB).copy()
            hand_results = self.hands.process(rgb_frame)

            if hand_results and hand_results.multi_hand_landmarks:
                for hand_landmarks in hand_results.multi_hand_landmarks:
                    hand_pts = [(int(lm.x * w), int(lm.y * h)) for lm in hand_landmarks.landmark]
                    wrist = hand_pts[0]
                    index_tip = hand_pts[8]

                    # Check proximity to Left Ear Zone
                    if left_ear_pts:
                        left_center = np.mean(left_ear_pts, axis=0)
                        dist_wrist = np.linalg.norm(np.array(wrist) - left_center)
                        dist_finger = np.linalg.norm(np.array(index_tip) - left_center)

                        if dist_wrist < self.proximity_threshold or dist_finger < self.proximity_threshold:
                            phone_detected = True
                            confidence = 0.88
                            detected_zone = "LEFT_EAR"
                            detected_bbox = (int(left_center[0] - 40), int(left_center[1] - 50), 80, 100)
                            break

                    # Check proximity to Right Ear Zone
                    if right_ear_pts:
                        right_center = np.mean(right_ear_pts, axis=0)
                        dist_wrist = np.linalg.norm(np.array(wrist) - right_center)
                        dist_finger = np.linalg.norm(np.array(index_tip) - right_center)

                        if dist_wrist < self.proximity_threshold or dist_finger < self.proximity_threshold:
                            phone_detected = True
                            confidence = 0.88
                            detected_zone = "RIGHT_EAR"
                            detected_bbox = (int(right_center[0] - 40), int(right_center[1] - 50), 80, 100)
                            break
        except Exception as e:
            logger.warning(f"Hand detection process skipped frame: {e}")

        # 2. Heuristic Object & Rectangular phone-holding Contour Check in ear/cheek region
        if not phone_detected and (left_ear_pts or right_ear_pts):
            for pts, z_name in [(left_ear_pts, "LEFT_EAR"), (right_ear_pts, "RIGHT_EAR")]:
                if not pts:
                    continue
                cx, cy = int(np.mean([p[0] for p in pts])), int(np.mean([p[1] for p in pts]))
                xmin, xmax = max(0, cx - 60), min(w, cx + 60)
                ymin, ymax = max(0, cy - 70), min(h, cy + 70)

                roi = frame[ymin:ymax, xmin:xmax]
                if roi.size > 0:
                    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                    edges = cv2.Canny(gray, 50, 150)
                    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

                    for cnt in contours:
                        area = cv2.contourArea(cnt)
                        if 800 < area < 6000:
                            x, y, bw, bh = cv2.boundingRect(cnt)
                            aspect_ratio = float(bh) / (bw + 1e-5)
                            if 1.4 <= aspect_ratio <= 3.2:
                                phone_detected = True
                                confidence = 0.82
                                detected_zone = z_name
                                detected_bbox = (xmin + x, ymin + y, bw, bh)
                                break

        # 3. Temporal State Persistence Filter
        if phone_detected:
            self.phone_detected_counter += 1
        else:
            self.phone_detected_counter = max(0, self.phone_detected_counter - 1)

        is_confirmed = self.phone_detected_counter >= self.trigger_threshold

        return {
            "phone_detected": is_confirmed,
            "phone_status": "PHONE_DETECTED" if is_confirmed else "NOT_DETECTED",
            "confidence": confidence if is_confirmed else 0.0,
            "bbox": detected_bbox if is_confirmed else None,
            "zone": detected_zone if is_confirmed else "NONE"
        }

    def reset(self):
        self.phone_detected_counter = 0

    def close(self):
        try:
            self.hands.close()
        except Exception as e:
            logger.error(f"Error closing MediaPipe Hands: {e}")
