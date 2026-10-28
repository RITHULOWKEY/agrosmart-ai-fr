const Farm = require('../models/Farm');

/**
 * @route   POST /api/farms
 * @desc    Create a new farm profile for user
 * @access  Private
 */
const createFarm = async (req, res) => {
  try {
    const { farmName, location, soilType, farmSize, primaryCrop, irrigationType } = req.body;

    if (!farmName) {
      return res.status(400).json({ success: false, message: 'Farm name is required.' });
    }

    const farm = await Farm.create({
      userId: req.user._id,
      farmName,
      location: location || req.user.location || 'Chennai, Tamil Nadu',
      soilType: soilType || 'Red Soil',
      farmSize: Number(farmSize) || 2.5,
      primaryCrop: primaryCrop || 'Tomato',
      irrigationType: irrigationType || 'Drip',
    });

    return res.status(201).json({
      success: true,
      message: 'Farm created successfully.',
      farm,
    });
  } catch (error) {
    console.error('Create farm error:', error);
    return res.status(500).json({ success: false, message: 'Server error creating farm.' });
  }
};

/**
 * @route   GET /api/farms
 * @desc    Get all farms owned by the logged-in farmer
 * @access  Private
 */
const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({
      success: true,
      count: farms.length,
      farms,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving farms.' });
  }
};

/**
 * @route   GET /api/farms/:id
 * @desc    Get single farm details
 * @access  Private
 */
const getFarmById = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }
    return res.json({ success: true, farm });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving farm.' });
  }
};

/**
 * @route   PUT /api/farms/:id
 * @desc    Update farm details
 * @access  Private
 */
const updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    const { farmName, location, soilType, farmSize, primaryCrop, irrigationType } = req.body;
    if (farmName) farm.farmName = farmName;
    if (location) farm.location = location;
    if (soilType) farm.soilType = soilType;
    if (farmSize !== undefined) farm.farmSize = Number(farmSize);
    if (primaryCrop) farm.primaryCrop = primaryCrop;
    if (irrigationType) farm.irrigationType = irrigationType;

    await farm.save();

    return res.json({
      success: true,
      message: 'Farm updated successfully.',
      farm,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating farm.' });
  }
};

// Spherical polygon area (in square meters)
function computePolygonArea(coords) {
  const R = 6378137;
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const p1 = coords[i];
    const p2 = coords[(i + 1) % coords.length];
    const dLng = ((p2[0] - p1[0]) * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.round(Math.abs((area * R * R) / 4));
}

// Perimeter (in meters)
function computePerimeter(coords) {
  const R = 6378137;
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += R * c;
  }
  return Math.round(total);
}

// Check line segment intersection for bowtie detection
function linesIntersect(p1, p2, p3, p4) {
  function ccw(A, B, C) {
    return (C[1] - A[1]) * (B[0] - A[0]) > (B[1] - A[1]) * (C[0] - A[0]);
  }
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

function hasSelfIntersections(ring) {
  const n = ring.length - 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      if (linesIntersect(ring[i], ring[i + 1], ring[j], ring[j + 1])) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper to validate polygon coordinates and compute GIS measurements
 */
const validateAndMeasureBoundary = (coordinates) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return { isValid: false, error: 'Coordinates array is required.' };
  }

  // Support either GeoJSON coordinates [[[lng, lat], ...]] or simple ring [[lng, lat], ...]
  let ring = coordinates;
  if (Array.isArray(coordinates[0]) && Array.isArray(coordinates[0][0])) {
    ring = coordinates[0];
  }

  if (ring.length < 3) {
    return { isValid: false, error: 'A farm boundary polygon requires at least 3 distinct coordinate points.' };
  }

  // Validate each point
  for (let i = 0; i < ring.length; i++) {
    const pt = ring[i];
    if (!Array.isArray(pt) || pt.length < 2) {
      return { isValid: false, error: `Invalid coordinate pair at vertex index ${i}.` };
    }
    const [lng, lat] = pt.map(Number);
    if (isNaN(lng) || isNaN(lat)) {
      return { isValid: false, error: `Non-numeric coordinate values at vertex index ${i}.` };
    }
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return { isValid: false, error: `Coordinates out of range at vertex index ${i} (lng: ${lng}, lat: ${lat}).` };
    }
  }

  // Ensure ring is closed
  const first = ring[0];
  const last = ring[ring.length - 1];
  const closedRing = [...ring];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    closedRing.push([first[0], first[1]]);
  }

  if (hasSelfIntersections(closedRing)) {
    return {
      isValid: false,
      error: 'Boundary polygon has self-intersecting edges (bowtie). Farm perimeter lines must not cross each other.',
    };
  }

  const areaSqMeters = computePolygonArea(closedRing);
  if (areaSqMeters <= 0) {
    return { isValid: false, error: 'Calculated farm area is zero or negative. Please draw a valid boundary.' };
  }

  const areaAcres = +(areaSqMeters * 0.000247105).toFixed(3);
  const areaHectares = +(areaSqMeters * 0.0001).toFixed(3);
  const perimeterMeters = computePerimeter(closedRing);

  // Centroid
  let sumLng = 0;
  let sumLat = 0;
  for (let i = 0; i < ring.length; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }
  const center = {
    lng: +(sumLng / ring.length).toFixed(6),
    lat: +(sumLat / ring.length).toFixed(6),
  };

  const geoJsonCoords = [closedRing];

  return {
    isValid: true,
    geoJsonCoords,
    measurements: {
      areaSqMeters,
      areaAcres,
      areaHectares,
      perimeterMeters,
      center,
    },
  };
};


