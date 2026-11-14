import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PageHeader, SectionHeading } from '../components/PageHeader';

const PARAMETERS = [
  ['Capture', 'getUserMedia, 640 x 480 ideal, 20 fps inference target'],
  ['Face landmarks', 'MediaPipe FaceLandmarker, 468 points, 1 face, blendshapes on'],
  ['Hand landmarks', 'MediaPipe HandLandmarker, 21 points, 2 hands'],
  ['Eye landmarks', '6 points per eye (right 33/160/158/133/153/144)'],
  ['EAR closure threshold', 'Below 0.22'],
  ['Blink', 'Closure under 0.5 s is ignored'],
  ['Caution state', 'Closure of 1.0 s or more'],
  ['Drowsy alert', 'Closure of 2.0 s or more'],
  ['Phone cue', 'Wrist or index tip within 85 px of an ear zone for 3 frames, scaled by frame width'],
  ['Risk score', 'Base 15; caution +35 and 10x closure; drowsy +65, 12x closure and 5 per event; extra face +25; phone +35; clamped 0-100'],
  ['Incident severity', 'Score 31+ moderate, 61+ high, 81+ critical'],
  ['Inference backend', 'WASM, GPU delegate with CPU fallback'],
];

const PIPELINE = [
  {
    title: '1. Capture',
    body: 'Frames come from getUserMedia in the browser. Inference is paused when the tab is hidden and nothing is uploaded or recorded.',
  },
  {
    title: '2. Measure',
    body: 'FaceLandmarker returns 468 points per face. The EAR is computed from six points per eye, and a state machine turns closure duration into awake, caution or drowsy.',
  },
  {
    title: '3. Correlate',
    body: 'HandLandmarker reports 21 points per hand. A wrist or fingertip inside the ear/cheek zone for three consecutive frames raises the phone flag, which also feeds the numeric risk score.',
  },
  {
    title: '4. Escalate',
    body: 'Crossing the drowsy threshold writes an alert to localStorage and shows it immediately. Incident scoring is a direct port of the Python engine, exercised with a labelled fixture payload because a browser has no accelerometer.',
  },
];

export default function Technology() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Technology"
        description="How the pipeline is built. Every number on this page is a value from the repository or a ported constant, not a benchmark."
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {PIPELINE.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription className="leading-relaxed">{step.body}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section>
        <SectionHeading
          title="Ports and parameters"
          description="constants.js and the detector modules mirror config.py and core/ one to one."
        />
        <Card>
          <div className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Parameter</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PARAMETERS.map(([name, value]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-muted-foreground">{value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Frontend</CardTitle>
            <CardDescription>
              React 18 and Vite. src/lib/detection holds pure mirrors of eye_detector.py, drowsiness_detector.py,
              risk_engine.py, phone_detector.py and accident_detector.py. SessionProvider owns the camera, the
              requestAnimationFrame loop and the published telemetry; there is no polling and no API client. Charts are
              Recharts, primitives follow the shadcn/ui source.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Deployment</CardTitle>
            <CardDescription>
              A static Vite build. Models and the WASM runtime are served from /public/models and /public/wasm, so the
              first load needs no CDN and no backend. Alerts, incidents, contacts and preferences live in localStorage.
              The Python server is kept for local desktop use only; the deployed app never calls it.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="rounded-lg border bg-surface p-6">
        <h2 className="text-[15px] font-semibold">Deliberate limits</h2>
        <ul className="mt-3 grid gap-2 text-[13px] leading-relaxed text-muted-foreground sm:grid-cols-2">
          <li>No accuracy percentage is published. Nothing in the repository measures it, so quoting one would be a guess.</li>
          <li>The phone cue uses landmark proximity only. The OpenCV contour heuristic in the Python build is not ported.</li>
          <li>There is no accelerometer, OBD reader or GPS on a web page, so impact detection is simulation only.</li>
          <li>Notification dispatch is simulated end to end. No SMS, call or webhook is sent from any browser.</li>
          <li>Alerts, incidents and contacts persist in this profile until site data is cleared.</li>
          <li>Inference quality depends on the device GPU. On weak hardware the CPU fallback lowers the frame rate.</li>
        </ul>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link to="/system">
            Check the running pipeline
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
