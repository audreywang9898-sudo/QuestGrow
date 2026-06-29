import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = __dirname;

async function runAll() {
  console.log('🚀 Starting database migrations runner...');
  
  try {
    const files = fs.readdirSync(SERVER_DIR);
    // Find all files ending with _migration.js
    const migrations = files
      .filter(file => file.endsWith('_migration.js'))
      .sort(); // Sort alphabetically to guarantee consistent order
      
    console.log(`Found ${migrations.length} migration scripts to run.`);
    
    for (const migration of migrations) {
      const fullPath = path.join(SERVER_DIR, migration);
      console.log(`\n----------------------------------------`);
      console.log(`🏃 Running migration: ${migration}...`);
      try {
        // Run as a separate process so process.exit() in scripts doesn't kill this runner
        const output = execSync(`node "${fullPath}"`, { stdio: 'inherit' });
        console.log(`✅ Completed: ${migration}`);
      } catch (err) {
        console.error(`❌ Failed: ${migration}`);
        // If a migration fails, exit with error code to stop Render build and flag the failure
        process.exit(1);
      }
    }
    
    console.log(`\n----------------------------------------`);
    console.log('🎉 All migrations completed successfully!');
  } catch (err) {
    console.error('Migration runner failed:', err);
    process.exit(1);
  }
}

runAll();
