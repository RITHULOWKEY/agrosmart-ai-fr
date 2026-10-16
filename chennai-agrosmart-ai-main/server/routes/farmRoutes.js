const express = require('express');
const {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  saveFarmBoundary,
  deleteFarmBoundary,
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
  .put(saveFarmBoundary)
  .delete(deleteFarmBoundary);

module.exports = router;

