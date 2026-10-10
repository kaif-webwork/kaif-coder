import { useState } from 'react';
import { Link } from 'react-router';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { type ChatMessage } from './knowledge';
import ChatMascot from './ChatMascot';

interface ChatMessageItemProps {
  message: ChatMessage;
  onNavigate?: () => void;
  onPreviewImage?: (src: string, alt?: string) => void;
}

function InlineCopyPill({
  text,
  display,
}: {
  text: string;
  display?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <span className="chat-copyable-pill">
      <span className="chat-copyable-text">{display || text}</span>
      <button
        type="button"
        className={`chat-inline-copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        title={copied ? 'Copied to clipboard!' : `Copy ${text}`}
        aria-label={copied ? 'Copied' : `Copy ${text}`}
      >
        {copied ? (
          <FiCheck className="chat-copy-icon copied" />
        ) : (
          <FiCopy className="chat-copy-icon" />
        )}
      </button>
    </span>
  );
}

export default function ChatMessageItem({
  message,
  onNavigate,
  onPreviewImage,
}: ChatMessageItemProps) {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.sender === 'assistant';

  const handleCopy = async () => {
    try {
      // Strip special card markers before copying
      const cleanText = message.text
        .replace(/:::card\s*([^\n]*)\n/g, '$1:\n')
        .replace(/:::/g, '')
        .replace(/\[tags:\s*([^\]]+)\]/g, '$1')
        .replace(/\[button:\s*\](?:\([^)]*\))?/g, '')
        .replace(/\[button:\s*([^\]]+)\](?:\([^)]+\))?/g, '$1')
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1]');

      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = cleanText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  /**
   * Main structured parser:
   * Splits message into cards (:::card ... :::), action buttons, headings, and standard markdown.
   */
  const renderMessageContent = (rawText: string) => {
    // Completely strip any stray or legacy [button: ...] markers so buttons never render
    const sanitizedText = rawText
      .replace(/\[button:\s*\](?:\([^)]*\))?/gi, '')
      .replace(/\[button:\s*([^\]]+)\]\(([^)]+)\)/gi, '[$1]($2)')
      .replace(/\[button:\s*([^\]]+)\]/gi, '$1');

    const cardRegex = /:::card\s*([^\n]*)\n([\s\S]*?):::/g;
    const segments: Array<{ type: 'card' | 'text'; title?: string; body: string }> = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = cardRegex.exec(sanitizedText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          body: sanitizedText.slice(lastIndex, match.index),
        });
      }
      segments.push({
        type: 'card',
        title: match[1]?.trim(),
        body: match[2]?.trim(),
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < sanitizedText.length) {
      segments.push({
        type: 'text',
        body: sanitizedText.slice(lastIndex),
      });
    }

    return segments.map((seg, segIdx) => {
      if (seg.type === 'card') {
        return (
          <div key={`card-${segIdx}`} className="chat-card-block">
            {seg.title && (
              <div className="chat-card-header">
                <span className="chat-card-header-dot" />
                <span className="chat-card-header-title">{seg.title}</span>
              </div>
            )}
            <div className="chat-card-body">
              {renderLines(seg.body, `card-${segIdx}`)}
            </div>
          </div>
        );
      }

      return (
        <div key={`text-${segIdx}`} className="chat-text-segment">
          {renderLines(seg.body, `text-${segIdx}`)}
        </div>
      );
    });
  };

  /**
   * Line-by-line renderer
   */
  const renderLines = (text: string, parentKey: string) => {
    const lines = text.split('\n');

    return lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      const lineKey = `${parentKey}-${lineIdx}`;

      if (!trimmed) {
        return <div key={lineKey} className="chat-line-break" />;
      }

      // Visual Media Card: ![Alt text](url) or [img: alt](url)
      const imgMatch =
        trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/) ||
        trimmed.match(/^\[img:\s*([^\]]*)\]\(([^)]+)\)$/);
      if (imgMatch) {
        const [, alt, url] = imgMatch;
        return (
          <div key={lineKey} className="chat-media-card">
            <div
              className="chat-media-img-frame"
              role="button"
              tabIndex={0}
              onClick={() => onPreviewImage?.(url, alt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPreviewImage?.(url, alt);
                }
              }}
              title="Click to view image in full screen"
              aria-label={`View ${alt || 'image'} full screen`}
            >
              <img
                src={url}
                alt={alt || 'Visual Preview'}
                className="chat-media-img"
                loading="lazy"
              />
            </div>
            {alt && <div className="chat-media-caption">{alt}</div>}
          </div>
        );
      }

      // Tags line: [tags: React, TypeScript, Next.js]
      const tagsMatch = trimmed.match(/^\[tags:\s*([^\]]+)\]$/);
      if (tagsMatch) {
        const items = tagsMatch[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        return (
          <div key={lineKey} className="chat-chips-container">
            {items.map((item, itemIdx) => (
              <span key={`${lineKey}-tag-${itemIdx}`} className="chat-skill-tag">
                {item}
              </span>
            ))}
          </div>
        );
      }

      // Heading 3: ###
      if (line.startsWith('### ')) {
        return (
          <h4 key={lineKey} className="chat-msg-h4">
            {parseInline(line.replace(/^###\s+/, ''), lineKey)}
          </h4>
        );
      }

      // Heading 2: ##
      if (line.startsWith('## ')) {
        return (
          <h3 key={lineKey} className="chat-msg-h3">
            {parseInline(line.replace(/^##\s+/, ''), lineKey)}
          </h3>
        );
      }

      // Bullet points (-, *, or •)
      if (/^[•\-*]\s*/.test(trimmed)) {
        return (
          <div key={lineKey} className="chat-bullet-row">
            <span className="chat-bullet-dot">•</span>
            <span className="chat-bullet-content">
              {parseInline(trimmed.replace(/^[•\-*]\s*/, ''), lineKey)}
            </span>
          </div>
        );
      }

      // Numbered lists (1. or 2.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        return (
          <div key={lineKey} className="chat-bullet-row">
            <span className="chat-number-badge">{numMatch[1]}.</span>
            <span className="chat-bullet-content">
              {parseInline(numMatch[2], lineKey)}
            </span>
          </div>
        );
      }

      // Standard paragraph
      return (
        <p key={lineKey} className="chat-msg-p">
          {parseInline(line, lineKey)}
        </p>
      );
    });
  };

  /**
   * Inline Markdown Parser: parses copy pills, emails, bold, italic, code, links
   */
  const parseInline = (text: string, parentKey: string) => {
    const tokenRegex = /(!\[[^\]]*\]\([^)]+\)|\[copy:\s*[^\]]+\](?:\([^)]+\))?|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = text.split(tokenRegex);

    return parts.map((part, idx) => {
      const key = `${parentKey}-tok-${idx}`;

      // Inline Image: ![Alt text](url)
      const imgInlineMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imgInlineMatch) {
        const [, alt, url] = imgInlineMatch;
        return (
          <span key={key} className="chat-media-card inline">
            <span
              className="chat-media-img-frame"
              role="button"
              tabIndex={0}
              onClick={() => onPreviewImage?.(url, alt)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPreviewImage?.(url, alt);
                }
              }}
              title="Click to view image in full screen"
              aria-label={`View ${alt || 'image'} full screen`}
            >
              <img
                src={url}
                alt={alt || 'Visual Preview'}
                className="chat-media-img"
                loading="lazy"
              />
            </span>
            {alt && <span className="chat-media-caption">{alt}</span>}
          </span>
        );
      }

      // Explicit copy pill: [copy: text](display) or [copy: text]
      const copyMatch = part.match(/^\[copy:\s*([^\]]+)\](?:\(([^)]+)\))?$/);
      if (copyMatch) {
        const [, val, customDisplay] = copyMatch;
        return (
          <InlineCopyPill
            key={key}
            text={val.trim()}
            display={customDisplay?.trim() || val.trim()}
          />
        );
      }

      // Email Auto-Detection: user@domain.com
      const emailMatch = part.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
      if (emailMatch) {
        return <InlineCopyPill key={key} text={part} />;
      }

      // Standard Markdown Link: [label](url)
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        let [, label, url] = linkMatch;
        label = label.replace(/^button:\s*/i, '').trim();
        if (!label) return null;
        const isInternal = url.startsWith('/');
        if (isInternal) {
          return (
            <Link
              key={key}
              to={url}
              className="chat-link-pill internal"
              onClick={onNavigate}
            >
              {label} ↗
            </Link>
          );
        }
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-link-pill external"
          >
            {label} ↗
          </a>
        );
      }

      // Code tag: `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        const val = part.slice(1, -1);
        return (
          <span key={key} className="chat-skill-tag">
            {val}
          </span>
        );
      }

      // Bold: **text**
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={key} className="chat-strong">
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Italic: *text*
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={key} className="chat-em">
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  return (
    <div className={`chat-message-row ${isAssistant ? 'assistant' : 'user'}`}>
      {isAssistant && (
        <div className="chat-avatar-mini" title="Kairo AI">
          <ChatMascot
            size={24}
            shape="square"
            state="idle"
            paused={true}
            interactive={false}
            antenna={true}
            floorShadow={false}
            useSvgAvatar={true}
            label="Kairo AI"
          />
        </div>
      )}

      <div className={`chat-bubble ${isAssistant ? 'assistant' : 'user'}`}>
        <div className="chat-bubble-content">
          {renderMessageContent(message.text)}
        </div>

        {isAssistant && (
          <div className="chat-bubble-footer">
            <span className="chat-msg-time">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <button
              type="button"
              className="chat-copy-btn"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy answer'}
              title={copied ? 'Copied to clipboard!' : 'Copy response'}
            >
              {copied ? (
                <>
                  <FiCheck className="chat-copy-icon copied" />
                  <span className="chat-copy-text">Copied!</span>
                </>
              ) : (
                <>
                  <FiCopy className="chat-copy-icon" />
                  <span className="chat-copy-text">Copy</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
