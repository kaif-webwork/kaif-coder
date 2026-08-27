import { forwardRef } from 'react';
import type { ReactNode } from 'react';
import './Tooltip.css';

interface TooltipProps {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ text, position = 'top', children, className = '' }, ref) => {
    return (
      <div className={`tooltip-wrapper ${className}`} ref={ref}>
        {children}
        <div className={`tooltip-bubble ${position}`}>
          {text}
          <span className="tooltip-arrow" />
        </div>
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
