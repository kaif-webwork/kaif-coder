import { useState, useEffect, useCallback, useRef } from 'react';
import type { RobotHeadState } from './robot-heads';
import ChatTrigger from './ChatTrigger';
import ChatWindow from './ChatWindow';
import { getChatResponse, type ChatMessage } from './knowledge';
import { getDailyMascot } from './mascots';
import {
  playMessageReceivedSound,
  playMessageSentSound,
  playClickSound,
} from '../../utils/sound';
import './ChatBot.css';

const STORAGE_KEY = 'kairo_ai_chat_history_v1';
const SOUND_KEY = 'kairo_ai_sound_enabled';
const FACE_STORAGE_KEY = 'kairo_ai_mascot_face_v1';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const dailyMascot = getDailyMascot();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [mascotFace, setMascotFace] = useState<RobotHeadState>(() => {
    try {
      const saved = localStorage.getItem(FACE_STORAGE_KEY);
      if (saved) return saved as RobotHeadState;
    } catch {
      // Fallback
    }
    return 'happy'; // Default to happy face as requested
  });

  const userChosenFaceRef = useRef<RobotHeadState>(mascotFace);

  const handleSelectFace = (face: RobotHeadState) => {
    userChosenFaceRef.current = face;
    setMascotFace(face);
    try {
      localStorage.setItem(FACE_STORAGE_KEY, face);
    } catch {
      // Ignore
    }
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Save messages to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Ignore
    }
  }, [messages]);

  // Handle global open event
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('open-kairo-ai', handleOpenEvent);
    window.addEventListener('open-kivo-ai', handleOpenEvent);
    window.addEventListener('open-kaif-ai', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-kairo-ai', handleOpenEvent);
      window.removeEventListener('open-kivo-ai', handleOpenEvent);
      window.removeEventListener('open-kaif-ai', handleOpenEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Lock body scroll on mobile viewports when chat modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isOpen && window.innerWidth <= 768) {
      const prevOverflow = document.body.style.overflow;
      const prevPosition = document.body.style.position;
      const prevTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.position = prevPosition;
        document.body.style.touchAction = prevTouchAction;
      };
    }
  }, [isOpen]);

  const toggleSound = () => {
    playClickSound();
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SOUND_KEY, String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);
      setMascotFace('searching'); // Expressive searching state

      if (soundEnabled) {
        playMessageSentSound();
      }

      const searchTimer = setTimeout(() => {
        setMascotFace('thinking');
      }, 180);

      try {
        const replyText = await getChatResponse(text, messagesRef.current);
        clearTimeout(searchTimer);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setMascotFace('speaking'); // Expressive speaking face

        setTimeout(() => {
          setMascotFace(userChosenFaceRef.current);
        }, 1500);

        if (soundEnabled) {
          playMessageReceivedSound();
        }
      } catch {
        clearTimeout(searchTimer);
        setMascotFace('error'); // Expressive error face
        setTimeout(() => {
          setMascotFace(userChosenFaceRef.current);
        }, 2200);

        const fallbackMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `Oops! Something went wrong answering that question. Please try asking again or reach out directly to Mohd Kaif at [kaif.webwork@gmail.com](mailto:kaif.webwork@gmail.com).`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, soundEnabled]
  );

  const handleClearChat = () => {
    playClickSound();
    setMessages([]);
  };

  return (
    <div
      className="kaif-ai-chatbot-root"
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
      {/* Floating Trigger with Square Mascot */}
      <ChatTrigger
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
        mascotFace={mascotFace}
      />

      {/* Expandable Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        isThinking={isThinking}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        mascotFace={mascotFace}
        onSelectFace={handleSelectFace}
      />
    </div>
  );
}
