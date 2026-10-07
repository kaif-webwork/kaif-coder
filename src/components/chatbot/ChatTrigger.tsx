import ChatMascot from './ChatMascot';
import { playClickSound } from '../../utils/sound';
import { IoClose } from 'react-icons/io5';

interface ChatTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatTrigger({ isOpen, onToggle }: ChatTriggerProps) {
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
        aria-label={isOpen ? 'Close Kivo AI' : 'Open Kivo AI (Beta)'}
        data-tooltip={isOpen ? 'Close' : 'Kivo AI • Beta'}
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
            <ChatMascot size={46} label="Kivo AI Mascot" />
            <span className="chat-online-indicator" />
          </div>
        )}
      </div>
    </div>
  );
}
