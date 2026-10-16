const express = require('express');
const { createAnalysis, getAnalyses, getAnalysisById } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(upload.single('cropPhoto'), createAnalysis)
  .get(getAnalyses);

router.route('/:id')
  .get(getAnalysisById);

module.exports = router;
