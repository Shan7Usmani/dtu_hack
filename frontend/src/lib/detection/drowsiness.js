import {
  BLINK_MAX_DURATION,
  CAUTION_DURATION,
  DROWSY_DURATION,
  EAR_THRESHOLD,
} from './constants';

/**
 * Mirror of DrowsinessDetector (core/drowsiness_detector.py).
 *
 * The Python class reads time.monotonic(); here the caller passes a
 * monotonically increasing timestamp in milliseconds, which keeps the state
 * machine pure and testable.
 */
export function createDrowsinessDetector(options = {}) {
  const earThreshold = options.earThreshold ?? EAR_THRESHOLD;
  const blinkMax = options.blinkMax ?? BLINK_MAX_DURATION;
  const cautionDuration = options.cautionDuration ?? CAUTION_DURATION;
  const drowsyDuration = options.drowsyDuration ?? DROWSY_DURATION;
  const earHistoryLimit = options.earHistoryLimit ?? 1000;

  let closedStartMs = 0;
  let isEyesClosed = false;
  let state = 'AWAKE';
  let eventCount = 0;
  let inDrowsyEvent = false;
  let longestClosure = 0;
  let earSum = 0;
  let earCount = 0;
  let earHistory = [];

  function resetEyeTimer() {
    isEyesClosed = false;
    closedStartMs = 0;
    inDrowsyEvent = false;
  }

  function recordEar(averageEar) {
    if (averageEar <= 0) return;
    earHistory.push(averageEar);
    if (earHistory.length > earHistoryLimit) earHistory = earHistory.slice(-earHistoryLimit / 2);
    earSum += averageEar;
    earCount += 1;
  }

  function update(averageEar, faceStatus, nowMs) {
    let closedDuration = 0;

    if (faceStatus === 'NO_DRIVER') {
      resetEyeTimer();
      state = 'NO_DRIVER';
      return buildResult(0, averageEar);
    }

    if (averageEar < earThreshold) {
      if (!isEyesClosed) {
        isEyesClosed = true;
        closedStartMs = nowMs;
      }
      closedDuration = (nowMs - closedStartMs) / 1000;
      if (closedDuration > longestClosure) longestClosure = closedDuration;

      if (closedDuration >= drowsyDuration) {
        state = 'DROWSY';
        if (!inDrowsyEvent) {
          eventCount += 1;
          inDrowsyEvent = true;
        }
      } else if (closedDuration >= cautionDuration) {
        state = 'CAUTION';
      } else if (closedDuration >= blinkMax) {
        // Between a blink and the caution threshold the Python build keeps
        // AWAKE; the duration is still reported so the UI can show it.
        state = 'AWAKE';
      } else {
        state = 'AWAKE';
      }
    } else {
      resetEyeTimer();
      state = 'AWAKE';
    }

    recordEar(averageEar);
    return buildResult(closedDuration, averageEar);
  }

  function buildResult(closedDuration, averageEar) {
    return {
      status: state,
      closed_duration: closedDuration,
      is_eyes_closed: isEyesClosed,
      drowsiness_events: eventCount,
      longest_closure: longestClosure,
      session_avg_ear: earCount ? earSum / earCount : averageEar,
    };
  }

  function reset() {
    resetEyeTimer();
    state = 'AWAKE';
    eventCount = 0;
    longestClosure = 0;
    earSum = 0;
    earCount = 0;
    earHistory = [];
  }

  return { update, reset, getState: () => state };
}
