import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { farmApi } from '../services/api';
import * as turf from '@turf/turf';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';

import {
  MapPin,
  Layers,
  Maximize2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  RotateCcw,
  CloudSun,
  Tractor,
  Search,
  Navigation,
  Loader2,
  Compass,
  ShieldCheck,
} from 'lucide-react';

// Configure Leaflet default marker icons for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map tile layers: Esri Satellite (High-Res) and OSM Standard fallback
const TILE_LAYERS = {
  satellite: {
    name: 'Satellite Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19,
  },
  street: {
    name: 'Street / Cadastral Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

// Popular Tamil Nadu Agricultural Hub shortcuts
const AGRI_LOCATIONS = [
  { name: 'Chennai Rural', lat: 13.0827, lng: 80.2707 },
  { name: 'Thiruvallur', lat: 13.1437, lng: 79.9079 },
  { name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { name: 'Chengalpattu', lat: 12.6841, lng: 79.9836 },
  { name: 'Sriperumbudur', lat: 12.9691, lng: 79.9419 },
  { name: 'Madurantakam', lat: 12.5086, lng: 79.8847 },
];

/**
 * Controller component inside MapContainer to access Leaflet map instance
 */
function MapController({
  onPolygonChange,
  activePolygonLayerRef,
  initialBoundary,
  searchCoords,
  setIsEditMode,
  setIsDrawMode,
}) {
  const map = useMap();

  const extractAndReportGeometry = useCallback(
    (layer) => {
      if (!layer || !layer.getLatLngs) return;
      const rawLatLngs = layer.getLatLngs();
      const ring = Array.isArray(rawLatLngs[0]) ? rawLatLngs[0] : rawLatLngs;

      if (!ring || ring.length < 3) {
        onPolygonChange(null);
        return;
      }

      const coords = ring.map((pt) => [Number(pt.lng), Number(pt.lat)]);
      // Close ring
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1]]);
      }

      onPolygonChange(coords);
    },
    [onPolygonChange]
  );

  // Setup Geoman controls & event handlers
  useEffect(() => {
    if (!map || !map.pm) return;

    // Configure Geoman global settings
    map.pm.setLang('en');
    map.pm.setPathOptions({
      color: '#059669',
      fillColor: '#10b981',
      fillOpacity: 0.35,
      weight: 3,
    });

    // Add toolbar controls on map
    map.pm.addControls({
      position: 'topleft',
      drawCircle: false,
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
      rotateMode: false,
    });

    const handleCreate = (e) => {
      // If we already had a polygon, remove the previous one to keep single parcel
      if (activePolygonLayerRef.current && activePolygonLayerRef.current !== e.layer) {
        map.removeLayer(activePolygonLayerRef.current);
      }
      activePolygonLayerRef.current = e.layer;
      extractAndReportGeometry(e.layer);

      // Listen for vertex edits on this new layer
      e.layer.on('pm:edit', () => {
        extractAndReportGeometry(e.layer);
      });
      e.layer.on('pm:dragend', () => {
        extractAndReportGeometry(e.layer);
      });
      e.layer.on('pm:remove', () => {
        activePolygonLayerRef.current = null;
        onPolygonChange(null);
      });

      setIsDrawMode(false);
    };

    const handleRemove = (e) => {
      if (activePolygonLayerRef.current === e.layer) {
        activePolygonLayerRef.current = null;
        onPolygonChange(null);
      }
    };

    const handleModeToggle = () => {
      setIsDrawMode(map.pm.globalDrawModeEnabled());
      setIsEditMode(map.pm.globalEditModeEnabled());
    };

    map.on('pm:create', handleCreate);
    map.on('pm:remove', handleRemove);
    map.on('pm:globaldrawmodetoggled', handleModeToggle);
    map.on('pm:globaleditmodetoggled', handleModeToggle);

    return () => {
      map.off('pm:create', handleCreate);
      map.off('pm:remove', handleRemove);
      map.off('pm:globaldrawmodetoggled', handleModeToggle);
      map.off('pm:globaleditmodetoggled', handleModeToggle);
    };
  }, [map, extractAndReportGeometry, onPolygonChange, activePolygonLayerRef, setIsDrawMode, setIsEditMode]);

  // Load initial boundary when changed
  useEffect(() => {
    if (!map) return;

    if (!initialBoundary || !initialBoundary.coordinates) {
      if (activePolygonLayerRef.current) {
        map.removeLayer(activePolygonLayerRef.current);
        activePolygonLayerRef.current = null;
        onPolygonChange(null);
      }
      return;
    }

    try {
      // Clear previous polygon
      if (activePolygonLayerRef.current) {
        map.removeLayer(activePolygonLayerRef.current);
        activePolygonLayerRef.current = null;
      }

      const geoJsonData = {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: initialBoundary.coordinates,
        },
      };

      const geoLayer = L.geoJSON(geoJsonData, {
        style: {
          color: '#059669',
          fillColor: '#10b981',
          fillOpacity: 0.35,
          weight: 3,
        },
      });

      // Extract inner layer
      const layers = geoLayer.getLayers();
      if (layers.length > 0) {
        const polyLayer = layers[0];
        polyLayer.addTo(map);
        activePolygonLayerRef.current = polyLayer;

        polyLayer.on('pm:edit', () => extractAndReportGeometry(polyLayer));
        polyLayer.on('pm:dragend', () => extractAndReportGeometry(polyLayer));
        polyLayer.on('pm:remove', () => {
          activePolygonLayerRef.current = null;
          onPolygonChange(null);
        });

        // Fit map bounds to loaded boundary
        map.fitBounds(polyLayer.getBounds(), { padding: [40, 40], maxZoom: 17 });
        extractAndReportGeometry(polyLayer);
      }
    } catch (err) {
      console.error('Failed to render saved boundary on Leaflet map:', err);
    }
  }, [map, initialBoundary, extractAndReportGeometry, activePolygonLayerRef, onPolygonChange]);

  // Jump to searched location
  useEffect(() => {
    if (!map || !searchCoords) return;
    map.flyTo([searchCoords.lat, searchCoords.lng], 16, { duration: 1.5 });
  }, [map, searchCoords]);

  return null;
}

