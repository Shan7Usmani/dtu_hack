import React, { useCallback, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PageHeader, SectionHeading } from '../components/PageHeader';

const MODELS = [
  { name: 'face_landmarker.task', size: '3.6 MB', purpose: '468-point face mesh, 1 face, blendshapes on' },
  { name: 'hand_landmarker.task', size: '7.5 MB', purpose: '21 hand points, 2 hands' },
  { name: 'wasm/vision_wasm_internal.wasm', size: '14 MB', purpose: 'MediaPipe inference runtime' },
  { name: 'wasm/vision_wasm_module_internal.wasm', size: '14 MB', purpose: 'SIMD runtime variant' },
];

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-2.5 last:border-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-medium">{children}</span>
    </div>
  );
}

function storageWorks() {
  try {
    window.localStorage.setItem('netrakshak.selfcheck', '1');
    window.localStorage.removeItem('netrakshak.selfcheck');
    return true;
  } catch (error) {
    return false;
  }
}

export default function SystemPage() {
  const {
    engineStatus,
    engineError,
    cameraState,
    cameraConnected,
    cameraError,
    devices,
    resolution,
    paused,
    inferenceFps,
    lastInferenceMs,
    framesProcessed,
    demoMode,
    online,
    localBackend,
    telemetry,
    alerts,
    incidents,
    contacts,
  } = useSystem();
  const [checks, setChecks] = useState(null);
  const [checkedAt, setCheckedAt] = useState(null);

  const runSelfCheck = useCallback(() => {
    setChecks([
      {
        label: 'Camera API',
        ready: Boolean(navigator.mediaDevices?.getUserMedia),
        detail: navigator.mediaDevices?.getUserMedia ? 'getUserMedia available' : 'not exposed by this browser',
      },
      {
        label: 'WebAssembly',
        ready: typeof WebAssembly === 'object',
        detail: typeof WebAssembly === 'object' ? 'WASM supported' : 'WASM missing - models cannot run',
      },
      {
        label: 'Secure context',
        ready: window.isSecureContext,
        detail: window.isSecureContext ? 'HTTPS or localhost' : 'camera and geolocation need HTTPS',
      },
      {
        label: 'Landmark models',
        ready: engineStatus.state === 'ready',
        detail: engineStatus.state === 'ready' ? `${engineStatus.delegate} delegate` : engineStatus.message,
      },
      {
        label: 'Camera stream',
        ready: cameraConnected,
        detail: cameraConnected ? `${resolution?.width || 0} x ${resolution?.height || 0}` : 'not running',
      },
      { label: 'Storage', ready: storageWorks(), detail: 'localStorage read/write' },
      {
        label: 'Geolocation',
        ready: Boolean(navigator.geolocation),
        detail: navigator.geolocation ? 'permission prompt on demand' : 'not exposed by this browser',
      },
      {
        label: 'Local Flask backend',
        ready: localBackend === 'available',
        detail:
          localBackend === 'available'
            ? 'detected on this host (optional)'
            : 'not running - the app does not need it',
      },
    ]);
    setCheckedAt(new Date().toLocaleString());
  }, [cameraConnected, engineStatus, localBackend, resolution]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="System"
        description="Runtime state of the browser pipeline. Nothing here talks to a server."
        actions={
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="size-4" />
            Reload pipeline
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inference</CardTitle>
            <CardDescription>MediaPipe tasks-vision running on this device</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Engine">
              <StatusBadge
                tone={
                  engineStatus.state === 'ready' ? 'success' : engineStatus.state === 'error' ? 'danger' : 'neutral'
                }
              >
                {engineStatus.state}
              </StatusBadge>
            </Row>
            <Row label="Delegate">{engineStatus.delegate || 'not loaded'}</Row>
            <Row label="Models">{engineStatus.message}</Row>
            <Row label="Inference rate">{inferenceFps ? `${inferenceFps} fps` : '--'}</Row>
            <Row label="Last frame cost">{lastInferenceMs == null ? '--' : `${lastInferenceMs} ms`}</Row>
            <Row label="Frames analysed">{framesProcessed.toLocaleString()}</Row>
            <Row label="Telemetry published">{telemetry ? 'Yes' : 'No'}</Row>
            <Row label="Tab hidden">{paused ? 'Inference paused' : 'Running'}</Row>
            {engineError && <p className="pt-2 text-[12px] text-destructive">{engineError}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Camera</CardTitle>
            <CardDescription>getUserMedia, no recording, no upload</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="State">
              <StatusBadge
                tone={cameraConnected ? 'success' : cameraState === 'error' || cameraState === 'unsupported' ? 'danger' : 'neutral'}
              >
                {cameraState}
              </StatusBadge>
            </Row>
            <Row label="Resolution">{resolution ? `${resolution.width} x ${resolution.height}` : '--'}</Row>
            <Row label="Devices detected">{devices.length || '--'}</Row>
            <Row label="Demo mode">
              <StatusBadge tone={demoMode ? 'warning' : 'neutral'}>{demoMode ? 'On' : 'Off'}</StatusBadge>
            </Row>
            {cameraError && <p className="pt-2 text-[12px] text-warning">{cameraError}</p>}
            {online === false && <p className="pt-1 text-[12px] text-muted-foreground">Camera error state is active.</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Self-check</CardTitle>
            <CardDescription>
              Each flag is read from this browser at the moment you run it. Nothing is reported as ready unless it was
              verified.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={runSelfCheck}>
            <ShieldCheck className="size-4" />
            Run self-check
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {!checks ? (
            <p className="text-[13px] text-muted-foreground">
              No self-check has run in this session. The result reflects the browser, not a server process.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-[12px] text-muted-foreground">Checked at {checkedAt}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Check</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead className="hidden sm:table-cell">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checks.map((check) => (
                    <TableRow key={check.label}>
                      <TableCell className="font-medium">{check.label}</TableCell>
                      <TableCell>
                        <StatusBadge tone={check.ready ? 'success' : 'warning'}>
                          {check.ready ? 'Ready' : 'Unavailable'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
                        {check.detail}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Local storage</CardTitle>
            <CardDescription>All persistence is in this browser profile</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Alerts stored">{alerts.length} (max 100)</Row>
            <Row label="Incidents stored">{incidents.length} (max 20)</Row>
            <Row label="Contacts stored">{contacts.length}</Row>
            <Row label="Theme + demo preference">localStorage keys</Row>
            <p className="pt-2 text-[12px] leading-relaxed text-muted-foreground">
              Clearing site data removes alerts, incidents, contacts and preferences. There is no account and no server
              copy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optional backend</CardTitle>
            <CardDescription>Detected, never required</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Row label="Flask server on this host">
              <StatusBadge tone={localBackend === 'available' ? 'success' : 'neutral'}>
                {localBackend === 'available' ? 'Detected' : localBackend === 'unknown' ? 'Checking' : 'Not running'}
              </StatusBadge>
            </Row>
            <p className="pt-2 text-[12px] leading-relaxed text-muted-foreground">
              The deployed build is static. A local server.py is only used when it happens to be running on localhost,
              and the app works identically without it.
            </p>
          </CardContent>
        </Card>
      </div>

      <section>
        <SectionHeading title="Bundled model files" description="Served from /public, so no CDN is contacted at runtime." />
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="hidden sm:table-cell">Used for</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MODELS.map((model) => (
                  <TableRow key={model.name}>
                    <TableCell className="font-mono text-[12px]">{model.name}</TableCell>
                    <TableCell className="tabular">{model.size}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">{model.purpose}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
