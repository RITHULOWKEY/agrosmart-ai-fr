import React from 'react';
import {
  Sprout,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  ArrowRight,
  HelpCircle,
  ShieldCheck,
  Activity,
  Flame,
} from 'lucide-react';

const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return null;

  const {
    overallStatus = 'Good Condition',
    priority = 'Medium',
    summary,
    actions = [],
    rationaleChain = [],
    riskScore = 25,
    sustainabilityScore = 85,
  } = recommendation;

  // Determine status color styling
  const isOptimal = overallStatus === 'Optimal' || overallStatus.includes('Good');
  const isAttention = overallStatus.includes('Attention');

  const priorityColor =
    priority === 'Critical'
      ? 'bg-red-500 text-white'
      : priority === 'High'
      ? 'bg-amber-500 text-white'
      : 'bg-emerald-600 text-white';

  return (
    <div className="space-y-6">
      {/* 1. Large Central Overall Status Card (Section 21) */}
      <div className="bg-gradient-to-br from-agro-900 via-agro-800 to-agro-950 text-white rounded-3xl p-6 sm:p-10 shadow-elevated relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-limeacc-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-limeacc-400 flex items-center gap-1.5">
              <SparklesIcon /> Central AgroSmart Decision Engine
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {overallStatus}
            </h2>
            <p className="text-sm text-agro-100 max-w-xl">
              Synthesized by cross-referencing your crop health, Chennai live weather, soil moisture, and wholesale mandi pricing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-agro-200 block uppercase font-bold tracking-wider">Priority</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${priorityColor}`}>
                {priority} Priority
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
              <span className="text-[10px] text-agro-200 block uppercase font-bold tracking-wider">Sustainability</span>
              <span className="text-sm font-extrabold text-limeacc-400 block mt-0.5">
                {sustainabilityScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Farmer-friendly Executive Summary */}
        <div className="relative z-10 pt-6">
          <p className="text-base sm:text-lg text-white/95 leading-relaxed font-medium bg-white/5 p-5 rounded-2xl border border-white/10">
            "{summary}"
          </p>
        </div>
      </div>

      {/* 2. Final Farmer Recommendation & Priority Actions (Section 23) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-agro-100 shadow-premium">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-agro-100 text-agro-800 flex items-center justify-center shadow-soft">
            <Sprout className="w-6 h-6 text-agro-700" />
          </div>
          <div>
            <h3 className="text-xl font-black text-agro-950">🌱 What You Should Do</h3>
            <p className="text-xs text-gray-500">
              Clear, step-by-step actions without technical AI jargon
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-agro-50/40 border border-agro-100 flex items-start space-x-3 hover:bg-agro-50/80 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-agro-700 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="text-sm text-gray-800 font-medium leading-relaxed">
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Explanation Section: "Why are we recommending this?" (Section 24) */}
      {rationaleChain && rationaleChain.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-agro-100 shadow-premium">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-earth-100 text-earth-800 flex items-center justify-center shadow-soft">
              <HelpCircle className="w-6 h-6 text-earth-700" />
            </div>
            <div>
              <h3 className="text-xl font-black text-agro-950">Why are we recommending this?</h3>
              <p className="text-xs text-gray-500">
                Transparent multi-agent causality connecting weather, soil, crop, and market
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {rationaleChain.map((chain, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#faf9f6] border border-earth-200/60 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-agro-900 uppercase tracking-wide">
                    {chain.factor}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-earth-200/60 text-earth-900 font-semibold">
                    FACTOR #{idx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold mb-1">
                      Observation
                    </span>
                    <p className="text-gray-800 font-medium">{chain.observation}</p>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <span className="text-agro-700 block text-[10px] uppercase font-bold mb-1">
                      Causal Implication
                    </span>
                    <p className="text-gray-800 font-medium">{chain.implication}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual connected relationship pill */}
          <div className="mt-6 p-4 rounded-2xl bg-agro-50 border border-agro-200 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-agro-900">
            <span className="px-3 py-1 bg-white rounded-lg border border-agro-200 shadow-2xs">High Ambient Humidity</span>
            <span className="text-agro-500">+</span>
            <span className="px-3 py-1 bg-white rounded-lg border border-agro-200 shadow-2xs">High Soil Moisture</span>
            <ArrowRight className="w-4 h-4 text-agro-600" />
            <span className="px-3 py-1 bg-white rounded-lg border border-agro-200 shadow-2xs text-rose-700">Higher Fungal Risk</span>
            <ArrowRight className="w-4 h-4 text-agro-600" />
            <span className="px-3 py-1 bg-white rounded-lg border border-agro-200 shadow-2xs text-emerald-800">Reduce Irrigation</span>
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
  </svg>
);

export default RecommendationCard;
