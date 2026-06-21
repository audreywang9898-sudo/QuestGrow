import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== Running Gamification Phase 2 Integration Tests ===");

// 1. Verify sfx.js exports playBossBattleSound
const sfxPath = path.resolve(__dirname, '../src/utils/sfx.js');
console.log(`Checking sfx.js at: ${sfxPath}`);
const sfxContent = fs.readFileSync(sfxPath, 'utf8');

assert.ok(sfxContent.includes('export const playBossBattleSound'), 'playBossBattleSound should be exported in sfx.js');
assert.ok(sfxContent.includes('sawtooth'), 'should use retro waveforms like sawtooth');
assert.ok(sfxContent.includes('triangle'), 'should use retro waveforms like triangle');
console.log('✓ sfx.js verification passed!');

// 2. Verify translations.js keys
const translationsPath = path.resolve(__dirname, '../src/utils/translations.js');
console.log(`Checking translations.js at: ${translationsPath}`);
const translationsContent = fs.readFileSync(translationsPath, 'utf8');

const keysToCheck = [
  'dungeonVirtue',
  'dungeonWisdom',
  'dungeonCourage',
  'dungeonEmpathy',
  'dungeonCreativity',
  'eliteBossLabel',
  'ultimateBossLabel'
];

keysToCheck.forEach(key => {
  assert.ok(translationsContent.includes(key), `Key "${key}" should be defined in translations.js`);
});
console.log('✓ translations.js verification passed!');

// 3. Verify KidPortal.jsx boss-quest-card usage
const kidPortalPath = path.resolve(__dirname, '../src/components/KidPortal.jsx');
console.log(`Checking KidPortal.jsx at: ${kidPortalPath}`);
const kidPortalContent = fs.readFileSync(kidPortalPath, 'utf8');

assert.ok(kidPortalContent.includes('boss-quest-card'), 'KidPortal.jsx should render boss-quest-card class');
assert.ok(kidPortalContent.includes('playBossBattleSound'), 'KidPortal.jsx should call playBossBattleSound');
assert.ok(kidPortalContent.includes('dungeonVirtue'), 'KidPortal.jsx should reference dungeonVirtue');
console.log('✓ KidPortal.jsx verification passed!');

// 4. Verify ParentPortal.jsx boss-quest-card usage
const parentPortalPath = path.resolve(__dirname, '../src/components/ParentPortal.jsx');
console.log(`Checking ParentPortal.jsx at: ${parentPortalPath}`);
const parentPortalContent = fs.readFileSync(parentPortalPath, 'utf8');

assert.ok(parentPortalContent.includes('boss-quest-card'), 'ParentPortal.jsx should render boss-quest-card class');
assert.ok(parentPortalContent.includes('eliteBossLabel'), 'ParentPortal.jsx should reference eliteBossLabel');
assert.ok(parentPortalContent.includes('ultimateBossLabel'), 'ParentPortal.jsx should reference ultimateBossLabel');
console.log('✓ ParentPortal.jsx verification passed!');

console.log("\n=== ALL INTEGRATION CHECKS PASSED SUCCESSFULLY ===");
