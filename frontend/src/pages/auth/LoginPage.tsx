import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import type { UserRole } from '../../types';

const ROLE_DEMOS: { role: UserRole; label: string; email: string; color: string }[] = [
  { role: 'inventor', label: 'Inventor', email: 'dr.ramesh@iitbombay.edu', color: 'bg-accent/10 text-accent border-accent/20' },
  { role: 'university', label: 'University TTO', email: 'tto@iitdelhi.ac.in', color: 'bg-success/10 text-success border-success/20' },
  { role: 'startup', label: 'Startup', email: 'cto@nexagen.ai', color: 'bg-warning/10 text-warning border-warning/20' },
  { role: 'enterprise', label: 'Enterprise', email: 'ip@tatainnovations.com', color: 'bg-navy-100 text-navy-700 border-navy-200' },
  { role: 'broker', label: 'Broker', email: 'rahul@ipbridges.in', color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { role: 'admin', label: 'Admin', email: 'admin@ipcos.io', color: 'bg-danger/10 text-danger border-danger/20' },
];

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading, error, clearError, loginAsRole } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-navy-900 flex-col relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-auto">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">IP Commercialization OS</div>
              <div className="text-navy-400 text-xs">Enterprise IP Platform</div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="py-16"
          >
            <h1 className="text-5xl font-bold text-white leading-tight mb-6">
              The Operating System<br />
              <span className="text-accent">for IP Commercialization</span>
            </h1>
            <p className="text-navy-300 text-lg leading-relaxed max-w-md">
              From patent capture to royalty collection — AI-powered intelligence, enterprise-grade workflows.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: 'Patents Managed', value: '387+' },
                { label: 'Licensing Deals', value: '₹145Cr+' },
                { label: 'Universities', value: '24' },
                { label: 'AI Match Score', value: '94%' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-navy-400 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial */}
          <div className="mt-auto bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-navy-200 text-sm italic leading-relaxed">
              "IP COS transformed how IIT Delhi's TTO operates. We reduced our time-to-license by 60% and increased revenue 3x in one year."
            </p>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-white text-xs font-bold">AK</div>
              <div>
                <div className="text-white text-xs font-semibold">Arun Khanna</div>
                <div className="text-navy-400 text-[11px]">Director, TTO — IIT Delhi</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — Login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="font-bold text-text-primary">IP COS</span>
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-1">Welcome back</h2>
          <p className="text-text-muted text-sm mb-8">Sign in to your IP Commercialization dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger/8 border border-danger/20 rounded-lg mb-4">
              <AlertCircle size={14} className="text-danger shrink-0" />
              <span className="text-sm text-danger">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }}
                className="input" placeholder="you@organization.edu"
                required autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link to="/auth/forgot-password" className="text-xs text-accent hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  className="input pr-10" placeholder="Enter your password"
                  required autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full h-10">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">Or try a demo account</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo role buttons */}
          <div className="grid grid-cols-3 gap-2">
            {ROLE_DEMOS.map((d) => (
              <button
                key={d.role}
                onClick={() => handleDemoLogin(d.role)}
                className={`px-2 py-2 rounded-md border text-xs font-semibold transition-all hover:shadow-sm ${d.color}`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-text-muted mt-6">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-accent font-medium hover:underline">Create account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
