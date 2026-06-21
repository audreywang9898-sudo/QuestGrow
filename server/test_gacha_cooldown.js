import { GACHA_POOL } from '../src/utils/mockData.js';

// Count helper
function countCategories(pool) {
  const counts = {
    '資源卡': 0,
    '特權卡': 0,
    '體驗卡': 0,
    '收藏卡': 0
  };
  
  for (const rarity in pool) {
    const cards = pool[rarity].cards;
    for (const card of cards) {
      if (counts[card.type] !== undefined) {
        counts[card.type]++;
      } else {
        console.warn(`Unknown card type: ${card.type}`);
      }
    }
  }
  return counts;
}

console.log("=== Testing Gacha Pool Counts ===");
const counts = countCategories(GACHA_POOL);
console.log("Category counts:", counts);

const expectedCount = 30;
let countsOk = true;
for (const cat in counts) {
  if (counts[cat] !== expectedCount) {
    console.error(`❌ Category [${cat}] has ${counts[cat]} items, expected ${expectedCount}!`);
    countsOk = false;
  } else {
    console.log(`✅ Category [${cat}] has exactly ${expectedCount} items.`);
  }
}

if (!countsOk) {
  process.exit(1);
}

console.log("\n=== Testing Gacha 7-Day Cooldown logic (Simulated Frontend) ===");

// Helper to filter pool for gacha draws
function simulateDraw(pool, raritySelected, inventory, simulatedDate) {
  const cardsInRarity = pool[raritySelected].cards;
  
  const currentDateStr = simulatedDate || new Date().toISOString().split('T')[0];
  const dateLimit = new Date(currentDateStr);
  dateLimit.setDate(dateLimit.getDate() - 7);
  const limitStr = dateLimit.toISOString().split('T')[0];

  const recentDrawnIds = new Set(
    (inventory || [])
      .filter(item => item.dateAcquired && item.dateAcquired >= limitStr)
      .map(item => item.id)
  );

  let filteredPool = cardsInRarity.filter(card => !recentDrawnIds.has(card.id));
  let isFallback = false;
  
  if (filteredPool.length === 0) {
    filteredPool = cardsInRarity;
    isFallback = true;
  }
  
  return {
    filteredPool,
    recentDrawnIds,
    isFallback
  };
}

// Case 1: Child draws a card. It should exclude templates drawn in the last 7 days.
// Rarity: Mythic has 5 cards. Let's make the child have drawn 3 of them.
const mythicCards = GACHA_POOL.Mythic.cards;
const inventoryMock = [
  { id: mythicCards[0].id, dateAcquired: "2026-06-20" }, // 1 day ago (cooldown)
  { id: mythicCards[1].id, dateAcquired: "2026-06-15" }, // 6 days ago (cooldown)
  { id: mythicCards[2].id, dateAcquired: "2026-06-12" }, // 9 days ago (safe - outside 7 days)
];

const result1 = simulateDraw(GACHA_POOL, 'Mythic', inventoryMock, '2026-06-21');
console.log("Mock Inventory:", inventoryMock);
console.log("Recent Drawn IDs (Set):", result1.recentDrawnIds);
console.log("Filtered Pool:", result1.filteredPool.map(c => c.id));
console.log("Is fallback triggered?", result1.isFallback);

if (result1.filteredPool.some(c => c.id === mythicCards[0].id || c.id === mythicCards[1].id)) {
  console.error("❌ Test failed: Filtered pool contains cooldown cards!");
  process.exit(1);
} else {
  console.log("✅ Test passed: Filtered pool successfully excludes cards drawn in the last 7 days.");
}

// Case 2: All cards of a rarity are drawn in the last 7 days. Fallback should trigger.
const allMythicInventoryMock = mythicCards.map(c => ({ id: c.id, dateAcquired: "2026-06-20" }));
const result2 = simulateDraw(GACHA_POOL, 'Mythic', allMythicInventoryMock, '2026-06-21');
console.log("\nMock Inventory (all on cooldown):", allMythicInventoryMock);
console.log("Is fallback triggered?", result2.isFallback);
console.log("Fallback pool length:", result2.filteredPool.length);

if (result2.isFallback && result2.filteredPool.length === mythicCards.length) {
  console.log("✅ Test passed: Fallback triggers and falls back to full pool when all cards are on cooldown.");
} else {
  console.error("❌ Test failed: Fallback was not triggered or pool length mismatch!");
  process.exit(1);
}

console.log("\n🎉 All Gacha Cooldown Tests Passed!");
process.exit(0);
