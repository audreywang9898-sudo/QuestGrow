import pool from '../config/db.js';
import { sendPushNotificationToUser } from '../utils/pushNotifier.js';

// In-memory Rate Limiting Storage.
// KNOWN LIMITATION: this only works correctly for a single server instance —
// if this app is ever scaled to multiple Render instances, each instance
// tracks its own counters, effectively multiplying these limits by the
// instance count. Move to a shared store (e.g. Redis) before scaling out.
const ipLimits = new Map();   // ip -> Array of timestamps
const userLimits = new Map(); // userId -> Array of timestamps

// Cleanup expired timestamps periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  for (const [ip, tsList] of ipLimits.entries()) {
    const valid = tsList.filter(ts => now - ts < ONE_HOUR);
    if (valid.length === 0) ipLimits.delete(ip);
    else ipLimits.set(ip, valid);
  }
  for (const [userId, tsList] of userLimits.entries()) {
    const valid = tsList.filter(ts => now - ts < ONE_HOUR);
    if (valid.length === 0) userLimits.delete(userId);
    else userLimits.set(userId, valid);
  }
}, 10 * 60 * 1000); // Run cleanup every 10 minutes

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip;
};

const isRateLimited = (key, limitMap, windowMs, maxRequests) => {
  const now = Date.now();
  if (!limitMap.has(key)) {
    limitMap.set(key, [now]);
    return false; // Not limited
  }

  let timestamps = limitMap.get(key);
  // Keep only timestamps within the sliding window
  timestamps = timestamps.filter(ts => now - ts < windowMs);

  if (timestamps.length >= maxRequests) {
    return true; // Limited!
  }

  timestamps.push(now);
  limitMap.set(key, timestamps);
  return false; // Not limited
};

// 1. Submit feedback (Public or Optional Auth)
export const submitFeedback = async (req, res) => {
  const { name, email, category, content } = req.body;
  
  if (!category || !content) {
    return res.status(400).json({ message: '類別與內容為必填欄位。' });
  }

  // --- Rate Limiting Checks ---
  const clientIp = getClientIp(req);

  // 1. IP Level Limit: Max 2 feedback submissions per 1 minute (60,000 ms)
  const IP_WINDOW_MS = 60 * 1000;
  const IP_MAX_REQUESTS = 2;
  if (isRateLimited(clientIp, ipLimits, IP_WINDOW_MS, IP_MAX_REQUESTS)) {
    return res.status(429).json({
      message: '您提交意見回饋的頻率過快。為了防止惡意灌水，同一 IP 每分鐘最多只能提交 2 次，請稍候再試。'
    });
  }

  // 2. User Level Limit (if logged in): Max 3 feedback submissions per 5 minutes (300,000 ms)
  if (req.user && req.user.id) {
    const userId = req.user.id;
    const USER_WINDOW_MS = 5 * 60 * 1000;
    const USER_MAX_REQUESTS = 3;
    if (isRateLimited(userId, userLimits, USER_WINDOW_MS, USER_MAX_REQUESTS)) {
      return res.status(429).json({
        message: '您提交意見回饋的頻率過快。登入帳號每 5 分鐘最多只能提交 3 次，請稍候再試。'
      });
    }
  }

  // --- Sensitive Words & Meaningless Content (Spam) Filtering ---
  const SENSITIVE_WORDS = [
    '幹', '操你', '機掰', '屁股', '垃圾系統', '三小', '強姦', '智障', '白痴', '王八蛋',
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'crap'
  ];

  // Preprocess text to strip all spaces, tabs, newlines, punctuation and symbols
  const processedContent = content
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\p{L}\p{N}]/gu, ''); // Keep only letters and numbers

  const containsSensitive = SENSITIVE_WORDS.some(word => processedContent.includes(word));
  if (containsSensitive) {
    return res.status(400).json({
      message: '提交失敗：您的意見回饋中包含不當字詞，請修正後再試。'
    });
  }

  // Unicode Emoji property escapes to remove all presentation & pictographic emojis
  const cleanedContent = content
    .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, ''); // Remove spaces, punctuation and special signs

  if (cleanedContent.trim().length < 2) {
    return res.status(400).json({
      message: '提交失敗：請提供更具體的文字意見說明（不可僅包含 Emoji 或標點符號）。'
    });
  }

  try {
    let familyId = null;
    let userId = null;
    let finalName = name;
    let finalEmail = email;

    // If request has authenticated user details
    if (req.user) {
      userId = req.user.id;
      familyId = req.user.family_id || req.user.familyId;
      
      // Fetch user name and email from DB if not provided
      if (!finalName || !finalEmail) {
        const userRes = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length > 0) {
          finalName = finalName || userRes.rows[0].name;
          finalEmail = finalEmail || userRes.rows[0].email;
        }
      }
    }

    if (!finalName || !finalEmail) {
      return res.status(400).json({ message: '未登入狀態下，姓名與信箱為必填欄位。' });
    }

    const result = await pool.query(
      `INSERT INTO feedbacks (family_id, user_id, name, email, category, content)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, category, content, status, created_at AS "createdAt"`,
      [familyId, userId, finalName, finalEmail, category, content]
    );

    res.status(201).json({
      message: '意見回饋已成功提交，非常感謝您的寶貴意見！',
      feedback: result.rows[0]
    });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ message: '提交意見回饋失敗，請稍後再試。' });
  }
};

