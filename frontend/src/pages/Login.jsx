import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Key, User, Phone, Crown, Eye, EyeOff, ArrowRight } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      showToast('success', 'Logged in successfully!');
      navigate('/');
    } else {
      showToast('error', result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      showToast('error', 'Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      showToast('warning', 'Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      showToast('warning', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // In our CRM, anyone can register a planner account, or we can route it to create an employee
      const res = await api.post('/employees', {
        name,
        email,
        password,
        phone,
        role: 'employee', // Default to employee role
      });

      if (res.data.success) {
        showToast('success', 'Account created successfully! Please sign in.');
        setIsRegister(false);
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-[#0a0f1d]/60 border border-[#1e293b] rounded-2xl pl-11 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-[#e8f0fe] focus:text-[#0b0f19] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-500/5 blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-indigo-500/5 blur-[100px]"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl shadow-xl shadow-brand-500/20 mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {isRegister ? 'Create Account' : 'SLV Events'}
          </h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-1.5 uppercase">
            {isRegister ? 'SLV EVENTS CRM & BOOKING PORTAL' : 'CRM & BOOKING PORTAL'}
          </p>
        </div>

        <div className="bg-[#0f1424]/70 border border-[#1e2640]/70 rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-md">
          {isRegister ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password (Min 8 Chars)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-500/15 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Access Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 rounded-lg border-[#1e293b] bg-[#0a0f1d] text-brand-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => showToast('info', 'Contact your system administrator to reset your password.')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white py-3.5 px-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-lg shadow-brand-500/15 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-5 border-t border-[#1e2640]/40 text-center text-xs text-slate-400">
            {isRegister ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-brand-400 hover:text-brand-300 font-bold transition-colors ml-1"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-brand-400 hover:text-brand-300 font-bold transition-colors ml-1"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
