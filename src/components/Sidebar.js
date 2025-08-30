import React from 'react';
import { FileText, X } from 'lucide-react';

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

const Sidebar = ({ uploadedDocs, onRemoveDoc }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-academic-200">
        <h2 className="text-lg font-semibold text-academic-900 mb-4">
          Uploaded Files
        </h2>
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
