import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi } from '../services/api';
import AppLayout from '../layouts/AppLayout';
import {
  Sprout,
  CloudSun,
  Layers,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Clock,
  Loader2,
  Compass,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await analysisApi.getAnalyses();
        if (res.data?.success && res.data.analyses && res.data.analyses.length > 0) {
          // Take the most recent analysis from MongoDB
          setLatestAnalysis(res.data.analyses[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard intelligence:', err);
        setError('Unable to fetch latest farm intelligence. Please verify your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const cropData = latestAnalysis?.agents?.crop?.result;
  const weatherData = latestAnalysis?.agents?.weather?.result;
  const soilData = latestAnalysis?.agents?.soil?.result;
  const marketData = latestAnalysis?.agents?.market?.result;
  const recommendation = latestAnalysis?.recommendation;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Dashboard Header (Section 16) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-agro-700 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Agricultural Advisory
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-agro-600" />
              {user?.location || 'Chennai, Tamil Nadu'} • Your farm intelligence at a glance.
            </p>
          </div>

          <Link
            to="/upload"
            className="px-5 py-3 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium hover:shadow-elevated transition-all duration-200 flex items-center justify-center gap-2 shrink-0 group"
          >
            <Sprout className="w-4 h-4 text-limeacc-400 group-hover:scale-110 transition-transform" />
            Analyze New Crop
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-agro-100 shadow-soft flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-agro-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading your farm intelligence from MongoDB...</p>
          </div>
        ) : !latestAnalysis ? (
          /* Empty State if user has not yet uploaded an analysis */
          <div className="p-10 sm:p-14 bg-white rounded-3xl border border-agro-100 shadow-soft text-center max-w-2xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-agro-50 text-agro-700 flex items-center justify-center mx-auto shadow-inner">
              <Sprout className="w-8 h-8 text-agro-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-agro-950">No crop analyses yet</h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Upload your first leaf or crop photograph to trigger our 4 AI agents and receive an actionable advisory for your field.
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium transition-all"
            >
              <Sprout className="w-4 h-4 text-limeacc-400" />
              Upload & Analyze My Crop
            </Link>
          </div>
        ) : (
          /* Real Data from MongoDB */
          <>
            {/* Section 16: Four Intelligence Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Crop */}
              <div className="p-5 bg-white rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-agro-900">
                    <Sprout className="w-4 h-4 text-emerald-600" /> 🌱 Crop
                  </span>
                  <span className="font-mono text-[10px] bg-agro-50 text-agro-800 px-2 py-0.5 rounded font-bold">
                    {latestAnalysis.cropType}
                  </span>
                </div>
                <p className="text-xl font-black text-agro-950 truncate">
                  {cropData?.healthStatus || 'Healthy'}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <span>Confidence:</span>
                  <span className="font-bold text-emerald-700">{cropData?.confidence || 92}%</span>
                </div>
              </div>

              {/* Card 2: Weather */}
              <div className="p-5 bg-white rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-agro-900">
                    <CloudSun className="w-4 h-4 text-sky-600" /> 🌦️ Weather
                  </span>
                  <span className="font-mono text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded font-bold">
                    {weatherData?.weatherCondition || 'Clear'}
                  </span>
                </div>
                <p className="text-xl font-black text-agro-950">
                  {weatherData?.temperature || 31}°C
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <span>Irrigation Risk:</span>
                  <span className="font-bold text-agro-800">{weatherData?.irrigationRisk || 'Favorable'}</span>
                </div>
              </div>

              {/* Card 3: Soil */}
              <div className="p-5 bg-white rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-agro-900">
                    <Layers className="w-4 h-4 text-amber-700" /> 🪨 Soil
                  </span>
                  <span className="font-mono text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                    {soilData?.soilType || latestAnalysis.soilType}
                  </span>
                </div>
                <p className="text-xl font-black text-agro-950">
                  {soilData?.cropSuitability || 'Good'}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <span>Moisture:</span>
                  <span className="font-bold text-blue-700">{soilData?.moistureStatus || 'Adequate'}</span>
                </div>
              </div>

              {/* Card 4: Market */}
              <div className="p-5 bg-white rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span className="flex items-center gap-1.5 font-bold text-agro-900">
                    <TrendingUp className="w-4 h-4 text-indigo-600" /> 📈 Market
                  </span>
                  <span className="font-mono text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-bold">
                    {marketData?.trend || 'Rising'}
                  </span>
                </div>
                <p className="text-xl font-black text-agro-950">
                  ₹{marketData?.currentPrice || 32} <span className="text-xs font-normal text-gray-400">/kg</span>
                </p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                  <span>Trend:</span>
                  <span className="font-bold text-emerald-700">{marketData?.trendPercentage || '+8.4%'}</span>
                </div>
              </div>
            </div>

            {/* Feature 1 & 2 Highlights: GIS Mapping & Weather Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Feature 1 Card: GIS Smart Farm Mapping */}
              <div className="p-6 bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-700" />
                      GIS Smart Farm Mapping
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 font-semibold">Esri Satellite + WGS84</span>
                  </div>
                  <h3 className="text-lg font-black text-agro-950">
                    Field Land Measurement & Boundaries
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Trace precision plot polygons, compute acreage in acres/hectares with satellite imagery, and synchronize perimeter telemetry with AI agents.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">Live polygon editing</span>
                  <Link
                    to="/gis-mapping"
                    className="px-4 py-2 rounded-xl bg-agro-700 hover:bg-agro-800 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 group"
                  >
                    Open GIS Map
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Feature 2 Card: Weather-Based Farming Recommendations */}
              <div className="p-6 bg-gradient-to-br from-white to-sky-50/40 rounded-3xl border border-sky-100 shadow-soft hover:shadow-premium transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-100/70 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1.5">
                      <CloudSun className="w-3.5 h-3.5 text-sky-700" />
                      Weather-Based Advisories
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Station
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-agro-950">
                    7-Day Forecast & Decision Directives
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    AI-powered recommendations on irrigation postponement, spray drift warnings, heat stress protection, and soil drainage management.
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    {weatherData?.weatherCondition || 'Live Telemetry'} • {weatherData?.temperature || 31}°C
                  </span>
                  <Link
                    to="/weather-advisory"
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-soft transition-all flex items-center gap-1.5 group"
                  >
                    Weather Advisory
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Section 16: Today's Recommendation (Large Premium Card) */}
            <div className="bg-gradient-to-br from-agro-900 via-agro-800 to-agro-950 rounded-3xl p-6 sm:p-10 text-white shadow-elevated relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-limeacc-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Synthesized Farm Advisory
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                    Today's Recommendation
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20">
                    {recommendation?.overallStatus || 'Attention Recommended'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-limeacc-400 text-agro-950">
                    {recommendation?.priority || 'Medium'} Priority
                  </span>
                </div>
              </div>

              {/* Recommendation summary quote */}
              <div className="relative z-10 bg-white/5 border border-white/10 p-5 rounded-2xl mb-6">
                <p className="text-base sm:text-lg text-white/95 leading-relaxed font-medium">
                  "{recommendation?.summary || 'Reduce irrigation today because rainfall is expected and soil moisture is already high.'}"
                </p>
              </div>

              {/* Action checklist snippet */}
              {recommendation?.actions && recommendation.actions.length > 0 && (
                <div className="relative z-10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-agro-200">Priority Steps:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {recommendation.actions.slice(0, 4).map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/10 p-2.5 rounded-xl border border-white/10">
                        <CheckCircle2 className="w-4 h-4 text-limeacc-400 shrink-0" />
                        <span className="truncate">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="relative z-10 flex flex-wrap items-center gap-4 pt-6 mt-6 border-t border-white/10">
                <Link
                  to={`/recommendation/${latestAnalysis._id}`}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-agro-950 font-bold text-xs shadow-soft transition-all"
                >
                  View Full Intelligence Report
                </Link>
                <Link
                  to="/upload"
                  className="px-5 py-2.5 rounded-xl bg-agro-700 hover:bg-agro-600 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                >
                  <Sprout className="w-3.5 h-3.5 text-limeacc-400" />
                  Analyze New Crop
                </Link>
                <span className="text-xs text-agro-300 ml-auto flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Analyzed on {new Date(latestAnalysis.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
