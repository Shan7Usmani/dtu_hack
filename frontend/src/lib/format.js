export function clamp(value, min = 0, max = 100) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, num));
}

export function isNum(value) {
  return value !== null && value !== undefined && Number.isFinite(Number(value));
}

export function fmt(value, digits = 0, fallback = '--') {
  if (!isNum(value)) return fallback;
  return Number(value).toFixed(digits);
}

export function average(values = []) {
  const nums = values.filter(isNum).map(Number);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

export const STATUS_LABELS = {
  AWAKE: 'Awake',
  CAUTION: 'Caution',
  DROWSY: 'Drowsy',
  NO_DRIVER: 'No driver',
  MULTIPLE_FACES: 'Multiple faces',
  OFFLINE: 'Paused',
};

/** Semantic tone for a driver state. Only used where state is meaningful. */
export function statusTone(status) {
  const key = String(status || '').toUpperCase();
  if (key === 'DROWSY') return 'danger';
  if (key === 'CAUTION' || key === 'MULTIPLE_FACES') return 'warning';
  if (key === 'AWAKE') return 'success';
  return 'neutral';
}

/** Semantic tone for the numeric risk score. */
export function riskTone(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 'neutral';
  if (value >= 70) return 'danger';
  if (value >= 40) return 'warning';
  return 'neutral';
}

export function formatUptime(seconds) {
  if (!Number.isFinite(Number(seconds))) return '--:--:--';
  const total = Math.max(0, Math.floor(Number(seconds)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((part) => String(part).padStart(2, '0')).join(':');
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString([], { hour12: false });
}
