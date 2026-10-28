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
    let farm = null;
    let location = req.body.location || req.user?.location || 'Chennai, Tamil Nadu';
    let cropType = req.body.cropType || req.user?.defaultCrop || 'Tomato';

    if (req.body.farmId) {
      const Farm = require('../models/Farm');
      farm = await Farm.findOne({ _id: req.body.farmId, userId: req.user._id });
      if (farm) {
        location = farm.location || location;
        cropType = farm.primaryCrop || cropType;
      }
    }

    const result = await weatherAgent.run({ ...req.body, location, cropType, farm });
    return res.json({ success: true, farm, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Farm-specific weather advisory endpoint
router.get(['/weather/farm/:farmId', '/farm/:farmId'], async (req, res) => {
  try {
    const Farm = require('../models/Farm');
    const farm = await Farm.findOne({ _id: req.params.farmId, userId: req.user._id });
    const location = farm?.location || req.user?.location || 'Chennai, Tamil Nadu';
    const cropType = farm?.primaryCrop || req.user?.defaultCrop || 'Tomato';

    const result = await weatherAgent.run({ location, cropType, farm });
    return res.json({ success: true, farm, ...result });
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
