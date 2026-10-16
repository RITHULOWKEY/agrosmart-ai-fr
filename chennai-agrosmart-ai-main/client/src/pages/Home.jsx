import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  CloudSun,
  Layers,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  UploadCloud,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col selection:bg-agro-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-agro-100/70 border border-agro-200 text-agro-900 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                Next-Gen Multi-Agent Agricultural Intelligence
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-agro-950 tracking-tight leading-[1.1]">
                Grow Better. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-agro-700 via-agro-600 to-limeacc-600">
                  Waste Less.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-700 max-w-xl leading-relaxed">
                Smarter farming decisions powered by four specialized AI intelligence agents:
                crop pathology, live weather, soil telemetry, and Koyambedu wholesale market trends.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/upload"
                  className="px-6 py-3.5 rounded-2xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium hover:shadow-elevated transition-all duration-200 flex items-center gap-2 group"
                >
                  <Sprout className="w-4 h-4 text-limeacc-400 group-hover:scale-110 transition-transform" />
                  Analyze My Crop
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-2xl bg-white hover:bg-agro-50 text-agro-900 font-bold text-sm border border-agro-200 shadow-soft hover:shadow-premium transition-all duration-200"
                >
                  Explore How It Works
                </a>
              </div>

              {/* Trust & Region Badges */}
              <div className="pt-4 flex items-center gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-agro-600" />
                  Calibrated for Tamil Nadu Crops
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-agro-600" />
                  Koyambedu Wholesale Mandi Data
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual with 4 Floating Insight Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Central Crop Visual Container */}
                <div className="relative rounded-3xl overflow-hidden border border-agro-200/80 shadow-elevated bg-white p-3">

                  <img
                    src="/images/tomato-farm.jpg"
                    alt="Healthy agricultural crops in Chennai"
                    className="w-full h-80 sm:h-96 object-cover rounded-2xl"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl pointer-events-none" />
                  <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-limeacc-400">Field Scout</span>
                    <h3 className="text-lg font-bold">Tomato & Horticulture Crops</h3>
                    <p className="text-xs text-gray-200">Red Soil • Drip Irrigated • Chennai Rural</p>
                  </div>
                </div>

                {/* Floating Card 1: Crop Health */}
                <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-premium border border-agro-100 flex items-center space-x-3 animate-bounce [animation-duration:5s]">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">🌱 Crop Health</span>
                    <p className="text-xs font-black text-agro-950">Healthy • 92%</p>
                  </div>
                </div>

                {/* Floating Card 2: Weather */}
                <div className="absolute -top-3 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-premium border border-agro-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <CloudSun className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">🌦️ Weather</span>
                    <p className="text-xs font-black text-agro-950">Favorable • 31°C</p>
                  </div>
                </div>

                {/* Floating Card 3: Soil */}
                <div className="absolute -bottom-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-premium border border-agro-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">🪨 Soil Condition</span>
                    <p className="text-xs font-black text-agro-950">Good • pH 6.8</p>
                  </div>
                </div>

                {/* Floating Card 4: Market */}
                <div className="absolute -bottom-3 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-premium border border-agro-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block font-semibold">📈 Mandi Trend</span>
                    <p className="text-xs font-black text-indigo-700">+8.4% • ₹32/kg</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 13: Four Agent Section */}
      <section className="py-20 bg-white border-y border-agro-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-agro-700 uppercase tracking-widest bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
              Multi-Agent Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-agro-950 tracking-tight">
              Four Intelligence Systems. One Better Decision.
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Each specialized agent inspects a crucial agricultural factor. Their outputs are combined
              by the central AgroSmart Decision Engine to produce one coherent action plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Crop Agent */}
            <div className="p-6 rounded-3xl bg-[#fdfdfc] border border-agro-100 hover:border-agro-400 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-agro-950 mb-1">🌱 Crop Intelligence</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Evaluates leaf photographs using computer-vision models to identify early blights, foliar fungi, chlorosis, and vegetative vigor.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-agro-800">
                <span>Computer Vision</span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">EfficientNet-B0</span>
              </div>
            </div>

            {/* Card 2: Weather Agent */}
            <div className="p-6 rounded-3xl bg-[#fdfdfc] border border-agro-100 hover:border-sky-400 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CloudSun className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-agro-950 mb-1">🌦️ Weather Intelligence</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Analyzes live Chennai coordinates, humidity spikes, precipitation forecasts, and micro-climate disease incubation risks.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-sky-800">
                <span>Live Open-Meteo</span>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700">Telemetry Feed</span>
              </div>
            </div>

            {/* Card 3: Soil Agent */}
            <div className="p-6 rounded-3xl bg-[#fdfdfc] border border-agro-100 hover:border-amber-400 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-agro-950 mb-1">🪨 Soil Intelligence</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Evaluates soil characteristics (Red Soil, Sandy, Clay, Loamy), root-zone moisture saturation, drainage risks, and nutrient pH limits.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-amber-800">
                <span>Agronomic Tilth</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700">Soil Physics</span>
              </div>
            </div>

            {/* Card 4: Market Agent */}
            <div className="p-6 rounded-3xl bg-[#fdfdfc] border border-agro-100 hover:border-indigo-400 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-agro-950 mb-1">📈 Market Intelligence</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  Tracks wholesale mandi pricing at Koyambedu market, demand momentum, and harvest timing for peak financial return.
                </p>
              </div>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-indigo-800">
                <span>Koyambedu Mandi</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">Spot Trends</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 14: How It Works */}
      <section id="how-it-works" className="py-20 bg-[#fbfbfa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-agro-700 uppercase tracking-widest bg-agro-50 px-3 py-1 rounded-full border border-agro-200">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-agro-950 tracking-tight">
              From Photo to Farmer Action in 4 Steps
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              A streamlined, transparent decision pipeline designed for practical field application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-agro-100 shadow-soft relative flex flex-col">
              <span className="w-10 h-10 rounded-2xl bg-agro-100 text-agro-800 flex items-center justify-center font-black text-sm mb-4">
                01
              </span>
              <h3 className="text-base font-bold text-agro-950 mb-1">Upload Crop Photo</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Take a quick photo of crop foliage or stems using your mobile or desktop device.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-agro-100 shadow-soft relative flex flex-col">
              <span className="w-10 h-10 rounded-2xl bg-agro-100 text-agro-800 flex items-center justify-center font-black text-sm mb-4">
                02
              </span>
              <h3 className="text-base font-bold text-agro-950 mb-1">Analyze 4 Vectors</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Crop, Weather, Soil, and Market agents process regional and crop conditions in parallel.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-agro-100 shadow-soft relative flex flex-col">
              <span className="w-10 h-10 rounded-2xl bg-agro-100 text-agro-800 flex items-center justify-center font-black text-sm mb-4">
                03
              </span>
              <h3 className="text-base font-bold text-agro-950 mb-1">Combine Intelligence</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                AgroSmart Decision Engine correlates risks (e.g. humidity + wet soil = fungal alert).
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-agro-100 shadow-soft relative flex flex-col">
              <span className="w-10 h-10 rounded-2xl bg-agro-700 text-white flex items-center justify-center font-black text-sm mb-4">
                04
              </span>
              <h3 className="text-base font-bold text-agro-950 mb-1">Act with Clarity</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive one clear recommendation and a prioritized daily task checklist for your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-agro-950 text-white py-12 border-t border-agro-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-agro-800 flex items-center justify-center text-limeacc-400">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">Chennai AgroSmart AI</span>
                <p className="text-xs text-agro-300">Grow Better. Waste Less.</p>
              </div>
            </div>

            <div className="text-xs text-agro-300 text-center md:text-right space-y-1">
              <p>© 2026 Chennai AgroSmart AI Platform. Multi-Agent Agricultural Decision Engine.</p>
              <p className="text-[11px] text-agro-400">
                Transparent Mode Indicators: Real APIs & Trained ML models distinguished from Demo Mode.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
