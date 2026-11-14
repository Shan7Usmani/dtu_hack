import { Inbox } from 'lucide-react';

import { cn } from '../../lib/utils';

/** Plain empty state used wherever a list or panel has no data yet. */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-6 py-12 text-center', className)}>
      <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/50">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="text-[13px] font-medium">{title}</p>
      {description && <p className="max-w-sm text-[12px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
