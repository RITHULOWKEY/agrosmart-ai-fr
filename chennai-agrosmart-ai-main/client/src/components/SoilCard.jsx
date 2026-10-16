import React from 'react';
import { Layers, Droplets, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

const SoilCard = ({ data, mode = 'DEMO' }) => {
  if (!data) return null;

  const isReal = mode === 'REAL';

  return (
    <div className="bg-white rounded-3xl p-6 border border-agro-100 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-agro-950">Soil Intelligence</h3>
              <p className="text-xs text-gray-500">Profile: {data.soilType || 'Red Soil'}</p>
            </div>
          </div>
          <div>
            <span
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                isReal
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isReal ? 'REAL SENSOR DATA' : 'DEMO SOIL MODE'}
            </span>
          </div>
        </div>

        {/* Primary Suitability & Status */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-amber-50/40 rounded-2xl border border-amber-100">
            <span className="text-xs text-amber-900 font-medium">Crop Suitability</span>
            <p className="text-lg font-extrabold text-agro-950 mt-1 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              {data.cropSuitability || 'Good'}
            </p>
            <span className="text-[10px] text-gray-500">Root zone affinity</span>
          </div>

          <div className="p-3 bg-earth-100/60 rounded-2xl border border-earth-200">
            <span className="text-xs text-earth-800 font-medium">Moisture Status</span>
            <p className="text-lg font-extrabold text-agro-950 mt-1 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-500" />
              {data.moistureStatus || 'High'}
            </p>
            <span className="text-[10px] text-gray-500">Retention level</span>
          </div>
        </div>

        {/* Soil Condition & Nutrients */}
        <div className="space-y-2.5 my-4">
          <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">Tilth & Structure:</span>
            <span className="font-bold text-agro-950 bg-white px-2 py-0.5 rounded border border-gray-200">
              {data.soilCondition || 'Moderate'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700">Nutrient Risk:</span>
            <span className="font-bold text-agro-950 bg-white px-2 py-0.5 rounded border border-gray-200">
              {data.nutrientRisk || 'Medium'}
            </span>
          </div>
        </div>

        {/* Parameters Grid if available */}
        {data.parameters && (
          <div className="p-3 bg-[#faf9f5] rounded-2xl border border-earth-200/60 mb-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-earth-700 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" /> Key Soil Telemetry
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
              <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[9px]">pH Level</span>
                <span className="font-bold text-gray-800">{data.parameters.ph}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[9px]">Nitrogen</span>
                <span className="font-bold text-gray-800">{data.parameters.nitrogen}</span>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-gray-100">
                <span className="text-gray-400 block text-[9px]">Potassium</span>
                <span className="font-bold text-gray-800">{data.parameters.potassium}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actionable recommendation */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-agro-800 mb-1">
          Soil Recommendation
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed bg-earth-50 p-2.5 rounded-xl border border-earth-100">
          {data.soilRecommendation || 'Improve drainage and avoid excessive irrigation.'}
        </p>
      </div>
    </div>
  );
};

export default SoilCard;
