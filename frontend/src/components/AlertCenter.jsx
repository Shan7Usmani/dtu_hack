import React, { useState } from 'react';
import { Download } from 'lucide-react';

import { useSystem } from '../context/SessionContext';
import { exportAlertsCsv } from '../lib/csv';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { StatusBadge } from './ui/badge';
import { EmptyState } from './ui/empty-state';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

function severityTone(severity) {
  const key = String(severity || '').toUpperCase();
  if (key === 'CRITICAL' || key === 'DANGER') return 'danger';
  if (key === 'WARNING' || key === 'WARN') return 'warning';
  if (key === 'INFO') return 'neutral';
  return 'neutral';
}

export default function AlertCenter({ alerts = [], loading, limit, onChanged, showExport = true }) {
  const { acknowledgeAlert } = useSystem();
  const [busyId, setBusyId] = useState(null);

  const rows = limit ? alerts.slice(0, limit) : alerts;

  const acknowledge = (id) => {
    setBusyId(id);
    acknowledgeAlert(id);
    setBusyId(null);
    if (onChanged) onChanged();
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <EmptyState
        title="No alerts yet"
        description="Alerts appear here when the detector reports drowsiness or phone use."
      />
    );
  }

  return (
    <div>
      {showExport && (
        <div className="flex justify-end pb-2">
          <Button variant="outline" size="sm" onClick={() => exportAlertsCsv(alerts)}>
            <Download className="size-4" />
            Export CSV
          </Button>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Time</TableHead>
            <TableHead>Event</TableHead>
            <TableHead className="hidden md:table-cell">Severity</TableHead>
            <TableHead className="w-28 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((alert) => (
            <TableRow key={alert.id}>
              <TableCell className="font-mono text-[12px] tabular text-muted-foreground">{alert.timestamp}</TableCell>
              <TableCell>
                <p className="font-medium">{alert.type}</p>
                <p className="text-[12px] text-muted-foreground">{alert.message}</p>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <StatusBadge tone={severityTone(alert.severity)}>{alert.severity}</StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                {alert.acknowledged ? (
                  <span className="text-[12px] text-muted-foreground">Acknowledged</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-7 px-2 text-[12px]', busyId === alert.id && 'opacity-50')}
                    onClick={() => acknowledge(alert.id)}
                    disabled={busyId === alert.id}
                  >
                    {busyId === alert.id ? 'Saving...' : 'Acknowledge'}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
