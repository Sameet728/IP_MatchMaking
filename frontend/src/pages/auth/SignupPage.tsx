import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';
import type { UserRole } from '../../types';

const ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'inventor', label: 'Inventor / Researcher', desc: 'Upload patents, get AI analysis, find licensees' },
  { role: 'university', label: 'University / TTO', desc: 'Manage institutional patent portfolio' },
  { role: 'startup', label: 'Startup', desc: 'Find and license technologies for your business' },
  { role: 'enterprise', label: 'Enterprise', desc: 'IP scouting, bulk acquisition, portfolio management' },
  { role: 'broker', label: 'IP Broker', desc: 'Close deals, earn commissions, manage negotiations' },
];

export const SignupPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', organization: '' });
  const [showPw, setShowPw] = useState(false);
  const { signup, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    const ok = await signup({ ...form, role: selectedRole });
    if (ok) navigate('/auth/verify-otp');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-navy-900 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
            </svg>
          </div>
          <span className="font-bold text-text-primary">IP Commercialization OS</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${s < step ? 'bg-success text-white' : s === step ? 'bg-accent text-white' : 'bg-navy-100 text-text-muted'}`}>
                {s < step ? <Check size={12} /> : s}
              </div>
              {s < 2 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-success' : 'bg-navy-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-text-primary mb-1">Choose your role</h2>
            <p className="text-text-muted text-sm mb-6">Select how you'll use the platform</p>

            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleRoleSelect(r.role)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border text-left transition-all hover:border-accent hover:bg-accent/3 
                    ${selectedRole === r.role ? 'border-accent bg-accent/5' : 'border-border bg-white'}`}
                >
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-text-primary">{r.label}</div>
                    <div className="text-xs text-text-muted mt-0.5">{r.desc}</div>
                  </div>
                  <ArrowRight size={15} className="text-text-muted" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={() => setStep(1)} className="text-xs text-accent mb-4 hover:underline flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-text-primary mb-1">Create your account</h2>
            <p className="text-text-muted text-sm mb-6">
              Registering as: <strong className="text-text-primary capitalize">{selectedRole?.replace('-', ' ')}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input className="input" placeholder="Dr. Ramesh Sharma" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Work Email</label>
                <input type="email" className="input" placeholder="you@organization.edu" required
                  value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); clearError(); }} />
              </div>
              <div>
                <label className="label">Organization</label>
                <input className="input" placeholder="IIT Bombay / Your Company"
                  value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="Min. 8 characters"
                    required minLength={6}
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-danger">{error}</p>}

              <button type="submit" disabled={isLoading} className="btn-primary w-full h-10">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <ArrowRight size={15} /></>}
              </button>
            </form>
          </motion.div>
        )}

        <p className="text-center text-xs text-text-muted mt-6">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-accent font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};
