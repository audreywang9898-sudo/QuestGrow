-- QuestGrow Database Schema (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS event_logs CASCADE;
DROP TABLE IF EXISTS weekly_competition CASCADE;
DROP TABLE IF EXISTS redeem_logs CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS parent_goals CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS children CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS families CASCADE;

-- 1. Families Table
CREATE TABLE families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    growth_score INT DEFAULT 6420,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Parents & Kids authentication accounts)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('parent', 'kid')),
    avatar TEXT DEFAULT 'boy',
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Children Table (Kid RPG character profiles)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INT DEFAULT 10,
    birthday VARCHAR(50) DEFAULT '10/24',
    avatar TEXT DEFAULT 'boy',
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    exp_needed INT DEFAULT 400,
    gold INT DEFAULT 100,
    tickets INT DEFAULT 1,
    job_class VARCHAR(100) DEFAULT 'Explorer (探索者) ⚔️',
    attributes JSONB NOT NULL DEFAULT '{"Wisdom": 10, "Responsibility": 10, "Courage": 10, "Empathy": 10, "Creativity": 10}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add child_id backreference to users (optional, but convenient for fast querying)
ALTER TABLE users ADD COLUMN child_id UUID REFERENCES children(id) ON DELETE SET NULL;

-- 4. Tasks Table (Quests)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES children(id) ON DELETE CASCADE, -- NULL means general task
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- e.g., '智', '德', '體', '美', '群'
    difficulty VARCHAR(50) NOT NULL, -- '簡單', '中等', '較難', '終極'
    exp_reward INT DEFAULT 100,
    gold_reward INT DEFAULT 50,
    ticket_reward INT DEFAULT 1,
    attribute_reward VARCHAR(50), -- e.g., 'Wisdom', 'Responsibility', etc.
    period VARCHAR(50) DEFAULT '每日', -- '每日', '每週'
    status VARCHAR(50) DEFAULT '進行中' CHECK (status IN ('未指派', '進行中', '待覆核', '已完成', '已退回')),
    rejection_reason TEXT,
    submission JSONB, -- { "notes": "...", "photo": "..." }
    date_created DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventory Table (Gacha cards obtained by kids)
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    card_template_id VARCHAR(100) NOT NULL, -- e.g., 'r_dinner', 'e_date'
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- '資源卡', '特權卡', '體驗卡', '收藏卡'
    rarity VARCHAR(50) NOT NULL, -- 'Common', 'Rare', 'Epic', 'Legendary', 'Mythic'
    description TEXT,
    status VARCHAR(50) DEFAULT '未使用' CHECK (status IN ('未使用', '待核銷', '已使用', '已過期')),
    date_acquired DATE DEFAULT CURRENT_DATE,
    expire_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Parent Goals Table
