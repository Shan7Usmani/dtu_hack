"""
DrowsinessDetector using time.monotonic() to track eye closure duration and driver state.
"""

import time
from typing import Any, Dict
from utils.logger import logger
import config


class DrowsinessDetector:
    """
    Time-based drowsiness state machine.
    """

    def __init__(self,
                 ear_threshold: float = config.EAR_THRESHOLD,
                 blink_max: float = config.BLINK_MAX_DURATION,
                 caution_dur: float = config.CAUTION_DURATION,
                 drowsy_dur: float = config.DROWSY_DURATION):
        self.ear_threshold = ear_threshold
        self.blink_max = blink_max
        self.caution_dur = caution_dur
        self.drowsy_dur = drowsy_dur

        # Internal tracking state
        self.closed_start_time: float = 0.0
        self.is_eyes_closed: bool = False
        self.current_state: str = "AWAKE"

        # Session Metrics
        self.drowsiness_event_count: int = 0
        self.longest_closure_duration: float = 0.0
        self.in_drowsy_event: bool = False
        self.ear_history: list = []

    def update(self, average_ear: float, face_status: str) -> Dict[str, Any]:
        """
        Update state machine with current EAR and face detection status.

        States: AWAKE, CAUTION, DROWSY, NO_DRIVER, MULTIPLE_FACES
        """
        now = time.monotonic()
        closed_duration = 0.0

        # Handle face status overriding eye status
        if face_status == "NO_DRIVER":
            self._reset_eye_timer()
            self.current_state = "NO_DRIVER"
            return self._build_result(0.0, average_ear)

        if face_status == "MULTIPLE_FACES":
            # Still process primary driver face, but record status note
            pass

        # Check eye closure
        if average_ear < self.ear_threshold:
            if not self.is_eyes_closed:
                self.is_eyes_closed = True
                self.closed_start_time = now

            closed_duration = now - self.closed_start_time
            if closed_duration > self.longest_closure_duration:
                self.longest_closure_duration = closed_duration

            # Determine State based on duration
            if closed_duration >= self.drowsy_dur:
                self.current_state = "DROWSY"
                if not self.in_drowsy_event:
                    self.drowsiness_event_count += 1
                    self.in_drowsy_event = True
                    logger.warning(f"Drowsiness detected! Eyes closed for {closed_duration:.2f} seconds.")
            elif closed_duration >= self.caution_dur:
                self.current_state = "CAUTION"
            else:
                # Blink range (0.0 to 0.5s)
                self.current_state = "AWAKE"
        else:
            # Eyes are open
            self._reset_eye_timer()
            self.current_state = "AWAKE"

        if average_ear > 0.0:
            self.ear_history.append(average_ear)
            if len(self.ear_history) > 1000:  # Keep buffer reasonable
                self.ear_history = self.ear_history[-500:]

        return self._build_result(closed_duration, average_ear)

    def _reset_eye_timer(self):
        """
        Reset closure timer when eyes reopen.
        """
        self.is_eyes_closed = False
        self.closed_start_time = 0.0
        self.in_drowsy_event = False

    def reset_session(self):
        """
        Reset session counters and history.
        """
        self._reset_eye_timer()
        self.current_state = "AWAKE"
        self.drowsiness_event_count = 0
        self.longest_closure_duration = 0.0
        self.ear_history.clear()
        logger.info("DrowsinessDetector session metrics reset.")

    def _build_result(self, closed_duration: float, average_ear: float) -> Dict[str, Any]:
        session_avg_ear = float(sum(self.ear_history) / len(self.ear_history)) if self.ear_history else average_ear
        return {
            "status": self.current_state,
            "closed_duration": closed_duration,
            "is_eyes_closed": self.is_eyes_closed,
            "drowsiness_events": self.drowsiness_event_count,
            "longest_closure": self.longest_closure_duration,
            "session_avg_ear": session_avg_ear
        }
