/**
 * QuestGrow — Complete Database Setup Script
 * Run once on a fresh database: node server/setup_db.js
 * Safe to re-run: uses CREATE TABLE IF NOT EXISTS and ADD COLUMN IF NOT EXISTS.
 */
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
  console.log('🚀 QuestGrow Database Setup Starting...');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'NOT SET');

  try {
    // ── 1. families ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS families (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        family_nickname VARCHAR(255) DEFAULT NULL,
        growth_score INTEGER DEFAULT 0,
        gacha_pool JSONB DEFAULT NULL,
        settings JSONB DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ families table ready');

    // ── 2. users ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'kid', 'admin')),
        avatar TEXT DEFAULT 'boy',
        google_id VARCHAR(255) DEFAULT NULL,
        child_id UUID DEFAULT NULL,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        login_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ users table ready');

    // ── 3. children ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS children (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        age INTEGER DEFAULT 10,
        birthday VARCHAR(20) DEFAULT '10/24',
        avatar TEXT DEFAULT 'boy',
        level INTEGER DEFAULT 1,
        exp INTEGER DEFAULT 0,
        exp_needed INTEGER DEFAULT 400,
        gold INTEGER DEFAULT 0,
        tickets INTEGER DEFAULT 0,
        job_class VARCHAR(100) DEFAULT 'Explorer (探索者) ⚔️',
        attributes JSONB DEFAULT '{"Wisdom":0,"Responsibility":0,"Courage":0,"Empathy":0,"Creativity":0}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ children table ready');

    // ── 4. tasks ─────────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        type VARCHAR(10) DEFAULT '智',
        difficulty VARCHAR(20) DEFAULT '簡單',
        exp_reward INTEGER DEFAULT 100,
        gold_reward INTEGER DEFAULT 50,
        ticket_reward INTEGER DEFAULT 1,
        attribute_reward VARCHAR(50) DEFAULT NULL,
        period VARCHAR(20) DEFAULT '每日',
        assigned_to UUID REFERENCES children(id) ON DELETE SET NULL DEFAULT NULL,
        status VARCHAR(30) DEFAULT '進行中',
        submission_notes TEXT DEFAULT NULL,
        submission_photo TEXT DEFAULT NULL,
        rejection_reason TEXT DEFAULT NULL,
        swap_count INTEGER DEFAULT 0,
        date_created VARCHAR(20) DEFAULT NULL,
        completed_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ tasks table ready');

    // ── 5. inventory ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        child_id UUID REFERENCES children(id) ON DELETE CASCADE,
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        type VARCHAR(50) DEFAULT '特權卡',
        rarity VARCHAR(30) DEFAULT 'Common',
        effect VARCHAR(50) DEFAULT NULL,
        icon VARCHAR(10) DEFAULT '🎴',
        status VARCHAR(30) DEFAULT '未使用',
        date_acquired VARCHAR(20) DEFAULT NULL,
        expire_at TIMESTAMP DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ inventory table ready');

    // ── 6. redeem_logs ───────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS redeem_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
        child_id UUID REFERENCES children(id) ON DELETE CASCADE,
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) DEFAULT NULL,
        rarity VARCHAR(30) DEFAULT NULL,
        redeemed_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ redeem_logs table ready');

    // ── 7. wishlist ──────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        points_needed INTEGER NOT NULL DEFAULT 1000,
        points_current INTEGER DEFAULT 0,
        is_ultimate BOOLEAN DEFAULT FALSE,
        is_redeemed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ wishlist table ready');

    // ── 8. parent_goals ──────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parent_goals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        progress INTEGER DEFAULT 0,
        status VARCHAR(30) DEFAULT '進行中',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ parent_goals table ready');

    // ── 9. weekly_competition ────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weekly_competition (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        week_range VARCHAR(50) DEFAULT NULL,
        champions JSONB DEFAULT NULL,
        mvp_task VARCHAR(255) DEFAULT NULL,
        devil_task VARCHAR(255) DEFAULT NULL,
        family_title VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ weekly_competition table ready');

    // ── 10. event_logs ───────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        family_id UUID REFERENCES families(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL DEFAULT NULL,
        event_type VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}',
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ event_logs table ready');

    // ── 11. admin_notifications ──────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ admin_notifications table ready');

    // ── 12. proverbs ─────────────────────────────────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS proverbs (
        id SERIAL PRIMARY KEY,
        content_zh TEXT NOT NULL,
        content_en TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✅ proverbs table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_adult_proverbs (
        id SERIAL PRIMARY KEY,
        content_zh VARCHAR(500) NOT NULL,
        content_en VARCHAR(500) NOT NULL
      )
    `);
    console.log('✅ daily_adult_proverbs table ready');

    // ── Safe column additions (idempotent) ───────────────────────────────────
    const safeAlters = [
      `ALTER TABLE families ADD COLUMN IF NOT EXISTS family_nickname VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE families ADD COLUMN IF NOT EXISTS gacha_pool JSONB DEFAULT NULL`,
      `ALTER TABLE families ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0`,
      `ALTER TABLE children ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{"Wisdom":0,"Responsibility":0,"Courage":0,"Empathy":0,"Creativity":0}'`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS swap_count INTEGER DEFAULT 0`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS rejection_reason TEXT DEFAULT NULL`,
    ];
    for (const sql of safeAlters) {
      try { await pool.query(sql); } catch (e) { /* Column already exists — ignore */ }
    }
    console.log('✅ Column migrations applied');

    // ── Fix existing children with NULL attributes ────────────────────────────
    await pool.query(`
      UPDATE children
      SET attributes = '{"Wisdom":0,"Responsibility":0,"Courage":0,"Empathy":0,"Creativity":0}'
      WHERE attributes IS NULL
    `);
    console.log('✅ Fixed NULL attributes on existing children');

    console.log('\n🎉 Database setup complete! All tables are ready.');
  } catch (error) {
    console.error('\n❌ Setup error:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