CREATE TABLE parent_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status VARCHAR(50) DEFAULT '進行中' CHECK (status IN ('進行中', '已達成')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Wishlist Table (Family wishlist requiring growth points)
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    points_needed INT NOT NULL DEFAULT 1000,
    points_current INT DEFAULT 0,
    is_ultimate BOOLEAN DEFAULT FALSE,
    is_redeemed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Redeem Logs Table (Card usage / validation history)
CREATE TABLE redeem_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    card_name VARCHAR(255) NOT NULL,
    kid_name VARCHAR(255) NOT NULL,
    date_redeemed DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT '已核銷',
    reviewer VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Weekly Competition Table (Weekly summaries)
CREATE TABLE weekly_competition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    week_range VARCHAR(100) NOT NULL,
    champions JSONB NOT NULL, -- { "taskCount": "...", "growthRate": "...", ... }
    mvp_task VARCHAR(255),
    devil_task VARCHAR(255),
    family_title VARCHAR(255) DEFAULT '「超級探險小隊」✨',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Event Logs Table (GDPR/Telemetry)
CREATE TABLE event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================
-- SEED MOCK DATA (For Initial Setup)
-- ==========================================

-- 1. Create a Default Family
INSERT INTO families (id, name) 
VALUES ('f1111111-1111-1111-1111-111111111111', '格林冒險家庭');

-- 2. Create Users (Default Parent & Default Kid accounts)
-- Note: passwords are 'password123' (we'll hash it in Node.js backend using bcryptjs, 
-- but for seeding we can insert raw or a pre-hashed string: '$2a$10$tJqIscC2zRkZlJ48aA719usG5p08x3J4wD9h7W5G.vCgE/c2UvWp.' is 'password123')
INSERT INTO users (id, family_id, email, password_hash, name, role, avatar) 
VALUES 
('aaaa1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'parent@questgrow.com', '$2a$10$euDgSzeDgGyC1pcs8sNo1evkYNQmLLOoipAvZWKa9Z3ZjhiFY5vTy', 'Audrey & Richard', 'parent', 'girl'),
('aaaa2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'kid@questgrow.com', '$2a$10$euDgSzeDgGyC1pcs8sNo1evkYNQmLLOoipAvZWKa9Z3ZjhiFY5vTy', '小格林 (Leo)', 'kid', 'boy'),
('aaaa3333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', 'michelle@questgrow.com', '$2a$10$euDgSzeDgGyC1pcs8sNo1evkYNQmLLOoipAvZWKa9Z3ZjhiFY5vTy', 'Michelle', 'kid', 'girl'),
('aaaa4444-4444-4444-4444-444444444444', 'f1111111-1111-1111-1111-111111111111', 'daniel@questgrow.com', '$2a$10$euDgSzeDgGyC1pcs8sNo1evkYNQmLLOoipAvZWKa9Z3ZjhiFY5vTy', 'Daniel', 'kid', 'boy');

-- 3. Create Children Profiles
INSERT INTO children (id, user_id, name, age, birthday, avatar, level, exp, exp_needed, gold, tickets, job_class, attributes)
VALUES 
('cccc1111-1111-1111-1111-111111111111', 'aaaa2222-2222-2222-2222-222222222222', '小格林 (Leo)', 10, '10/24', 'boy', 3, 420, 1000, 350, 5, 'Explorer (探索者) ⚔️', '{"Wisdom": 18, "Responsibility": 15, "Courage": 24, "Empathy": 12, "Creativity": 14}'),
('cccc2222-2222-2222-2222-222222222222', 'aaaa3333-3333-3333-3333-333333333333', 'Michelle', 8, '05/12', 'girl', 2, 150, 700, 200, 3, 'Guardian (守護者) 🛡️', '{"Wisdom": 12, "Responsibility": 18, "Courage": 10, "Empathy": 16, "Creativity": 14}'),
('cccc3333-3333-3333-3333-333333333333', 'aaaa4444-4444-4444-4444-444444444444', 'Daniel', 12, '09/30', 'boy', 4, 300, 1200, 500, 4, 'Sage (智者) 🔮', '{"Wisdom": 22, "Responsibility": 12, "Courage": 15, "Empathy": 10, "Creativity": 18}');

-- Update backreferences in users table
UPDATE users SET child_id = 'cccc1111-1111-1111-1111-111111111111' WHERE id = 'aaaa2222-2222-2222-2222-222222222222';
UPDATE users SET child_id = 'cccc2222-2222-2222-2222-222222222222' WHERE id = 'aaaa3333-3333-3333-3333-333333333333';
UPDATE users SET child_id = 'cccc3333-3333-3333-3333-333333333333' WHERE id = 'aaaa4444-4444-4444-4444-444444444444';

-- 4. Seed Tasks
INSERT INTO tasks (id, family_id, assigned_to, name, description, type, difficulty, exp_reward, gold_reward, ticket_reward, attribute_reward, period, status, date_created, submission, rejection_reason)
VALUES
('dddd1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '閱讀好書 20 分鐘', '今天閱讀《哈利波特》並分享精彩片段給媽媽聽。', '智', '中等', 200, 100, 1, 'Wisdom', '每日', '進行中', '2026-06-01', NULL, NULL),
('dddd2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '自主整理房間與書桌', '玩具放回箱子，書桌整理乾淨，並拖地。', '德', '較難', 400, 200, 2, 'Responsibility', '每日', '待覆核', '2026-06-01', '{"notes": "我把書本排好了，地板也擦得很乾淨！", "photo": "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80"}', NULL),
('dddd3333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '戶外超慢跑 1.5 公里', '去公園慢跑 3 圈，流汗並紀錄時間。', '體', '終極', 800, 400, 3, 'Courage', '每週', '已退回', '2026-05-30', NULL, '請拍張跑步手錶的紀錄照片給爸爸看喔，加油！'),
('dddd4444-4444-4444-4444-444444444444', 'f1111111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '製作一張感謝卡片送給家人', '親手繪製或寫下一張感恩小卡，送給辛苦的家人表達謝意。', '群', '簡單', 100, 50, 1, 'Empathy', '每週', '進行中', '2026-06-01', NULL, NULL),
('dddd5555-5555-5555-5555-555555555555', 'f1111111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', '🪙 每日收支記帳與小反思', '記錄今天的花費與收入，並寫下其中一項是『需要』還是『想要』，與家人討論。', '智', '簡單', 100, 50, 1, 'Wisdom', '每日', '進行中', '2026-06-01', NULL, NULL);

-- 5. Seed Inventory
INSERT INTO inventory (id, child_id, card_template_id, name, type, rarity, description, status, date_acquired, expire_at)
VALUES
('eeee1111-1111-1111-1111-111111111111', 'cccc1111-1111-1111-1111-111111111111', 'r_dinner', '晚餐選擇權', '特權卡', 'Rare', '今晚吃什麼？由你來做主！', '未使用', '2026-05-28', '2026-06-04'),
('eeee2222-2222-2222-2222-222222222222', 'cccc1111-1111-1111-1111-111111111111', 'e_date', '爸爸媽媽單獨約會券', '體驗卡', 'Epic', '獲得與爸爸或媽媽單獨出門吃冰淇淋/逛街的下午！', '待核銷', '2026-05-30', '2026-06-29'),
('eeee3333-3333-3333-3333-333333333333', 'cccc1111-1111-1111-1111-111111111111', 'l_title_dragon', '稱號：屠龍勇士', '收藏卡', 'Legendary', '解鎖酷炫角色稱號，展示於個人面板！', '已使用', '2026-05-25', NULL);

-- 6. Seed Parent Goals
INSERT INTO parent_goals (id, family_id, category, title, progress, status)
VALUES
('bbbb1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '健康體能', '每週慢跑 3 次（每次 3K）', 66, '進行中'),
('bbbb2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', '財務安全', '每月固定儲蓄與投資 1 萬元', 100, '已達成'),
('bbbb3333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', '閱讀與學習', '本月閱讀《底層邏輯》等 2 本書', 50, '進行中');

-- 7. Seed Wishlist
INSERT INTO wishlist (id, family_id, title, points_needed, points_current, is_ultimate, is_redeemed)
VALUES
('ffff1111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '全家日本自由行五天四夜', 10000, 6420, TRUE, FALSE),
('ffff2222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', '週末森林野奢露營體驗', 2000, 2000, FALSE, TRUE),
('ffff3333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', '購買家庭同樂 Switch 遊戲', 800, 800, FALSE, FALSE);

-- 8. Seed Redeem Logs
INSERT INTO redeem_logs (id, family_id, card_name, kid_name, date_redeemed, status, reviewer)
VALUES
('00001111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', '額外遊戲時間 30 分鐘', '小格林 (Leo)', '2026-05-29', '已核銷', 'Audrey (媽媽)'),
('00002222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', '晚餐選擇權', '小格林 (Leo)', '2026-05-27', '已核銷', 'Richard (爸爸)');

-- 9. Seed Weekly Competition
INSERT INTO weekly_competition (id, family_id, week_range, champions, mvp_task, devil_task, family_title)
VALUES
('00003333-3333-3333-3333-333333333333', 'f1111111-1111-1111-1111-111111111111', '05/25 ~ 05/31', '{"taskCount": "小格林 (Leo) [14 個任務]", "growthRate": "小格林 (Leo) [+150% EXP]", "courage": "小格林 (Leo) [超慢跑挑戰成功]", "creativity": "小格林 (Leo) [樂高飛船創作]"}', '自主整理房間與書桌 (完成度 92%)', '戶外超慢跑 1.5 公里 (完成度 40%)', '「超級探險小隊」✨');
