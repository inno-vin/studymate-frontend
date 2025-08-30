import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, AlertCircle } from 'lucide-react';

const PdfUpload = ({ onFileUpload, maxFiles = 10, className = '' }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const MAX = 25 * 1024 * 1024;

  const acceptAndClamp = (files) => {
    const pdfs = files.filter(f => f.type === 'application/pdf');
    const small = pdfs.filter(f => f.size <= MAX);
    if (pdfs.length && small.length !== pdfs.length) {
      setError('Some PDFs exceeded the 25MB limit and were skipped.');
    }
    return small.slice(0, maxFiles);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); setError(''); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };

  const handleDrop = (e) => {
    e.preventDefault(); setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    const picked = acceptAndClamp(files);
    if (picked.length) onFileUpload(picked);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const picked = acceptAndClamp(files);
    if (picked.length) onFileUpload(picked);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={className}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver ? 'border-primary-400 bg-primary-50' : 'border-academic-300 hover:border-academic-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-primary-500' : 'text-academic-400'}`} />
        <p className="text-sm text-academic-700">Drop PDFs here or</p>
        <button
          type="button"
          className="mt-2 text-sm px-3 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse PDFs
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
        <p className="mt-2 text-xs text-academic-500">Up to {maxFiles} PDFs, 25MB each.</p>
      </div>
    </div>
  );
};

export default PdfUpload;