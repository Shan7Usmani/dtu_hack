import * as React from 'react';

import { cn } from '../../lib/utils';
import { clamp } from '../../lib/format';

const Progress = React.forwardRef(({ className, indicatorClassName, value = 0, ...props }, ref) => {
  const pct = clamp(value);
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-secondary', className)}
      {...props}
    >
      <div
        className={cn('h-full w-full bg-primary transition-transform duration-300 ease-out', indicatorClassName)}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </div>
  );
});
Progress.displayName = 'Progress';

export { Progress };
