import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import LoginGate from './components/LoginGate'; 

function App() {
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem('studymate_username') || '');
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [mobileView, setMobileView] = useState(window.innerWidth < 1024);

  const API_BASE = 'https://studymate-backend-beta.vercel.app';

  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('studymate_token'));
    const isGuest = localStorage.getItem('studymate_guest') === '1';
    if (!hasToken && !isGuest) setGateOpen(true);
    if (hasToken) {
      fetchChats();
      setUsername(localStorage.getItem('studymate_username') || '');
    }

    const handleResize = () => setMobileView(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const authHeaders = () => {
    const token = localStorage.getItem('studymate_token');
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' }
      : { Accept: 'application/json' };
  };

  async function fetchChats() {
    const headers = authHeaders();
    if (!headers.Authorization) return;
    try {
      const res = await fetch(`${API_BASE}/api/history/chats`, { headers });
      const data = await res.json();
      if (res.ok && data.ok !== false) setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }

  async function createChatIfNeeded(firstUserMessage) {
    if (currentChatId) return currentChatId;
    const headers = authHeaders();
    if (!headers.Authorization) return null; // guest
    try {
      const res = await fetch(`${API_BASE}/api/history/chats`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: firstUserMessage?.content?.slice(0, 40) || 'New Chat',
          firstMessage: firstUserMessage
        })
      });
      const data = await res.json();
      if (res.ok && data.chatId) {
        setCurrentChatId(data.chatId);
        fetchChats();
        return data.chatId;
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
    return null;
  }

  async function appendMessages(chatId, messages) {
    const headers = authHeaders();
    if (!headers.Authorization || !chatId) return;
    try {
      await fetch(`${API_BASE}/api/history/chats/${chatId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages })
      });
      fetchChats();
    } catch (error) {
      console.error('Error appending messages:', error);
    }
  }

  async function loadChat(chatId) {
    const headers = authHeaders();
    if (!headers.Authorization) return;
    try {
      const res = await fetch(`${API_BASE}/api/history/chats/${chatId}`, { headers });
      const data = await res.json();
      if (res.ok && data.chat) {
        setCurrentChatId(chatId);
        setChatHistory(data.chat.messages || []);
        if (mobileView) setIsSidebarOpen(false);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  }

  const startNewChat = () => {
    setCurrentChatId(null);
    setChatHistory([]);
    setUploadedDocs([]);
    if (mobileView) setIsSidebarOpen(false);
  };

  const handleFileUpload = (files) => {
    const now = Date.now();
    const newDocs = Array.from(files).map((file, idx) => ({
      id: `${now}_${idx}_${Math.random()}`,
      name: file.name,
      file,
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
      // Keep both keys for backward compatibility with earlier backend
      uploadedDocs.forEach(doc => {
        formData.append('files', doc.file);
        formData.append('pdfs', doc.file);
      });

      const token = localStorage.getItem('studymate_token');
      const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };

      const res = await fetch(`${API_BASE}/api/chat`, { method: 'POST', headers, body: formData });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      let text = '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        text = await res.text();
      }

      if (!res.ok) {
        const snippet = (data?.details || data?.error || text || '').toString().slice(0, 200);
        throw new Error(snippet || `HTTP ${res.status}`);
      }

      const responseText = data?.response ?? '';
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toISOString(),
        sources: data?.usedSources || []
      };

      setChatHistory(prev => [...prev, assistantMessage]);

      if (token) {
        const newChatId = await createChatIfNeeded(userMessage);
        const targetChatId = newChatId || currentChatId;
        await appendMessages(targetChatId, [userMessage, assistantMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message || 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const onLoginClick = () => setGateOpen(true);
  const onLogoutClick = () => {
    localStorage.removeItem('studymate_token');
    localStorage.removeItem('studymate_username');
    localStorage.removeItem('studymate_guest');
    setUsername('');
    setCurrentChatId(null);
    setChats([]);
    setChatHistory([]);
    setUploadedDocs([]);
  };

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col">
      <Navbar
        onMenuClick={toggleSidebar}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        username={username}
        onNewChat={startNewChat}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar - Simplified without file upload */}
        <div className={`hidden lg:flex lg:flex-col w-80 bg-white border-r border-academic-200 flex-shrink-0 ${isSidebarOpen ? 'flex' : 'hidden'}`}>
          <div className="p-4 border-b border-academic-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-academic-700">Your Chats</h3>
              <button
                onClick={startNewChat}
                className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
              >
                + New Chat
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {username && chats && chats.length > 0 ? (
                chats.map(c => (
                  <button
                    key={c._id}
                    onClick={() => loadChat(c._id)}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${
                      currentChatId === c._id
                        ? 'bg-primary-50 border-primary-200 text-primary-700'
                        : 'bg-white border-academic-200 hover:bg-academic-50'
                    }`}
                  >
                    <div className="font-medium truncate">{c.title || 'Untitled'}</div>
                    <div className="text-xs text-academic-500">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-xs text-academic-500 p-2 text-center">
                  {username ? 'No saved chats yet' : 'Sign in to save chat history'}
                </div>
              )}
            </div>
          </div>
          
          {/* Uploaded files list in sidebar */}
          <div className="p-4 border-t border-academic-200">
            <h3 className="text-sm font-semibold text-academic-700 mb-3">Uploaded Files</h3>
            {uploadedDocs.length === 0 ? (
              <div className="text-xs text-academic-500 text-center py-4">
                No files added yet.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between bg-academic-50 border border-academic-200 rounded-lg px-3 py-2"
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
                          {prettyBytes(doc.size)}
                        </div>
                      </div>
                    </div>
                    <button
                      className="p-1 rounded hover:bg-academic-200 text-academic-500"
                      onClick={() => removeDocument(doc.id)}
                      aria-label="Remove file"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sidebar (Drawer) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              />
              <motion.div
                key="drawer"
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-y-0 left-0 w-80 bg-white border-r border-academic-200 z-40 lg:hidden shadow-xl flex flex-col"
              >
                <div className="p-4 border-b border-academic-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-academic-700">Your Chats</h3>
                    <button
                      onClick={startNewChat}
                      className="text-xs bg-primary-600 text-white px-2 py-1 rounded hover:bg-primary-700 transition-colors"
                    >
                      + New Chat
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {username && chats && chats.length > 0 ? (
                      chats.map(c => (
                        <button
                          key={c._id}
                          onClick={() => loadChat(c._id)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-lg border ${
                            currentChatId === c._id
                              ? 'bg-primary-50 border-primary-200 text-primary-700'
                              : 'bg-white border-academic-200 hover:bg-academic-50'
                          }`}
                        >
                          <div className="font-medium truncate">{c.title || 'Untitled'}</div>
                          <div className="text-xs text-academic-500">
                            {new Date(c.updatedAt).toLocaleDateString()}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-xs text-academic-500 p-2 text-center">
                        {username ? 'No saved chats yet' : 'Sign in to save chat history'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded files list in mobile sidebar */}
                <div className="p-4 border-t border-academic-200">
                  <h3 className="text-sm font-semibold text-academic-700 mb-3">Uploaded Files</h3>
                  {uploadedDocs.length === 0 ? (
                    <div className="text-xs text-academic-500 text-center py-4">
                      No files added yet.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uploadedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between bg-academic-50 border border-academic-200 rounded-lg px-3 py-2"
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
                                {prettyBytes(doc.size)}
                              </div>
                            </div>
                          </div>
                          <button
                            className="p-1 rounded hover:bg-academic-200 text-academic-500"
                            onClick={() => removeDocument(doc.id)}
                            aria-label="Remove file"
                            title="Remove file"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatInterface
            chatHistory={chatHistory}
            onSendMessage={sendMessage}
            isLoading={isLoading}
            uploadedDocs={uploadedDocs}
            onFileUpload={handleFileUpload}
            onRemoveDoc={removeDocument}
          />
        </div>
      </div>

      <Footer />

      <LoginGate
        isOpen={gateOpen}
        onClose={() => {
          setGateOpen(false);
          setUsername(localStorage.getItem('studymate_username') || '');
          fetchChats();
        }}
        onGuest={() => {}}
      />
    </div>
  );
}

export default App;
