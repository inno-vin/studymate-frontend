import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import SourceBadge from './SourceBadge';

const ChatMessage = ({ message, formatTimestamp, isLast }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  // Extract source references from message content
  const extractSources = (content) => {
    const sourceRegex = /\[source:\s*([^\]]+\.pdf)\]/gi;
    const sources = [];
    let match;
    
    while ((match = sourceRegex.exec(content)) !== null) {
      sources.push(match[1]);
    }
    
    return sources;
  };

  // Replace source references with placeholders for rendering
  const renderContent = (content) => {
    if (!content) return '';
    
    const sourceRegex = /\[source:\s*([^\]]+\.pdf)\]/gi;
    const parts = content.split(sourceRegex);
    const result = [];
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // Regular text
        result.push(<span key={i}>{parts[i]}</span>);
      } else {
        // Source filename
        result.push(
          <SourceBadge key={i} filename={parts[i]} />
        );
      }
    }
    
    return result;
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
            <div className={`prose prose-sm max-w-none ${
              isUser ? 'text-white' : 'text-academic-900'
            }`}>
              {renderContent(message.content)}
            </div>
          </div>
          
          {/* Timestamp */}
          <div className={`text-xs text-academic-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
          
          {/* Sources */}
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
