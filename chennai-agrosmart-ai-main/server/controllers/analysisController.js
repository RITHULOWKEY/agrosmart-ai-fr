const path = require('path');
const CropAnalysis = require('../models/CropAnalysis');
const AgentResult = require('../models/AgentResult');
const FinalRecommendation = require('../models/FinalRecommendation');
const agentOrchestrator = require('../services/agentOrchestrator');

/**
 * @route   POST /api/analysis
 * @desc    Upload crop photo & run 4-agent multi-intelligence analysis
 * @access  Private
 */
const createAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a JPG, PNG or WEBP image of the crop foliage.',
      });
    }

    const {
      farmId,
      cropType,
      soilType,
      plantingDate,
      growthStage,
      location,
      soilPh,
      soilMoisture,
      soilNitrogen,
      soilPhosphorus,
      soilPotassium,
      soilOrganicMatter,
      optionalInfo,
    } = req.body;

    if (!cropType) {
      return res.status(400).json({
        success: false,
        message: 'Crop type is required (e.g., Tomato, Paddy, Chilli).',
      });
    }

    // Relative image path for client serving
    const imageUrl = `/uploads/${req.file.filename}`;
    const absoluteImagePath = req.file.path;

    // Soil parameters parsing
    const soilParameters = {
      ph: soilPh ? Number(soilPh) : 6.8,
      moisture: soilMoisture ? Number(soilMoisture) : 65,
      nitrogen: soilNitrogen ? Number(soilNitrogen) : 140,
      phosphorus: soilPhosphorus ? Number(soilPhosphorus) : 35,
      potassium: soilPotassium ? Number(soilPotassium) : 190,
      organicMatter: soilOrganicMatter ? Number(soilOrganicMatter) : 1.2,
    };

    // 1. Create CropAnalysis record in MongoDB
    const cropAnalysis = await CropAnalysis.create({
      userId: req.user._id,
      farmId: farmId || null,
      cropType,
      soilType: soilType || 'Red Soil',
      plantingDate: plantingDate ? new Date(plantingDate) : new Date(),
      growthStage: growthStage || 'Vegetative',
      location: location || req.user.location || 'Chennai, Tamil Nadu',
      imageUrl,
      imageOriginalName: req.file.originalname,
      soilParameters,
      overallStatus: 'Analyzing',
    });

    // Lookup farm coordinates if farmId is linked
    let farmLat = undefined;
    let farmLon = undefined;
    if (farmId) {
      try {
        const Farm = require('../models/Farm');
        const linkedFarm = await Farm.findById(farmId);
        if (linkedFarm && linkedFarm.gisData?.center) {
          farmLat = linkedFarm.gisData.center.lat;
          farmLon = linkedFarm.gisData.center.lng;
        }
      } catch (e) {
        // Non-blocking
      }
    }

    // 2. Run the 4-agent intelligence pipeline asynchronously through the Orchestrator
    const orchestrationResult = await agentOrchestrator.orchestrateAnalysis({
      analysisId: cropAnalysis._id,
      imagePath: absoluteImagePath,
      cropType,
      soilType: soilType || 'Red Soil',
      location: location || req.user.location || 'Chennai, Tamil Nadu',
      plantingDate: plantingDate ? new Date(plantingDate) : new Date(),
      growthStage: growthStage || 'Vegetative',
      soilParameters,
      optionalInfo,
      lat: farmLat,
      lon: farmLon,
    });

    // Return the completed analysis with all agent cards and recommendation
    return res.status(201).json({
      success: true,
      message: 'Multi-Agent Crop Intelligence Analysis completed successfully.',
      analysis: cropAnalysis,
      agents: orchestrationResult.agents,
      recommendation: orchestrationResult.recommendation,
    });
  } catch (error) {
    console.error('Analysis execution error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'We could not complete the crop analysis. Please try again.',
    });
  }
};

/**
 * @route   GET /api/analysis
 * @desc    Get user's analysis history
 * @access  Private
 */
const getAnalyses = async (req, res) => {
  try {
    const analyses = await CropAnalysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (!analyses || analyses.length === 0) {
      return res.json({
        success: true,
        count: 0,
        analyses: [],
        message: 'No analyses yet. Analyze your first crop to get started.',
      });
    }

    // Attach agent results and recommendation for each history entry
    const enrichedAnalyses = await Promise.all(
      analyses.map(async (item) => {
        const [agents, recommendation] = await Promise.all([
          AgentResult.find({ analysisId: item._id }).lean(),
          FinalRecommendation.findOne({ analysisId: item._id }).lean(),
        ]);

        const agentMap = {};
        agents.forEach((ag) => {
          agentMap[ag.agentType] = ag;
        });

        return {
          ...item,
          agents: agentMap,
          recommendation,
        };
      })
    );

    return res.json({
      success: true,
      count: enrichedAnalyses.length,
      analyses: enrichedAnalyses,
    });
  } catch (error) {
    console.error('Error fetching analyses history:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve analysis history.',
    });
  }
};

/**
 * @route   GET /api/analysis/:id
 * @desc    Get detailed report for single analysis
 * @access  Private
 */
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await CropAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'Analysis report not found or access denied.',
      });
    }

    const [agents, recommendation] = await Promise.all([
      AgentResult.find({ analysisId: analysis._id }).lean(),
      FinalRecommendation.findOne({ analysisId: analysis._id }).lean(),
    ]);

    const agentMap = {};
    agents.forEach((ag) => {
      agentMap[ag.agentType] = ag;
    });

    return res.json({
      success: true,
      analysis,
      agents: agentMap,
      recommendation,
    });
  } catch (error) {
    console.error('Error fetching analysis details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving analysis report.',
    });
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
};
