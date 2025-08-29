import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const API_BASE = 'https://studymate-backend-beta.vercel.app';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('studymate_token', data.token);
      localStorage.setItem('studymate_username', data.username || '');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-academic-50 px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-academic-900 mb-1">Welcome back</h1>
        <p className="text-sm text-academic-600 mb-6">Login to continue</p>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <Mail className="w-4 h-4 text-academic-500" />
            <input type="email" placeholder="Email" className="input-field border-0 bg-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <Lock className="w-4 h-4 text-academic-500" />
            <input type="password" placeholder="Password" className="input-field border-0 bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Signing in…' : 'Login'}</button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link to="/register" className="text-primary-600 hover:text-primary-700">Create account</Link>
          <Link to="/verify" className="text-primary-600 hover:text-primary-700">Verify OTP</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
