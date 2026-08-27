import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../Blog.css';

interface BlogTerminalProps {
  commands: string[];
  title?: string;
}

export function BlogTerminal({ commands, title = 'Terminal' }: BlogTerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(commands.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="blog-terminal">
      <div className="blog-terminal-header">
        <div className="blog-terminal-dots">
          <span className="blog-terminal-dot red" />
          <span className="blog-terminal-dot yellow" />
          <span className="blog-terminal-dot green" />
        </div>
        <span className="blog-terminal-title">{title}</span>
        <button className="blog-copy-btn" onClick={handleCopy}>
          {copied ? <FiCheck /> : <FiCopy />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="blog-terminal-body">
        {commands.map((cmd, idx) => (
          <div key={idx} className="blog-terminal-line">
            {cmd}
          </div>
        ))}
      </div>
    </div>
  );
}
