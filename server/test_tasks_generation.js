// Verification script for programmatic task templates generation

import { TASK_TEMPLATES } from '../src/utils/mockData.js';

function verifyTemplates() {
  console.log('=== VERIFYING PROGRAMMATIC TASK TEMPLATES ===');
  console.log(`Total templates count: ${TASK_TEMPLATES.length}`);

  const counts = { '德': 0, '智': 0, '體': 0, '群': 0, '美': 0 };

  TASK_TEMPLATES.forEach(tpl => {
    if (counts[tpl.type] !== undefined) {
      counts[tpl.type]++;
    }
  });

  console.log('Templates count per category:');
  Object.entries(counts).forEach(([cat, count]) => {
    console.log(`- Category "${cat}": ${count} templates`);
  });

  // Verify that each has >= 100 templates
  let allPass = true;
  Object.entries(counts).forEach(([cat, count]) => {
    if (count < 100) {
      console.error(`Error: Category "${cat}" has less than 100 templates (got ${count})`);
      allPass = false;
    }
  });

  if (allPass) {
    console.log('SUCCESS: All categories have at least 100 templates successfully generated!');
  } else {
    console.error('FAIL: Template generation validation failed.');
    process.exitCode = 1;
  }
}

verifyTemplates();
