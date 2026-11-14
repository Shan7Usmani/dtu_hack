"""
AlarmManager for handling non-blocking audio alerts with automatic fallback support.
"""

import threading
import time
import sys
from utils.logger import logger
from utils.helpers import ensure_alarm_sound, play_fallback_beep
import config


class AlarmManager:
    """
    Manages non-blocking audio alarm thread for driver warnings.
    """

    def __init__(self, alarm_file=config.ALARM_FILE):
        self.alarm_file = alarm_file
        self.is_alarm_active = False
        self.is_running = True
        self.alarm_thread: threading.Thread = None
        self._pygame_initialized = False

        # Ensure alarm file exists
        ensure_alarm_sound(self.alarm_file)
        self._init_audio()

    def _init_audio(self):
        """
        Initialize pygame mixer if available, otherwise rely on winsound fallback.
        """
        try:
            import pygame
            pygame.mixer.init()
            self._pygame_initialized = True
            logger.info("Audio engine initialized via Pygame.")
        except Exception as e:
            logger.warning(f"Pygame audio init fallback to winsound: {e}")
            self._pygame_initialized = False

    def start_alarm(self):
        """
        Trigger alarm loop if not already running.
        """
        if self.is_alarm_active:
            return

        self.is_alarm_active = True
        logger.info("Alarm activated!")

        if self.alarm_thread is None or not self.alarm_thread.is_alive():
            self.alarm_thread = threading.Thread(target=self._alarm_loop, daemon=True)
            self.alarm_thread.start()

    def stop_alarm(self):
        """
        Stop alarm audio immediately.
        """
        if not self.is_alarm_active:
            return

        self.is_alarm_active = False
        logger.info("Alarm deactivated.")

        if self._pygame_initialized:
            try:
                import pygame
                pygame.mixer.music.stop()
            except Exception as e:
                logger.error(f"Error stopping pygame sound: {e}")

    def _alarm_loop(self):
        """
        Background loop to play alert sound while alarm is active.
        """
        while self.is_running and self.is_alarm_active:
            played = False
            # 1. Try Pygame WAV playback
            if self._pygame_initialized and self.alarm_file.exists():
                try:
                    import pygame
                    pygame.mixer.music.load(str(self.alarm_file))
                    pygame.mixer.music.play()
                    while pygame.mixer.music.get_busy() and self.is_alarm_active and self.is_running:
                        time.sleep(0.05)
                    played = True
                except Exception as e:
                    logger.error(f"Pygame playback error: {e}")

            # 2. Try Windows winsound SND_FILENAME / Beep fallback
            if not played and sys.platform == "win32":
                try:
                    import winsound
                    if self.alarm_file.exists():
                        winsound.PlaySound(str(self.alarm_file), winsound.SND_FILENAME | winsound.SND_ASYNC)
                        time.sleep(0.6)
                    else:
                        winsound.Beep(config.ALARM_FREQUENCY, config.ALARM_BEEP_DURATION)
                        time.sleep(0.1)
                    played = True
                except Exception as e:
                    logger.error(f"winsound error: {e}")

            # 3. Terminal bell fallback
            if not played:
                play_fallback_beep()
                time.sleep(0.4)

    def shutdown(self):
        """
        Shutdown alarm manager safely.
        """
        self.stop_alarm()
        self.is_running = False
        logger.info("AlarmManager shut down cleanly.")
