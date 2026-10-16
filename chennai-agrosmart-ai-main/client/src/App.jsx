import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FarmSetup from './pages/FarmSetup';
import UploadCrop from './pages/UploadCrop';
import Recommendation from './pages/Recommendation';
import History from './pages/History';
import Profile from './pages/Profile';
import GISMapping from './pages/GISMapping';
import WeatherAdvisory from './pages/WeatherAdvisory';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farm-setup"
            element={
              <ProtectedRoute>
                <FarmSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gis-mapping"
            element={
              <ProtectedRoute>
                <GISMapping />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather-advisory"
            element={
              <ProtectedRoute>
                <WeatherAdvisory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadCrop />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendation/:id"
            element={
              <ProtectedRoute>
                <Recommendation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
