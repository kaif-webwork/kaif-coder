import { useState, useMemo, useRef, useEffect } from 'react';
import './Calendar.css';

const palette = {
  bg: '#1c1e22',
  l1: '#3a3c44',
  l2: '#686a76',
  l3: '#adadb9',
  l4: '#ffffff',
};

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export default function Calendar() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically scroll to recent activity on mobile devices
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      }
    }, 50);

    const handleDismiss = () => setTooltip(null);
    window.addEventListener('click', handleDismiss);
    window.addEventListener('touchstart', handleDismiss);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('touchstart', handleDismiss);
    };
  }, []);

  // Pre-generate the 44-week grid to visually match the exact reference UI
  const { cells, monthLabels } = useMemo(() => {
    const totalCols = 44;
    const totalRows = 7;
    const colStep = 14.8;
    const grid: {
      x: number;
      y: number;
      fill: string;
      key: string;
      count: number;
      dateStr: string;
    }[] = [];

    // Specific highlight coordinates matching the reference screenshot
    const whitePoints = new Map<string, number>([
      ['19,0', 16], ['20,2', 24], ['22,2', 18], ['18,4', 21], ['20,4', 28], ['20,6', 19],
    ]);
    const brightPoints = new Map<string, number>([
      ['17,1', 11], ['19,1', 14], ['21,1', 9], ['17,2', 12], ['19,2', 15],
      ['18,3', 10], ['21,3', 13], ['19,4', 14], ['19,5', 12], ['17,6', 8], ['19,6', 13],
    ]);
    const medPoints = new Map<string, number>([
      ['1,4', 5], ['8,3', 6], ['8,4', 4], ['17,0', 7], ['18,1', 6], ['22,1', 5],
      ['20,3', 7], ['22,4', 6], ['21,6', 5], ['27,0', 6], ['34,4', 5], ['41,2', 6],
    ]);
    const lowPoints = new Map<string, number>([
      ['0,3', 2], ['0,4', 1], ['0,5', 3], ['0,6', 2], ['1,0', 1], ['1,1', 2], ['2,0', 2],
      ['3,0', 1], ['4,0', 3], ['5,0', 2], ['6,0', 1], ['7,0', 2], ['8,0', 1], ['9,0', 2],
      ['10,0', 3], ['11,0', 1], ['12,0', 2], ['13,0', 1], ['14,0', 2], ['15,0', 3], ['16,0', 2],
      ['23,0', 2], ['24,0', 1], ['25,0', 3], ['26,0', 2], ['28,0', 1], ['29,0', 2], ['30,0', 1],
      ['31,0', 2], ['32,0', 3], ['33,0', 1], ['35,0', 2], ['36,0', 1], ['37,0', 2], ['38,0', 3],
      ['39,0', 1], ['40,0', 2], ['42,0', 1], ['43,0', 2], ['10,5', 2], ['16,3', 3], ['24,5', 1],
      ['30,2', 2], ['36,4', 3],
    ]);

    const now = new Date();

    for (let c = 0; c < totalCols; c++) {
      for (let r = 0; r < totalRows; r++) {
        // Skip first few cells on column 0 to match offset start of year
        if (c === 0 && r < 3) continue;

        const ptKey = `${c},${r}`;
        const daysAgo = (totalCols - 1 - c) * 7 + (6 - r);
        const cellDate = new Date(now.getTime() - daysAgo * 86400000);
        const dateStr = cellDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        let fill = palette.bg;
        let count = 0;

        if (whitePoints.has(ptKey)) {
          fill = palette.l4;
          count = whitePoints.get(ptKey)!;
        } else if (brightPoints.has(ptKey)) {
          fill = palette.l3;
          count = brightPoints.get(ptKey)!;
        } else if (medPoints.has(ptKey)) {
          fill = palette.l2;
          count = medPoints.get(ptKey)!;
        } else if (lowPoints.has(ptKey)) {
          fill = palette.l1;
          count = lowPoints.get(ptKey)!;
        }

        grid.push({
          x: c * colStep,
          y: 25 + r * colStep,
          fill,
          key: ptKey,
          count,
          dateStr,
        });
      }
    }

    // Perfectly aligned month labels mapped to corresponding column starts
    const monthsMap = [
      { name: 'Sep', col: 0 },
      { name: 'Oct', col: 5 },
      { name: 'Nov', col: 10 },
      { name: 'Dec', col: 15 },
      { name: 'Jan', col: 19 },
      { name: 'Feb', col: 24 },
      { name: 'Mar', col: 29 },
      { name: 'Apr', col: 34 },
      { name: 'May', col: 39 },
    ];

    const months = monthsMap.map((m) => ({
      name: m.name,
      x: m.col * colStep + 1,
    }));

    return { cells: grid, monthLabels: months };
  }, []);

  const handleCellHover = (e: React.MouseEvent | React.TouchEvent, count: number, dateStr: string) => {
    const target = e.currentTarget as SVGElement;
    const rect = target.getBoundingClientRect();
    const rawX = rect.left + rect.width / 2;
    const clampedX = Math.max(90, Math.min(window.innerWidth - 90, rawX));

    setTooltip({
      text: `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${dateStr}`,
      x: clampedX,
      y: rect.top - 8,
    });
  };

  return (
    <div className="calendar-wrapper-box">
      <div ref={scrollRef} className="calendar-scroll-wrapper">
        <svg
          viewBox="0 0 655 132"
          className="calendar-inner-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Month labels */}
          {monthLabels.map((m) => (
            <text
              key={m.name}
              x={m.x}
              y="14"
              fill="#ffffff"
              fontFamily="'Figtree', sans-serif"
              fontSize="13"
              fontWeight="600"
            >
              {m.name}
            </text>
          ))}

          {/* Contribution Cells */}
          {cells.map((cell) => (
            <rect
              key={cell.key}
              x={cell.x}
              y={cell.y}
              width="12"
              height="12"
              rx="3.5"
              ry="3.5"
              fill={cell.fill}
              className="calendar-cell"
              onMouseEnter={(e) => handleCellHover(e, cell.count, cell.dateStr)}
              onMouseMove={(e) => handleCellHover(e, cell.count, cell.dateStr)}
              onMouseLeave={() => setTooltip(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleCellHover(e, cell.count, cell.dateStr);
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                handleCellHover(e, cell.count, cell.dateStr);
              }}
            />
          ))}
        </svg>
      </div>

      <div className="calendar-footer-bar">
        <span className="calendar-total-text">This year, I achieved 2054 contributions</span>
        <div className="calendar-legend">
          <span>Less</span>
          <div className="calendar-legend-boxes">
            <span className="calendar-legend-box" style={{ background: palette.bg }} />
            <span className="calendar-legend-box" style={{ background: palette.l1 }} />
            <span className="calendar-legend-box" style={{ background: palette.l2 }} />
            <span className="calendar-legend-box" style={{ background: palette.l3 }} />
            <span className="calendar-legend-box" style={{ background: palette.l4 }} />
          </div>
          <span>More</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="calendar-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
