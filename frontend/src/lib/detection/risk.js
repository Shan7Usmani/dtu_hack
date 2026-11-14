/**
 * Mirror of RiskEngine.evaluate_risk (core/risk_engine.py) and the numeric
 * score from server.py (calculate_numeric_risk_score).
 */
export function evaluateRisk({ status, closedDuration = 0, events = 0, faceStatus = 'SINGLE_FACE' }) {
  if (faceStatus === 'NO_DRIVER' || status === 'NO_DRIVER') return 'UNKNOWN';

  if (faceStatus === 'MULTIPLE_FACES' || status === 'MULTIPLE_FACES') {
    return status === 'DROWSY' ? 'HIGH' : 'WARNING';
  }

  if (status === 'DROWSY') {
    if (closedDuration >= 4.0 || events >= 3) return 'CRITICAL';
    return 'HIGH';
  }

  if (status === 'CAUTION') return 'MEDIUM';

  return 'LOW';
}

/** Numeric risk score, clamped 0-100. */
export function numericRiskScore({ status, closedDuration = 0, events = 0, phoneDetected = false, faceStatus }) {
  if (status === 'NO_DRIVER' || faceStatus === 'NO_DRIVER') return 0;

  let score = 15;
  if (status === 'CAUTION') {
    score += 35 + Math.trunc(closedDuration * 10);
  } else if (status === 'DROWSY') {
    score += 65 + Math.trunc(closedDuration * 12) + events * 5;
  } else if (status === 'MULTIPLE_FACES' || faceStatus === 'MULTIPLE_FACES') {
    score += 25;
  }

  if (phoneDetected) score += 35;

  return Math.min(100, Math.max(0, score));
}

/** server.py: phone use forces at least HIGH unless the state is already CRITICAL. */
export function combineRiskLevel(level, phoneDetected) {
  return phoneDetected && level !== 'CRITICAL' ? 'HIGH' : level;
}
