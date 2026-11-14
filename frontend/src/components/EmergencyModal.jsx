import React from 'react';
import { ShieldAlert } from 'lucide-react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { StatusBadge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EmptyState } from './ui/empty-state';
import EmergencyTimeline from './EmergencyTimeline';
import EmergencyMap from './EmergencyMap';
import { fmt } from '../lib/format';

function severityTone(severity) {
  const key = String(severity || '').toUpperCase();
  if (key === 'CRITICAL' || key === 'HIGH') return 'danger';
  if (key === 'MEDIUM') return 'warning';
  return 'neutral';
}

export default function EmergencyModal({ open, onOpenChange, incident, busy, onCancel, onRequestHelp, onResolve }) {
  if (!incident) return null;

  const notifications = incident.notifications || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Incident {incident.incident_id}
            {incident.is_simulated && <StatusBadge tone="warning">Simulated</StatusBadge>}
          </DialogTitle>
          <DialogDescription>
            Opened at {incident.timestamp} · status {String(incident.status || '').replace(/_/g, ' ').toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch ({notifications.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-4">
              <div>
                <p className="text-[12px] text-muted-foreground">Confidence</p>
                <p className="text-[15px] font-semibold tabular">{fmt(incident.confidence, 0)}%</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Severity</p>
                <StatusBadge tone={severityTone(incident.severity)} className="mt-1">
                  {incident.severity}
                </StatusBadge>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Driver condition</p>
                <p className="text-[13px] font-medium">{incident.driver_condition || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[12px] text-muted-foreground">Source</p>
                <p className="text-[13px] font-medium">{incident.is_simulated ? 'Simulation' : 'Sensor input'}</p>
              </div>
            </div>
            <EmergencyMap incident={incident} />
          </TabsContent>

          <TabsContent value="timeline">
            <EmergencyTimeline items={incident.timeline} />
          </TabsContent>

          <TabsContent value="dispatch" className="flex flex-col gap-3">
            <p className="text-[12px] text-muted-foreground">
              No SMS, call or webhook leaves this server. Every dispatch record below was produced by the simulated
              gateway.
            </p>
            {notifications.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Delivery</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.service}</TableCell>
                      <TableCell>
                        <StatusBadge tone="warning">{note.status}</StatusBadge>
                      </TableCell>
                      <TableCell className="hidden text-[12px] text-muted-foreground sm:table-cell">
                        {note.delivery_channel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="No dispatch records"
                description="This incident has not triggered the notification service."
              />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            I'm safe - cancel
          </Button>
          <Button variant="secondary" onClick={onResolve} disabled={busy}>
            Mark resolved
          </Button>
          <Button onClick={onRequestHelp} disabled={busy}>
            Request help now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
