import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Pause, Play, RotateCcw } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { useToast } from '../components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Skeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/ui/empty-state';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { Metric } from '../components/Metric';
import CameraStream from '../components/CameraStream';
import DetectionCards from '../components/DetectionCards';
import RiskGauge from '../components/RiskGauge';
import AlertCenter from '../components/AlertCenter';
import SessionChart from '../components/LiveChart';
import { STATUS_LABELS, fmt } from '../lib/format';

function SessionFact({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[13px] tabular">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const {
    telemetry,
    status,
    riskScore,
    fps,
    series,
    alerts,
    detections,
    isMonitoring,
    paused,
    cameraConnected,
    cameraState,
    demoMode,
    setDemoMode,
    activeIncident,
    acknowledgeAlert,
    startCamera,
    stopCamera,
    resetSession,
  } = useSystem();
  const { pushToast } = useToast();
  const [busy, setBusy] = useState(null);

  const loading = !telemetry;

  const run = async (label, fn, successMessage) => {
    setBusy(label);
    const res = await fn();
    setBusy(null);
    if (res && res.ok === false) {
      pushToast({ tone: 'danger', title: `${successMessage} failed`, message: res.message });
    } else {
      pushToast({ tone: 'signal', title: successMessage });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Monitor"
        description="Live driver state from the browser camera. Landmark inference runs on this device; no frame is uploaded."
        actions={
          <>
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
              <span className="text-[12px] text-muted-foreground">Demo data</span>
              <Switch checked={demoMode} onCheckedChange={setDemoMode} aria-label="Toggle demo mode" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => run('reset', async () => resetSession() || { ok: true }, 'Session reset')}
              disabled={busy === 'reset' || demoMode}
            >
              <RotateCcw className="size-4" />
              {busy === 'reset' ? 'Resetting...' : 'Reset session'}
            </Button>
            {cameraConnected ? (
              <Button variant="destructive" size="sm" onClick={stopCamera}>
                <Pause className="size-4" />
                Stop camera
              </Button>
            ) : (
              <Button size="sm" onClick={() => startCamera()} disabled={cameraState === 'requesting' || demoMode}>
                <Play className="size-4" />
                {cameraState === 'requesting' ? 'Starting...' : 'Start camera'}
              </Button>
            )}
          </>
        }
      />

      {activeIncident && (
        <div className="flex flex-col gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="danger">Incident open</StatusBadge>
            <span className="text-[13px]">
              {activeIncident.incident_id} · {activeIncident.severity} · confidence{' '}
              {fmt(activeIncident.confidence, 0)}%
            </span>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/emergency">
              Open incident
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      )}

      {paused && cameraConnected && (
        <p className="rounded-lg border bg-muted/40 px-4 py-2 text-[12px] text-muted-foreground">
          Inference is paused because the tab is hidden. Return to this tab to resume.
        </p>
      )}

      <Card>
        <CardContent className="grid grid-cols-2 gap-6 p-5 lg:grid-cols-3">
          <div>
            <p className="pb-2 text-[12px] font-medium text-muted-foreground">Risk score</p>
            {loading ? <Skeleton className="h-12 w-32" /> : <RiskGauge score={riskScore} status={status} />}
          </div>
          {loading ? (
            <>
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </>
          ) : (
            <>
              <Metric
                label="Drowsiness events"
                value={telemetry?.drowsiness_events ?? 0}
                hint="Counted since the session started"
              />
              <Metric label="Session uptime" value={telemetry?.monitoring_duration_formatted || '00:00:00'} hint="Slot clock" />
            </>
          )}
          <div className="col-span-2 lg:col-span-1">
            <Metric
              label="Inference rate"
              value={fps ? fmt(fps, 0) : '--'}
              unit="fps"
              hint="Frames analysed in the last second"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <CameraStream />

          <Card>
            <CardHeader>
              <CardTitle>Risk over time</CardTitle>
              <CardDescription>Sampled from the in-browser loop, roughly the last 30 seconds.</CardDescription>
            </CardHeader>
            <CardContent>
              <SessionChart data={series} dataKey="risk" label="Risk score" domain={[0, 100]} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Detectors</CardTitle>
              <CardDescription>Derived from the live landmark output</CardDescription>
            </CardHeader>
            <CardContent>
              <DetectionCards detections={detections} loading={!detections} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session detail</CardTitle>
              <CardDescription>Raw values behind the state machine</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[0, 1, 2, 3].map((row) => (
                    <Skeleton key={row} className="h-7 w-full" />
                  ))}
                </div>
              ) : (
                <div>
                  <SessionFact label="State" value={STATUS_LABELS[status] || 'Unknown'} />
                  <SessionFact label="Average EAR" value={fmt(telemetry?.average_ear, 3)} />
                  <SessionFact label="Session average EAR" value={fmt(telemetry?.session_avg_ear, 3)} />
                  <SessionFact label="Closed now" value={`${fmt(telemetry?.closed_duration, 1)}s`} />
                  <SessionFact label="Longest closure" value={`${fmt(telemetry?.longest_closure, 1)}s`} />
                  <SessionFact label="Faces in frame" value={telemetry?.face_count ?? '--'} />
                  <SessionFact label="Monitoring" value={isMonitoring ? 'Running' : 'Paused'} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <section>
        <SectionHeading
          title="Recent alerts"
          description="Written by the detector when drowsiness or phone use crosses a threshold."
          actions={
            <Button asChild variant="ghost" size="sm">
              <Link to="/alerts">
                All alerts
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          }
        />
        <Card>
          <CardContent className="pt-5">
            {alerts.length === 0 ? (
              <EmptyState
                title="No alerts yet"
                description="The detector has not logged any event in this browser."
              />
            ) : (
              <AlertCenter alerts={alerts} loading={false} limit={5} onChanged={() => {}} />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
