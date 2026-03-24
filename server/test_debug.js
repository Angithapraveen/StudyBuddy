require('dotenv').config({ path: './.env' });
const aiService = require('./services/ai.service.js');

async function runTests() {
  console.log("=== TEST 1: Small Text ===");
  try {
    const smallText = "This is a very short text to test the system.".repeat(2);
    const res = await aiService.generateNotes(smallText);
    console.log("Test 1 Result:", res.summary);
  } catch (e) {
    console.error("Test 1 Error:", e.message);
  }

  console.log("\n=== TEST 2: Medium Text ===");
  try {
    const mediumText = "Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.".repeat(4);
    const res = await aiService.generateNotes(mediumText);
    console.log("Test 2 Result:", res.summary);
  } catch (e) {
    console.error("Test 2 Error:", e.message);
  }

  console.log("\n=== TESTS COMPLETE ===");
  process.exit(0);
}

runTests();
