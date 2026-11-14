/** Mirror of utils/geometry.py */
export function euclideanDistance(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

/**
 * EAR = (||P2-P6|| + ||P3-P5||) / (2 * ||P1-P4||)
 * Point order matches the Python implementation.
 */
export function calculateEar(points) {
  if (!points || points.length < 6) return 0;
  const [p1, p2, p3, p4, p5, p6] = points;
  const vertical = euclideanDistance(p2, p6) + euclideanDistance(p3, p5);
  const horizontal = 2.0 * euclideanDistance(p1, p4);
  if (horizontal === 0) return 0;
  return vertical / horizontal;
}
