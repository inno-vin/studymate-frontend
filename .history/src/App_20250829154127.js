import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import FlowChart from './components/FlowChart';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';

function App() {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
      
      // Add PDF files if any are uploaded
      uploadedDocs.forEach(doc => {
        formData.append('pdfs', doc.file);
      });

      const response = await fetch('https://studymate-backend-beta.vercel.app/api/chat', {
        method: 'POST',
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
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <Navbar onMenuClick={toggleSidebar} />
      </div>
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sticky Desktop Sidebar */}
        <div className="hidden lg:block w-80 bg-white border-r border-academic-200 flex-shrink-0 sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          <Sidebar
            uploadedDocs={uploadedDocs}
            onFileUpload={handleFileUpload}
            onRemoveDoc={removeDocument}
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
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Main content: Flow area scrolls; navbar/sidebar stay fixed */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Flow chart area */}
          <div className="flex-1 min-h-0 border-b border-academic-200">
            <FlowChart />
          </div>
          {/* Chat below flow chart */}
          <div className="min-h-[300px] max-h-[60vh] overflow-hidden">
            <ChatInterface
              chatHistory={chatHistory}
              onSendMessage={sendMessage}
              isLoading={isLoading}
              uploadedDocs={uploadedDocs}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
