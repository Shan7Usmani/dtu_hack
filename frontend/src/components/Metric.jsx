import { cn } from '../lib/utils';

/**
 * The large number. Used sparingly - only for values that are live and matter.
 * `tone` should only be non-neutral when the value carries a risk state.
 */
export function Metric({ label, value, unit, hint, tone = 'neutral', className }) {
  const toneClass = {
    neutral: 'text-foreground',
    warning: 'text-warning',
    danger: 'text-destructive',
  }[tone] || 'text-foreground';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <span className={cn('flex items-baseline gap-1 text-[30px] font-semibold leading-none tabular', toneClass)}>
        {value}
        {unit && <span className="text-[13px] font-medium text-muted-foreground">{unit}</span>}
      </span>
      {hint && <span className="text-[12px] text-muted-foreground">{hint}</span>}
    </div>
  );
}
