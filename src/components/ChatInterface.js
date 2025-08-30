import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, FileText, Mic, MicOff } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatInterface = ({ chatHistory, onSendMessage, isLoading, uploadedDocs }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

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

  // 🎙️ Voice Assistant Logic
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        setListening(false);
      };
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return alert("Voice recognition not supported in this browser.");
    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-academic-200 px-6 py-4">
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
              <span className="text-sm text-academic-600">
                PDF Context Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {chatHistory.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Bot className="w-16 h-16 text-academic-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-academic-700 mb-2">
                Welcome to StudyMate!
              </h3>
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

        {/* Typing Indicator */}
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
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-primary-400 rounded-full"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 🎤 Listening Popup */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center space-y-3">
              <Mic className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
              <p className="text-lg font-semibold text-gray-700">Listening...</p>
              <p className="text-sm text-gray-500">Speak now</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-academic-200 px-6 py-4">
  <form onSubmit={handleSubmit} className="flex items-end space-x-3">
    {/* 🎙️ Voice Button */}
    <motion.button
      type="button"
      onClick={handleVoiceInput}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-lg transition-all duration-200 ${
        listening ? 'bg-red-500 text-white' : 'bg-academic-200 text-academic-600'
      }`}
    >
      {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
    </motion.button>

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
    </div>

    {/* Send Button */}
    <motion.button
      type="submit"
      disabled={!message.trim() || isLoading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-3 rounded-lg transition-all duration-200 ${
        message.trim() && !isLoading
          ? 'bg-primary-600 hover:bg-primary-700 text-white'
          : 'bg-academic-200 text-academic-400 cursor-not-allowed'
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
