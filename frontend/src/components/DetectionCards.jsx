import { Skeleton } from './ui/skeleton';
import { StatusBadge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { EmptyState } from './ui/empty-state';

/** Allowlist of detector keys this UI knows how to label truthfully. Anything
 * else in the payload is ignored, so an older server build cannot leak invented
 * rows (overspeed, head-pose claims) back into the table. */
const KNOWN_KEYS = ['eyes', 'face', 'phone', 'fatigue', 'alcohol', 'vehicle'];

function toneFor(row) {
  if (!row.connected) return 'neutral';
  const status = String(row.status || '').toUpperCase();
  if (status.includes('CLOSED') || status.includes('PHONE DETECTED') || status === 'DROWSY') return 'danger';
  if (status === 'CAUTION' || status === 'MULTIPLE_FACES' || status.includes('NO DRIVER')) return 'warning';
  if (status === 'OPEN' || status === 'AWAKE' || status.includes('NO PHONE')) return 'success';
  return 'neutral';
}

function labelFor(row) {
  if (!row.connected) return 'Not connected';
  return String(row.status || 'unknown')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Detector table. Uninstrumented sensors are shown as "not connected", never faked. */
export default function DetectionCards({ detections, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  const rows = detections
    ? KNOWN_KEYS.map((key) => detections[key]).filter(Boolean)
    : [];
  if (!rows.length) {
    return (
      <EmptyState
        title="No detector state"
        description="The server has not reported any detector output yet. Start monitoring to populate this table."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Signal</TableHead>
          <TableHead>State</TableHead>
          <TableHead className="hidden sm:table-cell">Reading</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.name}>
            <TableCell className="font-medium">{row.name}</TableCell>
            <TableCell>
              <StatusBadge tone={toneFor(row)}>{labelFor(row)}</StatusBadge>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
