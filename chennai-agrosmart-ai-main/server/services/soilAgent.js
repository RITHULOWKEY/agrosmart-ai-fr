/**
 * Agent 3 — 🪨 SOIL INTELLIGENCE AGENT
 * Purpose: Determine whether soil conditions are suitable for the selected crop.
 */
class SoilIntelligenceAgent {
  async run({ crop, soilType, soilParameters = {}, plantingDate, growthStage }) {
    console.log(`[Soil Intelligence Agent] Evaluating soil suitability for ${crop} on ${soilType}...`);

    try {
      const type = soilType || 'Red Soil';
      const cropName = (crop || 'Tomato').toLowerCase();

      // Extract parameters or use sensible defaults
      const ph = Number(soilParameters.ph) || 6.8;
      const moisture = Number(soilParameters.moisture) || 65;
      const nitrogen = Number(soilParameters.nitrogen) || 140;
      const phosphorus = Number(soilParameters.phosphorus) || 35;
      const potassium = Number(soilParameters.potassium) || 190;
      const organicMatter = Number(soilParameters.organicMatter) || 1.2;

      let cropSuitability = 'Good';
      let soilCondition = 'Healthy';
      let moistureStatus = 'Optimal';
      let nutrientRisk = 'Low';
      let soilRecommendation = 'Maintain existing soil health and organic mulch layer.';

      // Moisture evaluation
      if (moisture > 75) {
        moistureStatus = 'High (Saturated)';
      } else if (moisture < 40) {
        moistureStatus = 'Low (Dry)';
      } else {
        moistureStatus = 'Optimal (Adequate)';
      }

      // Soil type vs crop suitability rules
      if (type === 'Clay') {
        if (moisture > 70) {
          cropSuitability = cropName === 'paddy' ? 'Excellent' : 'Moderate';
          soilCondition = 'Heavy & Poor Drainage';
          soilRecommendation = 'Improve surface drainage, aerate beds, and avoid heavy irrigation to prevent root hypoxia.';
        } else {
          cropSuitability = 'Good';
          soilCondition = 'Moisture Retentive';
          soilRecommendation = 'Monitor soil compaction and apply compost to enhance porosity.';
        }
      } else if (type === 'Sandy') {
        if (moisture < 45) {
          cropSuitability = 'Challenging';
          soilCondition = 'Rapid Drainage / Leaching Risk';
          soilRecommendation = 'Apply biochar or farmyard manure (FYM) to increase water retention and avoid fertilizer leaching.';
        } else {
          cropSuitability = cropName === 'groundnut' ? 'Excellent' : 'Moderate';
          soilCondition = 'Permeable';
          soilRecommendation = 'Frequent light watering is superior to infrequent heavy irrigation in sandy profiles.';
        }
      } else if (type === 'Loamy') {
        cropSuitability = 'Excellent';
        soilCondition = 'Balanced Tilth';
        soilRecommendation = 'Soil structure is optimal. Continue standard bio-fertilizer schedule.';
      } else if (type === 'Red Soil') {
        // Very common in Chennai, Kanchipuram, Thiruvallur
        cropSuitability = 'Good';
        soilCondition = 'Iron & Mineral Rich, Mild Porosity';
        if (ph < 6.0) {
          nutrientRisk = 'Medium (Mild Acidity)';
          soilRecommendation = 'Add agricultural lime (calcium carbonate) or dolomite to balance acidic red soil pH.';
        } else {
          soilRecommendation = 'Red soil is well-suited for tomatoes, millets, and vegetables. Ensure consistent organic matter.';
        }
      }

      // pH and nutrient evaluations
      if (ph < 5.8 || ph > 7.8) {
        nutrientRisk = 'High (pH Micronutrient Lockout)';
      } else if (nitrogen < 100 || potassium < 120) {
        nutrientRisk = 'Medium (Nitrogen / Potassium Depletion)';
      }

      return {
        agentType: 'soil',
        status: 'SUCCESS',
        mode: 'DEMO', // Soil agent operates in calibrated simulation mode unless telemetry sensor API is plugged in
        confidence: 88,
        result: {
          soilType: type,
          cropSuitability,
          soilCondition,
          moistureStatus,
          nutrientRisk,
          soilRecommendation,
          parameters: {
            ph,
            moisture: `${moisture}%`,
            nitrogen: `${nitrogen} kg/ha`,
            phosphorus: `${phosphorus} kg/ha`,
            potassium: `${potassium} kg/ha`,
            organicMatter: `${organicMatter}%`,
          },
        },
      };
    } catch (error) {
      console.error('[Soil Intelligence Agent] Error:', error.message);
      return {
        agentType: 'soil',
        status: 'FAILED',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          soilType: soilType || 'Unknown',
          cropSuitability: 'Unknown',
          soilCondition: 'Unavailable',
          moistureStatus: 'Unknown',
          nutrientRisk: 'Unknown',
          soilRecommendation: 'Unable to evaluate soil characteristics. Ensure well-drained topsoil.',
        },
      };
    }
  }
}

module.exports = new SoilIntelligenceAgent();
