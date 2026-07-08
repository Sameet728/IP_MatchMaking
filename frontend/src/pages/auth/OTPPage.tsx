import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Loader2, RefreshCw } from 'lucide-react';

export const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const { user, verifyOtp, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    clearError();
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      const email = user?.email || localStorage.getItem('signup_email') || '';
      const ok = await verifyOtp(email, otpValue);
      if (ok) {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-1">Verify your email</h2>
        <p className="text-text-muted text-sm mb-6">We sent a 6-digit code to your email address. Enter it below.</p>

        <form onSubmit={handleVerify}>
          <div className="flex gap-2 justify-center mb-4">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
              />
            ))}
          </div>

          {error && <p className="text-xs text-danger mb-3">{error}</p>}

          <button type="submit" disabled={isLoading || otp.join('').length < 6} className="btn-primary w-full h-10 mb-3">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Verify Email'}
          </button>
        </form>

        <button className="btn-ghost text-xs flex items-center gap-1.5 mx-auto">
          <RefreshCw size={12} /> Resend code
        </button>

        <p className="text-[11px] text-text-muted mt-4">Demo: enter any 6 digits to verify</p>
      </motion.div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center mb-6">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-1">Reset password</h2>
          <p className="text-text-muted text-sm">Enter your email and we'll send a reset link.</p>
        </div>

        {sent ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 bg-success/8 border border-success/20 rounded-lg text-center">
            <p className="text-sm text-success font-medium">Reset link sent!</p>
            <p className="text-xs text-text-muted mt-1">Check your inbox at {email}</p>
            <button onClick={() => navigate('/auth/login')} className="btn-primary mt-4 text-sm px-6">
              Back to Login
            </button>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@organization.edu"
                required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full h-10">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
            </button>
            <button type="button" onClick={() => navigate('/auth/login')} className="btn-secondary w-full h-10">
              Cancel
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
