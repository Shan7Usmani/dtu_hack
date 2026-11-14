import { LEFT_EYE_LANDMARKS, RIGHT_EYE_LANDMARKS } from './constants';
import { calculateEar } from './geometry';

export const EMPTY_EYES = {
  left_ear: 0,
  right_ear: 0,
  average_ear: 0,
  left_eye_points: [],
  right_eye_points: [],
};

function extractPoints(landmarks, indices, width, height) {
  const points = [];
  for (const index of indices) {
    const lm = landmarks[index];
    if (lm) points.push([Math.trunc(lm.x * width), Math.trunc(lm.y * height)]);
  }
  return points;
}

/**
 * Mirror of EyeDetector.analyze_eyes (core/eye_detector.py).
 * `landmarks` is an array of normalized {x, y, z} points from FaceLandmarker.
 */
export function analyzeEyes(landmarks, width, height) {
  if (!landmarks || !landmarks.length || width <= 0 || height <= 0) {
    return { ...EMPTY_EYES };
  }

  const rightEyePoints = extractPoints(landmarks, RIGHT_EYE_LANDMARKS, width, height);
  const leftEyePoints = extractPoints(landmarks, LEFT_EYE_LANDMARKS, width, height);

  const rightEar = calculateEar(rightEyePoints);
  const leftEar = calculateEar(leftEyePoints);

  return {
    left_ear: leftEar,
    right_ear: rightEar,
    average_ear: (leftEar + rightEar) / 2,
    left_eye_points: leftEyePoints,
    right_eye_points: rightEyePoints,
  };
}
