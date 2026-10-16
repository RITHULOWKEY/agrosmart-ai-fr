const express = require('express');
const cropAgent = require('../services/cropAgent');
const weatherAgent = require('../services/weatherAgent');
const soilAgent = require('../services/soilAgent');
const marketAgent = require('../services/marketAgent');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/crop', async (req, res) => {
  try {
    const result = await cropAgent.run(req.body);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/weather', async (req, res) => {
  try {
    const result = await weatherAgent.run(req.body);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Feature 2: Get weather & farming recommendations for a specific farm
router.get('/weather/farm/:farmId', async (req, res) => {
  try {
    const Farm = require('../models/Farm');
    const farm = await Farm.findOne({ _id: req.params.farmId, userId: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found or access denied.' });
    }

    const lat = farm.gisData?.center?.lat;
    const lon = farm.gisData?.center?.lng;

    const result = await weatherAgent.run({
      location: farm.location,
      lat,
      lon,
      cropType: farm.primaryCrop,
      soilType: farm.soilType,
      farmSize: farm.farmSize,
      irrigationType: farm.irrigationType,
    });

    return res.json({
      success: true,
      farm: {
        _id: farm._id,
        farmName: farm.farmName,
        location: farm.location,
        soilType: farm.soilType,
        primaryCrop: farm.primaryCrop,
        farmSize: farm.farmSize,
        irrigationType: farm.irrigationType,
        hasBoundary: Boolean(farm.boundary && farm.boundary.coordinates),
        gisData: farm.gisData,
      },
      ...result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/soil', async (req, res) => {
  try {
    const result = await soilAgent.run(req.body);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/market', async (req, res) => {
  try {
    const result = await marketAgent.run(req.body);
    return res.json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
