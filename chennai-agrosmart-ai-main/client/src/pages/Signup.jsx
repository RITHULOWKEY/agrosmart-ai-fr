import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Lock, Mail, User, Phone, MapPin, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const Signup = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    location: 'Chennai, Tamil Nadu',
    preferredLanguage: 'English',
    defaultCrop: 'Tomato',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-white">
      {/* Left Column: Agricultural Visual Panel (Split-Screen) */}
      <div className="hidden md:flex md:col-span-5 lg:col-span-5 bg-gradient-to-br from-agro-900 via-agro-800 to-agro-950 p-12 text-white flex-col justify-between relative overflow-hidden">
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
            Join 1,000+ Farmers
          </span>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            Grow Better. <br />
            Waste Less.
          </h2>
          <p className="text-sm text-agro-100 leading-relaxed">
            Get instant computer-vision leaf pathology, localized Chennai weather risk alerts, soil suitability tips, and daily Koyambedu mandi prices.
          </p>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-limeacc-400" />
              <span>Multi-agent reasoning tailored to Tamil Nadu agriculture</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-limeacc-400" />
              <span>Supports Tomato, Paddy, Chilli, Brinjal, and Sugarcane</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-limeacc-400" />
              <span>Free account setup & field analysis reports</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-agro-300">
          Your farm telemetry is securely stored in your dedicated MongoDB database.
        </div>
      </div>

      {/* Right Column: Signup Form */}
      <div className="col-span-1 md:col-span-7 lg:col-span-7 p-6 sm:p-10 lg:p-14 flex flex-col justify-center max-w-xl mx-auto w-full overflow-y-auto">
        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight">
            Create Farmer Account 🌱
          </h2>
          <p className="text-sm text-gray-500">
            Start receiving personalized AI crop recommendations in minutes.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ramesh@agrosmart.in"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Password (min. 6 characters) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Farm Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Chennai Rural / Thiruvallur"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Primary Crop
              </label>
              <select
                name="defaultCrop"
                value={formData.defaultCrop}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50 focus:bg-white"
              >
                <option value="Tomato">Tomato (தக்காளி)</option>
                <option value="Paddy">Paddy / Rice (நெல்)</option>
                <option value="Chilli">Chilli (மிளகாய்)</option>
                <option value="Brinjal">Brinjal / Eggplant (கத்தரி)</option>
                <option value="Sugarcane">Sugarcane (கரும்பு)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium hover:shadow-elevated transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating your account...
              </>
            ) : (
              <>
                Complete Registration & Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-agro-700 hover:text-agro-900 underline">
            Log in to your account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
