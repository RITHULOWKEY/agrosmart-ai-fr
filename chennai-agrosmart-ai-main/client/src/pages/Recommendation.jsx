import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { analysisApi } from '../services/api';
import RecommendationCard from '../components/RecommendationCard';
import AgentCard from '../components/AgentCard';
import WeatherCard from '../components/WeatherCard';
import SoilCard from '../components/SoilCard';
import MarketCard from '../components/MarketCard';
import {
  Sprout,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Printer,
  Share2,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const Recommendation = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await analysisApi.getAnalysisById(id);
        if (res.data?.success) {
          setReport(res.data);
        } else {
          setError(res.data?.message || 'Report not found.');
        }
      } catch (err) {
        console.error('Failed to retrieve report:', err);
        setError(err.response?.data?.message || 'Unable to load analysis report.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchReport();
    }
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-16 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-agro-600 animate-spin" />
          <p className="text-gray-500 font-medium">Assembling your 4-agent intelligence report...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !report) {
    return (
      <AppLayout>
        <div className="p-10 max-w-xl mx-auto bg-white rounded-3xl border border-agro-100 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">Analysis Report Not Found</h2>
          <p className="text-sm text-gray-500">{error || 'Unable to locate this report.'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agro-700 text-white font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { analysis, agents = {}, recommendation } = report;
  const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const fullImageUrl = analysis?.imageUrl?.startsWith('http')
    ? analysis.imageUrl
    : `${backendBase}${analysis?.imageUrl}`;

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Navigation & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/history"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-agro-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to History
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold border border-gray-200 shadow-2xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
            <Link
              to="/upload"
              className="px-4 py-1.5 rounded-xl bg-agro-700 hover:bg-agro-800 text-white text-xs font-bold shadow-soft flex items-center gap-1.5"
            >
              <Sprout className="w-3.5 h-3.5 text-limeacc-400" />
              New Analysis
            </Link>
          </div>
        </div>

        {/* Section 20: Header & Subheading */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-agro-700 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Field Diagnostics & Action Plan
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-agro-950 tracking-tight">
              Your Farm Intelligence Report
            </h1>
            <p className="text-sm text-gray-600">
              A combined view of your crop, weather, soil, and market conditions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-agro-50/50 p-4 rounded-2xl border border-agro-100 shrink-0">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-agro-700" />
              <span>
                {new Date(analysis.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-agro-700" />
              <span>{analysis.location}</span>
            </div>
            <span>•</span>
            <div className="font-bold text-agro-900 bg-white px-2 py-0.5 rounded border border-agro-200">
              {analysis.cropType}
            </div>
          </div>
        </div>

        {/* Section 21 & 23 & 24: Decision Engine Central Overall Card & Final Recommendation */}
        <RecommendationCard recommendation={recommendation} />

        {/* Section 22: Four Result Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-agro-950">
              Individual Agent Intelligence Breakdowns
            </h3>
            <span className="text-xs text-gray-500 font-medium">4 Specialized AI Agents</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent 1: Crop */}
            <AgentCard
              data={agents.crop?.result}
              mode={agents.crop?.mode}
              imageUrl={fullImageUrl}
            />

            {/* Agent 2: Weather */}
            <WeatherCard
              data={agents.weather?.result}
              mode={agents.weather?.mode}
            />

            {/* Agent 3: Soil */}
            <SoilCard
              data={agents.soil?.result}
              mode={agents.soil?.mode}
            />

            {/* Agent 4: Market */}
            <MarketCard
              data={agents.market?.result}
              mode={agents.market?.mode}
            />
          </div>
        </div>

        {/* Visual Crop Photo Evidence Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft flex flex-col md:flex-row items-center gap-6">
          <div className="w-full md:w-56 h-44 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
            <img
              src={fullImageUrl}
              alt="Analyzed Leaf Foliage"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d691060c4?auto=format&fit=crop&w=400&q=80';
              }}
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-agro-700">Uploaded Foliage Evidence</span>
            <h4 className="text-lg font-bold text-agro-950">{analysis.cropType} Foliage Analysis</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Analyzed for morphological blight indicators, chlorosis patterns, and fungal pustules.
              All findings are permanently stored in your MongoDB database under Analysis ID: <code className="text-gray-500 font-mono">{analysis._id}</code>.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Recommendation;
