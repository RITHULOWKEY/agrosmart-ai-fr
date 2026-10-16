import React from 'react';
import { Link } from 'react-router-dom';
import { CloudSun, Droplets, Thermometer, Wind, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';

const WeatherCard = ({ data, mode = 'DEMO' }) => {
  if (!data) return null;

  const isReal = mode === 'REAL' || data.isLive;

  return (
    <div className="bg-white rounded-3xl p-6 border border-agro-100 shadow-soft hover:shadow-premium transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-xs">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-agro-950">Weather Intelligence</h3>
              <p className="text-xs text-gray-500">{data.stationLocation || 'Chennai Region'}</p>
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
              {isReal ? 'LIVE WEATHER' : 'DEMO WEATHER MODE'}
            </span>
          </div>
        </div>

        {/* Primary weather stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
          <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100/60">
            <div className="flex items-center gap-1.5 text-xs text-sky-800 font-medium">
              <Thermometer className="w-4 h-4 text-sky-600" />
              <span>Temp</span>
            </div>
            <p className="text-xl font-extrabold text-agro-950 mt-1">{data.temperature}°C</p>
            <span className="text-[10px] text-gray-500">{data.weatherCondition}</span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100/60">
            <div className="flex items-center gap-1.5 text-xs text-blue-800 font-medium">
              <Droplets className="w-4 h-4 text-blue-600" />
              <span>Humidity</span>
            </div>
            <p className="text-xl font-extrabold text-agro-950 mt-1">{data.humidity}%</p>
            <span className="text-[10px] text-gray-500">Ambient moisture</span>
          </div>

          <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100/60">
            <div className="flex items-center gap-1.5 text-xs text-teal-800 font-medium">
              <CloudSun className="w-4 h-4 text-teal-600" />
              <span>Rainfall</span>
            </div>
            <p className="text-xl font-extrabold text-agro-950 mt-1">{data.rainfall} mm</p>
            <span className="text-[10px] text-gray-500">24h forecast</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
              <Wind className="w-4 h-4 text-gray-500" />
              <span>Wind</span>
            </div>
            <p className="text-xl font-extrabold text-agro-950 mt-1">{data.windSpeed || 14} <span className="text-xs font-normal text-gray-500">km/h</span></p>
            <span className="text-[10px] text-gray-500">Steady breeze</span>
          </div>
        </div>

        {/* Agronomic Risk Meters */}
        <div className="space-y-2.5 my-4">
          <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Irrigation Risk:
            </span>
            <span className="font-bold text-agro-950 bg-white px-2 py-0.5 rounded border border-gray-200">
              {data.irrigationRisk || 'Medium'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs p-2.5 bg-gray-50 rounded-xl">
            <span className="font-medium text-gray-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              Spore & Fungal Risk:
            </span>
            <span className="font-bold text-agro-950 bg-white px-2 py-0.5 rounded border border-gray-200">
              {data.diseaseRisk || 'Medium'}
            </span>
          </div>
        </div>
      </div>

      {/* Actionable recommendation */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-agro-800 mb-1">
          Weather Recommendation
        </h4>
        <p className="text-xs text-gray-700 leading-relaxed bg-agro-50/50 p-2.5 rounded-xl border border-agro-100">
          {data.weatherRecommendation || 'Weather is favorable for standard farming practices.'}
        </p>

        <Link
          to="/weather-advisory"
          className="mt-3 text-xs font-bold text-sky-700 hover:text-sky-900 transition-colors flex items-center justify-end gap-1 group"
        >
          <span>View 7-Day Forecast & Advisories</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default WeatherCard;
