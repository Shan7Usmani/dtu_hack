"""
Helper utilities for Netrakshak (formatting, audio generation, fallbacks).
"""

import math
import struct
import wave
import sys
from pathlib import Path
from utils.logger import logger
import config


def format_duration(seconds: float) -> str:
    """
    Format time in seconds to HH:MM:SS or MM:SS string.
    """
    seconds = int(max(0, seconds))
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def ensure_alarm_sound(file_path: Path = config.ALARM_FILE) -> bool:
    """
    Generate a clean dual-tone alarm WAV file if it does not already exist.
    """
    try:
        if file_path.exists() and file_path.stat().st_size > 0:
            return True

        file_path.parent.mkdir(parents=True, exist_ok=True)
        sample_rate = 44100
        duration_sec = 0.8
        freq1 = 880.0  # A5 note
        freq2 = 1320.0 # E6 note
        n_samples = int(sample_rate * duration_sec)

        with wave.open(str(file_path), "wb") as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)

            for i in range(n_samples):
                t = i / sample_rate
                # Alternate between freq1 and freq2 every 0.1 seconds
                freq = freq1 if int(t / 0.1) % 2 == 0 else freq2
                value = int(32767 * 0.5 * math.sin(2 * math.pi * freq * t))
                data = struct.pack("<h", value)
                wav_file.writeframesraw(data)

        logger.info(f"Generated alarm sound file at {file_path}")
        return True
    except Exception as e:
        logger.error(f"Failed to generate alarm sound file: {e}")
        return False


def play_fallback_beep(frequency: int = config.ALARM_FREQUENCY, duration: int = config.ALARM_BEEP_DURATION):
    """
    Play fallback beep using winsound on Windows or system bell.
    """
    if sys.platform == "win32":
        try:
            import winsound
            winsound.Beep(frequency, duration)
        except Exception as e:
            logger.warning(f"winsound beep error: {e}")
    else:
        # Fallback terminal bell
        print("\a", end="", flush=True)
