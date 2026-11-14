import { FaceLandmarker, FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

const BASE = import.meta.env.BASE_URL || '/';
const WASM_PATH = `${BASE}wasm`;
const FACE_MODEL = `${BASE}models/face_landmarker.task`;
const HAND_MODEL = `${BASE}models/hand_landmarker.task`;

function buildFace(fileset, delegate) {
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: false,
  });
}

function buildHands(fileset, delegate) {
  return HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate },
    runningMode: 'VIDEO',
    numHands: 2,
  });
}

async function initialise(delegate) {
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
  const face = await buildFace(fileset, delegate);
  const hands = await buildHands(fileset, delegate);
  return { face, hands };
}

/**
 * Loads both MediaPipe tasks from files served out of /public, so a deployed
 * build never calls a CDN. Falls back from the GPU delegate to CPU WASM.
 */
export async function createVisionEngine({ onStatus } = {}) {
  let delegate = 'GPU';
  let face;
  let hands;

  onStatus?.('loading', 'Loading face landmarks');

  try {
    ({ face, hands } = await initialise('GPU'));
  } catch (gpuError) {
    onStatus?.('loading', 'GPU delegate unavailable, using CPU WASM');
    delegate = 'CPU';
    ({ face, hands } = await initialise('CPU'));
  }

  onStatus?.('ready', `Landmarkers ready (${delegate})`);

  return {
    delegate,
    detect(video, timestampMs) {
      const faceResult = face.detectForVideo(video, timestampMs);
      const handResult = hands.detectForVideo(video, timestampMs);
      return {
        faces: faceResult?.faceLandmarks || [],
        blendshapes: faceResult?.faceBlendshapes?.[0]?.categories || [],
        hands: handResult?.landmarks || [],
      };
    },
    close() {
      try {
        face?.close();
        hands?.close();
      } catch (error) {
        /* already closed */
      }
    },
  };
}
