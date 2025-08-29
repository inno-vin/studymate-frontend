import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const presetEmail = location?.state?.email || '';

  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setSuccess('Email verified! You can now login.');
      setTimeout(() => navigate('/login', { replace: true }), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-academic-50 px-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
        <p className="text-academic-600 mb-6">Enter the OTP sent to your email</p>
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        {success && <div className="mb-4 text-green-600 text-sm">{success}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">OTP</label>
            <input className="input-field" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
        </form>
        <div className="text-sm text-academic-600 mt-4">
          Back to <Link to="/login" className="text-primary-600">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