const GISMapping = () => {
  const [searchParams] = useSearchParams();

  // Farm selection state
  const [farms, setFarms] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(searchParams.get('farmId') || '');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loadingFarms, setLoadingFarms] = useState(true);

  // Map state
  const [activeTileType, setActiveTileType] = useState('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);

  // GIS measurements state
  const [coordinates, setCoordinates] = useState(null);
  const [measurements, setMeasurements] = useState({
    areaSqMeters: 0,
    areaAcres: 0,
    areaHectares: 0,
    perimeterMeters: 0,
    vertexCount: 0,
    center: null,
  });
  const [hasSelfIntersections, setHasSelfIntersections] = useState(false);
  const [boundaryNotes, setBoundaryNotes] = useState('');

  // UI status
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activePolygonLayerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Fetch all user farms
  const fetchFarms = useCallback(async () => {
    try {
      setLoadingFarms(true);
      const res = await farmApi.getFarms();
      if (res.data?.success) {
        const farmList = res.data.farms || [];
        setFarms(farmList);

        // Auto-select farm if ID is in URL or pick first
        const queryFarmId = searchParams.get('farmId');
        if (queryFarmId) {
          const match = farmList.find((f) => f._id === queryFarmId);
          if (match) {
            setSelectedFarmId(match._id);
            setSelectedFarm(match);
          }
        } else if (farmList.length > 0 && !selectedFarmId) {
          setSelectedFarmId(farmList[0]._id);
          setSelectedFarm(farmList[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load farms for GIS mapping:', err);
      setErrorMsg('Unable to retrieve farm profiles.');
    } finally {
      setLoadingFarms(false);
    }
  }, [searchParams, selectedFarmId]);

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  // Update selected farm details when selection changes
  useEffect(() => {
    if (!selectedFarmId || farms.length === 0) return;
    const farm = farms.find((f) => f._id === selectedFarmId);
    if (farm) {
      setSelectedFarm(farm);
      setBoundaryNotes(farm.gisData?.notes || '');
      setSuccessMsg('');
      setErrorMsg('');

      // If farm has a center, jump map there
      if (farm.gisData?.center?.lat && farm.gisData?.center?.lng) {
        setSearchCoords({
          lat: farm.gisData.center.lat,
          lng: farm.gisData.center.lng,
        });
      }
    }
  }, [selectedFarmId, farms]);

  // Handle polygon coordinate changes & calculate real-time GIS measurements via Turf.js
  const handlePolygonChange = useCallback((ringCoords) => {
    if (!ringCoords || ringCoords.length < 3) {
      setCoordinates(null);
      setMeasurements({
        areaSqMeters: 0,
        areaAcres: 0,
        areaHectares: 0,
        perimeterMeters: 0,
        vertexCount: 0,
        center: null,
      });
      setHasSelfIntersections(false);
      return;
    }

    setCoordinates(ringCoords);

    try {
      const poly = turf.polygon([ringCoords]);

      // 1. Validate self-intersections (bowties)
      const kinks = turf.kinks(poly);
      const isKinked = kinks && kinks.features && kinks.features.length > 0;
      setHasSelfIntersections(isKinked);

      // 2. Calculate Area
      const areaSqM = Math.round(turf.area(poly));
      const areaAcres = +(areaSqM * 0.000247105).toFixed(3);
      const areaHa = +(areaSqM * 0.0001).toFixed(3);

      // 3. Calculate Perimeter in Metres
      const line = turf.polygonToLine(poly);
      const perimeterM = Math.round(turf.length(line, { units: 'kilometers' }) * 1000);

      // 4. Calculate Centroid
      const centroid = turf.centroid(poly);
      const center = {
        lng: +centroid.geometry.coordinates[0].toFixed(6),
        lat: +centroid.geometry.coordinates[1].toFixed(6),
      };

      setMeasurements({
        areaSqMeters: areaSqM,
        areaAcres,
        areaHectares: areaHa,
        perimeterMeters: perimeterM,
        vertexCount: ringCoords.length - 1, // exclude closing duplicate point
        center,
      });
    } catch (err) {
      console.warn('Turf geospatial calculation error:', err);
    }
  }, []);

  // Location search using OpenStreetMap Nominatim or preset agricultural zones
  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setErrorMsg('');

    try {
      const q = encodeURIComponent(`${searchQuery}, Tamil Nadu, India`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
        headers: { 'Accept-Language': 'en' },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        setSearchCoords({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        });
        setSuccessMsg(`Centered map on: ${item.display_name.split(',').slice(0, 3).join(',')}`);
      } else {
        setErrorMsg(`Location "${searchQuery}" not found. Try entering a district like Thiruvallur or Kanchipuram.`);
      }
    } catch {
      setErrorMsg('Geocoding service unavailable. Use shortcut buttons below or pan manually.');
    } finally {
      setSearching(false);
    }
  };

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSearchCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setSuccessMsg('Centered map on your current GPS location.');
      },
      () => {
        setErrorMsg('Could not acquire your current location. Please check browser permissions.');
      },
      { timeout: 10000 }
    );
  };

  // Clear current active polygon on map
  const handleClearMap = () => {
    if (activePolygonLayerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(activePolygonLayerRef.current);
      activePolygonLayerRef.current = null;
    }
    setCoordinates(null);
    setMeasurements({
      areaSqMeters: 0,
      areaAcres: 0,
      areaHectares: 0,
      perimeterMeters: 0,
      vertexCount: 0,
      center: null,
    });
    setHasSelfIntersections(false);
    setSuccessMsg('Map cleared. Click "Start Drawing" to trace a new parcel.');
  };

  // Save boundary & measurements to MongoDB against the selected farm
  const handleSaveBoundary = async () => {
    if (!selectedFarmId) {
      setErrorMsg('Please select or register a farm first to attach this boundary.');
      return;
    }

    if (!coordinates || coordinates.length < 3) {
      setErrorMsg('Please draw a farm boundary polygon before saving.');
      return;
    }

    if (hasSelfIntersections) {
      setErrorMsg('Cannot save self-intersecting boundary lines. Please adjust vertices so perimeter edges do not cross.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await farmApi.saveBoundary(selectedFarmId, {
        coordinates,
        notes: boundaryNotes,
        syncFarmSize: true,
      });

      if (res.data?.success) {
        setSuccessMsg(`Boundary saved successfully for "${res.data.farm?.farmName}". Recorded acreage: ${res.data.farm?.gisData?.areaAcres} Acres.`);
        // Refresh farms list to update badges
        await fetchFarms();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Server error saving boundary coordinates.');
    } finally {
      setSaving(false);
    }
  };

  // Delete/Clear boundary from database
  const handleDeleteBoundary = async () => {
    if (!selectedFarmId) return;
    if (!window.confirm('Are you sure you want to delete the saved GIS boundary for this farm?')) return;

    setDeleting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await farmApi.deleteBoundary(selectedFarmId);
      if (res.data?.success) {
        handleClearMap();
        setSuccessMsg('Farm boundary cleared from database.');
        await fetchFarms();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete farm boundary.');
    } finally {
      setDeleting(false);
    }
  };

  // Default center: Chennai coordinates
  const defaultCenter = [13.0827, 80.2707];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-agro-100 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-agro-700 uppercase tracking-widest mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Precision Agriculture Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-agro-950 tracking-tight flex items-center gap-2">
              <Compass className="w-7 h-7 text-agro-700" />
              GIS Land Measurement & Smart Farm Mapping
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Trace field boundaries, calculate acreage with satellite precision, and synchronize telemetry with AI agents.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedFarmId && (
              <Link
                to={`/weather-advisory?farmId=${selectedFarmId}`}
                className="px-4 py-2.5 rounded-2xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 text-xs font-bold transition-all flex items-center gap-1.5"
                title="View hyper-localized weather advisory for this surveyed plot"
              >
                <CloudSun className="w-4 h-4 text-sky-600" />
                Weather for this Farm
              </Link>
            )}
            <Link
              to="/farm-setup"
              className="px-4 py-2.5 rounded-2xl bg-agro-50 text-agro-800 hover:bg-agro-100 border border-agro-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Tractor className="w-4 h-4 text-agro-600" />
              Manage Farms
            </Link>
          </div>
        </div>

        {/* Alerts & Toasts */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-900 text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {hasSelfIntersections && (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-900 text-sm flex items-center gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-bold">Self-Intersecting Boundary Line Detected (Bowtie)</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Perimeter lines cross each other. Click "Edit Vertices" on the map to drag crossover vertices apart so the farm polygon is simple.
              </p>
            </div>
          </div>
        )}

        {/* Main Grid: Controls & Stats on left (4 cols), Map on right (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Panel: Farm Selector, Search & Live Measurements */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. Target Farm Selector */}
            <div className="bg-white p-5 rounded-3xl border border-agro-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-agro-900 flex items-center gap-1.5">
                  <Tractor className="w-4 h-4 text-agro-700" />
                  Select Farm Profile
                </label>
                {selectedFarm?.boundary?.coordinates && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Boundary Mapped
                  </span>
                )}
              </div>

              {loadingFarms ? (
                <div className="p-3 text-center text-xs text-gray-500 flex justify-center items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-agro-600" />
                  Loading your farms...
                </div>
              ) : farms.length === 0 ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 space-y-2">
                  <p>You have not registered any farms yet.</p>
                  <Link to="/farm-setup" className="font-bold underline text-agro-800 block">
                    Create your first farm in Farm Setup &rarr;
                  </Link>
                </div>
              ) : (
                <select
                  value={selectedFarmId}
                  onChange={(e) => setSelectedFarmId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-agro-600 outline-none text-sm font-semibold bg-gray-50/50 text-agro-950"
                >
                  {farms.map((farm) => (
                    <option key={farm._id} value={farm._id}>
                      {farm.farmName} ({farm.farmSize} Acres • {farm.primaryCrop})
                    </option>
                  ))}
                </select>
              )}

              {selectedFarm && (
                <div className="p-3 bg-agro-50/50 rounded-2xl border border-agro-100 text-xs text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span className="font-bold text-agro-900">{selectedFarm.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Recorded Size:</span>
                    <span className="font-bold text-agro-900">{selectedFarm.farmSize} Acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Soil & Crop:</span>
                    <span className="font-bold text-agro-900">
                      {selectedFarm.soilType} • {selectedFarm.primaryCrop}
                    </span>
                  </div>
                  {selectedFarm.gisData?.lastSurveyedAt && (
                    <div className="flex justify-between pt-1 border-t border-agro-200/50 text-[11px] text-gray-500">
                      <span>Last Surveyed:</span>
                      <span>{new Date(selectedFarm.gisData.lastSurveyedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Live Land Measurement Cards */}
            <div className="bg-white p-5 rounded-3xl border border-agro-100 shadow-soft space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-wider text-agro-900 flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-emerald-600" />
                  Live Geospatial Measurements
                </span>
                <span className="text-[10px] font-mono bg-agro-50 text-agro-800 px-2 py-0.5 rounded font-bold">
                  {measurements.vertexCount} Vertices
                </span>
              </div>

              {/* Area Primary Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-emerald-100/40 rounded-2xl border border-emerald-200/70">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Acres</span>
                  <p className="text-2xl font-black text-agro-950 mt-1">
                    {measurements.areaAcres.toLocaleString()} <span className="text-xs font-semibold text-gray-500">ac</span>
                  </p>
                  <span className="text-[10px] text-emerald-700">Standard farm unit</span>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-teal-50 to-teal-100/40 rounded-2xl border border-teal-200/70">
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wide">Hectares</span>
                  <p className="text-2xl font-black text-agro-950 mt-1">
                    {measurements.areaHectares.toLocaleString()} <span className="text-xs font-semibold text-gray-500">ha</span>
                  </p>
                  <span className="text-[10px] text-teal-700">Metric land unit</span>
                </div>
              </div>

              {/* Square Metres & Perimeter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Square Metres</span>
                  <p className="text-lg font-extrabold text-agro-950 mt-0.5">
                    {measurements.areaSqMeters.toLocaleString()} <span className="text-[10px] text-gray-500">m²</span>
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Perimeter</span>
                  <p className="text-lg font-extrabold text-agro-950 mt-0.5">
                    {measurements.perimeterMeters.toLocaleString()} <span className="text-[10px] text-gray-500">m</span>
                  </p>
                </div>
              </div>

              {/* Centroid coordinates */}
              {measurements.center && (
                <div className="p-2.5 bg-agro-50/50 rounded-xl border border-agro-100 flex items-center justify-between text-xs text-gray-600">
                  <span className="flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-agro-600" /> Centroid:
                  </span>
                  <span className="font-mono text-agro-900 font-bold">
                    {measurements.center.lat}, {measurements.center.lng}
                  </span>
                </div>
              )}

              {/* Survey Notes */}
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                  Plot Survey Notes (Optional)
                </label>
                <input
                  type="text"
                  value={boundaryNotes}
                  onChange={(e) => setBoundaryNotes(e.target.value)}
                  placeholder="e.g. West boundary bounded by canal"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50/50 focus:border-agro-600 outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <button
                  onClick={handleSaveBoundary}
                  disabled={saving || !coordinates || hasSelfIntersections}
                  className="w-full py-3 px-4 rounded-xl bg-agro-700 hover:bg-agro-800 text-white font-bold text-sm shadow-premium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-limeacc-400" />
                      Save Boundary to Farm
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleClearMap}
                    disabled={!coordinates}
                    className="py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Drawing
                  </button>

                  <button
                    onClick={handleDeleteBoundary}
                    disabled={deleting || !selectedFarm?.boundary?.coordinates}
                    className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Delete Saved
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Official Disclaimer */}
            <div className="p-4 bg-earth-50 rounded-2xl border border-earth-200/80 text-xs text-earth-800 space-y-1 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-earth-900">
                <Info className="w-4 h-4 text-earth-700 shrink-0" />
                Geospatial Estimation Disclaimer
              </div>
              <p className="text-[11px] leading-relaxed text-earth-700">
                Map-based calculations use WGS84 ellipsoidal projections and satellite imagery tiles. Measurements are digital estimates for precision agriculture and input estimation, and do not constitute legal or certified government cadastral revenue surveys.
              </p>
            </div>
          </div>

          {/* Right Panel: Map Container & Navigation Tools */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-3xl border border-agro-100 shadow-soft space-y-4">
            {/* Top Toolbar: Search + Layer Toggle + Geolocation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Location Search Bar */}
              <form onSubmit={handleSearchLocation} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search village, district, or pincode..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 focus:border-agro-600 outline-none text-xs bg-gray-50/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-3.5 py-2 rounded-xl bg-agro-700 hover:bg-agro-800 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 shrink-0"
                >
                  {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
                </button>
                <button
                  type="button"
                  onClick={handleLocateMe}
                  className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all shrink-0"
                  title="Locate me via browser GPS"
                >
                  <Navigation className="w-4 h-4 text-agro-700" />
                </button>
              </form>

              {/* Layer Toggle Switch */}
              <div className="flex items-center bg-gray-100 p-1 rounded-2xl shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTileType('satellite')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTileType === 'satellite'
                      ? 'bg-agro-700 text-white shadow-xs'
                      : 'text-gray-600 hover:text-agro-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTileType('street')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTileType === 'street'
                      ? 'bg-agro-700 text-white shadow-xs'
                      : 'text-gray-600 hover:text-agro-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Street / Topo
                </button>
              </div>
            </div>

            {/* Quick Location Shortcuts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase shrink-0">Quick Jumps:</span>
              {AGRI_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setSearchCoords({ lat: loc.lat, lng: loc.lng })}
                  className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-agro-50 text-gray-600 hover:text-agro-800 border border-gray-200/70 text-[11px] font-medium whitespace-nowrap transition-colors"
                >
                  {loc.name}
                </button>
              ))}
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-agro-200/70 shadow-inner h-[550px] w-full z-0">
              <MapContainer
                center={
                  selectedFarm?.gisData?.center?.lat
                    ? [selectedFarm.gisData.center.lat, selectedFarm.gisData.center.lng]
                    : defaultCenter
                }
                zoom={14}
                scrollWheelZoom={true}
                className="h-full w-full"
                ref={mapInstanceRef}
              >
                <TileLayer
                  url={TILE_LAYERS[activeTileType].url}
                  attribution={TILE_LAYERS[activeTileType].attribution}
                  maxZoom={TILE_LAYERS[activeTileType].maxZoom}
                />

                <MapController
                  onPolygonChange={handlePolygonChange}
                  activePolygonLayerRef={activePolygonLayerRef}
                  initialBoundary={selectedFarm?.boundary}
                  searchCoords={searchCoords}
                  setIsEditMode={setIsEditMode}
                  setIsDrawMode={setIsDrawMode}
                />
              </MapContainer>

              {/* Floating Map Help Overlay */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-gray-200 text-[11px] text-gray-700 shadow-md max-w-xs pointer-events-none z-[1000]">
                <p className="font-bold text-agro-950 flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Drawing Instructions:
                </p>
                <p>Use the toolbar on the top-left of the map: click the polygon icon to begin drawing vertices. Double-click or click the starting point to finish.</p>
              </div>

              {/* Active Mode Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-[1000]">
                <span className="text-[11px] font-bold bg-white/95 backdrop-blur-md text-agro-950 px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {activeTileType === 'satellite' ? 'Esri Satellite Layer' : 'OSM Street Layer'}
                </span>
                {isDrawMode && (
                  <span className="text-[11px] font-bold bg-amber-600 text-white px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                    Draw Mode Active
                  </span>
                )}
                {isEditMode && (
                  <span className="text-[11px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg shadow-sm animate-pulse">
                    Editing Vertices
                  </span>
                )}
                {coordinates && (
                  <span className="text-[11px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-lg shadow-sm">
                    {measurements.areaAcres} Acres Active
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Status bar */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-700">Tile Provider:</span>
                <span>{activeTileType === 'satellite' ? 'Esri World Imagery' : 'OpenStreetMap Standard'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Projection:</span>
                <span className="font-mono text-gray-700 font-semibold">EPSG:3857 / WGS84</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GISMapping;
