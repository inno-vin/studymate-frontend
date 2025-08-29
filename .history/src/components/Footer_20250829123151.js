import React from 'react';
import { motion } from 'framer-motion';
import { Heart, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white border-t border-academic-200 px-6 py-4"
    >
      <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2 text-academic-600">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">Powered by Sparcx sollutions </span>
        </div>
        
        {/* <div className="flex items-center space-x-4 text-xs text-academic-500">
          <span>Built with React & TailwindCSS</span>
          <span>•</span>
          <span>Powered by Gemini AI</span>
        </div> */}
        
        <div className="flex items-center space-x-1 text-xs text-academic-500">
          <span>Made with</span>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 10 }}
            className="text-red-500"
          >
            <Heart className="w-3 h-3 fill-current" />
          </motion.div>
          <span>for students</span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;


