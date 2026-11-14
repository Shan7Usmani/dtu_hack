export default function EmergencyTimeline({ items = [] }) {
  if (!items.length) {
    return <p className="text-[12px] text-muted-foreground">No timeline entries recorded.</p>;
  }

  return (
    <ol className="relative flex flex-col gap-3 border-l pl-4">
      {items.map((item, index) => (
        <li key={`${item.time}-${index}`} className="relative">
          <span className="absolute -left-[21px] top-1.5 size-1.5 rounded-full bg-border ring-4 ring-background" />
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[13px] font-medium">{item.title}</span>
            <span className="font-mono text-[11px] tabular text-muted-foreground">{item.time}</span>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground">{item.desc}</p>
        </li>
      ))}
    </ol>
  );
}
