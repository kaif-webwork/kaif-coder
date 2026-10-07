import { Mascot } from 'page-mascot';
import { getDailyMascot, getMascotById, type MascotData } from './mascots';

interface ChatMascotProps {
  size?: number;
  className?: string;
  label?: string;
  mascotId?: string;
  mascot?: MascotData;
  onClick?: () => void;
}

export default function ChatMascot({
  size = 60,
  className = '',
  label,
  mascotId,
  mascot,
  onClick,
}: ChatMascotProps) {
  // Automatically selects today's daily mascot or allows overriding
  const currentMascot = mascot || (mascotId ? getMascotById(mascotId) : getDailyMascot());
  const effectiveLabel = label || `${currentMascot.name} Mascot`;

  return (
    <div
      className={`chat-mascot-container ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <Mascot
        key={currentMascot.id}
        directions={currentMascot.directions}
        reactions={currentMascot.reactions}
        size={size}
        label={effectiveLabel}
      />
    </div>
  );
}
