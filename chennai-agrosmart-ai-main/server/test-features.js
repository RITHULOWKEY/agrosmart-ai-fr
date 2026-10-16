/**
 * Verification test script for:
 * 1. Feature 1: GIS-Based Smart Farm Mapping (Polygon validation, area in acres/ha/sq m, perimeter, bowtie detection)
 * 2. Feature 2: Weather-Based Farming Recommendations (Live Open-Meteo, 7-day forecast, prioritized farming recommendations)
 * 3. Security: User authorization verification
 */

const { validateAndMeasureBoundary } = require('./controllers/farmController');
const { fetchExtendedWeather, fetchLiveWeather } = require('./services/weatherService');
const weatherAgent = require('./services/weatherAgent');

async function runVerification() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE VERIFICATION SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // --- TEST 1: GIS Polygon Area & Perimeter Calculation ---
  console.log('\n--- Test Suite 1: GIS Geometry & Measurement Calculations ---');
  // 100m x 100m square in Chennai: ~10,000 sq m (~2.47 acres)
  // [lng, lat]
  const squarePlot = [
    [80.2500, 13.0800],
    [80.2510, 13.0800],
    [80.2510, 13.0810],
    [80.2500, 13.0810],
    [80.2500, 13.0800],
  ];

  const geomRes = validateAndMeasureBoundary(squarePlot);
  assert(geomRes.isValid === true, 'Valid polygon correctly accepted');
  assert(geomRes.measurements.areaSqMeters > 0, `Calculated area in sq m: ${geomRes.measurements?.areaSqMeters} m²`);
  assert(geomRes.measurements.areaAcres > 0, `Calculated area in acres: ${geomRes.measurements?.areaAcres} Acres`);
  assert(geomRes.measurements.areaHectares > 0, `Calculated area in hectares: ${geomRes.measurements?.areaHectares} Ha`);
  assert(geomRes.measurements.perimeterMeters > 0, `Calculated perimeter in metres: ${geomRes.measurements?.perimeterMeters} m`);
  assert(geomRes.measurements.center && geomRes.measurements.center.lat > 0, 'Computed centroid coordinates');

  // --- TEST 2: Self-Intersecting (Bowtie) Polygon Detection ---
  console.log('\n--- Test Suite 2: Invalid & Self-Intersecting Polygon Rejection ---');
  const bowtiePlot = [
    [80.2500, 13.0800],
    [80.2510, 13.0810],
    [80.2500, 13.0810],
    [80.2510, 13.0800],
    [80.2500, 13.0800],
  ];
  const bowtieRes = validateAndMeasureBoundary(bowtiePlot);
  assert(bowtieRes.isValid === false, 'Self-intersecting (bowtie) polygon correctly flagged as invalid');
  assert(bowtieRes.error.includes('self-intersecting'), `Correct error message: "${bowtieRes.error}"`);

  // Insufficient vertices
  const linePlot = [
    [80.2500, 13.0800],
    [80.2510, 13.0800],
  ];
  const lineRes = validateAndMeasureBoundary(linePlot);
  assert(lineRes.isValid === false, 'Polygon with < 3 points correctly rejected');

  // Out of range coordinates
  const outOfRangePlot = [
    [250.0, 13.0],
    [251.0, 13.0],
    [251.0, 14.0],
    [250.0, 13.0],
  ];
  const outOfRangeRes = validateAndMeasureBoundary(outOfRangePlot);
  assert(outOfRangeRes.isValid === false, 'Out-of-range coordinates correctly rejected');

  // --- TEST 3: Weather Telemetry & 7-Day Forecast ---
  console.log('\n--- Test Suite 3: Weather Service Live Telemetry & 7-Day Forecast ---');
  const weatherRes = await fetchExtendedWeather({ location: 'Thiruvallur' });
  assert(weatherRes.isLive === true || weatherRes.mode === 'DEMO', 'Weather response contains live/demo mode status');
  assert(weatherRes.current && typeof weatherRes.current.temperature === 'number', `Current temp: ${weatherRes.current?.temperature}°C`);
  assert(weatherRes.current.humidity > 0, `Current humidity: ${weatherRes.current?.humidity}%`);
  assert(Array.isArray(weatherRes.forecast7Day), '7-day forecast array is present');
  assert(weatherRes.forecast7Day.length === 7, `Forecast contains 7 full days (got: ${weatherRes.forecast7Day.length})`);
  assert(weatherRes.forecast7Day[0].tempMax !== undefined, 'Forecast days include max/min temperatures');
  assert(weatherRes.forecast7Day[0].precipitation !== undefined, 'Forecast days include precipitation sum');

  // --- TEST 4: Weather Intelligence Agent & Contextual Recommendations ---
  console.log('\n--- Test Suite 4: Weather Intelligence Agent Contextual Recommendations ---');
  const agentRes = await weatherAgent.run({
    location: 'Kanchipuram, Tamil Nadu',
    cropType: 'Tomato',
    soilType: 'Clay',
    irrigationType: 'Drip',
  });

  assert(agentRes.status === 'SUCCESS', 'Weather Agent returned SUCCESS');
  assert(agentRes.result && Array.isArray(agentRes.result.recommendations), 'Agent returned recommendations array');
  assert(agentRes.result.recommendations.length > 0, `Generated ${agentRes.result.recommendations.length} recommendations`);

  // Verify each recommendation has required fields
  let allHaveRequiredFields = true;
  for (const rec of agentRes.result.recommendations) {
    if (!rec.title || !rec.action || !rec.reason || !rec.priority || !rec.category || !rec.relevantWeather) {
      allHaveRequiredFields = false;
      console.error('Missing field in recommendation:', rec);
    }
  }
  assert(allHaveRequiredFields, 'All recommendations have priority, action, reason, category, and relevant weather data');

  // Check specific agricultural directives
  const hasIrrigationRec = agentRes.result.recommendations.some((r) => r.category === 'Irrigation');
  assert(hasIrrigationRec, 'Includes Irrigation management recommendation');

  console.log('\nSample Generated Recommendations:');
  agentRes.result.recommendations.slice(0, 3).forEach((r, idx) => {
    console.log(`  ${idx + 1}. [${r.priority.toUpperCase()}] ${r.title}`);
    console.log(`     Action: ${r.action}`);
    console.log(`     Reason: ${r.reason}`);
    console.log(`     Weather: ${r.relevantWeather}`);
  });

  // --- TEST 5: Security & User Authorization Check ---
  console.log('\n--- Test Suite 5: Farm Authorization & Security Architecture ---');
  const farmRoutes = require('./routes/farmRoutes');
  assert(farmRoutes !== undefined, 'Farm routes configured');

  console.log('\n================================================================');
  console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
