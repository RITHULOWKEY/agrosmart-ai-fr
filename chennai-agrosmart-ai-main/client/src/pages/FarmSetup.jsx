import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { farmApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  Plus,
  MapPin,
  Layers,
  Sprout,
  Droplets,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Maximize2,
  Compass,
  CloudSun,
} from 'lucide-react';

const FarmSetup = () => {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    farmName: '',
    location: user?.location || 'Chennai Rural, Tamil Nadu',
    soilType: 'Red Soil',
    farmSize: 3,
    primaryCrop: user?.defaultCrop || 'Tomato',
    irrigationType: 'Drip',
  });

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await farmApi.getFarms();
      if (res.data?.success) {
        setFarms(res.data.farms || []);
      }
    } catch (err) {
      console.error('Failed to fetch farms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCreateFarm = async (e) => {
    e.preventDefault();
    if (!formData.farmName) {
      setErrorMsg('Please specify a name for your farm.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await farmApi.createFarm(formData);
      if (res.data?.success) {
        setSuccessMsg(`Farm "${formData.farmName}" registered successfully in MongoDB.`);
        setFormData({
          farmName: '',
          location: user?.location || 'Chennai Rural, Tamil Nadu',
          soilType: 'Red Soil',
          farmSize: 3,
          primaryCrop: 'Tomato',
          irrigationType: 'Drip',
        });
        fetchFarms();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error creating farm.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft">
          <span className="text-xs font-bold text-agro-700 uppercase tracking-widest bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
            Field Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight mt-1">
            Farm & Crop Setup
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Register your agricultural holdings, acreage, and irrigation methods for hyper-localized AI telemetry.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Create New Farm Form */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-agro-50 text-agro-700 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-agro-950">Add New Field Profile</h3>
                <p className="text-xs text-gray-500">Configure land parameters</p>
              </div>
            </div>

            <form onSubmit={handleCreateFarm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Farm Name *
                </label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  placeholder="e.g. Green Valley Plot A"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 outline-none text-sm bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Location (District / Village)
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Thiruvallur / Kanchipuram"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 outline-none text-sm bg-gray-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Soil Profile
                  </label>
                  <select
                    name="soilType"
                    value={formData.soilType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50"
                  >
                    <option value="Red Soil">Red Soil</option>
                    <option value="Clay">Clay</option>
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Size (Acres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="farmSize"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Primary Crop
                  </label>
                  <select
                    name="primaryCrop"
                    value={formData.primaryCrop}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Paddy">Paddy</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Brinjal">Brinjal</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Irrigation System
                  </label>
                  <select
                    name="irrigationType"
                    value={formData.irrigationType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50"
                  >
                    <option value="Drip">Drip Irrigation</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Flood">Flood / Furrow</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Save Farm to Database
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Registered Farms List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-black text-agro-950 flex items-center gap-2">
              <Tractor className="w-5 h-5 text-agro-700" />
              Your Registered Farms ({farms.length})
            </h3>

            {loading ? (
              <div className="p-8 bg-white rounded-3xl border border-agro-100 flex justify-center">
                <Loader2 className="w-6 h-6 text-agro-600 animate-spin" />
              </div>
            ) : farms.length === 0 ? (
              <div className="p-8 bg-white rounded-3xl border border-agro-100 text-center text-sm text-gray-500">
                No farms registered yet. Add your first field profile using the form on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {farms.map((f) => (
                  <div
                    key={f._id}
                    className="p-5 bg-white rounded-3xl border border-agro-100 shadow-soft hover:shadow-premium transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-base text-agro-950">{f.farmName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-agro-100 text-agro-800 font-bold">
                          {f.farmSize} Acres
                        </span>
                        {f.boundary?.coordinates ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            GIS Mapped
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                            Not Mapped
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-agro-600" /> {f.location}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                        <span className="flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-amber-700" /> {f.soilType}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Sprout className="w-3.5 h-3.5 text-emerald-600" /> {f.primaryCrop}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" /> {f.irrigationType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/gis-mapping?farmId=${f._id}`}
                        className="px-3 py-1.5 rounded-xl bg-agro-50 hover:bg-agro-100 text-agro-800 text-xs font-bold border border-agro-200 transition-all flex items-center gap-1"
                        title="Measure or edit boundary on GIS map"
                      >
                        <Compass className="w-3.5 h-3.5 text-agro-600" />
                        GIS Map
                      </Link>
                      <Link
                        to={`/weather-advisory?farmId=${f._id}`}
                        className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200 transition-all flex items-center gap-1"
                        title="View weather forecast and recommendations"
                      >
                        <CloudSun className="w-3.5 h-3.5 text-sky-600" />
                        Weather
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default FarmSetup;
