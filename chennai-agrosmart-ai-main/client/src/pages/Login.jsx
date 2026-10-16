import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-white">
      {/* Left Column: Agricultural Visual Panel (Split-Screen) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-6 bg-gradient-to-br from-agro-900 via-agro-800 to-agro-950 p-12 text-white flex-col justify-between relative overflow-hidden">
        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-limeacc-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-limeacc-400 border border-white/15">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Chennai AgroSmart AI</span>
              <p className="text-[10px] text-agro-200 uppercase tracking-widest font-semibold">Farmer Intelligence</p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto max-w-md">
          <span className="text-xs font-bold uppercase tracking-wider text-limeacc-400 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            Welcome Back
          </span>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Grow Better. <br />
            Waste Less.
          </h2>
          <p className="text-sm text-agro-100 leading-relaxed">
            Log in to access your field diagnostics, Chennai mandi price alerts, and multi-agent farming recommendations.
          </p>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-limeacc-300 font-semibold">
              <Sprout className="w-4 h-4" />
              <span>4-Agent Agricultural Intelligence Mesh</span>
            </div>
            <p className="text-agro-200">
              Correlating Crop Health + Weather + Soil + Mandi Market Data in one unified dashboard.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-xs text-agro-300">
          Protected by JWT authentication and secure database encryption.
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="col-span-1 md:col-span-7 lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center max-w-lg mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-agro-700 text-white flex items-center justify-center">
            <Sprout className="w-6 h-6 text-limeacc-400" />
          </div>
          <div>
            <span className="font-bold text-lg text-agro-900">Chennai AgroSmart AI</span>
            <p className="text-xs text-gray-500">Grow Better. Waste Less.</p>
          </div>
        </div>

        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight">
            Welcome Back, Farmer 👋
          </h2>
          <p className="text-sm text-gray-500">
            Sign in to check your active crop analyses and market updates.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="farmer@agrosmart.in"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm transition-all bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium hover:shadow-elevated transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Farm Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
          New to Chennai AgroSmart?{' '}
          <Link to="/signup" className="font-bold text-agro-700 hover:text-agro-900 underline">
            Create your free farmer account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
