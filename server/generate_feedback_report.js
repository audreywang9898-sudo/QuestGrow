import pool from './config/db.js';
import fs from 'fs';
import path from 'path';

// Helper to categorize and recommend based on keywords
function getAIAnalysis(category, content) {
  const c = content.toLowerCase();
  let aiCategory = '一般意見';
  let severity = '低';
  let recommendation = '感謝用戶的回饋，我們將持續優化系統。';

  if (c.includes('慢') || c.includes('卡') || c.includes('延遲') || c.includes('當掉')) {
    aiCategory = '效能優化';
    severity = '中';
    recommendation = '建議評估前端渲染效能，對相關列表進行分頁載入（Pagination / Lazy Load）或使用 useMemo 緩存計算。';
  } else if (c.includes('錯') || c.includes('不能') || c.includes('bug') || c.includes('失敗') || c.includes('壞掉')) {
    aiCategory = '程式錯誤 (Bug)';
    severity = '高';
    recommendation = '請後端工程師檢查 API 錯誤日誌與資料庫約束，修復異常阻斷流程。';
  } else if (c.includes('想要') || c.includes('希望') || c.includes('新增') || c.includes('功能')) {
    aiCategory = '新功能需求';
    severity = '低';
    recommendation = '將此需求納入產品 backlog，後續評估開發優先級與時程。';
  } else if (c.includes('看不懂') || c.includes('介面') || c.includes('設計') || c.includes('難用') || c.includes('位置')) {
    aiCategory = '使用者體驗 (UX)';
    severity = '中';
    recommendation = '評估簡化操作步驟，改進磨砂玻璃與卡片版面佈局，提供清晰的引導教學。';
  }

  return { aiCategory, severity, recommendation };
}

async function run() {
  console.log('Generating 24-hour feedback report...');
  try {
    // 1. Fetch feedbacks from the database
    // We fetch feedbacks from the last 24 hours, but fall back to the most recent 10 if none in last 24h.
    const last24hRes = await pool.query(
      `SELECT id, family_id, name, email, category, content, status, created_at
       FROM feedbacks
       WHERE created_at >= NOW() - INTERVAL '24 HOURS'
       ORDER BY created_at DESC`
    );

    let feedbacks = last24hRes.rows;
    let isFallback = false;

    if (feedbacks.length === 0) {
      console.log('No feedbacks in the last 24 hours. Fetching recent feedbacks as fallback.');
      const recentRes = await pool.query(
        `SELECT id, family_id, name, email, category, content, status, created_at
         FROM feedbacks
         ORDER BY created_at DESC
         LIMIT 5`
      );
      feedbacks = recentRes.rows;
      isFallback = true;
    }

    // 2. Generate Markdown content
    let md = `# 📊 QuestGrow 意見回饋彙總報告 (24H)\n\n`;
    md += `*報告生成時間：${new Date().toLocaleString('zh-TW')}*\n`;
    md += `*篩選區間：最近 24 小時內新增的意見回饋 ${isFallback ? '（目前 24H 內無新回饋，顯示最近歷史回饋備查）' : ''}*\n\n`;

    if (feedbacks.length === 0) {
      md += `> [!NOTE]\n`;
      md += `> 資料庫中目前沒有任何使用者意見回饋。\n`;
    } else {
      // Statistics
      const totalCount = feedbacks.length;
      const resolvedCount = feedbacks.filter(f => f.status === '已解決').length;
      const pendingCount = feedbacks.filter(f => f.status === '待處理').length;
      const processingCount = feedbacks.filter(f => f.status === '處理中').length;

      md += `## 📈 數據概覽\n\n`;
      md += `| 指標 | 數值 | 備註 |\n`;
      md += `| --- | --- | --- |\n`;
      md += `| **回饋總量** | ${totalCount} 件 | 最近收集的意見回饋筆數 |\n`;
      md += `| **待處理** | ⏳ ${pendingCount} 件 | 需要管理員進行審閱與初步評估 |\n`;
      md += `| **處理中** | ⚙️ ${processingCount} 件 | 工程/設計團隊正在安排修復或優化 |\n`;
      md += `| **已解決** | ✅ ${resolvedCount} 件 | 已解決並已發送 PWA 推播通知家長 |\n\n`;

      md += `---\n\n`;
      md += `## 💬 詳細回饋清單與 AI 分析建議\n\n`;

      feedbacks.forEach((fb, index) => {
        const { aiCategory, severity, recommendation } = getAIAnalysis(fb.category, fb.content);
        const dateStr = new Date(fb.created_at).toLocaleString('zh-TW');

        md += `### ${index + 1}. 【${fb.category}】 - 提報者：${fb.name} (${fb.email})\n`;
        md += `- **建立時間**：\`${dateStr}\`\n`;
        md += `- **當前狀態**：\`${fb.status}\`\n`;
        md += `- **回饋內容**：\n`;
        md += `  > ${fb.content}\n\n`;
        
        md += `> **🤖 AI 診斷分析**\n`;
        md += `> - **分類標籤**：\`${aiCategory}\` | **優先級/嚴重度**：\`${severity}\`\n`;
        md += `> - **改善建議**：${recommendation}\n\n`;
        md += `---\n\n`;
      });
    }

    // 3. Write to artifacts path
    const artifactDir = 'C:/Users/missc/.gemini/antigravity-ide/brain/54f2561c-b4a5-48e2-82c2-8b94ec35b4c3';
    const filePath = path.join(artifactDir, 'feedback_report_24h.md');
    
    // Ensure directory exists
    if (!fs.existsSync(artifactDir)) {
      fs.mkdirSync(artifactDir, { recursive: true });
    }

    fs.writeFileSync(filePath, md, 'utf8');
    console.log(`Feedback report generated successfully at: ${filePath}`);

  } catch (err) {
    console.error('Error generating report:', err);
  } finally {
    await pool.end();
  }
}

run();