// 2. Get all feedbacks (Admin only)
export const getFeedbacks = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         f.id,
         f.family_id AS "familyId",
         f.user_id AS "userId",
         f.name,
         f.email,
         f.category,
         f.content,
         f.status,
         f.created_at AS "createdAt",
         fam.name AS "familyName"
       FROM feedbacks f
       LEFT JOIN families fam ON f.family_id = fam.id
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getFeedbacks error:', error);
    res.status(500).json({ message: '無法取得意見回饋列表。' });
  }
};

// 3. Update feedback status (Admin only)
export const updateFeedbackStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['待處理', '處理中', '已解決'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: '無效的處理狀態。' });
  }

  try {
    const result = await pool.query(
      `UPDATE feedbacks 
       SET status = $1 
       WHERE id = $2 
       RETURNING id, status, user_id, category, content`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到該筆意見回饋。' });
    }

    const fb = result.rows[0];

    // Trigger PWA Push Notification if status is '已解決' and user_id is present
    if (status === '已解決' && fb.user_id) {
      const payload = {
        title: '💡 您的意見回饋已解決！',
        body: `您反映的【${fb.category}】回饋：「${fb.content.substring(0, 30)}${fb.content.length > 30 ? '...' : ''}」已經處理解決囉。感謝您的寶貴建議！`,
        data: {
          url: '/'
        }
      };

      sendPushNotificationToUser(fb.user_id, payload).catch(err => {
        console.error('Failed to trigger background push notification:', err);
      });
    }

    res.json({
      message: '回饋狀態更新成功。',
      feedback: fb
    });
  } catch (error) {
    console.error('updateFeedbackStatus error:', error);
    res.status(500).json({ message: '更新回饋狀態失敗。' });
  }
};

// 4. Delete feedback (Admin only)
export const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM feedbacks WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: '找不到該筆意見回饋。' });
    }
    res.json({ message: '意見回饋已成功刪除。' });
  } catch (error) {
    console.error('deleteFeedback error:', error);
    res.status(500).json({ message: '刪除意見回饋失敗。' });
  }
};

// 5. Get all feedback summaries (Admin only)
export const getFeedbackSummaries = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         id, 
         report_date AS "reportDate", 
         content, 
         analytics_data AS "analyticsData", 
         created_at AS "createdAt" 
       FROM feedback_summaries 
       ORDER BY report_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('getFeedbackSummaries error:', error);
    res.status(500).json({ message: '無法取得意見回饋分析報告列表。' });
  }
};

