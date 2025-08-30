import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Image as ImageIcon, FileSpreadsheet, FileArchive, FileCode, File as FileIcon } from 'lucide-react';

const prettyBytes = (bytes = 0) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const iconForMime = (mime = '') => {
  if (mime.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
  if (mime.includes('pdf')) return <FileText className="w-4 h-4" />;
  if (mime.includes('spreadsheet') || mime.includes('excel')) return <FileSpreadsheet className="w-4 h-4" />;
  if (mime.includes('zip') || mime.includes('tar') || mime.includes('gzip')) return <FileArchive className="w-4 h-4" />;
  if (mime.startsWith('text/') || mime.includes('json') || mime.includes('xml') || mime.includes('code')) return <FileCode className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
};

const Sidebar = ({ uploadedDocs, onFileUpload, onRemoveDoc, maxFiles = 10 }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-academic-200">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">
          Uploaded Files
        </h2>

        <div
          className={`relative border-2 border-dashed rounded-lg p-5 text-center transition-all duration-200 ${
            isDragOver ? 'border-primary-400 bg-primary-50' : 'border-academic-300 hover:border-academic-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragOver ? 'text-primary-500' : 'text-academic-400'}`} />
          <p className="text-sm text-academic-700">
            Drag & drop files here, or
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-2 text-sm px-3 py-1.5 rounded bg-primary-600 text-white hover:bg-primary-700 transition-colors"
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
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {uploadedDocs.length === 0 ? (
          <div className="text-xs text-academic-500 text-center py-4">
            No files added yet.
          </div>
        ) : (
          uploadedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-white border border-academic-200 rounded-lg px-3 py-2"
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
                className="p-1.5 rounded hover:bg-academic-100 text-academic-500"
                onClick={() => onRemoveDoc(doc.id)}
                aria-label="Remove file"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar; 
