"""
NETRAKSHAK — AI DRIVER SAFETY MONITORING SYSTEM
Main Application Entry Point.
"""

import sys
from utils.logger import logger
from utils.helpers import ensure_alarm_sound
import config

def main():
    logger.info("Initializing NETRAKSHAK Safety System...")
    logger.info(f"Version: {config.APP_VERSION}")
    logger.info(f"Python: {sys.version.split()[0]}")

    # Ensure alarm asset sound file exists
    ensure_alarm_sound()

    # Launch GUI Dashboard
    try:
        from ui.dashboard import NetrakshakDashboard
        app = NetrakshakDashboard()
        logger.info("Launching Netrakshak Dashboard Window...")
        app.mainloop()
    except Exception as e:
        logger.critical(f"Unhandled application exception: {e}", exc_info=True)
        print(f"\n[CRITICAL ERROR] Failed to start Netrakshak: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
