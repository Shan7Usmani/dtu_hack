import { Progress } from './ui/progress';
import { STATUS_LABELS, clamp, riskTone } from '../lib/format';

const TONE_TEXT = {
  danger: 'text-destructive',
  warning: 'text-warning',
  neutral: 'text-foreground',
};

const TONE_BAR = {
  danger: 'bg-destructive',
  warning: 'bg-warning',
  neutral: 'bg-primary',
};

/** Risk score readout. The number is the live value from /telemetry. */
export default function RiskGauge({ score, status }) {
  const value = clamp(score);
  const tone = riskTone(value);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1">
        <span className={`text-[32px] font-semibold leading-none tabular ${TONE_TEXT[tone]}`}>{Math.round(value)}</span>
        <span className="text-[13px] text-muted-foreground">/ 100</span>
      </div>
      <Progress value={value} className="h-1.5" indicatorClassName={TONE_BAR[tone]} />
      <p className="text-[12px] text-muted-foreground">
        Driver state: <span className="text-foreground">{STATUS_LABELS[status] || 'Unknown'}</span>
      </p>
    </div>
  );
}
