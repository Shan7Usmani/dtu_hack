"""
CameraManager for robust thread-safe video stream capture from OpenCV VideoCapture.
"""

import time
from typing import Optional, Tuple
import cv2
import numpy as np
from utils.logger import logger
import config


class CameraManager:
    """
    Manages OpenCV video capture device safely.
    """

    def __init__(self, camera_index: int = config.CAMERA_INDEX,
                 width: int = config.FRAME_WIDTH,
                 height: int = config.FRAME_HEIGHT):
        self.camera_index = camera_index
        self.width = width
        self.height = height
        self.cap: Optional[cv2.VideoCapture] = None
        self.is_running = False
        self.last_error: Optional[str] = None

    def start(self) -> Tuple[bool, str]:
        """
        Open and configure camera stream.
        """
        try:
            if self.cap is not None and self.cap.isOpened():
                return True, "Camera already running"

            logger.info(f"Opening camera index {self.camera_index}...")
            # On Windows, try cv2.CAP_DSHOW or default CAP_ANY
            self.cap = cv2.VideoCapture(self.camera_index, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                # Fallback to default backend
                self.cap = cv2.VideoCapture(self.camera_index)

            if not self.cap.isOpened():
                self.last_error = f"Camera unavailable at index {self.camera_index}. Check webcam connection/permissions."
                logger.error(self.last_error)
                return False, self.last_error

            # Configure resolution
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
            self.is_running = True
            self.last_error = None
            logger.info("Camera started successfully.")
            return True, "Camera started successfully"
        except Exception as e:
            self.last_error = f"Camera initialization error: {str(e)}"
            logger.error(self.last_error)
            return False, self.last_error

    def read_frame(self) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Read next frame from webcam.
        """
        if not self.is_running or self.cap is None or not self.cap.isOpened():
            return False, None

        try:
            ret, frame = self.cap.read()
            if not ret or frame is None:
                logger.warning("Empty frame received from camera stream.")
                return False, None
            return True, frame
        except Exception as e:
            logger.error(f"Error reading camera frame: {e}")
            return False, None

    def stop(self):
        """
        Release camera resources cleanly.
        """
        self.is_running = False
        if self.cap is not None:
            try:
                self.cap.release()
            except Exception as e:
                logger.error(f"Error releasing camera: {e}")
            self.cap = None
        logger.info("Camera stopped and released.")

    def is_opened(self) -> bool:
        """
        Check if camera capture is active.
        """
        return self.is_running and self.cap is not None and self.cap.isOpened()
