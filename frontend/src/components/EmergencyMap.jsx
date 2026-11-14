import { MapPin } from 'lucide-react';

import { EmptyState } from './ui/empty-state';

/**
 * Location readout for an incident. It only renders what the backend was given:
 * if no coordinates arrived, it says so instead of inventing a place.
 */
export default function EmergencyMap({ incident }) {
  const location = incident?.location;

  if (!location) {
    return (
      <EmptyState
        icon={MapPin}
        title="No location available"
        description="No GPS receiver is attached to this build, and no coordinates were supplied with the incident."
      />
    );
  }

  const { latitude, longitude, address, source } = location;
  const hasCoords = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));
  const sourceLabel =
    source === 'simulated_fixture'
      ? 'Simulated fixture coordinates'
      : source === 'browser_geolocation'
        ? 'Browser geolocation - granted by the user'
        : source === 'caller_supplied'
          ? 'Supplied by the caller'
          : 'Source not stated';

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{address || 'Coordinates only'}</p>
          <p className="font-mono text-[12px] tabular text-muted-foreground">
            {hasCoords ? `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}` : 'No coordinates'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border px-2 py-0.5 text-[11px] text-muted-foreground">{sourceLabel}</span>
        {hasCoords && (
          <a
            href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="text-[12px] text-primary underline-offset-4 hover:underline"
          >
            Open in OpenStreetMap
          </a>
        )}
      </div>
    </div>
  );
}
