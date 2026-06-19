import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const isProductionDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('render.com') || 
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionDb ? { rejectUnauthorized: false } : false
});

async function run() {
  console.log("Starting family nickname and parent onboarding migration...");
  try {
    // 1. Alter families table to add family_nickname column
    await pool.query(`
      ALTER TABLE families 
      ADD COLUMN IF NOT EXISTS family_nickname VARCHAR(255) DEFAULT NULL;
    `);
    console.log("Successfully altered families table to add family_nickname column.");

    // 2. Alter users table to add onboarding_completed column
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
    `);
    console.log("Successfully altered users table to add onboarding_completed column.");

    // 3. Set default nickname for the existing default family
    await pool.query(`
      UPDATE families 
      SET family_nickname = '格林冒險小隊' 
      WHERE id = 'f1111111-1111-1111-1111-111111111111';
    `);
    console.log("Successfully set default family_nickname for Green Adventure family.");

    // 4. Set onboarding_completed = true for the existing default parent user so they don't see it (for convenience of testing, or keep it false so we can see it?)
    // Wait, let's keep it FALSE so that we can test onboarding with the default parent user!
    // But let's check what the spec says: "新家長第一次登入後... 用 is_first_login 或 onboarding_completed 判斷"
    // Let's set it to FALSE for our default parent so we can test the wizard easily, or we can manually trigger it.
    // Yes! Let's set the default parent's onboarding_completed to false so we can test it directly!
    await pool.query(`
      UPDATE users 
      SET onboarding_completed = false 
      WHERE email = 'parent@questgrow.com';
    `);
    console.log("Successfully set parent@questgrow.com onboarding_completed to false for testing.");

    // 5. Seed other mock families for leaderboard
    await pool.query(`
      INSERT INTO families (id, name, family_nickname, growth_score) 
      VALUES 
        ('f2222222-2222-2222-2222-222222222222', '波特家庭', '超能波特小隊', 1200),
        ('f3333333-3333-3333-3333-333333333333', '馬斯克家庭', '馬斯克星際小隊', 950),
        ('f4444444-4444-4444-4444-444444444444', '皮卡丘家庭', '皮卡丘雷霆家族', 600),
        ('f5555555-5555-5555-5555-555555555555', '工藤家庭', '柯南偵探家族', 400)
      ON CONFLICT (id) DO UPDATE 
      SET family_nickname = EXCLUDED.family_nickname, 
          growth_score = EXCLUDED.growth_score;
    `);
    console.log("Successfully seeded mock families for the leaderboard.");

  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

run();
