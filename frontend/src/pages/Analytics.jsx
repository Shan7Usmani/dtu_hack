import React from 'react';
import { Download } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { Metric } from '../components/Metric';
import SessionChart from '../components/LiveChart';
import { exportSeriesCsv } from '../lib/csv';
import { STATUS_LABELS, average, fmt } from '../lib/format';

export default function Analytics() {
  const {
    telemetry,
    status,
    series,
    alerts,
    activeIncident,
    inferenceFps,
    lastInferenceMs,
    framesProcessed,
    resolution,
    engineStatus,
  } = useSystem();

  const loading = !telemetry;
  const events = telemetry?.drowsiness_events ?? 0;
  const avgRisk = average(series.map((point) => point.risk));

  const summary = [
    { label: 'Session duration', value: telemetry?.monitoring_duration_formatted || '00:00:00', source: 'Detector state' },
    { label: 'Drowsiness events', value: events, source: 'Detector state' },
    { label: 'Longest eye closure', value: `${fmt(telemetry?.longest_closure, 1)} s`, source: 'Detector state' },
    { label: 'Session average EAR', value: fmt(telemetry?.session_avg_ear, 3), source: 'Detector state' },
    { label: 'Current state', value: STATUS_LABELS[status] || 'Unknown', source: 'Detector state' },
    { label: 'Alerts logged', value: alerts.length, source: 'localStorage' },
    { label: 'Alerts unacknowledged', value: alerts.filter((alert) => !alert.acknowledged).length, source: 'localStorage' },
    { label: 'Open incidents', value: activeIncident ? 1 : 0, source: 'localStorage' },
    { label: 'Frames analysed', value: framesProcessed.toLocaleString(), source: 'Inference loop' },
    { label: 'Inference rate', value: inferenceFps ? `${fmt(inferenceFps, 0)} fps` : '--', source: 'Inference loop' },
    {
      label: 'Last frame cost',
      value: lastInferenceMs == null ? '--' : `${lastInferenceMs} ms`,
      source: 'Inference loop',
    },
    {
      label: 'Capture resolution',
      value: resolution ? `${resolution.width} x ${resolution.height}` : '--',
      source: 'Camera track',
    },
    {
      label: 'Delegate',
      value: engineStatus.delegate || 'not loaded',
      source: 'MediaPipe tasks-vision',
    },
    { label: 'Samples in this view', value: series.length, source: 'Client buffer' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Analytics"
        description="Everything here is the current browser session. No trip history is stored, so there is no cross-day trend to chart."
        actions={
          <Button variant="outline" size="sm" onClick={() => exportSeriesCsv(series)} disabled={!series.length}>
            <Download className="size-4" />
            Export samples
          </Button>
        }
      />

      <Card>
        <CardContent className="grid grid-cols-2 gap-6 p-5 sm:grid-cols-4">
          {loading ? (
            [0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-14 w-full" />)
          ) : (
            <>
              <Metric label="Drowsiness events" value={events} hint="This session" />
              <Metric label="Longest closure" value={fmt(telemetry?.longest_closure, 1)} unit="s" />
              <Metric
                label="Average risk (sampled)"
                value={avgRisk === null ? '--' : Math.round(avgRisk)}
                unit="/ 100"
              />
              <Metric label="Frames analysed" value={framesProcessed.toLocaleString()} hint="Since the page loaded" />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Risk score</CardTitle>
            <CardDescription>Sampled every 250 ms from the detection loop.</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionChart data={series} dataKey="risk" label="Risk score" domain={[0, 100]} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Eye aspect ratio</CardTitle>
            <CardDescription>Closure threshold is EAR 0.22, mirrored from config.py.</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionChart data={series} dataKey="ear" label="Average EAR" domain={[0, 0.5]} colorClass="text-chart-2" />
          </CardContent>
        </Card>
      </div>

      <section>
        <SectionHeading title="Session summary" description="Each row names where the value comes from." />
        <Card>
          <CardContent className="pt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="hidden sm:table-cell">Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.map((row) => (
                  <TableRow key={row.label}>
                    <TableCell className="font-medium">{row.label}</TableCell>
                    <TableCell className="text-right font-mono text-[13px] tabular">{row.value}</TableCell>
                    <TableCell className="hidden font-mono text-[12px] text-muted-foreground sm:table-cell">
                      {row.source}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg border bg-surface p-6">
        <h2 className="text-[15px] font-semibold">What is missing, and why</h2>
        <ul className="mt-3 grid gap-2 text-[13px] leading-relaxed text-muted-foreground sm:grid-cols-2">
          <li>
            <span className="text-foreground">Safe-driving percentage.</span> It needs a trip history and a definition of
            a safe distance. Neither exists in a browser build, so it is not shown.
          </li>
          <li>
            <span className="text-foreground">Overspeed or distraction counts.</span> A webcam gives no speed, and this
            pipeline does not estimate head pose, so counting either would be invented.
          </li>
          <li>
            <span className="text-foreground">Hourly or daily trend.</span> Only the current session is held; refresh the
            page and the counters start again.
          </li>
          <li>
            <span className="text-foreground">Sensor fusion state.</span> No vehicle bus, GPS receiver or breath sensor
            is reachable from the browser.
          </li>
        </ul>
      </section>
    </div>
  );
}
