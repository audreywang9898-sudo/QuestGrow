import pool from './config/db.js';

const proverbs = [
  { zh: "教育的本質是一棵樹搖動另一棵樹，一朵雲推動另一朵雲，一個靈魂喚醒另一個靈魂。", en: "The essence of education is a tree shaking another tree, a cloud pushing another cloud, a soul awakening another soul." },
  { zh: "陪伴是給孩子最好的禮物，而你的穩定與快樂是家庭的基石。", en: "Accompanying is the best gift to children, and your stability and happiness are the foundation of the family." },
  { zh: "生活不是等待暴風雨過去，而是學習在雨中跳舞。", en: "Life isn't about waiting for the storm to pass, it's about learning to dance in the rain." },
  { zh: "最好的種樹時間是十年前，其次是現在。", en: "The best time to plant a tree was ten years ago. The second best time is now." },
  { zh: "保持心中的光，因為你不知道誰會藉此走出黑暗。", en: "Keep the light in your heart, for you never know who may use it to guide themselves out of the dark." },
  { zh: "千里的旅程，是從第一步開始的。", en: "A journey of a thousand miles begins with a single step." },
  { zh: "不要因為走得太遠，而忘記了當初為什麼出發。", en: "Do not go so far that you forget why you set out in the first place." },
  { zh: "溫和但堅定，是我們給自己和孩子最溫暖的力量。", en: "Gentle yet firm is the warmest strength we can give to ourselves and our children." },
  { zh: "每天給自己一點時間靜下心來，你做得比想像中更好。", en: "Give yourself a little time to quiet down each day; you are doing better than you think." },
  { zh: "家庭的溫度，決定了孩子看世界的角度。", en: "The warmth of a home determines how a child perceives the world." },
  { zh: "允許自己有不完美的時候，成長是一輩子的旅程。", en: "Allow yourself to be imperfect; growth is a lifelong journey." },
  { zh: "聽懂孩子沒說出口的話，是父母最深的溫柔。", en: "Hearing what your child leaves unsaid is a parent's deepest gentleness." },
  { zh: "孩子是看著父母的背影長大的，做好自己就是最好的教育。", en: "Children grow up looking at their parents' backs; being yourself is the best education." },
  { zh: "每一次耐心的傾聽，都在孩子心中種下一顆信任的種子。", en: "Every patient listening seeds a grain of trust in a child's heart." },
  { zh: "幸福不是擁有多，而是計較得少。", en: "Happiness is not about having more, but about caring less." },
  { zh: "給孩子翅膀，也給他們回家的方向。", en: "Give children wings, and also give them a direction to come home." },
  { zh: "家是避風港，而不是戰場；用愛和解，用理解搭建橋樑。", en: "Home is a harbor, not a battlefield; reconcile with love and build bridges with understanding." },
  { zh: "每一步努力都算數，時間會給出最好的答案。", en: "Every effort counts; time will yield the best answers." },
  { zh: "照顧好自己的情緒，是為家庭注入的第一劑陽光。", en: "Taking care of your own emotions is the first ray of sunshine you inject into your family." },
  { zh: "改變從心態開始，當你微笑，世界也會回以微笑。", en: "Change begins with mindset; when you smile, the world smiles back." },
  { zh: "學習在不確定中尋找平靜，每個人都在以自己的步調前行。", en: "Learn to find peace in uncertainty; everyone is moving at their own pace." },
  { zh: "父母的心寬廣了，孩子的世界就寬廣了。", en: "When parents' hearts expand, the children's world expands." },
  { zh: "讚美要具體，批評要溫和；多看優點，少挑毛病。", en: "Be specific with praise and gentle with criticism; look more at strengths and less at flaws." },
  { zh: "在忙碌的生活中，別忘了留一首歌的時間給自己。", en: "In a busy life, don't forget to reserve the duration of a song for yourself." },
  { zh: "真正的勇敢不是沒有恐懼，而是帶著恐懼依然堅定前行。", en: "True courage is not the absence of fear, but moving forward steadfastly despite it." },
  { zh: "每一顆星星都有它閃耀的時刻，每一位家人也是如此。", en: "Every star has its moment to shine, and so does every family member." },
  { zh: "放手不是不管，而是相信孩子有面對風雨的潛力。", en: "Letting go is not neglecting, but believing in the child's potential to face storms." },
  { zh: "用讚賞的眼光看家人，你會發現生活處處是驚喜。", en: "Look at your family with appreciation, and you will find surprises everywhere." },
  { zh: "今日的耐心，是明日幸福的基石。", en: "Today's patience is the foundation of tomorrow's happiness." },
  { zh: "教育不是注滿一桶水，而是點燃一團火。", en: "Education is not the filling of a bucket, but the lighting of a fire." },
  { zh: "與其給孩子鋪好路，不如鍛鍊他們走路的雙腳。", en: "Rather than preparing the road for children, prepare their feet for the road." },
  { zh: "懂得以退為進，有時候放鬆才是最好的拉近。", en: "Know when to yield; sometimes relaxation is the best way to draw closer." },
  { zh: "每個家庭都有獨特的節奏，不必羨慕別人的旋律。", en: "Every family has its unique rhythm; no need to envy others' melodies." },
  { zh: "在愛裡沒有恐懼，只有彼此支持的堅強。", en: "There is no fear in love, only the strength of mutual support." },
  { zh: "凡事盡力而為，其餘的交給時間與耐心。", en: "Do your best in everything, and leave the rest to time and patience." },
  { zh: "懂得說對不起的父母，教出懂得負責任的孩子。", en: "Parents who know how to apologize raise children who know how to take responsibility." },
  { zh: "感恩能放大生活中的美好，讓平凡的每一天都閃閃發亮。", en: "Gratitude amplifies the beauty in life, making every ordinary day shine." },
  { zh: "建立良好的邊界，是愛護自己也尊重家人的表現。", en: "Establishing healthy boundaries is a display of loving yourself and respecting family." },
  { zh: "失敗只是暫時的繞道，它讓我們在下一次出發時更聰明。", en: "Failure is only a temporary detour; it makes us smarter on the next departure." },
  { zh: "對自己溫柔一點，你已經做得很好了。", en: "Be gentler with yourself; you have already done very well." },
  { zh: "給孩子犯錯的空間，那是他們學習最快的方式。", en: "Give children room to make mistakes; that is their fastest way of learning." },
  { zh: "用心經營的關係，如細水長流，溫潤而持久。", en: "Relationships nurtured with care are like flowing streams, gentle and enduring." },
  { zh: "快樂是一種選擇，今天就選擇看見美好的一面吧。", en: "Happiness is a choice; choose to see the bright side today." },
  { zh: "與家人共度的平凡時光，往往是日後最珍貴的記憶。", en: "Ordinary moments spent with family often become the most precious memories later on." },
  { zh: "當你放慢腳步，才能看見路旁盛開的繁花。", en: "Only when you slow down can you see the flowers blooming along the roadside." },
  { zh: "信任是家庭默契的來源，給予信任，收穫安心。", en: "Trust is the source of family chemistry; give trust, receive peace of mind." },
  { zh: "用智慧引導，而非用情緒壓制。", en: "Guide with wisdom rather than suppressing with emotion." },
  { zh: "保持好奇心，世界永遠有值得學習的新鮮事。", en: "Keep curiosity alive; the world always has fresh things to learn." },
  { zh: "每一天都是新的畫布，你可以決定畫上什麼顏色。", en: "Every day is a fresh canvas; you decide what colors to paint." },
  { zh: "分享快樂，快樂會加倍；分擔憂愁，憂愁會減半。", en: "Share joy and it doubles; share sorrow and it halves." },
  { zh: "擁有健康的身體與平靜的心靈，就是最大的財富。", en: "Having a healthy body and a peaceful mind is the greatest wealth." },
  { zh: "不要急於求成，美好的事物都需要時間灌溉。", en: "Do not rush for success; beautiful things require time to grow." },
  { zh: "幽默感是家庭關係的潤滑劑，多點笑聲，少點摩擦。", en: "Humor is the lubricant of family relations; more laughter, less friction." },
  { zh: "每個孩子都是獨一無二的種子，花期不同，用心靜待。", en: "Every child is a unique seed; their blooming times differ, wait patiently with care." },
  { zh: "傾聽的耳朵比說教的嘴巴，更能走進家人的心裡。", en: "A listening ear goes deeper into family members' hearts than a lecturing mouth." },
  { zh: "在慢下來的時光裡，重新發現生活的樂趣。", en: "In slowed down times, rediscover the joy of life." },
  { zh: "家人的支持，是我們面對外界風雨最強大的盾牌。", en: "Family support is our strongest shield when facing the storms of the outer world." },
  { zh: "朝著陽光走，陰影就會落在身後。", en: "Walk toward the sunshine, and shadows will fall behind you." },
  { zh: "每天發掘一個小小的確幸，生活就會充滿暖意。", en: "Discover a small certainty of happiness every day, and life will be full of warmth." },
  { zh: "家是愛的起點，也是愛永遠的歸宿。", en: "Home is where love begins, and where love belongs forever." }
];

async function run() {
  console.log("Starting adult proverbs table migration...");
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_adult_proverbs (
        id SERIAL PRIMARY KEY,
        content_zh VARCHAR(500) NOT NULL,
        content_en VARCHAR(500) NOT NULL
      );
    `);
    console.log("Successfully created daily_adult_proverbs table.");

    // 2. Clear and seed
    await pool.query("TRUNCATE TABLE daily_adult_proverbs RESTART IDENTITY;");
    
    const chunkSize = 50;
    for (let i = 0; i < proverbs.length; i += chunkSize) {
      const chunk = proverbs.slice(i, i + chunkSize);
      const valuePlaceholders = chunk.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(', ');
      const values = [];
      chunk.forEach(p => {
        values.push(p.zh, p.en);
      });
      
      await pool.query(
        `INSERT INTO daily_adult_proverbs (content_zh, content_en) VALUES ${valuePlaceholders}`,
        values
      );
    }
    
    const checkCount = await pool.query("SELECT COUNT(*) FROM daily_adult_proverbs;");
    console.log(`Successfully seeded ${checkCount.rows[0].count} adult proverbs into database.`);
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Database pool closed.");
  }
}

run();
