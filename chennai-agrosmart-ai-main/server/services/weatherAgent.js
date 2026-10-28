const { fetchLiveWeather } = require('./weatherService');

/**
 * Agent 2 — 🌦️ WEATHER INTELLIGENCE AGENT
 * Purpose: Analyze current/recent weather conditions relevant to the crop.
 */
class WeatherIntelligenceAgent {
  async run({ location, cropType, growthStage }) {
    console.log(`[Weather Intelligence Agent] Checking conditions for ${location || 'Chennai'}...`);

    try {
      const weatherData = await fetchLiveWeather(location || 'Chennai');

      const temp = weatherData.temperature;
      const humidity = weatherData.humidity;
      const rain = weatherData.rainfall;

      // Agronomic risk calculations
      let irrigationRisk = 'Low';
      let diseaseRisk = 'Low';
      let weatherRecommendation = 'Weather conditions are stable for current farming operations.';

      // Determine irrigation risk
      if (rain > 10 || humidity > 80) {
        irrigationRisk = 'High';
      } else if (rain > 2 || humidity > 70) {
        irrigationRisk = 'Medium';
      } else if (temp > 35) {
        irrigationRisk = 'High (Evaporation)';
      }

      // Determine micro-climate disease risk (e.g. fungal pathogens flourish with warm + high humidity)
      if (humidity >= 75 && temp >= 25 && temp <= 34) {
        diseaseRisk = 'High (Fungal Spore Proliferation)';
      } else if (humidity >= 65 || rain > 3) {
        diseaseRisk = 'Medium';
      }

      // Synthesis of actionable weather advice for farmer
      if (rain > 15) {
        weatherRecommendation = 'Heavy rain forecast. Postpone fertilizer application and clear field furrows to prevent root rot.';
      } else if (rain > 0 && humidity > 70) {
        weatherRecommendation = 'Avoid excessive irrigation due to expected rainfall and elevated ambient moisture.';
      } else if (temp > 36) {
        weatherRecommendation = 'High heat stress detected. Provide light morning or evening irrigation to shield root zone.';
      } else if (diseaseRisk.includes('High')) {
        weatherRecommendation = 'Warm and humid conditions favor fungal pathogens. Inspect canopy leaves and refrain from overhead watering.';
      }

      // Generate actionable agricultural recommendations for WeatherAdvisory UI
      const recommendations = [
        {
          id: 'rec-1',
          category: 'Irrigation',
          priority: rain > 5 ? 'Alert' : temp > 35 ? 'High' : 'Medium',
          title:
            rain > 5
              ? 'Suspend Active Irrigation'
              : temp > 35
              ? 'Early Morning Deep Drip Cycle'
              : 'Standard Moisture Maintenance',
          action:
            rain > 5
              ? 'Halt scheduled drip cycles for 24-48 hours to prevent root waterlogging and nutrient leaching.'
              : temp > 35
              ? 'Deliver 35 mins drip cycle between 05:30 - 08:00 AM before intense solar evaporation.'
              : 'Maintain normal morning drip cycle according to soil tensiometer readings.',
          reason: `Ambient temp is ${temp}°C with humidity at ${humidity}% and precipitation at ${rain} mm.`,
          relevantWeather: `Temperature: ${temp}°C • Humidity: ${humidity}% • Rain: ${rain} mm`,
          timing: 'Next 12 Hours',
        },
        {
          id: 'rec-2',
          category: 'Crop Protection & Spraying',
          priority: weatherData.windSpeed > 20 ? 'Alert' : humidity > 75 ? 'High' : 'Low',
          title:
            weatherData.windSpeed > 20
              ? 'High Wind Chemical Drift Warning'
              : humidity > 75
              ? 'Fungal Spore Preventive Foliar Application'
              : 'Optimal Field Operational Window',
          action:
            weatherData.windSpeed > 20
              ? 'Postpone pesticide and foliar fertilizer sprays to avoid chemical drift and non-target damage.'
              : humidity > 75
              ? 'Inspect leaf undersides for downy mildew/blight spores; spray bio-fungicide during calm morning hours.'
              : 'Atmospheric drift index is low. Safe window for foliar nourishment and fertilizer application.',
          reason: `Wind speed is ${weatherData.windSpeed} km/h, humidity is ${humidity}%.`,
          relevantWeather: `Wind Speed: ${weatherData.windSpeed} km/h • Humidity: ${humidity}%`,
          timing: 'Today 06:30 - 09:30 AM',
        },
        {
          id: 'rec-3',
          category: 'Soil & Microclimate',
          priority: diseaseRisk.includes('High') ? 'High' : 'Medium',
          title: diseaseRisk.includes('High') ? 'Clear Drainage Furrows & Aerate' : 'Mulch & Soil Moisture Preservation',
          action: diseaseRisk.includes('High')
            ? 'Ensure field drainage outlets are clear to prevent standing water pools in low-lying rows.'
            : 'Check organic straw mulch cover across bed tops to conserve moisture and moderate soil temperature.',
          reason: `Agronomic microclimate risk classified as ${diseaseRisk}.`,
          relevantWeather: `Soil Profile Evaluated • Primary Crop: ${cropType || 'Tomato'}`,
          timing: 'Immediate Field Entry',
        },
      ];

      return {
        agentType: 'weather',
        status: 'SUCCESS',
        mode: weatherData.mode, // REAL or DEMO
        confidence: weatherData.isLive ? 95 : 82,
        result: {
          temperature: temp,
          apparentTemperature: weatherData.apparentTemperature ?? (temp + 2),
          humidity,
          rainfall: rain,
          windSpeed: weatherData.windSpeed,
          windDirection: weatherData.windDirection ?? 0,
          weatherCondition: weatherData.weatherCondition,
          irrigationRisk,
          diseaseRisk,
          weatherRecommendation,
          stationLocation: weatherData.location,
          isLive: weatherData.isLive,
          forecast7Day: weatherData.forecast7Day || [],
          recommendations,
          hourly24h: weatherData.hourly24h || [],
        },
      };

    } catch (error) {
      console.error('[Weather Intelligence Agent] Error:', error.message);
      return {
        agentType: 'weather',
        status: 'TEMPORARILY_UNAVAILABLE',
        mode: 'UNAVAILABLE',
        confidence: 0,
        result: {
          temperature: 30,
          humidity: 70,
          rainfall: 0,
          weatherCondition: 'Unavailable',
          irrigationRisk: 'Unknown',
          diseaseRisk: 'Unknown',
          weatherRecommendation: 'Weather service temporarily unreachable. Observe localized rainfall before irrigating.',
          stationLocation: 'Offline',
          isLive: false,
        },
      };
    }
  }
}

module.exports = new WeatherIntelligenceAgent();
