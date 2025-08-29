import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

const API_BASE = 'https://studymate-backend-beta.vercel.app';

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      active ? 'bg-primary-600 text-white' : 'bg-academic-200 text-academic-700 hover:bg-academic-300'
    }`}
  >
    {children}
  </button>
);

const AuthModal = ({ isOpen, onClose, onAuthenticated }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'verify'
  const [form, setForm] = useState({ username: '', email: '', password: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const callApi = async (path, payload) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const doRegister = async () => {
    setLoading(true); setMessage('');
    try {
      await callApi('/api/register', {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      setMessage('Registration successful. Check your email for the OTP.');
      setActiveTab('verify');
    } catch (e) {
      setMessage(e.message);
    } finally { setLoading(false); }
  };

  const doVerify = async () => {
    setLoading(true); setMessage('');
    try {
      await callApi('/api/verify-otp', {
        email: form.email.trim(),
        otp: form.otp.trim(),
      });
      setMessage('Email verified! You can now log in.');
      setActiveTab('login');
    } catch (e) {
      setMessage(e.message);
    } finally { setLoading(false); }
  };

  const doLogin = async () => {
    setLoading(true); setMessage('');
    try {
      const data = await callApi('/api/login', {
        email: form.email.trim(),
        password: form.password,
      });
      const { token, username } = data;
      localStorage.setItem('studymate_token', token);
      localStorage.setItem('studymate_username', username || '');
      onAuthenticated({ token, username });
      onClose();
    } catch (e) {
      setMessage(e.message);
    } finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-academic-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-academic-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-academic-900">StudyMate Account</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-academic-100"
                >
                  <X className="w-5 h-5 text-academic-600" />
                </button>
              </div>

              <div className="px-6 pt-4">
                <div className="flex space-x-2 mb-4">
                  <TabButton active={activeTab === 'login'} onClick={() => setActiveTab('login')}>Login</TabButton>
                  <TabButton active={activeTab === 'register'} onClick={() => setActiveTab('register')}>Register</TabButton>
                  <TabButton active={activeTab === 'verify'} onClick={() => setActiveTab('verify')}>Verify OTP</TabButton>
                </div>

                {message && (
                  <div className="mb-3 text-sm text-academic-700 bg-academic-100 border border-academic-200 rounded-lg px-3 py-2">
                    {message}
                  </div>
                )}
              </div>

              <div className="px-6 pb-6">
                {activeTab === 'register' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <UserIcon className="w-4 h-4 text-academic-500" />
                      <input
                        name="username"
                        placeholder="Username"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Lock className="w-4 h-4 text-academic-500" />
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <button onClick={doRegister} disabled={loading} className="btn-primary w-full">
                      {loading ? 'Registering…' : 'Register'}
                    </button>
                  </div>
                )}

                {activeTab === 'verify' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email used to register"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <ShieldCheck className="w-4 h-4 text-academic-500" />
                      <input
                        name="otp"
                        placeholder="6-digit OTP"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <button onClick={doVerify} disabled={loading} className="btn-primary w-full">
                      {loading ? 'Verifying…' : 'Verify OTP'}
                    </button>
                  </div>
                )}

                {activeTab === 'login' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Lock className="w-4 h-4 text-academic-500" />
                      <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        className="input-field border-0 bg-transparent"
                        onChange={handleChange}
                      />
                    </div>
                    <button onClick={doLogin} disabled={loading} className="btn-primary w-full">
                      {loading ? 'Signing in…' : 'Login'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
