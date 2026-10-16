/**
 * AgroSmart Decision Engine
 * Orchestration / Decision layer combining outputs of:
 * Crop Intelligence + Weather Intelligence + Soil Intelligence + Market Intelligence
 * Outputs one simple, practical, actionable recommendation for the farmer.
 */

class AgroSmartDecisionEngine {
  synthesize({ cropResult, weatherResult, soilResult, marketResult }) {
    console.log('[Decision Engine] Synthesizing multi-agent outputs...');

    const crop = cropResult?.crop || 'Crop';
    const cropHealth = cropResult?.healthStatus || 'Healthy';
    const cropDisease = cropResult?.disease || 'None';
    const cropSeverity = cropResult?.severity || 'Low';

    const temp = weatherResult?.temperature ?? 30;
    const humidity = weatherResult?.humidity ?? 70;
    const rainfall = weatherResult?.rainfall ?? 0;
    const irrigationRisk = weatherResult?.irrigationRisk || 'Low';

    const soilType = soilResult?.soilType || 'Soil';
    const moistureStatus = soilResult?.moistureStatus || 'Optimal';
    const soilCondition = soilResult?.soilCondition || 'Moderate';

    const currentPrice = marketResult?.currentPrice || 0;
    const marketTrend = marketResult?.trend || 'Stable';
    const marketCondition = marketResult?.marketCondition || 'Neutral';

    // Build the Rationale Chain (Explanation of "Why are we recommending this?")
    const rationaleChain = [];
    const actions = [];
    let priority = 'Medium';
    let overallStatus = 'Good Condition';
    let riskScore = 30; // 0 - 100
    let sustainabilityScore = 80;

    // 1. Evaluate Moisture & Fungal Disease synergy (Weather + Soil + Crop)
    const isHighMoisture = moistureStatus.includes('High') || rainfall > 5;
    const isHighHumidity = humidity >= 70;
    const isCropVulnerable = !cropHealth.toLowerCase().includes('healthy') || cropSeverity === 'Medium' || cropSeverity === 'High';

    if (isHighHumidity && isHighMoisture) {
      rationaleChain.push({
        factor: 'High Ambient Humidity & Wet Soil',
        observation: `Humidity is ${humidity}% with ${moistureStatus.toLowerCase()} soil conditions.`,
        implication: 'Warm humidity combined with stagnant soil moisture drastically multiplies spore germination and fungal root rot.',
      });
      actions.push('Reduce or pause unnecessary irrigation today to let the topsoil breathe.');
      actions.push('Inspect the lower canopy leaves closely for brown spots or wilting.');
      priority = isCropVulnerable ? 'High' : 'Medium';
      overallStatus = 'Attention Recommended';
      riskScore += 25;
    } else if (temp > 35 && moistureStatus.includes('Low')) {
      rationaleChain.push({
        factor: 'Heat Stress & Dry Root Zone',
        observation: `Day temperature is ${temp}°C and soil moisture is dry.`,
        implication: 'High evapotranspiration will induce blossom drop and leaf scorching if water stress persists.',
      });
      actions.push('Apply early morning drip irrigation to replenish soil root moisture.');
      actions.push('Consider applying dry organic straw mulch around crop bases to preserve moisture.');
      priority = 'High';
      overallStatus = 'Action Required';
      riskScore += 30;
    } else {
      rationaleChain.push({
        factor: 'Balanced Environmental Conditions',
        observation: `Weather is ${weatherResult?.weatherCondition || 'favorable'} (${temp}°C) and soil moisture is balanced.`,
        implication: 'Microclimate is conducive to vegetative vigor and steady fruit setting.',
      });
      actions.push('Maintain regular watering schedule according to field moisture needs.');
    }

    // 2. Evaluate Soil Drainage & Nutrient Condition
    if (soilType === 'Clay' && isHighMoisture) {
      rationaleChain.push({
        factor: 'Clay Soil Drainage Limitation',
        observation: 'Clay soil retains high moisture and drains slowly.',
        implication: 'Waterlogging can starve roots of oxygen (hypoxia).',
      });
      actions.push('Clear field furrows to ensure excess water drains freely away from crop beds.');
      riskScore += 10;
    } else if (soilType === 'Sandy') {
      actions.push('Sandy soil drains rapidly; split fertilizer applications to avoid nutrient wash-off.');
    }

    // 3. Evaluate Crop Health Specifics
    if (isCropVulnerable) {
      rationaleChain.push({
        factor: 'Crop Foliage Warning',
        observation: `Detected ${cropHealth} (${cropDisease}).`,
        implication: 'Early intervention now prevents secondary spread to adjacent healthy rows.',
      });
      actions.push(`Targeted Treatment: ${cropResult.recommendation || 'Remove diseased foliage promptly.'}`);
      overallStatus = cropSeverity === 'High' ? 'High Alert' : 'Attention Recommended';
      riskScore += 20;
    } else {
      actions.push('Continue weekly field scouting to catch any early pest or leaf changes.');
    }

    // 4. Evaluate Market Opportunity
    if (marketTrend === 'Increasing' && marketCondition === 'Favorable') {
      rationaleChain.push({
        factor: 'Favorable Wholesale Market Trend',
        observation: `${crop} is trading at ₹${currentPrice}/kg with an increasing price trend (+${marketResult?.trendPercentage || 'upward'}).`,
        implication: 'Strong market demand provides a profitable window for selling ready produce.',
      });
      actions.push(`Harvest mature produce in early morning hours to command peak wholesale price (₹${currentPrice}/kg) at Koyambedu market.`);
    } else if (marketTrend === 'Decreasing') {
      actions.push(`Market prices are softening (₹${currentPrice}/kg). If produce is ready, dispatch promptly before further supply arrivals.`);
    } else {
      actions.push('Track mandi rates before finalizing your upcoming harvest schedule.');
    }

    // Overall summary formulation for the farmer
    let summary = '';
    if (overallStatus === 'Good Condition' || overallStatus === 'Optimal') {
      summary = `${crop} crop is in healthy condition with favorable growing conditions. Current market prices are steady, and standard moisture management will sustain optimal yield.`;
    } else if (overallStatus === 'Attention Recommended') {
      summary = `${crop} crop requires watchful attention: ${isHighHumidity && isHighMoisture ? 'high soil moisture and elevated humidity heighten fungal disease risk' : 'minor foliage stress noted'}. Proactive moisture control and early leaf inspection will protect crop health and harvest value.`;
    } else {
      summary = `${crop} crop needs prompt intervention. Elevated moisture or heat along with detected stress signs could impact productivity. Follow the priority action checklist below to stabilize crop vigor.`;
    }

    // Clamp scores
    riskScore = Math.min(Math.max(riskScore, 10), 95);
    sustainabilityScore = Math.max(100 - Math.round(riskScore * 0.4), 60);

    return {
      overallStatus,
      priority,
      summary,
      actions: Array.from(new Set(actions)), // deduplicate
      rationaleChain,
      riskScore,
      sustainabilityScore,
    };
  }
}

module.exports = new AgroSmartDecisionEngine();
