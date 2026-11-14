function csvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function downloadCsv(filename, rows, columns) {
  const header = columns.map((column) => csvCell(column.label)).join(',');
  const body = rows.map((row) => columns.map((column) => csvCell(row[column.key])).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${header}\r\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
}

export function exportAlertsCsv(alerts = [], filename) {
  downloadCsv(
    filename || `netrakshak-alerts-${stamp()}.csv`,
    alerts.map((alert) => ({ ...alert, acknowledged: alert.acknowledged ? 'yes' : 'no' })),
    [
      { key: 'id', label: 'Alert ID' },
      { key: 'date', label: 'Date' },
      { key: 'timestamp', label: 'Time' },
      { key: 'type', label: 'Event type' },
      { key: 'severity', label: 'Severity' },
      { key: 'message', label: 'Description' },
      { key: 'acknowledged', label: 'Acknowledged' },
    ],
  );
}

export function exportSeriesCsv(series = [], filename) {
  downloadCsv(
    filename || `netrakshak-session-${stamp()}.csv`,
    series.map((point, index) => ({
      sample: index + 1,
      time: new Date(point.t).toISOString(),
      risk_score: Math.round(point.risk),
      ear: Number(point.ear).toFixed(3),
      fps: Number(point.fps).toFixed(1),
    })),
    [
      { key: 'sample', label: 'Sample' },
      { key: 'time', label: 'Timestamp' },
      { key: 'risk_score', label: 'Risk score' },
      { key: 'ear', label: 'Average EAR' },
      { key: 'fps', label: 'FPS' },
    ],
  );
}
