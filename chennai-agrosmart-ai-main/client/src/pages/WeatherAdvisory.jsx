import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { farmApi, agentApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sun,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  Sparkles,
  Info,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const WeatherAdvisory = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(searchParams.get('farmId') || '');
  const [selectedFarm, setSelectedFarm] = useState(null);

  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch user's registered farms
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const res = await farmApi.getFarms();
        if (res.data?.success) {
          const farmList = res.data.farms || [];
          setFarms(farmList);

          const queryFarmId = searchParams.get('farmId');
          if (queryFarmId && farmList.some((f) => f._id === queryFarmId)) {
            setSelectedFarmId(queryFarmId);
          } else if (farmList.length > 0 && !selectedFarmId) {
            setSelectedFarmId(farmList[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load farms for weather advisory:', err);
      }
    };

    fetchFarms();
  }, []);

  // 2. Fetch live weather & farming recommendations whenever selected farm changes
  const fetchWeatherForFarm = async (farmId, isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let res;
      if (farmId) {
        // Use farm-specific endpoint
        res = await agentApi.getFarmWeather(farmId);
      } else {
        // Fallback to user location
        res = await agentApi.getWeather({
          location: user?.location || 'Chennai, Tamil Nadu',
          cropType: user?.defaultCrop || 'Tomato',
        });
      }

      if (res.data?.success && res.data.result) {
        setWeatherData(res.data.result);
        if (res.data.farm) {
          setSelectedFarm(res.data.farm);
        }
      } else {
        setError('Could not retrieve weather intelligence from server.');
      }
    } catch (err) {
      console.error('Weather intelligence retrieval failed:', err);
      setError(err.response?.data?.message || 'Weather intelligence service temporarily unreachable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedFarmId) {
      const match = farms.find((f) => f._id === selectedFarmId);
      if (match) setSelectedFarm(match);
      fetchWeatherForFarm(selectedFarmId);
    } else if (farms.length === 0 && !loading) {
      fetchWeatherForFarm(null);
    }
  }, [selectedFarmId, farms]);

  // Weather condition icon helper
  const getWeatherIcon = (condition = '', size = 'w-6 h-6') => {
    const cond = condition.toLowerCase();
    if (cond.includes('thunder') || cond.includes('storm')) {
      return <CloudRain className={`${size} text-amber-500`} />;
    }
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) {
      return <CloudRain className={`${size} text-sky-500`} />;
    }
    if (cond.includes('clear') || cond.includes('sunny')) {
      return <Sun className={`${size} text-amber-400`} />;
    }
    return <CloudSun className={`${size} text-sky-600`} />;
  };

  const isLive = weatherData?.isLive;
  const current = {
    temp: weatherData?.temperature ?? 31,
    apparentTemp: weatherData?.apparentTemperature ?? 34,
    humidity: weatherData?.humidity ?? 72,
    rainfall: weatherData?.rainfall ?? 0,
    windSpeed: weatherData?.windSpeed ?? 14,
    windDirection: weatherData?.windDirection ?? 0,
    condition: weatherData?.weatherCondition || 'Partly Cloudy',
    station: weatherData?.station || weatherData?.stationLocation || 'Open-Meteo Live Station',
    location: weatherData?.stationLocation || selectedFarm?.location || user?.location || 'Chennai, Tamil Nadu',
  };

  const forecast7Day = weatherData?.forecast7Day || [];
  const recommendations = weatherData?.recommendations || [];
  const hourly24h = weatherData?.hourly24h || [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-agro-700 uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Agro-Meteorological Decision Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight flex items-center gap-2">
              <CloudSun className="w-8 h-8 text-sky-600" />
              Weather-Based Farming Recommendations
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Hyper-localized telemetry for your fields with AI-driven irrigation, drainage, and chemical spray advisories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Farm Selector Dropdown */}
            {farms.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl border border-agro-200 bg-agro-50/60 text-xs font-bold text-agro-950 outline-none focus:border-agro-600"
                >
                  {farms.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.farmName} ({f.location.split(',')[0]} • {f.primaryCrop})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchWeatherForFarm(selectedFarmId, true)}
              disabled={refreshing || loading}
              className="p-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh live weather telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-agro-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Live vs Demo Badge Banner */}
        <div
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs ${
            isLive
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isLive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
              }`}
            ></span>
            <span className="font-extrabold uppercase tracking-wider">
              {isLive ? 'LIVE WEATHER TELEMETRY' : 'DEMO WEATHER MODE / SIMULATION'}
            </span>
            <span className="hidden md:inline">•</span>
            <span className="text-gray-600 truncate">
              Station: {current.station}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {selectedFarm && (
              <span className="text-gray-600 font-medium">
                Surveyed Acreage: <span className="font-bold text-agro-950">{selectedFarm.farmSize} Acres</span>
              </span>
            )}
            {selectedFarm?._id && (
              <Link
                to={`/gis-mapping?farmId=${selectedFarm._id}`}
                className="text-agro-800 hover:text-agro-950 font-bold underline flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                View GIS Boundary
              </Link>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-agro-100 shadow-soft flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Fetching live satellite weather telemetry & generating recommendations...</p>
          </div>
        ) : (
          <>
            {/* Top Row: Current Conditions Hero Card (7 cols) + Agronomic Risk (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Current Weather Card */}
              <div className="lg:col-span-7 bg-gradient-to-br from-agro-950 via-agro-900 to-agro-800 rounded-3xl p-6 sm:p-8 text-white shadow-elevated flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs text-limeacc-400 font-bold uppercase tracking-wider">
                      <MapPin className="w-4 h-4" />
                      {current.location}
                    </div>
                    <span className="text-xs text-white/70 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                      {current.condition}
                    </span>
                  </div>

                  {/* Main Temp & Condition */}
                  <div className="my-6 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline">
                        <span className="text-5xl sm:text-6xl font-black tracking-tight">{current.temp}</span>
                        <span className="text-3xl font-light text-white/70 ml-1">°C</span>
                      </div>
                      <p className="text-sm text-white/80 mt-1">
                        Feels like {current.apparentTemp}°C • {current.condition}
                      </p>
                    </div>

                    <div className="p-4 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                      {getWeatherIcon(current.condition, 'w-12 h-12')}
                    </div>
                  </div>

                  {/* 4 Stat Badges Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
                      <span className="text-white/70 flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" /> Humidity
                      </span>
                      <p className="text-base font-extrabold mt-1">{current.humidity}%</p>
                    </div>

                    <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
                      <span className="text-white/70 flex items-center gap-1">
                        <CloudRain className="w-3.5 h-3.5 text-teal-400" /> 24h Rain
                      </span>
                      <p className="text-base font-extrabold mt-1">{current.rainfall} mm</p>
                    </div>

                    <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
                      <span className="text-white/70 flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-gray-300" /> Wind
                      </span>
                      <p className="text-base font-extrabold mt-1">{current.windSpeed} km/h</p>
                    </div>

                    <div className="p-2.5 bg-white/10 rounded-2xl border border-white/10">
                      <span className="text-white/70 flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-rose-400" /> Soil Profile
                      </span>
                      <p className="text-base font-extrabold mt-1 truncate">{selectedFarm?.soilType || 'Red Soil'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agronomic Risk & Summary Card */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-agro-100 shadow-soft flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <h3 className="text-base font-bold text-agro-950 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-agro-700" />
                      Agronomic Microclimate Risks
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-agro-700 bg-agro-50 px-2.5 py-1 rounded-full border border-agro-200">
                      Evaluated
                    </span>
                  </div>

                  <div className="space-y-3.5 my-4">
                    {/* Irrigation Risk */}
                    <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                          <Droplets className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-sky-950">Irrigation Stress Index</p>
                          <p className="text-[11px] text-sky-800/80">Evaporation & rainfall balance</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white text-sky-900 border border-sky-200 shadow-2xs">
                        {weatherData?.irrigationRisk || 'Moderate'}
                      </span>
                    </div>

                    {/* Spore / Disease Risk */}
                    <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100/70 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-rose-950">Fungal Pathogen Risk</p>
                          <p className="text-[11px] text-rose-800/80">Warmth + moisture proliferation</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white text-rose-900 border border-rose-200 shadow-2xs">
                        {weatherData?.diseaseRisk || 'Low'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary Agent Recommendation Banner */}
                <div className="p-4 bg-agro-50 rounded-2xl border border-agro-100 text-xs space-y-1">
                  <span className="font-bold text-agro-900 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-limeacc-600" />
                    Agent Advisory Headline
                  </span>
                  <p className="text-agro-900 leading-relaxed font-medium">
                    {weatherData?.weatherRecommendation || 'Weather conditions are stable for current farming operations.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 7-Day Precision Weather Forecast */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-agro-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-agro-950 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-agro-700" />
                    7-Day Weather Forecast
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Precipitation estimates and temperature range for {selectedFarm?.farmName || current.location}.
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  {forecast7Day.length} Days Outlook
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast7Day.map((day, idx) => {
                  const hasRain = day.precipitation > 2 || day.rainProbability > 50;
                  return (
                    <div
                      key={day.date || idx}
                      className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col justify-between ${
                        idx === 0
                          ? 'bg-agro-50/70 border-agro-300 ring-1 ring-agro-400 shadow-soft'
                          : hasRain
                          ? 'bg-sky-50/50 border-sky-200'
                          : 'bg-white border-gray-100 hover:border-gray-200 shadow-xs'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold text-agro-950 block">{day.dayName}</span>
                        <span className="text-[10px] text-gray-400 block mb-2">
                          {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>

                        <div className="flex justify-center my-2">
                          {getWeatherIcon(day.weatherCondition, 'w-7 h-7')}
                        </div>

                        <p className="text-[11px] font-semibold text-gray-700 truncate mb-2">
                          {day.weatherCondition}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-100 space-y-1 text-xs">
                        <div className="flex justify-center items-baseline gap-1.5 font-bold">
                          <span className="text-agro-950">{day.tempMax}°</span>
                          <span className="text-gray-400 text-[10px]">/ {day.tempMin}°</span>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                          <span className="flex items-center gap-0.5 text-sky-700 font-semibold">
                            <CloudRain className="w-3 h-3" />
                            {day.precipitation}mm
                          </span>
                          <span className="text-gray-400">{day.rainProbability}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actionable Farming Recommendations Grid */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-agro-950 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-limeacc-600" />
                    Actionable Agricultural Recommendations
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Field advisories formulated by the Decision Engine based on live weather data and {selectedFarm?.primaryCrop || 'crop'} parameters.
                  </p>
                </div>
                <span className="text-xs font-bold text-agro-800 bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
                  {recommendations.length} Active Directives
                </span>
              </div>

              {recommendations.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-2xl">
                  No critical weather alerts detected. Standard agronomic practices apply.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => {
                    const isAlert = rec.priority === 'Alert';
                    const isHigh = rec.priority === 'High';
                    const isMedium = rec.priority === 'Medium';

                    return (
                      <div
                        key={rec.id}
                        className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                          isAlert
                            ? 'bg-rose-50/40 border-rose-200 hover:shadow-premium'
                            : isHigh
                            ? 'bg-amber-50/40 border-amber-200 hover:shadow-premium'
                            : isMedium
                            ? 'bg-sky-50/30 border-sky-200 hover:shadow-premium'
                            : 'bg-emerald-50/30 border-emerald-200 hover:shadow-premium'
                        }`}
                      >
                        <div>
                          {/* Priority & Category Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border text-gray-700 shadow-2xs">
                              {rec.category}
                            </span>

                            <span
                              className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                isAlert
                                  ? 'bg-rose-600 text-white border-rose-700'
                                  : isHigh
                                  ? 'bg-amber-500 text-white border-amber-600'
                                  : isMedium
                                  ? 'bg-sky-600 text-white border-sky-700'
                                  : 'bg-emerald-600 text-white border-emerald-700'
                              }`}
                            >
                              {rec.priority} Priority
                            </span>
                          </div>

                          {/* Directive Title */}
                          <h4 className="text-base font-extrabold text-agro-950 mb-1.5 flex items-center gap-1.5">
                            {isAlert || isHigh ? (
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            )}
                            {rec.title}
                          </h4>

                          {/* Specific Action */}
                          <p className="text-sm font-semibold text-agro-900 bg-white/70 p-3 rounded-2xl border border-gray-100 my-2">
                            "{rec.action}"
                          </p>

                          {/* Agronomic Reason */}
                          <div className="space-y-1 text-xs text-gray-600 mt-3">
                            <p className="leading-relaxed">
                              <span className="font-bold text-gray-800">Reason:</span> {rec.reason}
                            </p>
                          </div>
                        </div>

                        {/* Weather metric footer */}
                        <div className="pt-3 mt-3 border-t border-gray-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-500">
                          <span className="font-medium text-gray-700 truncate max-w-xs">
                            {rec.relevantWeather}
                          </span>
                          <span className="font-semibold text-agro-800 bg-white px-2 py-0.5 rounded border border-gray-200">
                            {rec.timing}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Next 24 Hours Operational Window */}
            {hourly24h && hourly24h.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-agro-100 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-agro-950 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-agro-700" />
                    Next 24 Hours Operational Intervals
                  </h4>
                  <span className="text-[11px] text-gray-400">Field entry planning</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  {hourly24h.map((h, i) => (
                    <div key={i} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-center text-xs">
                      <span className="font-mono text-[10px] text-gray-400 block">{h.hour}</span>
                      <p className="font-black text-agro-950 mt-1">{h.temperature}°C</p>
                      <div className="flex justify-center my-1">
                        {getWeatherIcon(h.weatherCondition, 'w-4 h-4')}
                      </div>
                      <span className="text-[10px] text-sky-700 font-semibold block">{h.rainProbability}% Rain</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2.5">
              <Info className="w-4 h-4 text-gray-400 shrink-0" />
              <span>
                Agricultural recommendations are algorithmic estimations synthesized from real-time meteorological models and agronomic rules. Always verify immediate on-field soil and crop conditions before major chemical or harvesting actions.
              </span>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default WeatherAdvisory;
