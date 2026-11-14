"""
NETRAKSHAK — EMERGENCY NOTIFICATION SERVICE
Abstract service providing notification workflows for police, ambulance, fire, contacts, and fleet controls.
"""

import time
from typing import Dict, Any, List
from utils.logger import logger


class EmergencyNotificationService:
    """
    Handles dispatch notification channels (Police, Ambulance, Fire, Contacts, Fleet).
    Supports Demo/Simulation Mode and real integration abstractions (SMS, Telephony, Webhooks).
    """

    def __init__(self):
        self.notification_history: List[Dict[str, Any]] = []

    def dispatch_emergency_notifications(
        self,
        incident_id: str,
        severity: str,
        location: Dict[str, Any],
        contacts: List[Dict[str, Any]],
        is_simulated: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Triggers emergency notification channels.
        Returns a list of notification status records.
        """
        now = time.strftime("%H:%M:%S")
        records = []

        services_to_notify = ["Police Control Room", "Ambulance Emergency Services"]
        if severity in ["HIGH", "CRITICAL"]:
            services_to_notify.append("Fire & Rescue Unit")
            services_to_notify.append("Nearest Trauma Hospital")

        for service in services_to_notify:
            rec = {
                "id": f"NOTIF-{len(self.notification_history) + 1:04d}",
                "incident_id": incident_id,
                "service": service,
                # No SMS / telephony / webhook provider is configured in this
                # build, so every dispatch is recorded as a simulation.
                "status": "SIMULATED_NOTIFIED",
                "timestamp": now,
                "delivery_channel": "Simulated gateway (no provider configured)",
                "is_simulated": True,
                "incident_is_simulated": is_simulated
            }
            records.append(rec)
            self.notification_history.insert(0, rec)

        # Notify Configured Emergency Contacts
        for contact in contacts:
            if contact.get("active", True):
                rec = {
                    "id": f"NOTIF-{len(self.notification_history) + 1:04d}",
                    "incident_id": incident_id,
                    "service": f"Contact: {contact['name']} ({contact['relationship']})",
                    "status": "SIMULATED_NOTIFIED",
                    "timestamp": now,
                    "delivery_channel": "Simulated gateway (message not sent)",
                    "is_simulated": True,
                    "incident_is_simulated": is_simulated
                }
                records.append(rec)
                self.notification_history.insert(0, rec)

        logger.info(f"Dispatched {len(records)} emergency notifications for incident {incident_id} (Simulated: {is_simulated})")
        return records
