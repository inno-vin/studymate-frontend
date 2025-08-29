import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';

const API_BASE = 'https://studymate-backend-beta.vercel.app';

const VerifyOtpPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setMessage('Email verified successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-academic-50 px-4 py-10">
      <div className="w-full max-w-md card">
        <h1 className="text-2xl font-bold text-academic-900 mb-1">Verify your email</h1>
        <p className="text-sm text-academic-600 mb-6">Enter the 6-digit OTP sent to your email</p>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>}
        {message && <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <Mail className="w-4 h-4 text-academic-500" />
            <input type="email" placeholder="Email" className="input-field border-0 bg-transparent" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center bg-academic-100 rounded-lg px-3">
            <ShieldCheck className="w-4 h-4 text-academic-500" />
            <input placeholder="6-digit OTP" className="input-field border-0 bg-transparent" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Verifying…' : 'Verify'}</button>
        </form>

        <div className="flex justify-between mt-4 text-sm">
          <Link to="/login" className="text-primary-600 hover:text-primary-700">Login</Link>
          <Link to="/register" className="text-primary-600 hover:text-primary-700">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
