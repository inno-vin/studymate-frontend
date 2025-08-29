import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, FileText } from 'lucide-react';
import ChatMessage from './ChatMessage';
import VoiceAssistant from './VoiceAssistant';

const ChatInterface = ({ chatHistory, onSendMessage, isLoading, uploadedDocs }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const lastAssistantText = useMemo(() => {
    for (let i = chatHistory.length - 1; i >= 0; i--) {
      if (chatHistory[i].role === 'assistant') return chatHistory[i].content;
    }
    return '';
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    if (isLoading) {
      setIsTyping(true);
    } else {
      setIsTyping(false);
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-academic-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-academic-900">Chat with StudyMate</h2>
            <p className="text-sm text-academic-600">
              {uploadedDocs.length > 0 
                ? `${uploadedDocs.length} document${uploadedDocs.length > 1 ? 's' : ''} loaded`
                : 'No documents loaded'
              }
            </p>
          </div>
          {uploadedDocs.length > 0 && (
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-primary-500" />
              <span className="text-sm text-academic-600">PDF Context Active</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Bot className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-academic-700 mb-2">Welcome to StudyMate!</h3>
              <p className="text-academic-600 max-w-md mx-auto">
                Upload your academic documents and start asking questions. I'll help you understand 
                the content and answer your queries based on the uploaded materials.
              </p>
            </motion.div>
          ) : (
            chatHistory.map((msg, index) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                formatTimestamp={formatTimestamp}
                isLast={index === chatHistory.length - 1}
              />
            ))
          )}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3 p-4 bg-academic-50 rounded-lg border border-academic-200"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-academic-600">StudyMate is thinking</span>
              <div className="flex space-x-1">
                <motion.div className="w-2 h-2 bg-primary-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-2 h-2 bg-primary-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-2 h-2 bg-primary-400 rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-academic-200 px-6 py-4 sticky bottom-0">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="input-field resize-none min-h-[44px] max-h-32 overflow-y-auto"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute -top-12 right-0">
              <VoiceAssistant
                onTranscript={(t) => setMessage(t)}
                ttsText={lastAssistantText}
              />
            </div>
            <div className="absolute bottom-2 right-2 text-xs text-academic-400">Press Enter to send, Shift+Enter for new line</div>
          </div>
          <motion.button
            type="submit"
            disabled={!message.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-lg transition-all duration-200 ${
              message.trim() && !isLoading ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-academic-200 text-academic-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
