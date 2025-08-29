import React from 'react';
import { motion } from 'framer-motion';
import { Menu, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white border-b border-academic-200 px-6 py-4 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-academic-100 transition-colors duration-200"
          >
            <Menu className="w-6 h-6 text-academic-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 5 }}
              className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            
            <div>
              <Link to="/" className="block">
                <h1 className="text-2xl font-bold text-academic-900">StudyMate</h1>
                <p className="text-sm text-academic-600">AI Academic Assistant</p>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="text-sm text-academic-600">SPARCX</div>
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-academic-700 text-sm">{username}</span>
              <button className="btn-secondary py-1" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link to="/login" className="btn-secondary py-1">Login</Link>
              <Link to="/register" className="btn-primary py-1">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
