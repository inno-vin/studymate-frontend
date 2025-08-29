import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon } from 'lucide-react';

const API_BASE = 'https://studymate-backend-beta.vercel.app';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setInfo('');
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setInfo('Registration successful. Check your email for a 6-digit OTP.');
      setTimeout(() => navigate('/verify', { state: { email } }), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-academic-50 px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-academic-900 mb-1">Create your account</h1>
        <p className="text-sm text-academic-600 mb-6">Register to get started</p>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {info && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <UserIcon className="w-4 h-4 text-academic-500" />
            <input type="text" placeholder="Username" className="input-field border-0 bg-transparent" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <Mail className="w-4 h-4 text-academic-500" />
            <input type="email" placeholder="Email" className="input-field border-0 bg-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <Lock className="w-4 h-4 text-academic-500" />
            <input type="password" placeholder="Password" className="input-field border-0 bg-transparent" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Registering…' : 'Register'}</button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link to="/login" className="text-primary-600 hover:text-primary-700">Login</Link>
          <Link to="/verify" className="text-primary-600 hover:text-primary-700">Verify OTP</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
