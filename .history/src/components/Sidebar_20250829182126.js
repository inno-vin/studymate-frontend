import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

const Sidebar = ({ uploadedDocs, onFileUpload, onRemoveDoc, chatHistory = [], serverHistory = [] }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => {
      const name = (file.name || '').toLowerCase();
      return /(\.pdf|\.doc|\.docx|\.txt|\.md|\.csv|\.ppt|\.pptx|\.xls|\.xlsx|\.json)$/i.test(name);
    });
    
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(file => {
      const name = (file.name || '').toLowerCase();
      return /(\.pdf|\.doc|\.docx|\.txt|\.md|\.csv|\.ppt|\.pptx|\.xls|\.xlsx|\.json)$/i.test(name);
    });
    
    if (files.length > 0) {
      onFileUpload(files);
    }
    
    // Reset input value
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-academic-200">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">
          Uploaded Documents
        </h2>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
            isDragOver 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-academic-300 hover:border-academic-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${
            isDragOver ? 'text-primary-500' : 'text-academic-400'
          }`} />
          
          <p className="text-sm text-academic-600 mb-3">
            {isDragOver ? 'Drop files here' : 'Drag & drop documents here'}
          </p>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-sm"
          >
            Browse Files
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.md,.csv,.ppt,.pptx,.xls,.xlsx,.json"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <p className="text-xs text-academic-500 mt-2">
            Max 10 files • Common document types
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence>
          {uploadedDocs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <FileText className="w-12 h-12 text-academic-300 mx-auto mb-3" />
              <p className="text-academic-500 text-sm">
                No documents uploaded yet
              </p>
              <p className="text-academic-400 text-xs mt-1">
                Upload documents to get started
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {uploadedDocs.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                  className="bg-academic-50 rounded-lg p-3 border border-academic-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4 text-primary-500 flex-shrink-0" />
                        <p className="text-sm font-medium text-academic-800 truncate">
                          {doc.name}
                        </p>
                      </div>
                      <p className="text-xs text-academic-500">
                        {formatFileSize(doc.size)}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => onRemoveDoc(doc.id)}
                      className="p-1 hover:bg-academic-200 rounded transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-academic-500" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
        {/* Conversation history */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-academic-700 mb-2">Recent conversation</h3>
          {chatHistory.length === 0 ? (
            <p className="text-xs text-academic-500">No messages yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {chatHistory.slice(-12).map((m) => (
                <div key={m.id} className={`text-xs rounded border p-2 ${m.role === 'user' ? 'bg-white border-academic-200' : 'bg-academic-50 border-academic-200'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${m.role === 'user' ? 'text-academic-800' : 'text-primary-700'}`}>{m.role === 'user' ? 'You' : 'StudyMate'}</span>
                    {m.timestamp && <span className="text-[10px] text-academic-400">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                  </div>
                  <div className="line-clamp-3 text-academic-700">{m.content}</div>
                </div>
              ))}
            </div>
          )}
          {/* Persisted chats from server */}
          {serverHistory && serverHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold text-academic-600 mb-2">Saved chats</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {serverHistory.slice(0, 10).map((c) => (
                  <div key={c._id} className="text-xs rounded border border-academic-200 bg-white p-2">
                    <div className="text-academic-700 line-clamp-2">
                      {(c.messages || []).map(m => m.content).join(' ').slice(0, 140)}
                    </div>
                    <div className="text-[10px] text-academic-400 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
