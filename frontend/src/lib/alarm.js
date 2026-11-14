/**
 * Browser alarm tone, mirroring core/alarm_manager.py and templates/index.html.
 *
 * Uses the Web Audio API so no asset file has to be deployed and the tone works
 * offline. A single sawtooth oscillator alternates between 880 Hz and 1320 Hz,
 * the same dual-tone the server build synthesises into assets/sounds/alarm.wav.
 *
 * startAlarm()/stopAlarm() (via setAlarm) are idempotent and safe to call on
 * every frame. The AudioContext stays suspended until a user gesture;
 * resumeGesture() must be called from a click/keydown handler (and is called
 * automatically from startCamera and from toggling demo mode on).
 *
 * If the browser has no Web Audio support the calls are silent no-ops, the same
 * way the server build falls back to winsound and then the terminal bell.
 */

const FREQUENCY_A = 880; // A5, matches alarm.wav tone 1
const FREQUENCY_B = 1320; // E6, matches alarm.wav tone 2
const TOGGLE_MS = 150; // alternate tones every 150 ms
const GAIN = 0.25;

let audioCtx = null;
let oscillator = null;
let gainNode = null;
let toggleTimer = null;
let currentFrequency = FREQUENCY_A;
let desired = false; // whether the caller wants the alarm playing
let active = false; // whether the oscillator is actually running
let gestureListenersAttached = false;

function ensureContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

function attachGestureListeners() {
  if (gestureListenersAttached) return;
  gestureListenersAttached = true;
  const resume = () => resumeGesture();
  // once: the first gesture anywhere is enough to unlock audio for the page.
  document.addEventListener('click', resume, { once: true });
  document.addEventListener('keydown', resume, { once: true });
}

function startOscillator() {
  if (active) return;
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    // Browsers block audio until a gesture; retry when the context resumes.
    attachGestureListeners();
    return;
  }

  oscillator = ctx.createOscillator();
  gainNode = ctx.createGain();
  oscillator.type = 'sawtooth';
  currentFrequency = FREQUENCY_A;
  oscillator.frequency.setValueAtTime(currentFrequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(GAIN, ctx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start();
  active = true;

  const toggle = () => {
    if (!active) return;
    currentFrequency = currentFrequency === FREQUENCY_A ? FREQUENCY_B : FREQUENCY_A;
    oscillator.frequency.setValueAtTime(currentFrequency, ctx.currentTime);
    toggleTimer = setTimeout(toggle, TOGGLE_MS);
  };
  toggleTimer = setTimeout(toggle, TOGGLE_MS);
}

function stopOscillator() {
  if (toggleTimer) {
    clearTimeout(toggleTimer);
    toggleTimer = null;
  }
  if (oscillator) {
    try {
      oscillator.stop();
    } catch (e) {
      // already stopped (e.g. page teardown) — ignore
    }
    oscillator.disconnect();
    oscillator = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  active = false;
}

/**
 * Unlock (or attempt to unlock) the AudioContext on a user gesture. Safe to
 * call many times. If the alarm was desired but blocked on a suspended
 * context, this starts it once the context is running.
 */
export function resumeGesture() {
  const ctx = ensureContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  attachGestureListeners();
  if (desired && !active) startOscillator();
}

/**
 * Set the desired alarm state. Idempotent: calling setAlarm(true) while the
 * oscillator is already running is a no-op, and setAlarm(false) while stopped
 * is a no-op.
 */
export function setAlarm(on) {
  desired = Boolean(on);
  if (desired) {
    startOscillator();
  } else {
    stopOscillator();
  }
}

/** Stop the alarm and forget the desired state (used at teardown). */
export function stopAlarm() {
  setAlarm(false);
}

export function isAlarmActive() {
  return active;
}