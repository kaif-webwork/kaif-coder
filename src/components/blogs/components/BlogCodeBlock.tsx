import { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';
import '../Blog.css';

interface BlogCodeBlockProps {
  code: string;
  filename?: string;
  language?: string;
}

export function BlogCodeBlock({ code, filename, language }: BlogCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="blog-code-block">
      {(filename || language) && (
        <div className="blog-code-header">
          <span>{filename || language}</span>
          <button className="blog-copy-btn" onClick={handleCopy}>
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="blog-code-body">
        <code>{code}</code>
      </pre>
    </div>
  );
}
