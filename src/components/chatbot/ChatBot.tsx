import { useState, useEffect, useCallback } from 'react';
import ChatTrigger from './ChatTrigger';
import ChatWindow from './ChatWindow';
import { getChatResponse, type ChatMessage } from './knowledge';
import {
  playMessageReceivedSound,
  playMessageSentSound,
  playClickSound,
} from '../../utils/sound';
import './ChatBot.css';

const STORAGE_KEY = 'kaif_ai_chat_history_v1';
const SOUND_KEY = 'kaif_ai_sound_enabled';

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init-1',
  sender: 'assistant',
  text: `Hi! I am **Kivo AI (Beta)**. Feel free to ask about Mohd Kaif's work, including his flagship project **AdZero**, tech stack, work experience, verified credentials, or resume.`,
  timestamp: Date.now(),
};

export function openKivoAIChat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-kivo-ai'));
  }
}

export const openKaifAIChat = openKivoAIChat;

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem(SOUND_KEY);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

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

    window.addEventListener('open-kivo-ai', handleOpenEvent);
    window.addEventListener('open-kaif-ai', handleOpenEvent);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
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

      if (soundEnabled) {
        playMessageSentSound();
      }

      try {
        const replyText = await getChatResponse(text);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          sender: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (soundEnabled) {
          playMessageReceivedSound();
        }
      } catch {
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
    <div className="kaif-ai-chatbot-root">
      {/* Floating Trigger with TV Mascot Icon */}
      <ChatTrigger
        isOpen={isOpen}
        onToggle={() => setIsOpen((prev) => !prev)}
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
      />
    </div>
  );
}
