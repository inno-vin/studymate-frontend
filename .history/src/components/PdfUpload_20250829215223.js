import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, maxFiles = 10, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/plain', // .txt
    'image/jpeg', // .jpg, .jpeg
    'image/png', // .png
    'image/gif', // .gif
    'image/webp', // .webp
    'image/svg+xml' // .svg
  ];

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
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => supportedTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      setError('Please drop only supported file types (PDF, DOC, DOCX, PPT, XLS, TXT, Images)');
      return;
    }
    
    if (validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setError('');
    onFileUpload(validFiles);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => supportedTypes.includes(file.type));
    
    if (validFiles.length === 0) {
      setError('Please select only supported file types (PDF, DOC, DOCX, PPT, XLS, TXT, Images)');
      return;
    }
    
    if (validFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setError('');
    onFileUpload(validFiles);
    
    // Reset input value
    e.target.value = '';
  };

  return (
    <div className={className}>
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
          {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="btn-primary text-sm"
        >
          Browse Files
        </button>
        
        <p className="text-xs text-academic-500 mt-2">
          Max {maxFiles} files • PDF, DOC, DOCX, PPT, XLS, TXT, Images
        </p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.webp,.svg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-600">{error}</span>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;
