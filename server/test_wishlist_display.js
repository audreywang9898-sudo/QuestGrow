import fs from 'fs';
import path from 'path';

console.log('=== Running Wishlist Display Integration Check ===');

const kidPortalPath = path.resolve('src/components/KidPortal.jsx');

if (!fs.existsSync(kidPortalPath)) {
  console.error(`❌ KidPortal.jsx not found at: ${kidPortalPath}`);
  process.exit(1);
}

const content = fs.readFileSync(kidPortalPath, 'utf8');

// Check for maxPointsWish definition
const hasMaxPointsWishDef = content.includes('const maxPointsWish = (() => {');
if (!hasMaxPointsWishDef) {
  console.error('❌ Missing maxPointsWish definition logic!');
  process.exit(1);
}
console.log('✓ maxPointsWish definition exists.');

// Check for card rendering block
const hasCardRender = content.includes('{/* Highest Points Active Family Wish Card */}');
if (!hasCardRender) {
  console.error('❌ Missing Highest Points Active Family Wish Card HTML/JSX comments or block!');
  process.exit(1);
}
console.log('✓ Family Wish Card rendering block exists.');

// Check for rendering with Bopomofo/Zhuyin function wrapping title
const hasZhuyinTitle = content.includes('renderTextWithZhuyin(maxPointsWish.title)');
if (!hasZhuyinTitle) {
  console.error('❌ Family Wish Card title is not wrapped in renderTextWithZhuyin for Bopomofo phonetic assist compatibility!');
  process.exit(1);
}
console.log('✓ Family Wish Card title has Bopomofo phonetic assist compatibility.');

console.log('=== ALL CHECKS PASSED SUCCESSFULLY ===');
