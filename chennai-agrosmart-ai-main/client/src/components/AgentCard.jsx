import React from 'react';
import { Sprout, ShieldCheck, AlertTriangle, Cpu, CheckCircle } from 'lucide-react';

const AgentCard = ({ data, mode = 'DEMO', imageUrl }) => {
  if (!data) return null;

  const isReal = mode === 'REAL';
  const confidence = data.confidence || 85;
  const isHealthy = (data.healthStatus || '').toLowerCase().includes('healthy');

  return (
    <div className="bg-white rounded-3xl p-6 border border-agro-100 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-agro-950">Crop Intelligence</h3>
              <p className="text-xs text-gray-500">Crop: {data.crop || 'Foliage'}</p>
            </div>
          </div>
          <div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                isReal
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isReal ? 'LIVE MODEL PREDICTION' : 'DEMO MODE'}
            </span>
          </div>
        </div>

        {/* Health status banner */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-agro-50 to-emerald-50/40 border border-agro-100 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-agro-800 uppercase tracking-wide">Diagnosis</span>
            <h4 className="text-lg font-extrabold text-agro-950 mt-0.5">{data.healthStatus}</h4>
            <p className="text-xs text-gray-600 mt-1">{data.disease}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-gray-500 block">Severity</span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-0.5 ${
                data.severity === 'None' || data.severity === 'Low'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {data.severity || 'Low'}
            </span>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="my-4 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-agro-600" /> Model Confidence
            </span>
            <span className="text-agro-800 font-bold">{confidence}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-agro-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
            <span className="flex items-center gap-1 font-mono">
              <Cpu className="w-3 h-3 text-gray-400" />
              {data.modelArchitecture || 'EfficientNet-B0'}
            </span>
            <span>Computer Vision</span>
          </div>
        </div>

        {/* Visual symptoms detected */}
        {data.visualSymptoms && data.visualSymptoms.length > 0 && (
          <div className="my-3 space-y-1">
            <span className="text-[11px] font-bold uppercase text-gray-600 tracking-wider">Detected Symptoms:</span>
            <ul className="space-y-1">
              {data.visualSymptoms.map((symptom, idx) => (
                <li key={idx} className="text-xs text-gray-700 flex items-start gap-1.5">
                  <span className="text-agro-600 font-bold mt-0.5">•</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actionable recommendation */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-agro-800 mb-1">
          Crop Recommendation
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
          {data.recommendation || 'Continue standard monitoring protocol.'}
        </p>
      </div>
    </div>
  );
};

export default AgentCard;
