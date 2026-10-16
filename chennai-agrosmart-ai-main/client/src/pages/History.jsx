import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { analysisApi } from '../services/api';
import {
  Sprout,
  Calendar,
  MapPin,
  ArrowRight,
  CloudSun,
  Layers,
  TrendingUp,
  AlertCircle,
  Loader2,
  FileText,
} from 'lucide-react';

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await analysisApi.getAnalyses();
        if (res.data?.success) {
          setAnalyses(res.data.analyses || []);
        } else {
          setError(res.data?.message || 'Failed to retrieve analysis history.');
        }
      } catch (err) {
        console.error('History fetch error:', err);
        setError('Unable to load history from database.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const backendBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft">
          <div>
            <span className="text-xs font-bold text-agro-700 uppercase tracking-widest bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
              Audit & Records
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight mt-1">
              Field Analysis History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Browse your historical multi-agent crop health audits and recommendations.
            </p>
          </div>

          <Link
            to="/upload"
            className="px-5 py-2.5 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-xs shadow-premium transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Sprout className="w-4 h-4 text-limeacc-400" />
            New Crop Analysis
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-agro-100 shadow-soft flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-agro-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Loading your farm records from MongoDB...</p>
          </div>
        ) : analyses.length === 0 ? (
          /* Empty state */
          <div className="p-12 bg-white rounded-3xl border border-agro-100 shadow-soft text-center max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-agro-50 text-agro-700 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-agro-600" />
            </div>
            <h2 className="text-2xl font-black text-agro-950">No analyses yet</h2>
            <p className="text-sm text-gray-500">
              Analyze your first crop to get started with multi-agent recommendations.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium transition-all"
            >
              <Sprout className="w-4 h-4 text-limeacc-400" />
              Analyze First Crop
            </Link>
          </div>
        ) : (
          /* History Grid (Section 25) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((item) => {
              const cropAgent = item.agents?.crop?.result;
              const weatherAgent = item.agents?.weather?.result;
              const soilAgent = item.agents?.soil?.result;
              const marketAgent = item.agents?.market?.result;

              const imageUrl = item.imageUrl?.startsWith('http')
                ? item.imageUrl
                : `${backendBase}${item.imageUrl}`;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl overflow-hidden border border-agro-100 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Crop Image */}
                    <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={item.cropType}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d691060c4?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-bold text-agro-950 shadow-xs">
                        {item.cropType}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white">
                        {item.soilType}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Crop Diagnosis</span>
                        <h3 className="text-lg font-black text-agro-950 truncate">
                          {cropAgent?.healthStatus || item.overallStatus || 'Healthy'}
                        </h3>
                      </div>

                      {/* 4 Multi-agent summary pills (Section 25) */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-agro-50/50 p-3 rounded-2xl border border-agro-100">
                        <div className="flex items-center gap-1.5 text-agro-900 font-semibold truncate">
                          <span>🌱</span>
                          <span className="text-gray-500 font-normal">Crop:</span>
                          <span>{cropAgent?.confidence ? `${cropAgent.confidence}%` : '92%'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-agro-900 font-semibold truncate">
                          <span>🌦️</span>
                          <span className="text-gray-500 font-normal">Weather:</span>
                          <span>{weatherAgent?.weatherCondition || 'Favorable'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-agro-900 font-semibold truncate">
                          <span>🪨</span>
                          <span className="text-gray-500 font-normal">Soil:</span>
                          <span>{soilAgent?.cropSuitability || 'Good'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-agro-900 font-semibold truncate">
                          <span>📈</span>
                          <span className="text-gray-500 font-normal">Market:</span>
                          <span>{marketAgent?.trend || 'Rising'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Date & Link */}
                  <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between text-xs mt-3">
                    <span className="text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(item.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    <Link
                      to={`/recommendation/${item._id}`}
                      className="px-4 py-2 rounded-xl bg-agro-700 hover:bg-agro-800 text-white font-bold shadow-soft hover:shadow-premium transition-all flex items-center gap-1 group/btn"
                    >
                      View Report
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default History;
