import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';

function ChatPage() {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [serverHistory, setServerHistory] = useState([]);
  const { token } = useAuth();

  const API_BASE = 'https://studymate-backend-beta.vercel.app';

  const loadServerHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setServerHistory(Array.isArray(data) ? data : []);
    } catch (_) {
      // ignore
    }
  };

  React.useEffect(() => {
    loadServerHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleFileUpload = (files) => {
    const newDocs = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      file: file,
      size: file.size
    }));

    setUploadedDocs(prev => [...prev, ...newDocs].slice(0, 10));
  };

  const removeDocument = (docId) => {
    setUploadedDocs(prev => prev.filter(doc => doc.id !== docId));
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([...chatHistory, userMessage]));

      uploadedDocs.forEach(doc => {
        formData.append('file', doc.file);
      });

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.usedSources || []
      };

      setChatHistory(prev => [...prev, assistantMessage]);
      // refresh saved history from backend
      loadServerHistory();
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <div className="sticky top-0 z-50">
        <Navbar onMenuClick={toggleSidebar} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop persistent sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-academic-200 flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <Sidebar
            uploadedDocs={uploadedDocs}
            onFileUpload={handleFileUpload}
            onRemoveDoc={removeDocument}
            chatHistory={chatHistory}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              />

              {/* Drawer */}
              <motion.div
                key="drawer"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 w-80 bg-white border-r border-academic-200 z-40 lg:hidden shadow-xl"
              >
                <Sidebar
                  uploadedDocs={uploadedDocs}
                  onFileUpload={handleFileUpload}
                  onRemoveDoc={removeDocument}
                  chatHistory={chatHistory}
                  serverHistory={serverHistory}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <ChatInterface
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            uploadedDocs={uploadedDocs}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
