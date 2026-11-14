import React from 'react';
import { RotateCcw, UserX } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { useToast } from '../components/ui/toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { EmptyState } from '../components/ui/empty-state';
import { Skeleton } from '../components/ui/skeleton';
import { PageHeader, SectionHeading } from '../components/PageHeader';
import { STATUS_LABELS, fmt } from '../lib/format';

export default function DriverPage() {
  const { telemetry, status, alerts, isMonitoring, cameraConnected, resolution, resetSession } = useSystem();
  const { pushToast } = useToast();

  const loading = !telemetry;

  const reset = () => {
    resetSession();
    pushToast({
      tone: 'signal',
      title: 'Session reset',
      message: 'Closure counters and the sampled series were cleared in this tab.',
    });
  };

  const metrics = [
    { label: 'State', value: STATUS_LABELS[status] || 'Unknown' },
    { label: 'Session uptime', value: telemetry?.monitoring_duration_formatted || '00:00:00' },
    { label: 'Drowsiness events', value: telemetry?.drowsiness_events ?? 0 },
    { label: 'Longest closure', value: `${fmt(telemetry?.longest_closure, 1)} s` },
    { label: 'Average EAR now', value: fmt(telemetry?.average_ear, 3) },
    { label: 'Session average EAR', value: fmt(telemetry?.session_avg_ear, 3) },
    { label: 'Phone detected', value: telemetry?.phone_detected ? 'Yes' : 'No' },
    { label: 'Alerts logged', value: alerts.length },
    { label: 'Monitoring', value: isMonitoring ? 'Running' : 'Paused' },
    { label: 'Camera', value: cameraConnected ? 'Live' : 'Stopped' },
    { label: 'Capture resolution', value: resolution ? `${resolution.width} x ${resolution.height}` : '--' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Session"
        description="What the current monitoring session has measured, for the person in front of the camera."
        actions={
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="size-4" />
            Reset session
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Driver profile</CardTitle>
          <CardDescription>This route exists, but the data behind it does not.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={UserX}
            title="No driver profile configured"
            description="There is no roster, vehicle register or licence store in this build, and no backend to ask. Rather than showing an invented name, vehicle and safety score, this page shows nothing. The session below belongs to whoever is in front of the camera."
          />
        </CardContent>
      </Card>

      <section>
        <SectionHeading title="Session metrics" description="Measured values only, from the in-browser detector." />
        <Card>
          <CardContent className="pt-5">
            {loading ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3, 4].map((row) => (
                  <Skeleton key={row} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right font-mono text-[13px] tabular">{row.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
