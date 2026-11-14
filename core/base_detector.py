"""
Abstract Base Class for safety detectors in Netrakshak architecture (V1-V10 readiness).
"""

from abc import ABC, abstractmethod
from typing import Any, Dict
import numpy as np


class BaseDetector(ABC):
    """
    Interface for safety analysis detectors.
    """

    def __init__(self, name: str):
        self.name = name
        self.enabled = True

    @abstractmethod
    def process_frame(self, frame: np.ndarray, landmarks: Any = None, **kwargs) -> Dict[str, Any]:
        """
        Process frame and return telemetry dictionary.
        """
        pass

    def reset(self):
        """
        Reset internal state trackers.
        """
        pass
