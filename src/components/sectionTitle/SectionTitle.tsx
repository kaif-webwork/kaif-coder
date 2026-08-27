import type { ReactNode } from 'react';
import './SectionTitle.css';

interface SectionTitleProps {
  children: ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <div className="section-title">
      <div className="section-title-text">
        <span className="section-title-corner top-left" />
        <span className="section-title-corner top-right" />
        <span className="section-title-corner bottom-left" />
        <span className="section-title-corner bottom-right" />
        {children}
      </div>
      <div className="section-title-line" />
    </div>
  );
}
