import type { RobotHeadState } from './robot-heads';
import ChatMascot from './ChatMascot';
import { getDailyMascot } from './mascots';
import { playClickSound } from '../../utils/sound';
import { IoClose } from 'react-icons/io5';

interface ChatTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
  mascotFace?: RobotHeadState;
}

export default function ChatTrigger({
  isOpen,
  onToggle,
  mascotFace = 'happy',
}: ChatTriggerProps) {
  const dailyMascot = getDailyMascot();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    onToggle();
  };

  return (
    <div className={`chat-trigger-wrapper ${isOpen ? 'chat-open' : ''}`}>
      <div
        className={`chat-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label={isOpen ? 'Close Kairo AI' : `Open Kairo AI — ${dailyMascot.themeName} (${dailyMascot.dayName} Edition)`}
        data-tooltip={isOpen ? 'Close' : `Kairo AI • ${dailyMascot.themeName}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            playClickSound();
            onToggle();
          }
        }}
      >
        {isOpen ? (
          <IoClose className="chat-trigger-icon" />
        ) : (
          <div className="chat-trigger-mascot-box">
            <ChatMascot
              size={40}
              shape="square"
              state={mascotFace}
              paused={false}
              interactive={false}
              antenna={true}
              floorShadow={false}
              label="Kairo AI Companion"
            />
          </div>
        )}
      </div>
    </div>
  );
}
