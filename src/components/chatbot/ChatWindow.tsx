import { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';
import {
  FiVolume2,
  FiVolumeX,
  FiRotateCcw,
  FiArrowUp,
  FiSmartphone,
  FiCode,
  FiBriefcase,
  FiAward,
  FiFileText,
  FiMail,
} from 'react-icons/fi';
import type { RobotHeadState } from './robot-heads';
import ChatMascot from './ChatMascot';
import ChatMessageItem from './ChatMessageItem';
import { QUICK_PROMPTS, type ChatMessage } from './knowledge';
import { playClickSound } from '../../utils/sound';
import { MASCOT_FACES, getDailyMascot } from './mascots';


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

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isThinking: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  mascotFace?: RobotHeadState;
  onSelectFace?: (face: RobotHeadState) => void;
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
  mascotFace = 'happy',
  onSelectFace,
}: ChatWindowProps) {
  const dailyMascot = getDailyMascot();
  const [inputValue, setInputValue] = useState('');
  const [previewImage, setPreviewImage] = useState<{ src: string; alt?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipsBarRef = useRef<HTMLDivElement>(null);
  const isDraggingChips = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const hasDragged = useRef(false);

  // Close image preview on Escape key (use capture phase to avoid closing chat window)
  useEffect(() => {
    if (!previewImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setPreviewImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [previewImage]);

  // Auto-scroll in conversation view
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Auto-focus input when opened (desktop only to prevent mobile viewport squashing)
  useEffect(() => {
    if (isOpen) {
      const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
      if (!isTouch) {
        const timer = setTimeout(() => {
          inputRef.current?.focus({ preventScroll: true });
        }, 120);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);

  // Horizontal wheel scroll for quick chips
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

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isThinking) return;

    if (soundEnabled) playClickSound();
    setInputValue('');
    onSendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePromptClick = (promptText: string) => {
    if (hasDragged.current) return;
    if (soundEnabled) playClickSound();
    onSendMessage(promptText);
  };

  const handleResetChat = () => {
    if (soundEnabled) playClickSound();
    onClearChat();
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 100);
  };

  const handleMascotTap = () => {
    if (soundEnabled) playClickSound();
    if (!onSelectFace) return;
    const currentIdx = MASCOT_FACES.findIndex((f) => f.id === mascotFace);
    const nextIdx = (currentIdx + 1) % MASCOT_FACES.length;
    onSelectFace(MASCOT_FACES[nextIdx].id);
  };

  if (!isOpen) return null;

  return (
    <div
      className="chat-window-container"
      role="dialog"
      aria-modal="true"
      aria-label="Kairo AI — Your Personal AI Companion"
      data-lenis-prevent="true"
      data-lenis-prevent-wheel="true"
      data-lenis-prevent-touch="true"
      onWheel={(e) => e.stopPropagation()}
      style={
        {
          '--mascot-daily-color': dailyMascot.color,
          '--mascot-daily-hover': dailyMascot.hoverColor,
          '--mascot-daily-glow': dailyMascot.glowColor,
          '--mascot-daily-trim': dailyMascot.trimColor,
          '--mascot-daily-text': dailyMascot.textColor,
        } as React.CSSProperties
      }
    >
      {/* ==========================================================================
          MINIMAL HEADER
          ========================================================================== */}
      <div className="chat-window-header">
        <div className="chat-header-brand">
          <div
            className="chat-header-mascot"
            title={`Kairo AI • ${dailyMascot.themeName} (${dailyMascot.dayName} Edition)`}
          >
            <ChatMascot
              size={28}
              shape="square"
              state={isThinking ? 'thinking' : mascotFace}
              paused={true}
              interactive={false}
              antenna={true}
              floorShadow={false}
              label="Kairo AI Avatar"
            />
          </div>
          <div className="chat-header-info">
            <div className="chat-header-title-row">
              <span className="chat-header-brand-title">Kairo AI</span>
              <span className="chat-minimal-tag">Companion</span>
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="chat-header-btn"
              onClick={handleResetChat}
              title="New Chat"
              aria-label="Start new conversation"
            >
              <FiRotateCcw />
            </button>
          )}

          <button
            type="button"
            className="chat-header-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          >
            {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
          </button>

          <button
            type="button"
            className="chat-header-btn close"
            onClick={onClose}
            title="Close"
            aria-label="Close chat"
          >
            <IoClose />
          </button>
        </div>
      </div>

      {/* ==========================================================================
          CHAT BODY
          ========================================================================== */}
      <div
        className="chat-window-body"
        data-lenis-prevent="true"
        data-lenis-prevent-wheel="true"
        data-lenis-prevent-touch="true"
        onWheel={(e) => e.stopPropagation()}
      >
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="chat-welcome-container">
            <div className="chat-welcome-hero">
              <div
                className="chat-welcome-mascot"
                onClick={handleMascotTap}
                title="Tap Kairo to spin & change expression"
              >
                <ChatMascot
                  size={115}
                  shape="square"
                  state={isThinking ? 'thinking' : mascotFace}
                  interactive={true}
                  paused={false}
                  antenna={true}
                  floorShadow={false}
                  label={`Kairo AI Square Bot - ${mascotFace} Face`}
                />
              </div>
              <h2 className="chat-welcome-title">Kairo AI</h2>
              <p className="chat-welcome-subtitle">
                Hey there! I'm Kairo, your AI companion. How can I help you today?
              </p>
            </div>

            <div className="chat-welcome-grid">
              {QUICK_PROMPTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="chat-welcome-card"
                  onClick={() => handlePromptClick(item.prompt)}
                >
                  <div className="chat-welcome-card-icon">
                    {getTopicIcon(item.id)}
                  </div>
                  <div className="chat-welcome-card-content">
                    <span className="chat-welcome-card-title">{item.title}</span>
                    <span className="chat-welcome-card-desc">{item.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Messages Stream */
          <div className="chat-messages-list">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onNavigate={onClose}
                onPreviewImage={(src, alt) => {
                  playClickSound();
                  setPreviewImage({ src, alt });
                }}
              />
            ))}

            {isThinking && (
              <div className="chat-message-row assistant">
                <div className="chat-avatar-mini">
                  <ChatMascot
                    size={24}
                    shape="square"
                    state="thinking"
                    paused={true}
                    interactive={false}
                    antenna={true}
                    floorShadow={false}
                    label="Thinking"
                  />
                </div>
                <div className="chat-bubble assistant thinking">
                  <div className="chat-typing-dots">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                  <span className="chat-typing-label">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==========================================================================
          QUICK PROMPT CHIPS (Shown above input when conversation is active)
          ========================================================================== */}
      {messages.length > 0 && (
        <div
          ref={chipsBarRef}
          className="chat-quick-chips-bar"
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
              onClick={() => handlePromptClick(item.prompt)}
              title={item.desc}
            >
              <span className="chat-chip-icon">{getTopicIcon(item.id)}</span>
              <span>{item.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* ==========================================================================
          ALWAYS-VISIBLE DOCKED INPUT FOOTER
          ========================================================================== */}
      <div className="chat-window-footer">
        <form className="chat-native-input-box" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="chat-native-input-field"
            placeholder="Ask Kairo anything about Kaif..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            aria-label="Message Kairo AI"
          />
          <button
            type="submit"
            className={`chat-send-btn ${inputValue.trim() ? 'active' : ''}`}
            disabled={!inputValue.trim() || isThinking}
            style={
              inputValue.trim() && !isThinking
                ? {
                    backgroundColor: dailyMascot.color,
                    borderColor: dailyMascot.trimColor,
                    color: dailyMascot.textColor || '#ffffff',
                    boxShadow: `0 2px 12px ${dailyMascot.glowColor}`,
                  }
                : undefined
            }
            aria-label="Send message"
          >
            <FiArrowUp className="chat-send-icon" />
          </button>
        </form>
      </div>

      {/* ==========================================================================
          IN-PAGE IMAGE LIGHTBOX MODAL (WITH PROMINENT CLOSE BUTTON)
          ========================================================================== */}
      {previewImage && (
        <div
          className="chat-lightbox-backdrop"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview Modal"
        >
          <div
            className="chat-lightbox-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-lightbox-header">
              <span className="chat-lightbox-title">
                {previewImage.alt || 'Image Preview'}
              </span>
              <button
                type="button"
                className="chat-lightbox-close-btn"
                onClick={() => {
                  playClickSound();
                  setPreviewImage(null);
                }}
                title="Close Image (Esc)"
                aria-label="Close image preview"
              >
                <IoClose />
              </button>
            </div>

            <div className="chat-lightbox-body">
              <img
                src={previewImage.src}
                alt={previewImage.alt || 'Full View'}
                className="chat-lightbox-full-img"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
