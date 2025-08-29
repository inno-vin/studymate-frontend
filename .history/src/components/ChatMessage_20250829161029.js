import React, { useEffect, useMemo, useRef } from 'react';
import mermaid from 'mermaid';

// Extract mermaid code blocks from text
function extractMermaid(text) {
  const regex = /```mermaid[\r\n]+([\s\S]*?)```/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push(match[1].trim());
  }
  return blocks;
}

function stripSourceTags(text) {
  // Gather '# SOURCE: filename' occurrences but return text without them
  const lines = text.split(/\r?\n/);
  const filenames = [];
  const kept = [];
  for (const line of lines) {
    const m = line.match(/^#\s*SOURCE:\s*(.+)$/i);
    if (m) filenames.push(m[1].trim()); else kept.push(line);
  }
  return { cleaned: kept.join('\n').trim(), filenames: Array.from(new Set(filenames)) };
}

const ChatMessage = ({ message, formatTimestamp }) => {
  const containerRef = useRef(null);

  const isAssistant = message.role === 'assistant';

  const { cleaned, filenames } = useMemo(() => stripSourceTags(message.content || ''), [message.content]);
  const mermaidDiagrams = useMemo(() => extractMermaid(cleaned), [cleaned]);

  useEffect(() => {
    if (mermaidDiagrams.length > 0 && containerRef.current) {
      mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', theme: 'default' });
      // Render all diagrams in the container
      const nodes = containerRef.current.querySelectorAll('[data-mermaid]');
      nodes.forEach((node, idx) => {
        const code = mermaidDiagrams[idx] || node.textContent;
        const id = `m-${message.id}-${idx}`;
        mermaid.render(id, code, (svg) => { node.innerHTML = svg; });
      });
    }
  }, [mermaidDiagrams, message.id]);

  return (
    <div className={`flex ${isAssistant ? '' : 'justify-end'}`}>
      <div className={`max-w-3xl w-full ${isAssistant ? 'bg-white border border-academic-200' : 'bg-primary-600 text-white'} rounded-lg p-4`}>
        <div ref={containerRef} className={`assistant-prose ${isAssistant ? '' : ''}`}>
          {/* Render text with code blocks simplified; mermaid blocks replaced by placeholders */}
          {cleaned.split(/```mermaid[\s\S]*?```/).map((segment, i, arr) => (
            <div key={`seg-${i}`}>
              <p className={`${isAssistant ? 'text-academic-800' : 'text-white'}`}>{segment}</p>
              {i < arr.length - 1 && (
                <div data-mermaid className="my-3 rounded-md overflow-hidden border border-academic-200 bg-white p-2" />
              )}
            </div>
          ))}
        </div>
        {isAssistant && filenames.length > 0 && (
          <div className="mt-3 text-xs text-academic-500">
            Source: {filenames.join(', ')}
          </div>
        )}
        {message.timestamp && (
          <div className={`mt-2 text-xs ${isAssistant ? 'text-academic-400' : 'text-white/80'}`}>{formatTimestamp(message.timestamp)}</div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
