const express = require('express');
const {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  saveBoundary,
  deleteBoundary,
  getFarmWeather,
} = require('../controllers/farmController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createFarm)
  .get(getFarms);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm);

router.route('/:id/boundary')
  .post(saveBoundary)
  .delete(deleteBoundary);

router.route('/:id/weather')
  .get(getFarmWeather);

module.exports = router;

