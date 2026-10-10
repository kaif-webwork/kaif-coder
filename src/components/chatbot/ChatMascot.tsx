import { RobotHead, type RobotHeadState, type RobotHeadShape } from './robot-heads';
import { getDailyMascot, getMascotById, type MascotData } from './mascots';

export interface ChatMascotProps {
  size?: number;
  className?: string;
  label?: string;
  state?: RobotHeadState;
  shape?: RobotHeadShape;
  color?: string;
  trimColor?: string;
  screenColor?: string;
  antenna?: boolean;
  interactive?: boolean;
  floorShadow?: boolean;
  speed?: number;
  paused?: boolean;
  mascotId?: string;
  mascot?: MascotData;
  useSvgAvatar?: boolean;
  onClick?: () => void;
}

/**
 * Lightweight vector TV Robot Avatar (only used optionally for multi-message chat streams)
 */
function SvgRobotAvatar({
  size = 24,
  state = 'idle',
  label = 'Kairo AI Robot',
  color = '#2b49a3',
  trimColor = '#93a6c8',
}: {
  size?: number;
  state?: RobotHeadState;
  label?: string;
  color?: string;
  trimColor?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
      style={{ display: 'block', width: size, height: size }}
    >
      <rect x="1.5" y="11.5" width="2" height="6" rx="1" fill={trimColor} />
      <rect x="28.5" y="11.5" width="2" height="6" rx="1" fill={trimColor} />
      <circle cx="16" cy="5" r="1.5" fill={trimColor} />
      <rect
        x="3.5"
        y="6.5"
        width="25"
        height="19"
        rx="4"
        fill={color}
        stroke={trimColor}
        strokeWidth="1.2"
      />
      <rect
        x="6.5"
        y="9.5"
        width="19"
        height="13"
        rx="2.5"
        fill="#0b0d10"
      />
      {state === 'thinking' ? (
        <g fill="#e4e4e7">
          <rect x="10" y="11.5" width="3" height="2" rx="0.5" />
          <rect x="19" y="11.5" width="3" height="2" rx="0.5" />
          <circle cx="12" cy="18" r="0.8" fill="#a1a1aa" opacity="0.6" />
          <circle cx="16" cy="18" r="0.8" fill="#a1a1aa" opacity="0.9" />
          <circle cx="20" cy="18" r="0.8" fill="#a1a1aa" opacity="0.6" />
        </g>
      ) : state === 'happy' || state === 'speaking' ? (
        <g stroke="#e4e4e7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 16L11.5 14L13 16" />
          <path d="M19 16L20.5 14L22 16" />
        </g>
      ) : (
        <g fill="#e4e4e7">
          <rect x="10" y="13" width="3.2" height="4.5" rx="0.7" />
          <rect x="18.8" y="13" width="3.2" height="4.5" rx="0.7" />
        </g>
      )}
    </svg>
  );
}

export default function ChatMascot({
  size = 48,
  className = '',
  label,
  state = 'idle',
  shape,
  color,
  trimColor,
  screenColor,
  antenna = true,
  interactive = true, // Tap to hop & spin, follow pointer enabled
  floorShadow = false,
  speed = 1,
  paused = false,
  mascotId,
  mascot,
  useSvgAvatar = false,
  onClick,
}: ChatMascotProps) {
  const currentMascot = mascot || (mascotId ? getMascotById(mascotId) : getDailyMascot());
  const effectiveShape = shape || currentMascot.shape || 'square';
  const effectiveColor = color || currentMascot.color || '#2b49a3';
  const effectiveTrim = trimColor || currentMascot.trimColor || '#93a6c8';
  const effectiveScreen = screenColor || currentMascot.screenColor || '#e8f2ff';
  const effectiveAntenna = antenna !== undefined ? antenna : (currentMascot.antenna ?? true);
  const effectiveLabel = label || `${currentMascot.name} Robot Mascot`;

  // Only use SvgRobotAvatar if explicitly requested (e.g. for long message history lists)
  if (useSvgAvatar) {
    return (
      <div
        className={`chat-mascot-container ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        <SvgRobotAvatar
          size={size}
          state={state}
          label={effectiveLabel}
          color={effectiveColor}
          trimColor={effectiveTrim}
        />
      </div>
    );
  }

  // Real 3D Canvas RobotHead from robot-heads with full live simulation & animations
  return (
    <div
      className={`chat-mascot-container ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <RobotHead
        state={state}
        shape={effectiveShape}
        size={size}
        color={effectiveColor}
        trimColor={effectiveTrim}
        screenColor={effectiveScreen}
        antenna={effectiveAntenna}
        interactive={interactive}
        floorShadow={floorShadow}
        speed={speed}
        paused={paused}
        aria-label={effectiveLabel}
      />
    </div>
  );
}
