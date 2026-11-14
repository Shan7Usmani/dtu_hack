import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Phone, ShieldAlert, UserCheck } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { SectionHeading } from '../components/PageHeader';
import { Metric } from '../components/Metric';
import { STATUS_LABELS, fmt } from '../lib/format';

function LiveRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b py-2.5 last:border-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, description, badge }) {
  return (
    <Card>
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between">
          <span className="flex size-8 items-center justify-center rounded-md border bg-secondary">
            <Icon className="size-4 text-muted-foreground" />
          </span>
          {badge}
        </div>
        <CardTitle className="pt-1">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export default function Home() {
  const { telemetry, status, riskScore, fps, online, demoMode, activeIncident } = useSystem();

  const loading = !telemetry;
  const phoneDetected = Boolean(telemetry?.phone_detected);
  const events = telemetry?.drowsiness_events ?? 0;

  return (
    <div className="flex flex-col gap-12">
      {/* Hero */}
      <section className="grid gap-8 pt-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start">
        <div className="max-w-xl">
          <StatusBadge tone={online === false ? 'danger' : demoMode ? 'warning' : 'success'}>
            {online === false ? 'Backend offline' : demoMode ? 'Demo data' : 'Live telemetry'}
          </StatusBadge>
          <h1 className="mt-4 text-[clamp(1.9rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight">
            Driver safety, measured in real time.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Netrakshak reads eye closure, face presence and handheld phone use from a single webcam, entirely inside the
            browser. When the driver becomes unsafe it records an alert, raises the risk score, and shows the evidence
            it actually has. The emergency flow is present but is exercised through a clearly labelled simulation.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to="/dashboard">
                Open live monitor
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/technology">How it works</Link>
            </Button>
          </div>
          <p className="mt-3 text-[12px] text-muted-foreground">
            No account, no cloud, no driver roster. Everything runs in this tab; camera frames never leave the device.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Current session</CardTitle>
            <CardDescription>Read straight from the in-browser detector, refreshed five times a second.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3].map((row) => (
                  <Skeleton key={row} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div>
                <LiveRow label="Backend">
                  <StatusBadge tone={online === false ? 'danger' : 'success'}>
                    {online === false ? 'Unreachable' : 'Reachable'}
                  </StatusBadge>
                </LiveRow>
                <LiveRow label="Driver state">
                  <span className="text-[13px] font-medium">{STATUS_LABELS[status] || 'Unknown'}</span>
                </LiveRow>
                <LiveRow label="Eyes">
                  <span className="font-mono text-[13px] tabular">
                    EAR {fmt(telemetry?.average_ear, 3)}
                  </span>
                </LiveRow>
                <LiveRow label="Phone">
                  <StatusBadge tone={phoneDetected ? 'danger' : 'success'}>
                    {phoneDetected ? 'Detected' : 'Clear'}
                  </StatusBadge>
                </LiveRow>
                <LiveRow label="Emergency">
                  <StatusBadge tone={activeIncident ? 'danger' : 'neutral'}>
                    {activeIncident ? 'Incident open' : 'Standby'}
                  </StatusBadge>
                </LiveRow>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Live numbers */}
      <section>
        <SectionHeading
          title="Live numbers"
          description="These four values are the only large figures in the product. Everything else is a table row."
        />
        <Card>
          <CardContent className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
            {loading ? (
              [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)
            ) : (
              <>
                <Metric label="Risk score" value={Math.round(riskScore)} unit="/ 100" />
                <Metric label="Drowsiness events" value={events} hint="This session" />
                <Metric label="Session uptime" value={telemetry?.monitoring_duration_formatted || '00:00:00'} />
                <Metric label="Capture rate" value={fmt(fps, 1)} unit="fps" />
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Capabilities, each showing its live state */}
      <section>
        <SectionHeading
          title="What the system actually does"
          description="Each card shows the state reported by the running detector, not a marketing figure."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CapabilityCard
            icon={Eye}
            title="Eye closure (EAR)"
            description="Six landmarks per eye produce an eye-aspect-ratio. Blinks are separated from real closure."
            badge={
              <StatusBadge tone={telemetry?.is_eyes_closed ? 'danger' : 'success'}>
                {telemetry?.is_eyes_closed ? 'Closed' : 'Open'}
              </StatusBadge>
            }
          />
          <CapabilityCard
            icon={Phone}
            title="Phone use"
            description="Hand and face landmarks together flag a handheld device while the vehicle is moving."
            badge={
              <StatusBadge tone={phoneDetected ? 'danger' : 'success'}>
                {phoneDetected ? 'Detected' : 'Clear'}
              </StatusBadge>
            }
          />
          <CapabilityCard
            icon={UserCheck}
            title="Face presence"
            description="Detects no driver, one driver, or several faces in frame so alerts are not raised blindly."
            badge={<StatusBadge tone="neutral">{STATUS_LABELS[status] || 'Waiting'}</StatusBadge>}
          />
          <CapabilityCard
            icon={ShieldAlert}
            title="Emergency response"
            description="Impact scoring is ported to the browser and exercised with a labelled fixture payload. Nothing is dispatched."
            badge={
              <StatusBadge tone={activeIncident ? 'danger' : 'neutral'}>
                {activeIncident ? 'Open' : 'Standby'}
              </StatusBadge>
            }
          />
        </div>
      </section>

      {/* Honest limits */}
      <section className="rounded-lg border bg-surface">
        <div className="p-6">
          <h2 className="text-[15px] font-semibold">Not connected in this build</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            The interface only shows what the system measures. These inputs do not exist here, so no screen pretends
            they do:
          </p>
          <ul className="mt-4 grid gap-2 text-[13px] text-muted-foreground sm:grid-cols-2">
            <li className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              GPS or location hardware - incidents carry coordinates only if you grant browser geolocation.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              Vehicle speed, OBD or accelerometer - impact scoring needs a sensor payload.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              Alcohol or breath sensors.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              Driver rosters, vehicle registrations and trip history.
            </li>
            <li className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
              A real SMS, call or dispatch provider - every notification is marked simulated.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
