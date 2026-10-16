import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, LayoutDashboard, History, User, LogOut, Menu, X, ArrowRight, Compass, CloudSun } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-agro-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-agro-600 to-agro-800 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6 text-limeacc-400" />
            </div>
            <div>
              <span className="font-bold text-lg text-agro-900 tracking-tight flex items-center gap-1.5">
                Chennai AgroSmart <span className="text-xs px-2 py-0.5 rounded-full bg-agro-100 text-agro-800 font-semibold uppercase">AI</span>
              </span>
              <p className="text-[10px] text-gray-500 font-medium tracking-wide">Grow Better. Waste Less.</p>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors">
              Overview
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4 text-agro-600" />
                  Dashboard
                </Link>
                <Link to="/gis-mapping" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-agro-600" />
                  GIS Mapping
                </Link>
                <Link to="/weather-advisory" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-agro-600" />
                  Weather
                </Link>
                <Link to="/history" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors flex items-center gap-1.5">
                  <History className="w-4 h-4 text-agro-600" />
                  History
                </Link>
                <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-agro-700 transition-colors flex items-center gap-1.5">
                  <User className="w-4 h-4 text-agro-600" />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <Link
                  to="/upload"
                  className="px-4 py-2 rounded-xl bg-agro-700 hover:bg-agro-800 text-white text-sm font-semibold shadow-soft hover:shadow-premium transition-all duration-200 flex items-center gap-1.5"
                >
                  <Sprout className="w-4 h-4 text-limeacc-400" />
                  Analyze Crop
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-gray-700 hover:text-agro-800 transition-colors">
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl bg-agro-700 hover:bg-agro-800 text-white text-sm font-semibold shadow-soft hover:shadow-premium transition-all duration-200 flex items-center gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-agro-800 hover:bg-agro-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-agro-100 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
          >
            Overview
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
              >
                Dashboard
              </Link>
              <Link
                to="/gis-mapping"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
              >
                GIS Farm Mapping
              </Link>
              <Link
                to="/weather-advisory"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
              >
                Weather Advisory
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-semibold text-white bg-agro-700 hover:bg-agro-800"
              >
                Analyze Crop
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
              >
                Analysis History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-gray-700 hover:bg-agro-50"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-red-600 hover:bg-red-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-center text-base font-semibold text-gray-700 hover:bg-agro-50"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-center text-base font-semibold text-white bg-agro-700 hover:bg-agro-800"
              >
                Sign Up Free
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
