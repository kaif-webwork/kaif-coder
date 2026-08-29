import './Loading.css';

export default function Loading() {
  return (
    <div className="chip-loader-overlay">
      <div className="chip-loader-container">
        <svg
          viewBox="0 0 600 260"
          className="chip-loader-svg"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Chip radial gradient */}
            <radialGradient id="chipGrad" cx="50%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#282a30" />
              <stop offset="60%" stopColor="#18191d" />
              <stop offset="100%" stopColor="#0e0f12" />
            </radialGradient>

          </defs>

          {/* ================= BACKGROUND CIRCUIT TRACES ================= */}
          {/* Left Traces */}
          <path className="circuit-trace-base" d="M 190 102 H 135 V 36 H 50" />
          <path className="circuit-trace-base" d="M 190 120 H 118 V 82 H 35" />
          <path className="circuit-trace-base" d="M 190 138 H 95 V 134 H 22" />
          <path className="circuit-trace-base" d="M 190 156 H 135 V 196 H 50" />

          {/* Right Traces */}
          <path className="circuit-trace-base" d="M 410 102 H 465 V 36 H 550" />
          <path className="circuit-trace-base" d="M 410 120 H 482 V 82 H 565" />
          <path className="circuit-trace-base" d="M 410 138 H 578" />
          <path className="circuit-trace-base" d="M 410 156 H 465 V 196 H 550" />

          {/* ================= ANIMATED PULSE TRAVELERS (SINGLE CLEAN LIGHT LINE) ================= */}
          <path className="circuit-pulse pulse-purple" d="M 50 36 H 135 V 102 H 190" />
          <path className="circuit-pulse pulse-cyan" d="M 35 82 H 118 V 120 H 190" />
          <path className="circuit-pulse pulse-yellow" d="M 22 134 H 95 V 138 H 190" />
          <path className="circuit-pulse pulse-green" d="M 50 196 H 135 V 156 H 190" />

          <path className="circuit-pulse pulse-cyan-r" d="M 550 36 H 465 V 102 H 410" />
          <path className="circuit-pulse pulse-green-r" d="M 565 82 H 482 V 120 H 410" />
          <path className="circuit-pulse pulse-orange" d="M 578 138 H 410" />
          <path className="circuit-pulse pulse-yellow-r" d="M 550 196 H 465 V 156 H 410" />

          {/* ================= TERMINAL BLACK NODES ================= */}
          {/* Left Terminal Nodes */}
          <circle cx="50" cy="36" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="35" cy="82" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="22" cy="134" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="50" cy="196" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />

          {/* Right Terminal Nodes */}
          <circle cx="550" cy="36" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="565" cy="82" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="578" cy="138" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />
          <circle cx="550" cy="196" r="4.5" fill="#000000" stroke="#2a2c33" strokeWidth="1.5" />

          {/* ================= IC CHIP METALLIC PINS ================= */}
          {/* Left Metal Pins */}
          <rect x="183" y="98" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="183" y="116" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="183" y="134" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="183" y="152" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />

          {/* Right Metal Pins */}
          <rect x="409" y="98" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="409" y="116" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="409" y="134" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />
          <rect x="409" y="152" width="8" height="7.5" rx="1.2" fill="#9ca3af" stroke="#4b5563" strokeWidth="0.8" />

          {/* ================= CENTER IC CHIP BODY ================= */}
          <rect
            x="190"
            y="85"
            width="220"
            height="88"
            rx="16"
            ry="16"
            fill="url(#chipGrad)"
            stroke="#383b45"
            strokeWidth="1.5"
            className="chip-body-rect"
          />

          {/* Chip Center Text */}
          <text
            x="300"
            y="136"
            fill="#d1d5db"
            fontFamily="'Figtree', -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="15.5"
            fontWeight="500"
            textAnchor="middle"
            letterSpacing="0.2"
            className="chip-loading-text"
          >
            Just a second babe...
          </text>
        </svg>
      </div>
    </div>
  );
}
