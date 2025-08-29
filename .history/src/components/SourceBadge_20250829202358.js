import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Info } from 'lucide-react';

const SourceBadge = ({ filename }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block">
      <motion.span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        whileHover={{ scale: 1.05 }}
        className="inline-flex items-center space-x-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-full border border-primary-200 cursor-help"
      >
        <FileText className="w-3 h-3" />
        <span>{filename}</span>
        <Info className="w-3 h-3 text-primary-500" />
      </motion.span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-academic-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap"
          >
            This information was retrieved from {filename}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-academic-800" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SourceBadge;
