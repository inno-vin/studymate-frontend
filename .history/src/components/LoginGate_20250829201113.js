import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User as UserIcon, ShieldCheck } from 'lucide-react';

const API_BASE = 'https://studymate-backend-beta.vercel.app';

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium ${active ? 'bg-primary-600 text-white' : 'bg-academic-200 text-academic-700 hover:bg-academic-300'}`}
  >
    {label}
  </button>
);

const LoginGate = ({ isOpen, onClose, onGuest }) => {
  const [tab, setTab] = useState('login'); // login | register | verify
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const post = async (path, payload) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const doLogin = async () => {
    setLoading(true); setMsg('');
    try {
      const data = await post('/api/auth/login', { emailOrUsername: emailOrUsername.trim(), password });
      localStorage.setItem('studymate_token', data.token);
      localStorage.setItem('studymate_username', data.user?.username || '');
      onClose();
    } catch (e) { setMsg(e.message); } finally { setLoading(false); }
  };

  const doRegister = async () => {
    setLoading(true); setMsg('');
    try {
      // requireOtp true to enforce verify flow similar to ChatGPT
      const data = await post('/api/auth/register', { username: username.trim(), email: email.trim(), password, requireOtp: true });
      setMsg('Registered. Check your email for OTP.');
      setTab('verify');
    } catch (e) { setMsg(e.message); } finally { setLoading(false); }
  };

  const doVerify = async () => {
    setLoading(true); setMsg('');
    try {
      const data = await post('/api/auth/verify', { email: email.trim(), otp: otp.trim() });
      localStorage.setItem('studymate_token', data.token);
      localStorage.setItem('studymate_username', data.user?.username || '');
      onClose();
    } catch (e) { setMsg(e.message); } finally { setLoading(false); }
  };

  const continueGuest = () => {
    localStorage.removeItem('studymate_token');
    localStorage.setItem('studymate_guest', '1');
    onGuest?.();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center px-4" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}>
            <div className="w-full max-w-lg bg-white rounded-2xl border border-academic-200 shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-academic-200">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-academic-900">Sign in to StudyMate</h3>
                </div>
                <button onClick={onClose} className="p-2 rounded-lg hover:bg-academic-100">
                  <X className="w-5 h-5 text-academic-600" />
                </button>
              </div>

              <div className="px-6 pt-4 flex gap-2">
                <Tab label="Login" active={tab==='login'} onClick={() => setTab('login')} />
                <Tab label="Register" active={tab==='register'} onClick={() => setTab('register')} />
                <Tab label="Verify OTP" active={tab==='verify'} onClick={() => setTab('verify')} />
              </div>

              {msg && <div className="mx-6 mt-3 text-sm text-academic-800 bg-academic-100 border border-academic-200 rounded-lg px-3 py-2">{msg}</div>}

              <div className="px-6 py-5">
                {tab === 'login' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input className="input-field border-0 bg-transparent" placeholder="Email or Username" value={emailOrUsername} onChange={(e)=>setEmailOrUsername(e.target.value)} />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Lock className="w-4 h-4 text-academic-500" />
                      <input type="password" className="input-field border-0 bg-transparent" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
                    </div>
                    <button className="btn-primary w-full" disabled={loading} onClick={doLogin}>{loading ? 'Signing in…' : 'Login'}</button>
                  </div>
                )}

                {tab === 'register' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <UserIcon className="w-4 h-4 text-academic-500" />
                      <input className="input-field border-0 bg-transparent" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input className="input-field border-0 bg-transparent" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Lock className="w-4 h-4 text-academic-500" />
                      <input type="password" className="input-field border-0 bg-transparent" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} />
                    </div>
                    <button className="btn-primary w-full" disabled={loading} onClick={doRegister}>{loading ? 'Registering…' : 'Register'}</button>
                  </div>
                )}

                {tab === 'verify' && (
                  <div className="space-y-3">
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <Mail className="w-4 h-4 text-academic-500" />
                      <input className="input-field border-0 bg-transparent" placeholder="Email used to register" value={email} onChange={(e)=>setEmail(e.target.value)} />
                    </div>
                    <div className="flex items-center bg-academic-100 rounded-lg px-3">
                      <ShieldCheck className="w-4 h-4 text-academic-500" />
                      <input className="input-field border-0 bg-transparent" placeholder="6-digit OTP" value={otp} onChange={(e)=>setOtp(e.target.value)} />
                    </div>
                    <button className="btn-primary w-full" disabled={loading} onClick={doVerify}>{loading ? 'Verifying…' : 'Verify'}</button>
                  </div>
                )}

                <div className="mt-5">
                  <button onClick={continueGuest} className="w-full btn-secondary">Continue without login</button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginGate;
