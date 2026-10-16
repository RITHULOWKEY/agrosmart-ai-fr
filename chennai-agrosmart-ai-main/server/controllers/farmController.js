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
    if (req.body.boundary !== undefined) farm.boundary = req.body.boundary;
    if (req.body.gisData !== undefined) farm.gisData = req.body.gisData;

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

/**
 * Helper to validate polygon coordinates and compute GIS measurements
 */
const validateAndMeasureBoundary = (coordinates) => {
  let turf;
  try {
    turf = require('@turf/turf');
  } catch (err) {
    console.warn('Turf.js not available on server, falling back to basic validation.');
  }

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

  const geoJsonCoords = [closedRing];

  // If turf is available, run advanced geometric validation & precision measurement
  if (turf) {
    try {
      const poly = turf.polygon(geoJsonCoords);

      // Check self-intersections (kinks)
      const kinks = turf.kinks(poly);
      if (kinks && kinks.features && kinks.features.length > 0) {
        return {
          isValid: false,
          error: 'Boundary polygon has self-intersecting edges (bowtie). Farm perimeter lines must not cross each other.',
        };
      }

      const areaSqMeters = Math.round(turf.area(poly));
      if (areaSqMeters <= 0) {
        return { isValid: false, error: 'Calculated farm area is zero or negative. Please draw a valid boundary.' };
      }

      const areaAcres = +(areaSqMeters * 0.000247105).toFixed(3);
      const areaHectares = +(areaSqMeters * 0.0001).toFixed(3);

      const line = turf.polygonToLine(poly);
      const perimeterMeters = Math.round(turf.length(line, { units: 'kilometers' }) * 1000);

      const centroid = turf.centroid(poly);
      const center = {
        lng: +centroid.geometry.coordinates[0].toFixed(6),
        lat: +centroid.geometry.coordinates[1].toFixed(6),
      };

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
    } catch (err) {
      return { isValid: false, error: `Geospatial geometry error: ${err.message}` };
    }
  }

  // Basic fallback calculation
  return {
    isValid: true,
    geoJsonCoords,
    measurements: {
      areaSqMeters: 0,
      areaAcres: 0,
      areaHectares: 0,
      perimeterMeters: 0,
      center: { lng: ring[0][0], lat: ring[0][1] },
    },
  };
};

/**
 * @route   PUT /api/farms/:id/boundary
 * @desc    Save/update GIS polygon boundary and measurements for a farm
 * @access  Private
 */
const saveFarmBoundary = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    const { coordinates, notes, syncFarmSize = true } = req.body;

    const validation = validateAndMeasureBoundary(coordinates);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error || 'Invalid farm polygon coordinates.',
      });
    }

    farm.boundary = {
      type: 'Polygon',
      coordinates: validation.geoJsonCoords,
    };

    farm.gisData = {
      ...validation.measurements,
      notes: notes || farm.gisData?.notes || '',
      lastSurveyedAt: new Date(),
    };

    // Optionally sync the farm's recorded size in acres with GIS measurement
    if (syncFarmSize && validation.measurements.areaAcres > 0) {
      farm.farmSize = validation.measurements.areaAcres;
    }

    await farm.save();

    return res.json({
      success: true,
      message: 'Farm GIS boundary and land measurements saved successfully.',
      farm,
    });
  } catch (error) {
    console.error('Save farm boundary error:', error);
    return res.status(500).json({ success: false, message: 'Server error saving farm boundary.' });
  }
};

/**
 * @route   DELETE /api/farms/:id/boundary
 * @desc    Delete/clear GIS polygon boundary for a farm
 * @access  Private
 */
const deleteFarmBoundary = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    farm.boundary = undefined;
    farm.gisData = {
      areaSqMeters: 0,
      areaAcres: 0,
      areaHectares: 0,
      perimeterMeters: 0,
      notes: '',
      lastSurveyedAt: null,
    };

    await farm.save();

    return res.json({
      success: true,
      message: 'Farm GIS boundary cleared successfully.',
      farm,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error deleting farm boundary.' });
  }
};

module.exports = {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  saveFarmBoundary,
  deleteFarmBoundary,
  validateAndMeasureBoundary,
};
