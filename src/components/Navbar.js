import React from 'react';
import { Menu, MessageSquare, LogIn, LogOut, User, Plus, UserPlus } from 'lucide-react';

const Navbar = ({ onMenuClick, onLoginClick, onLogoutClick, username, onNewChat, isSidebarOpen }) => {
  return (
    <nav className="bg-white border-b border-academic-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-academic-100 transition-colors lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-academic-700" />
          </button>
          
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-primary-600" />
            <h1 className="text-xl font-bold text-academic-900">StudyMate</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onNewChat}
            className="hidden md:flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
          
          {username ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-academic-700 bg-academic-100 px-3 py-1.5 rounded-lg">
                <User className="w-4 h-4" />
                <span className="font-medium">{username}</span>
              </div>
              <button
                onClick={onLogoutClick}
                className="flex items-center space-x-1 bg-academic-200 text-academic-800 px-3 py-2 rounded-lg text-sm hover:bg-academic-300 transition-colors"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-primary-700 transition-colors"
              aria-label="Log in"
              title="Log in / Sign up"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
