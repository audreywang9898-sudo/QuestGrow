import fs from 'fs';
import path from 'path';

console.log('=== Running Visual Gamification Integration Check ===');

const kidPortalPath = path.resolve('src/components/KidPortal.jsx');
const parentPortalPath = path.resolve('src/components/ParentPortal.jsx');
const cssPath = path.resolve('src/index.css');

if (!fs.existsSync(kidPortalPath)) {
  console.error(`❌ KidPortal.jsx not found at: ${kidPortalPath}`);
  process.exit(1);
}
if (!fs.existsSync(parentPortalPath)) {
  console.error(`❌ ParentPortal.jsx not found at: ${parentPortalPath}`);
  process.exit(1);
}
if (!fs.existsSync(cssPath)) {
  console.error(`❌ index.css not found at: ${cssPath}`);
  process.exit(1);
}

const kidContent = fs.readFileSync(kidPortalPath, 'utf8');
const parentContent = fs.readFileSync(parentPortalPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 1. Verify KidPortal.jsx has the backpack slots grid (e.g. Array.from({ length: 24 }))
const hasBackpackSlots = kidContent.includes('Array.from({ length: 24 })');
if (!hasBackpackSlots) {
  console.error('❌ KidPortal.jsx is missing the 6x4 (24 slots) inventory grid initialization!');
  process.exit(1);
}
console.log('✓ KidPortal.jsx has 6x4 backpack slots.');

// 2. Verify KidPortal.jsx uses rpg-grid-slot class
const hasRpgGridSlot = kidContent.includes('rpg-grid-slot');
if (!hasRpgGridSlot) {
  console.error('❌ KidPortal.jsx is missing use of rpg-grid-slot class!');
  process.exit(1);
}
console.log('✓ KidPortal.jsx uses rpg-grid-slot.');

// 3. Verify ParentPortal.jsx uses guild-bounty-wood and guild-scroll classes
const hasGuildBountyWood = parentContent.includes('guild-bounty-wood');
const hasGuildScroll = parentContent.includes('guild-scroll');
if (!hasGuildBountyWood || !hasGuildScroll) {
  console.error('❌ ParentPortal.jsx is missing guild-bounty-wood or guild-scroll classes!');
  process.exit(1);
}
console.log('✓ ParentPortal.jsx uses guild-bounty-wood and guild-scroll.');

// 4. Verify index.css has the gamification classes defined
const expectedCssClasses = [
  'rpg-grid-slot',
  'exp-metallic-bar',
  'hp-metallic-bar',
  'gacha-cabinet',
  'guild-scroll',
  'guild-bounty-wood'
];

for (const cls of expectedCssClasses) {
  if (!cssContent.includes(cls)) {
    console.error(`❌ index.css is missing class definition: ${cls}`);
    process.exit(1);
  }
}
console.log('✓ index.css defines all required gamification classes.');

// 5. Verify Kid onboarding tour step count is updated to 6
const has6Steps = kidContent.includes('步驟 ${tourStep} / 6') || kidContent.includes('Step ${tourStep} / 6');
if (!has6Steps) {
  console.error('❌ Kid onboarding tour step count in KidPortal.jsx is not updated to 6 steps!');
  process.exit(1);
}
console.log('✓ Kid onboarding tour has 6 steps.');

console.log('=== ALL CHECKS PASSED SUCCESSFULLY ===');