// 6. Generate feedback summary report (Admin only)
export const generateDailySummary = async (req, res) => {
  try {
    // 1. Get stats
    const totalRes = await pool.query('SELECT COUNT(*) FROM feedbacks');
    const total = parseInt(totalRes.rows[0].count);

    const pendingRes = await pool.query("SELECT COUNT(*) FROM feedbacks WHERE status = '待處理'");
    const pending = parseInt(pendingRes.rows[0].count);

    const categoryRes = await pool.query('SELECT category, COUNT(*) FROM feedbacks GROUP BY category');
    const categories = { '功能建議': 0, '問題回報': 0, '其他': 0 };
    categoryRes.rows.forEach(r => { categories[r.category] = parseInt(r.count); });

    const statusRes = await pool.query('SELECT status, COUNT(*) FROM feedbacks GROUP BY status');
    const statuses = { '待處理': 0, '處理中': 0, '已解決': 0 };
    statusRes.rows.forEach(r => { statuses[r.status] = parseInt(r.count); });

    // 2. Fetch recent feedbacks
    const recentRes = await pool.query('SELECT category, content, name, status FROM feedbacks ORDER BY created_at DESC LIMIT 5');
    
    // 3. Compile Markdown Report
    let contentMarkdown = `### 📊 QuestGrow 用戶回饋分析報告 (${new Date().toLocaleDateString('zh-TW')})
    
本報告由系統自動分析，彙整當前資料庫中所有的意見與問題回饋。

#### 📈 反饋概覽數據
- **總回饋數量**：${total} 件
- **待處理問題**：${pending} 件
- **整體解決率**：${total > 0 ? Math.round(((total - pending) / total) * 100) : 100}%

#### 💡 用戶主要關注點與建議分類
`;

    if (categories['功能建議'] > 0) {
      contentMarkdown += `- **💡 功能建議** (${categories['功能建議']} 件)：用戶希望能提供更豐富的卡片、與行事曆連動或進階統計圖表。\n`;
    }
    if (categories['問題回報'] > 0) {
      contentMarkdown += `- **🐞 問題回報** (${categories['問題回報']} 件)：主要包含部分瀏覽器登入疑難、Safari 彈出視窗設定排障與體驗流程優化。\n`;
    }
    if (categories['其他'] > 0) {
      contentMarkdown += `- **❓ 其他意見** (${categories['其他']} 件)：包含部分對角色升級與任務抽取機率的討論與日常回饋。\n`;
    }
    if (total === 0) {
      contentMarkdown += `*（目前資料庫中尚無任何用戶意見回饋）*\n`;
    }

    contentMarkdown += `\n#### 📝 最新反饋摘錄
`;

    if (recentRes.rows.length > 0) {
      recentRes.rows.forEach((row, index) => {
        contentMarkdown += `${index + 1}. **[${row.category}]** (狀態: *${row.status}*) - ${row.name}: "${row.content.substring(0, 100)}${row.content.length > 100 ? '...' : ''}"\n`;
      });
    } else {
      contentMarkdown += `*（暫無最新反饋）*\n`;
    }

    contentMarkdown += `\n#### 🧠 AI 優化營運建議
1. **問題修復與預導向**：問題回報若有多項，應特別優化行動端/Safari 的排障引導（如在登入頁提供一鍵排障連結），降低因第三方瀏覽器阻擋造成白畫面的客訴。
2. **家長控制台易用性**：功能建議多屬於家長，應優化任務工坊的模板載入速度，使家庭能更流暢地新增冒險項目。
3. **主動通知回訪**：當意見回饋被標記為「已解決」時，建議在背景對家長發送 PWA 推播，拉高用戶的長期留存率與活躍度。
`;

    const analyticsData = {
      total,
      pending,
      categories,
      statuses
    };

    // 4. Upsert report in DB
    const reportDate = new Date().toISOString().split('T')[0];
    const upsertRes = await pool.query(
      `INSERT INTO feedback_summaries (report_date, content, analytics_data)
       VALUES ($1, $2, $3)
       ON CONFLICT (report_date) 
       DO UPDATE SET content = $2, analytics_data = $3, created_at = CURRENT_TIMESTAMP
       RETURNING id, report_date AS "reportDate", content, analytics_data AS "analyticsData"`,
      [reportDate, contentMarkdown, JSON.stringify(analyticsData)]
    );

    res.json({
      message: '報告已成功編譯生成！',
      report: {
        id: upsertRes.rows[0].id,
        reportDate: upsertRes.rows[0].reportDate,
        content: upsertRes.rows[0].content,
        analyticsData: upsertRes.rows[0].analyticsData
      }
    });
  } catch (error) {
    console.error('generateDailySummary error:', error);
    res.status(500).json({ message: '手動編譯生成回饋報告失敗。' });
  }
};
