import { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import {
  FiVolume2,
  FiVolumeX,
  FiTrash2,
  FiArrowUpRight,
  FiChevronLeft,
  FiMessageSquare,
  FiSmartphone,
  FiCode,
  FiBriefcase,
  FiAward,
  FiFileText,
  FiMail,
} from 'react-icons/fi';
import ChatMascot from './ChatMascot';
import ChatMessageItem from './ChatMessageItem';
import { QUICK_PROMPTS, type ChatMessage } from './knowledge';
import { playClickSound } from '../../utils/sound';

const getTopicIcon = (id: string) => {
  switch (id) {
    case 'adzero':
      return <FiSmartphone className="chat-topic-svg" />;
    case 'skills':
      return <FiCode className="chat-topic-svg" />;
    case 'experience':
      return <FiBriefcase className="chat-topic-svg" />;
    case 'certificates':
      return <FiAward className="chat-topic-svg" />;
    case 'resume':
      return <FiFileText className="chat-topic-svg" />;
    case 'contact':
      return <FiMail className="chat-topic-svg" />;
    default:
      return <FiCode className="chat-topic-svg" />;
  }
};

const MASCOT_THOUGHTS = [
  { text: 'Ask me about AdZero v4.4!', prompt: 'Tell me about the AdZero app and how it works' },
  { text: "Wondering about Kaif's tech stack?", prompt: 'What technologies and skills does Mohd Kaif specialize in?' },
  { text: "Explore Mohd Kaif's work experience...", prompt: "What is Mohd Kaif's engineering work experience?" },
  { text: 'Want to verify certified credentials?', prompt: 'Show me verified certifications and credentials' },
  { text: "Download Mohd Kaif's resume & PDF...", prompt: "Where can I view or download Mohd Kaif's resume?" },
  { text: 'Looking to hire or work with Kaif?', prompt: 'How can I hire or contact Mohd Kaif?' },
];

type ChatScreen = 'topics' | 'chat';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isThinking: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onClearChat,
  isThinking,
  soundEnabled,
  onToggleSound,
}: ChatWindowProps) {
  // Screens: 'topics' (landing/topics grid) and 'chat' (active conversation)
  const [screen, setScreen] = useState<ChatScreen>(() =>
    messages.length > 0 ? 'chat' : 'topics'
  );
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const topicsContainerRef = useRef<HTMLDivElement>(null);
  const chipsBarRef = useRef<HTMLDivElement>(null);
  const isDraggingChips = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  // Auto-rotate mascot thinking dialog thoughts
  useEffect(() => {
    if (!isOpen || screen !== 'topics') return;
    const interval = setInterval(() => {
      setThoughtIndex((prev) => (prev + 1) % MASCOT_THOUGHTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, screen]);

  // Wheel horizontal scroll support (desktop mouse wheel)
  const handleChipsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      e.stopPropagation();
      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  const handleChipsMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chipsBarRef.current) return;
    isDraggingChips.current = true;
    hasDragged.current = false;
    dragStartX.current = e.pageX - chipsBarRef.current.offsetLeft;
    scrollStartX.current = chipsBarRef.current.scrollLeft;
  };

  const handleChipsMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingChips.current || !chipsBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - chipsBarRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDragged.current = true;
    }
    chipsBarRef.current.scrollLeft = scrollStartX.current - walk;
  };

  const handleChipsMouseUp = () => {
    isDraggingChips.current = false;
  };

  // Auto-scroll in conversation view
  useEffect(() => {
    if (isOpen && screen === 'chat' && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen, screen]);

  // Ensure topics view stays scrolled to top when opened
  useEffect(() => {
    if (isOpen && screen === 'topics' && topicsContainerRef.current) {
      topicsContainerRef.current.scrollTop = 0;
    }
  }, [isOpen, screen]);

  // Safe auto-focus only in chat view with preventScroll
  useEffect(() => {
    if (isOpen && screen === 'chat') {
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, screen]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isThinking) return;

    if (soundEnabled) playClickSound();
    setInputValue('');
    onSendMessage(trimmed);
    setScreen('chat');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (promptText: string) => {
    if (soundEnabled) playClickSound();
    onSendMessage(promptText);
    setScreen('chat');
  };

  const handleOpenCustomChat = () => {
    if (soundEnabled) playClickSound();
    setScreen('chat');
  };

  const handleBackToTopics = () => {
    if (soundEnabled) playClickSound();
    setScreen('topics');
  };

  const handleReset = () => {
    if (soundEnabled) playClickSound();
    onClearChat();
    setScreen('topics');
  };

  if (!isOpen) return null;

  return (
    <div
      className="chat-window-container"
      role="dialog"
      aria-modal="true"
      aria-label="Kivo AI Assistant"
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* ==========================================================================
          SIGNATURE HEADER BAR (Always present for consistent portfolio styling)
          ========================================================================== */}
      <div className="chat-window-header">
        <div className="chat-header-brand">
          {screen === 'chat' && (
            <button
              type="button"
              className="chat-header-btn back"
              onClick={handleBackToTopics}
              title="Back to topics"
              aria-label="Back to topics"
            >
              <FiChevronLeft />
            </button>
          )}
          <div className="chat-header-mascot" title="Kivo AI">
            <ChatMascot size={22} label="Kivo Avatar" />
          </div>
          <div className="chat-header-info">
            <div className="chat-header-title-row">
              <span className="chat-header-brand-title">Kivo AI</span>
              <span className="chat-beta-badge">Beta</span>
            </div>
            <div className="cert-status-badge chat-header-status-badge">
              <span className="status-live-dot" />
              <span>Online</span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button
            type="button"
            className="chat-header-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
          </button>

          {screen === 'chat' && (
            <button
              type="button"
              className="chat-header-btn"
              onClick={handleReset}
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <FiTrash2 />
            </button>
          )}

          <button
            type="button"
            className="chat-header-btn close"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <IoClose />
          </button>
        </div>
      </div>

      {/* ==========================================================================
          TOPICS SCREEN (Landing page with prominent Robot Mascot & 6 Cards)
          ========================================================================== */}
      {screen === 'topics' && (
        <div
          ref={topicsContainerRef}
          className="chat-topics-screen"
          data-lenis-prevent="true"
          data-lenis-prevent-wheel="true"
          data-lenis-prevent-touch="true"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Centered Hero Mascot & Question */}
          <div className="chat-topics-hero">
            <div className="chat-topics-mascot-box">
              {/* Automatic Rotating Mascot Thinking Dialogue Box */}
              <button
                type="button"
                className="chat-mascot-thought-bubble"
                onClick={() => handlePromptClick(MASCOT_THOUGHTS[thoughtIndex].prompt)}
                title="Click to ask this question"
                aria-label={`Mascot thinking: ${MASCOT_THOUGHTS[thoughtIndex].text}`}
              >
                <span className="chat-thought-dots-indicator">
                  <span className="thought-dot dot-1" />
                  <span className="thought-dot dot-2" />
                  <span className="thought-dot dot-3" />
                </span>
                <span key={thoughtIndex} className="chat-thought-text">
                  {MASCOT_THOUGHTS[thoughtIndex].text}
                </span>
                <span className="chat-thought-pointer" />
              </button>

              <div className="chat-mascot-aura" />
              <ChatMascot size={190} label="Kivo AI Bot" />
            </div>
            <h2 className="chat-topics-heading">What can I help with?</h2>
            <p className="chat-topics-subheading">Choose a topic below or type your question.</p>
          </div>

          {/* 2-Column Cards Grid */}
          <div className="chat-topics-grid">
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chat-topic-card"
                onClick={() => handlePromptClick(item.prompt)}
              >
                <div className="chat-topic-icon-box">
                  {getTopicIcon(item.id)}
                </div>
                <div className="chat-topic-content">
                  <span className="chat-topic-title">{item.title}</span>
                  <span className="chat-topic-desc">{item.desc}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Bottom Action Pill Button */}
          <div className="chat-topics-bottom-action">
            <button
              type="button"
              className="chat-topics-cta-btn"
              onClick={handleOpenCustomChat}
              aria-label="Ask a custom question"
            >
              <div className="chat-cta-left">
                <span className="chat-cta-icon-pill">
                  <FiMessageSquare />
                </span>
                <span className="chat-cta-label">Ask a custom question...</span>
              </div>
              <div className="chat-cta-badge">
                <span className="chat-cta-action-text">Chat</span>
                <FiArrowUpRight className="chat-cta-arrow" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ==========================================================================
          CONVERSATION SCREEN (Active Chat Stream)
          ========================================================================== */}
      {screen === 'chat' && (
        <>
          <div
            className="chat-window-body"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="chat-messages-list">
              {messages.length === 0 && (
                <div className="chat-empty-chat-state">
                  <div className="chat-empty-mascot">
                    <div className="chat-mascot-aura empty-state" />
                    <ChatMascot size={135} label="Kivo Avatar" />
                  </div>
                  <span className="chat-empty-title">Ask Kivo anything</span>
                  <span className="chat-empty-subtitle">
                    Type your question below or pick a prompt to explore Kaif's work.
                  </span>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} onNavigate={onClose} />
              ))}

              {isThinking && (
                <div className="chat-message-row assistant">
                  <div className="chat-avatar-mini">
                    <ChatMascot size={26} label="Thinking" />
                  </div>
                  <div className="chat-bubble assistant thinking">
                    <div className="chat-typing-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </div>
                    <span className="chat-typing-label">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Quick chips bar in active conversation */}
          <div
            ref={chipsBarRef}
            className="chat-quick-chips-bar"
            data-lenis-prevent="true"
            data-lenis-prevent-wheel="true"
            data-lenis-prevent-touch="true"
            onWheel={handleChipsWheel}
            onMouseDown={handleChipsMouseDown}
            onMouseMove={handleChipsMouseMove}
            onMouseUp={handleChipsMouseUp}
            onMouseLeave={handleChipsMouseUp}
          >
            {QUICK_PROMPTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chat-mini-chip"
                onClick={() => {
                  if (hasDragged.current) return;
                  handlePromptClick(item.prompt);
                }}
              >
                <span className="chat-chip-icon">{getTopicIcon(item.id)}</span>
                <span>{item.title}</span>
              </button>
            ))}
          </div>

          {/* Native Input Footer */}
          <form className="chat-window-footer" onSubmit={handleSubmit}>
            <div className="chat-native-input-box">
              <input
                ref={inputRef}
                type="text"
                className="chat-native-input-field"
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
                aria-label="Your message"
              />
              <button
                type="submit"
                className={`contact-pill-btn chat-send-pill-btn ${inputValue.trim() ? 'active' : ''}`}
                disabled={!inputValue.trim() || isThinking}
                aria-label="Send message"
              >
                <span>Send</span>
                <FiArrowUpRight className="chat-send-btn-icon" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
