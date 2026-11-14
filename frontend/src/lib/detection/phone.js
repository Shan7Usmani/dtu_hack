import {
  HAND_INDEX_TIP,
  HAND_WRIST_INDEX,
  PHONE_EAR_INDICES,
  PHONE_PROXIMITY_PX,
  PHONE_REFERENCE_WIDTH,
  PHONE_TRIGGER_FRAMES,
} from './constants';

function center(points) {
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  return [sum[0] / points.length, sum[1] / points.length];
}

function distance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function zonePoints(landmarks, indices, width, height) {
  return indices.map((index) => {
    const lm = landmarks[index];
    return lm ? [lm.x * width, lm.y * height] : null;
  }).filter(Boolean);
}

/**
 * Mirror of PhoneDetector (core/phone_detector.py), minus the OpenCV contour
 * heuristic: the browser pipeline only has landmarks, so proximity is the sole
 * cue. The 3-frame temporal filter is kept so a single stray hand frame does
 * not raise an alarm.
 *
 * Returns the same field names the Python detector returns.
 */
export function createPhoneDetector(options = {}) {
  const proximityPx = options.proximityPx ?? PHONE_PROXIMITY_PX;
  const referenceWidth = options.referenceWidth ?? PHONE_REFERENCE_WIDTH;
  const triggerFrames = options.triggerFrames ?? PHONE_TRIGGER_FRAMES;

  let counter = 0;

  function evaluate({ hands = [], faceLandmarks = null, width = referenceWidth, height = 480 }) {
    let detected = false;
    let confidence = 0;
    let zone = 'NONE';

    const leftEar = faceLandmarks ? zonePoints(faceLandmarks, PHONE_EAR_INDICES.left, width, height) : [];
    const rightEar = faceLandmarks ? zonePoints(faceLandmarks, PHONE_EAR_INDICES.right, width, height) : [];
    const threshold = proximityPx * (width / referenceWidth);

    if (hands.length && (leftEar.length || rightEar.length)) {
      const zones = [
        { name: 'LEFT_EAR', points: leftEar },
        { name: 'RIGHT_EAR', points: rightEar },
      ].filter((entry) => entry.points.length);

      for (const hand of hands) {
        const wrist = hand[HAND_WRIST_INDEX];
        const indexTip = hand[HAND_INDEX_TIP];
        const wristPx = wrist ? [wrist.x * width, wrist.y * height] : null;
        const tipPx = indexTip ? [indexTip.x * width, indexTip.y * height] : null;

        for (const entry of zones) {
          const earCenter = center(entry.points);
          const nearWrist = wristPx ? distance(wristPx, earCenter) < threshold : false;
          const nearTip = tipPx ? distance(tipPx, earCenter) < threshold : false;
          if (nearWrist || nearTip) {
            detected = true;
            confidence = 0.88;
            zone = entry.name;
            break;
          }
        }
        if (detected) break;
      }
    }

    counter = detected ? counter + 1 : Math.max(0, counter - 1);
    const confirmed = counter >= triggerFrames;

    return {
      phone_detected: confirmed,
      phone_status: confirmed ? 'PHONE_DETECTED' : 'NOT_DETECTED',
      confidence: confirmed ? confidence : 0,
      zone: confirmed ? zone : 'NONE',
    };
  }

  function reset() {
    counter = 0;
  }

  return { evaluate, reset };
}
