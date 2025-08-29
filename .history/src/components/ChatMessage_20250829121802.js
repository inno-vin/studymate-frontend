import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import SourceBadge from './SourceBadge';
import Markdown from 'markdown-to-jsx';

const ChatMessage = ({ message, formatTimestamp, isLast }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  // Render content with Markdown and inline [source: file.pdf] badges
  const renderContentWithMarkdownAndSources = (content) => {
    if (!content) return '';

    const sourceRegex = /\[source:\s*([^\]]+\.pdf)\]/gi;
    const parts = content.split(sourceRegex);
    const nodes = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const textSpan = parts[i];
        if (textSpan) {
          nodes.push(
            <Markdown
              key={`md-${i}`}
              options={{
                forceBlock: false,
                overrides: {
                  a: {
                    props: {
                      className: 'text-primary-600 hover:text-primary-700 underline'
                    }
                  }
                }
              }}
            >
              {textSpan}
            </Markdown>
          );
        }
      } else {
        const filename = parts[i];
        nodes.push(<SourceBadge key={`src-${i}`} filename={filename} />);
      }
    }

    return nodes;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: isLast ? 0.1 : 0 
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-primary-100 text-primary-600' 
            : isError
            ? 'bg-red-100 text-red-600'
            : 'bg-academic-100 text-academic-600'
        }`}>
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Bot className="w-4 h-4" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`rounded-2xl px-4 py-3 max-w-full ${
            isUser
              ? 'bg-primary-600 text-white'
              : isError
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-white text-academic-900 border border-academic-200'
          }`}>
            <div className={`${isUser ? '' : 'assistant-prose'}`}>
              {isUser ? message.content : renderContentWithMarkdownAndSources(message.content)}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-academic-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
          
          {/* Sources array from backend */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs text-academic-500">Sources:</span>
              {message.sources.map((source, index) => (
                <SourceBadge key={index} filename={source} />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
