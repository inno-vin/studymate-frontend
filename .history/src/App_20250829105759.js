import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';

function App() {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
      <Navbar onMenuClick={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-80 bg-white border-r border-academic-200 flex-shrink-0"
            >
              <Sidebar
                uploadedDocs={uploadedDocs}
                onFileUpload={handleFileUpload}
                onRemoveDoc={removeDocument}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex-1 flex flex-col min-w-0">
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

export default App;
