import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, FileText, Upload, X, Paperclip } from 'lucide-react';

const prettyBytes = (bytes = 0) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const iconForMime = (mime = '') => {
  if (mime.includes('pdf')) return <FileText className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const ChatInterface = ({ chatHistory, onSendMessage, isLoading, uploadedDocs, onFileUpload, onRemoveDoc, maxFiles = 10 }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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

  // File upload functions
  const enforceLimit = (files) => {
    const remaining = Math.max(0, maxFiles - uploadedDocs.length);
    return remaining > 0 ? files.slice(0, remaining) : [];
  };

  const validateFiles = (files) => {
    const MAX = 25 * 1024 * 1024; // 25MB to match backend
    const over = files.find(f => f.size > MAX);
    if (over) {
      setError(`"${over.name}" exceeds 25MB limit.`);
      return files.filter(f => f.size <= MAX);
    }
    return files;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
    setError('');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    setError('');
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    const valid = validateFiles(files);
    const bounded = enforceLimit(valid);
    if (bounded.length) onFileUpload(bounded);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setError('');
    const valid = validateFiles(files);
    const bounded = enforceLimit(valid);
    if (bounded.length) onFileUpload(bounded);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
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
    
    // Auto-resize textarea
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
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3/4 rounded-lg p-4 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-academic-100 text-academic-800'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 text-xs">
                          <p className="font-medium">Sources:</p>
                          <ul className="list-disc list-inside">
                            {msg.sources.map((source, i) => (
                              <li key={i}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <span className="text-xs opacity-70 ml-2 mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
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

      {/* Message Input with File Upload */}
      <div className="bg-white border-t border-academic-200 px-6 py-4">
        {/* File Upload Area */}
        <AnimatePresence>
          {showFileUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
                  isDragOver ? 'border-primary-400 bg-primary-50' : 'border-academic-300 hover:border-academic-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-6 h-6 mx-auto mb-2 ${isDragOver ? 'text-primary-500' : 'text-academic-400'}`} />
                <p className="text-sm text-academic-700">
                  Drag & drop files here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm px-3 py-1 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  Browse files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <p className="mt-2 text-xs text-academic-500">
                  Up to {maxFiles} files, 25MB each.
                </p>
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mt-2 text-xs text-red-600"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Uploaded files list */}
              {uploadedDocs.length > 0 && (
                <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                  {uploadedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-academic-50 border border-academic-200 rounded-lg px-3 py-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="text-academic-500">
                          {iconForMime(doc.file?.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-academic-800 truncate">
                            {doc.name}
                          </div>
                          <div className="text-xs text-academic-500">
                            {doc.file?.type || 'application/octet-stream'} • {prettyBytes(doc.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        className="p-1 rounded hover:bg-academic-200 text-academic-500"
                        onClick={() => onRemoveDoc(doc.id)}
                        aria-label="Remove file"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`p-2.5 rounded-lg transition-all duration-200 ${
              showFileUpload ? 'bg-primary-600 text-white' : 'bg-academic-200 text-academic-600 hover:bg-academic-300'
            }`}
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your documents..."
              className="input-field resize-none min-h-[44px] max-h-32 overflow-y-auto w-full"
              rows={1}
              disabled={isLoading}
            />
            <div className="absolute bottom-2 right-2 text-xs text-academic-400">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
          
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