/**
 * @route   POST /api/farms/:id/boundary
 * @desc    Save GIS boundary polygon and turf measurements
 * @access  Private
 */
const saveBoundary = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    const { coordinates, notes, syncFarmSize = true, measurements } = req.body;
    const validation = validateAndMeasureBoundary(coordinates);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: validation.error || 'Valid polygon coordinates required.' });
    }

    const finalMeasurements = measurements || validation.measurements;
    const areaAcres = finalMeasurements?.areaAcres || farm.farmSize || 2.5;

    farm.boundary = {
      type: 'Polygon',
      coordinates: validation.geoJsonCoords,
    };

    farm.gisData = {
      type: 'Polygon',
      coordinates,
      areaSqMeters: finalMeasurements?.areaSqMeters || 0,
      areaAcres,
      areaHectares: finalMeasurements?.areaHectares || 0,
      perimeterMeters: finalMeasurements?.perimeterMeters || 0,
      vertexCount: coordinates.length,
      center: finalMeasurements?.center || undefined,
      notes: notes || '',
      updatedAt: new Date(),
    };

    if (syncFarmSize && areaAcres > 0) {
      farm.farmSize = Number(areaAcres.toFixed(2));
    }

    await farm.save();

    return res.json({
      success: true,
      message: 'Farm GIS boundary saved successfully.',
      farm,
    });
  } catch (error) {
    console.error('Save boundary error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving farm boundary.' });
  }
};

/**
 * @route   DELETE /api/farms/:id/boundary
 * @desc    Delete/Clear GIS boundary polygon
 * @access  Private
 */
const deleteBoundary = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    farm.boundary = undefined;
    farm.gisData = undefined;
    await farm.save();

    return res.json({
      success: true,
      message: 'Farm boundary deleted successfully.',
      farm,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting farm boundary.' });
  }
};

/**
 * @route   GET /api/farms/:id/weather
 * @desc    Fetch weather advisory specifically tailored to this farm
 * @access  Private
 */
const getFarmWeather = async (req, res) => {
  try {
    const weatherAgent = require('../services/weatherAgent');
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    const location = farm.location || req.user?.location || 'Chennai, Tamil Nadu';
    const cropType = farm.primaryCrop || req.user?.defaultCrop || 'Tomato';

    const result = await weatherAgent.run({ location, cropType, farm });
    return res.json({
      success: true,
      farm,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error retrieving farm weather.' });
  }
};

module.exports = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  saveBoundary,
  saveFarmBoundary: saveBoundary,
  deleteBoundary,
  deleteFarmBoundary: deleteBoundary,
  getFarmWeather,
  validateAndMeasureBoundary,
};


