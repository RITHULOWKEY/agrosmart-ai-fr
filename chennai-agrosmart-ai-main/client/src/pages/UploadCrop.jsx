import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { analysisApi } from '../services/api';
import AgentStatus from '../components/AgentStatus';
import {
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Sprout,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const UploadCrop = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Form parameters
  const [cropType, setCropType] = useState(user?.defaultCrop || 'Tomato');
  const [soilType, setSoilType] = useState('Red Soil');
  const [growthStage, setGrowthStage] = useState('Vegetative');
  const [location, setLocation] = useState(user?.location || 'Chennai Rural, Tamil Nadu');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

  // Optional soil sensor parameters
  const [showAdvancedSoil, setShowAdvancedSoil] = useState(false);
  const [soilParams, setSoilParams] = useState({
    ph: '6.8',
    moisture: '65',
    nitrogen: '140',
    phosphorus: '35',
    potassium: '190',
  });

  // Pipeline states
  const [analyzing, setAnalyzing] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileSelection = (selectedFile) => {
    if (!selectedFile) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid JPG, PNG, or WEBP crop image.');
      return;
    }

    // Validate size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitAnalysis = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or capture a crop photograph first.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setAgentStep(1); // Crop agent started

    const formData = new FormData();
    formData.append('cropPhoto', file);
    formData.append('cropType', cropType);
    formData.append('soilType', soilType);
    formData.append('growthStage', growthStage);
    formData.append('location', location);
    formData.append('plantingDate', plantingDate);

    // Append soil params
    formData.append('soilPh', soilParams.ph);
    formData.append('soilMoisture', soilParams.moisture);
    formData.append('soilNitrogen', soilParams.nitrogen);
    formData.append('soilPhosphorus', soilParams.phosphorus);
    formData.append('soilPotassium', soilParams.potassium);

    try {
      // Simulate sequential visual steps for farmer UX while server processes
      const stepTimer1 = setTimeout(() => setAgentStep(2), 700); // Weather
      const stepTimer2 = setTimeout(() => setAgentStep(3), 1400); // Soil
      const stepTimer3 = setTimeout(() => setAgentStep(4), 2100); // Market

      const res = await analysisApi.createAnalysis(formData, (progress) => {
        setUploadProgress(progress);
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      if (res.data?.success && res.data?.analysis) {
        setAgentStep(5); // Complete!
        setTimeout(() => {
          navigate(`/recommendation/${res.data.analysis._id}`);
        }, 800);
      } else {
        throw new Error(res.data?.message || 'Analysis could not be saved.');
      }
    } catch (err) {
      console.error('Analysis submission failed:', err);
      setError(err.response?.data?.message || err.message || 'We could not complete the crop analysis. Please try again.');
      setAnalyzing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Title & Description */}
        <div>
          <span className="text-xs font-bold text-agro-700 uppercase tracking-widest bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
            Multi-Agent Diagnostic Intake
          </span>
          <h1 className="text-3xl font-black text-agro-950 tracking-tight mt-2">
            Upload Crop & Run Intelligence Agents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Capture a clear photograph of the crop foliage, configure farm parameters, and dispatch to our 4 AI systems.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Live Analysis Progress View if actively analyzing */}
        {analyzing ? (
          <div className="space-y-6">
            <AgentStatus step={agentStep} isComplete={agentStep >= 5} error={error} />
            <div className="p-6 bg-white rounded-3xl border border-agro-100 shadow-soft text-center text-sm text-gray-500">
              Please wait while our 4 AI agents synthesize your agricultural diagnosis...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitAnalysis} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Visual Drag & Drop Upload Card (Section 18) */}
              <div className="lg:col-span-6 space-y-4">
                {!previewUrl ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[380px] bg-white ${
                      dragActive
                        ? 'border-agro-600 bg-agro-50/50 scale-[1.01]'
                        : 'border-agro-200 hover:border-agro-400 hover:bg-agro-50/20 shadow-soft'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleFileSelection(e.target.files[0])}
                      className="hidden"
                    />

                    <div className="w-20 h-20 rounded-3xl bg-agro-50 text-agro-700 flex items-center justify-center mb-4 shadow-inner">
                      <Camera className="w-10 h-10 text-agro-600" />
                    </div>

                    <h3 className="text-xl font-bold text-agro-950 mb-1">Upload Crop Photo</h3>
                    <p className="text-sm text-gray-500 mb-4 max-w-xs">
                      Drag & drop your leaf or field photo here, or browse files
                    </p>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                      <span>JPG</span> • <span>PNG</span> • <span>WEBP</span> (max 10MB)
                    </div>
                  </div>
                ) : (
                  /* Preview Card with Image & Clear Option */
                  <div className="relative rounded-3xl overflow-hidden border border-agro-200 bg-white p-3 shadow-premium">
                    <img
                      src={previewUrl}
                      alt="Crop Foliage Preview"
                      className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-6 right-6 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="p-3 text-center">
                      <span className="text-xs font-semibold text-agro-800">
                        ✓ {file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Crop, Field & Soil Context Parameters */}
              <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft space-y-5">
                <div className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-2xl bg-agro-50 text-agro-700 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-agro-950">Field Context</h3>
                    <p className="text-xs text-gray-500">Guides Soil, Weather and Market agents</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Crop Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Crop Variety *
                    </label>
                    <select
                      value={cropType}
                      onChange={(e) => setCropType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50"
                    >
                      <option value="Tomato">Tomato (தக்காளி)</option>
                      <option value="Paddy">Paddy / Rice (நெல்)</option>
                      <option value="Chilli">Chilli (மிளகாய்)</option>
                      <option value="Brinjal">Brinjal / Eggplant (கத்தரி)</option>
                      <option value="Sugarcane">Sugarcane (கரும்பு)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Soil Type */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Soil Profile
                      </label>
                      <select
                        value={soilType}
                        onChange={(e) => setSoilType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50"
                      >
                        <option value="Red Soil">Red Soil (செம்மண்)</option>
                        <option value="Clay">Clay (களிமண்)</option>
                        <option value="Loamy">Loamy (வண்டல் மண்)</option>
                        <option value="Sandy">Sandy (மணல் மண்)</option>
                        <option value="Unknown">Unknown Profile</option>
                      </select>
                    </div>

                    {/* Growth Stage */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Growth Stage
                      </label>
                      <select
                        value={growthStage}
                        onChange={(e) => setGrowthStage(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50"
                      >
                        <option value="Seedling">Seedling (நாற்று)</option>
                        <option value="Vegetative">Vegetative (வளர்ச்சி நிலை)</option>
                        <option value="Flowering">Flowering (பூக்கும் நிலை)</option>
                        <option value="Fruiting">Fruiting (காய் பிடிக்கும் நிலை)</option>
                        <option value="Maturity/Harvest">Maturity / Ready to Harvest</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Field Location
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Chennai Rural / Thiruvallur"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50"
                      />
                    </div>

                    {/* Planting Date */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Planting Date
                      </label>
                      <input
                        type="date"
                        value={plantingDate}
                        onChange={(e) => setPlantingDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 focus:ring-2 focus:ring-agro-100 outline-none text-sm bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Toggle Advanced Soil Sensors */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedSoil(!showAdvancedSoil)}
                      className="text-xs font-bold text-agro-800 flex items-center gap-1.5 hover:text-agro-950"
                    >
                      <Sliders className="w-3.5 h-3.5 text-agro-600" />
                      {showAdvancedSoil ? 'Hide Soil Telemetry Parameters' : 'Provide Soil Sensor Parameters (Optional)'}
                      {showAdvancedSoil ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showAdvancedSoil && (
                      <div className="grid grid-cols-3 gap-3 pt-3">
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold block">pH Level</label>
                          <input
                            type="number"
                            step="0.1"
                            value={soilParams.ph}
                            onChange={(e) => setSoilParams({ ...soilParams, ph: e.target.value })}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold block">Moisture %</label>
                          <input
                            type="number"
                            value={soilParams.moisture}
                            onChange={(e) => setSoilParams({ ...soilParams, moisture: e.target.value })}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold block">Nitrogen (kg/ha)</label>
                          <input
                            type="number"
                            value={soilParams.nitrogen}
                            onChange={(e) => setSoilParams({ ...soilParams, nitrogen: e.target.value })}
                            className="w-full p-2 text-xs rounded-lg border bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big Button: Analyze My Crop (Section 18) */}
                <button
                  type="submit"
                  disabled={!file || analyzing}
                  className="w-full py-4 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-extrabold text-base shadow-premium hover:shadow-elevated transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4 group"
                >
                  <Sprout className="w-5 h-5 text-limeacc-400 group-hover:scale-110 transition-transform" />
                  Analyze My Crop
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppLayout>
  );
};

export default UploadCrop;
