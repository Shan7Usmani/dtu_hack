import { ACCIDENT_THRESHOLDS } from './constants';

/**
 * Mirror of AccidentDetector.calculate_accident_confidence
 * (core/accident_detector.py). The browser has no accelerometer, so this is
 * only ever called with an explicitly labelled fixture payload.
 */
export function scoreIncident(payload = {}) {
  let score = 0;

  const gForce = Number(payload.gForce ?? 1);
  const speedDrop = Number(payload.speedDropKmh ?? 0);
  const rotation = Number(payload.rotationDegSec ?? 0);
  const driverStatus = payload.driverStatus || 'AWAKE';
  const eyeClosed = Number(payload.eyeClosedDuration ?? 0);
  const cvCollision = Boolean(payload.cvCollisionCue);

  if (gForce >= 5) score += 45;
  else if (gForce >= 3.5) score += 35;
  else if (gForce >= 2.5) score += 25;
  else if (gForce >= 1.5) score += 10;

  if (speedDrop >= 50) score += 30;
  else if (speedDrop >= 30) score += 20;
  else if (speedDrop >= 15) score += 15;

  if (rotation >= 180) score += 25;
  else if (rotation >= 45) score += 15;

  let driverCondition = 'RESPONSIVE';
  if (driverStatus === 'DROWSY' && eyeClosed >= 3) {
    score += 20;
    driverCondition = 'UNRESPONSIVE';
  } else if (driverStatus === 'NO_DRIVER' || driverStatus === 'UNRESPONSIVE') {
    score += 25;
    driverCondition = 'UNRESPONSIVE';
  }

  if (cvCollision) score += 15;

  const total = Math.min(100, score);
  let severity = 'LOW';
  if (total >= ACCIDENT_THRESHOLDS.critical) severity = 'CRITICAL';
  else if (total >= ACCIDENT_THRESHOLDS.high) severity = 'HIGH';
  else if (total >= ACCIDENT_THRESHOLDS.moderate) severity = 'MODERATE';

  return { confidence: total, severity, driverCondition };
}
