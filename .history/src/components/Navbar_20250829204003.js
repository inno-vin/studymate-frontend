import React from 'react';
import { motion } from 'framer-motion';
import { Menu, BookOpen } from 'lucide-react';

const Navbar = ({ onMenuClick, onLoginClick, onLogoutClick, username }) => {
  const isAuthed = Boolean(username);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="bg-white border-b border-academic-200 px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-academic-100">
            <Menu className="w-6 h-6 text-academic-600" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-academic-900">StudyMate</h1>
              <p className="text-sm text-academic-600">AI Academic Assistant</p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isAuthed ? (
            <>
              <span className="text-sm text-academic-700 hidden sm:inline">Hi, {username}</span>
              <button onClick={onLogoutClick} className="btn-secondary text-sm">Logout</button>
            </>
          ) : (
            <button onClick={onLoginClick} className="btn-primary text-sm">Login</button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
