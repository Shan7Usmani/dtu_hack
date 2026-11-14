import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Camera, CameraOff, Phone, Play, Square, Video } from 'lucide-react';

import { useSession } from '../context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { StatusBadge } from './ui/badge';
import { EmptyState } from './ui/empty-state';
import { fmt } from '../lib/format';

function CameraNotice({ icon: Icon = CameraOff, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-[13px] font-medium">{title}</p>
      <p className="max-w-sm text-[12px] leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/**
 * Browser camera panel. The MediaStream is owned by SessionProvider (which also
 * feeds the inference loop); this component only shows a preview of it plus the
 * live readouts the detectors produce.
 */
export default function CameraStream() {
  const {
    cameraState,
    cameraError,
    cameraConnected,
    stream,
    devices,
    deviceId,
    selectDevice,
    startCamera,
    stopCamera,
    resolution,
    engineStatus,
    engineError,
    inferenceFps,
    lastInferenceMs,
    framesProcessed,
    paused,
    telemetry,
    demoMode,
  } = useSession();

  const previewRef = useRef(null);

  useEffect(() => {
    if (previewRef.current) previewRef.current.srcObject = stream || null;
  }, [stream, cameraState]);

  const status = telemetry?.status || 'STANDBY';
  const phone = Boolean(telemetry?.phone_detected);
  const drowsy = status === 'DROWSY';

  const controls = (
    <div className="flex flex-wrap items-center gap-1.5">
      {devices.length > 1 && (
        <select
          value={deviceId || ''}
          onChange={(event) => selectDevice(event.target.value)}
          aria-label="Camera device"
          className="h-8 max-w-[11rem] rounded-md border bg-background px-2 text-[12px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      )}
      {cameraConnected ? (
        <Button variant="outline" size="sm" onClick={stopCamera}>
          <Square className="size-3.5" />
          Stop camera
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={() => startCamera()} disabled={cameraState === 'requesting'}>
          <Play className="size-3.5" />
          {cameraState === 'requesting' ? 'Starting...' : 'Start camera'}
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Camera</CardTitle>
          <CardDescription>
            {demoMode
              ? 'Demo mode - no frames are captured'
              : 'In-browser capture. Face and hand landmarks run in WebAssembly on this device.'}
          </CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge
            tone={demoMode ? 'warning' : cameraConnected ? (drowsy || phone ? 'danger' : 'success') : 'neutral'}
          >
            {demoMode ? 'Demo' : cameraConnected ? (phone ? 'Phone' : drowsy ? 'Drowsy' : 'Live') : 'Idle'}
          </StatusBadge>
          {!demoMode && controls}
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          {demoMode ? (
            <CameraNotice
              icon={Video}
              title="Simulated telemetry"
              description="Demo mode replaces camera input with a scripted EAR waveform. Point the camera at a driver and turn demo mode off to measure anything real."
            />
          ) : cameraConnected ? (
            <>
              <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="size-full -scale-x-100 object-cover"
                aria-label="Live camera preview"
              />
              <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                <div className="rounded-md border bg-background/85 px-2 py-1 backdrop-blur-sm">
                  <p className="text-[11px] font-medium">
                    {phone ? 'Phone detected' : status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')}
                  </p>
                  <p className="font-mono text-[11px] tabular text-muted-foreground">
                    EAR {fmt(telemetry?.average_ear, 3)} · closed {fmt(telemetry?.closed_duration, 1)}s
                  </p>
                </div>
                <div className="rounded-md border bg-background/85 px-2 py-1 text-right backdrop-blur-sm">
                  <p className="font-mono text-[11px] tabular text-muted-foreground">{fmt(inferenceFps, 0)} fps</p>
                </div>
              </div>

              {phone && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-md border border-destructive bg-destructive px-3 py-2 text-center">
                  <span className="flex items-center justify-center gap-2 text-[13px] font-semibold text-destructive-foreground">
                    <Phone className="size-4" />
                    Handheld phone detected near the face
                  </span>
                </div>
              )}
              {drowsy && !phone && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-md border border-destructive bg-destructive px-3 py-2 text-center">
                  <span className="flex items-center justify-center gap-2 text-[13px] font-semibold text-destructive-foreground">
                    <AlertTriangle className="size-4" />
                    Eyes closed for {fmt(telemetry?.closed_duration, 1)}s
                  </span>
                </div>
              )}
              {paused && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-background/90 text-center">
                  <p className="text-[13px] font-medium">Inference paused</p>
                  <p className="text-[12px] text-muted-foreground">The tab was hidden. Return to resume detection.</p>
                </div>
              )}
            </>
          ) : cameraState === 'requesting' ? (
            <CameraNotice
              icon={Camera}
              title="Waiting for camera permission"
              description="Allow camera access in the browser prompt. Video never leaves this device."
            />
          ) : cameraState === 'error' || cameraState === 'unsupported' ? (
            <CameraNotice
              icon={CameraOff}
              title={cameraState === 'unsupported' ? 'Camera API unavailable' : 'Camera could not start'}
              description={cameraError || 'No camera stream is available.'}
              action={
                <Button size="sm" variant="outline" onClick={() => startCamera()}>
                  <Play className="size-3.5" />
                  Retry
                </Button>
              }
            />
          ) : (
            <CameraNotice
              icon={Camera}
              title="Camera is stopped"
              description="Start the camera to load the landmark models and begin measuring eye closure and phone use. Nothing is recorded or uploaded."
              action={
                <Button size="sm" onClick={() => startCamera()}>
                  <Play className="size-3.5" />
                  Start camera
                </Button>
              }
            />
          )}
        </div>

        {engineError && (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/5 px-3 py-2 text-[12px] leading-relaxed">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
            {engineError}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span className="font-mono tabular">
            {resolution ? `${resolution.width} x ${resolution.height}` : 'resolution --'} ·{' '}
            {engineStatus.delegate ? `${engineStatus.delegate} delegate` : 'models idle'} ·{' '}
            {framesProcessed.toLocaleString()} frames
          </span>
          <span className="font-mono tabular">
            {lastInferenceMs == null ? 'inference --' : `inference ${lastInferenceMs} ms`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
