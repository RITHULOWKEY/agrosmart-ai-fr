import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Tractor,
  History,
  User,
  ShieldCheck,
  TrendingUp,
  CloudSun,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze Crop', path: '/upload', icon: Sprout, highlight: true },
  { name: 'Farm & Crop Setup', path: '/farm-setup', icon: Tractor },
  { name: 'GIS Farm Mapping', path: '/gis-mapping', icon: Compass },
  { name: 'Weather Advisory', path: '/weather-advisory', icon: CloudSun },
  { name: 'Analysis History', path: '/history', icon: History },
  { name: 'Profile & Settings', path: '/profile', icon: User },
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-agro-100 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 hidden md:flex shrink-0">
      <div className="p-4 space-y-6">
        {/* Farmer Profile Card */}
        <div className="p-3.5 bg-gradient-to-br from-agro-50 to-earth-100 rounded-2xl border border-agro-100/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-agro-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || 'F'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-agro-950 truncate">{user?.name || 'Farmer'}</h4>
              <p className="text-xs text-agro-700 truncate">{user?.location || 'Chennai Region'}</p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-agro-200/50 flex items-center justify-between text-[11px] text-gray-600 font-medium">
            <span>Primary Crop:</span>
            <span className="font-semibold text-agro-900 bg-white px-2 py-0.5 rounded-md border border-agro-200">
              {user?.defaultCrop || 'Tomato'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-agro-700 text-white shadow-soft'
                      : item.highlight
                      ? 'text-agro-800 bg-agro-50 hover:bg-agro-100'
                      : 'text-gray-600 hover:text-agro-800 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Active Multi-Agent Engine Indicator */}
        <div className="p-3 bg-[#f8faf7] rounded-2xl border border-agro-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-agro-950">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Agent Mesh
            </span>
            <span className="text-[10px] text-agro-700 bg-agro-100 px-1.5 py-0.5 rounded font-mono">4 ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-600 pt-1">
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100">
              <Sprout className="w-3 h-3 text-emerald-600" />
              <span>Crop</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100">
              <CloudSun className="w-3 h-3 text-sky-600" />
              <span>Weather</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100">
              <Layers className="w-3 h-3 text-amber-700" />
              <span>Soil</span>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-100">
              <TrendingUp className="w-3 h-3 text-indigo-600" />
              <span>Market</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-agro-100 text-[11px] text-gray-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-agro-600" />
          Chennai AgroSmart
        </span>
        <span className="font-mono text-gray-400">v1.0.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
