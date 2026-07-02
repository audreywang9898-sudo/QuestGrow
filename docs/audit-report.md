# QuestGrow 資料庫效率 + 資安全面體檢報告

- **稽核日期**：2026-07-02
- **稽核範圍**：`server/`（Express API）、`src/`（React 前端）、`schema.sql`
- **稽核方式**：唯讀原始碼盤點，**未修改任何程式碼**。本報告由人工逐檔案審閱 + 三個獨立子代理交叉比對完成，所有發現皆附檔案與行號依據。
- **產品背景**：親子任務遊戲化平台，使用者含 6～14 歲兒童，家長以 Google/LINE OAuth 登入，目前部署於 Render Beta 環境。**兒童個資與帳號安全問題一律以最高標準檢視。**

> ⚠️ 本報告僅為盤點與建議，尚未進行任何修改。請逐項核准後，再個別處理。

---

## 第一步：技術棧與資料流盤點

### 1. 技術棧總覽

| 項目 | 內容 |
|---|---|
| 後端框架 | Node.js + Express 4（ESM 模組），`server/index.js` 為進入點 |
| 資料庫 | **PostgreSQL**（關聯式 SQL），非 NoSQL、非檔案式 |
| 資料存取方式 | **原生 `pg`（node-postgres）Pool + 手寫 SQL 字串**，**沒有使用任何 ORM**（非 Prisma/Sequelize/TypeORM）。所有查詢在 `server/controllers/*.js` 中直接呼叫 `pool.query()`/`client.query()` |
| 前端框架 | React 18 + Vite，無 React Router（`src/App.jsx` 以 state 切換 `LoginPortal`/`ParentPortal`/`KidPortal`/`AdminPortal` 四個巨型元件） |
| 認證 | JWT（`jsonwebtoken`，7 天效期）＋ `bcryptjs` 密碼雜湊 ＋ Google OAuth（`google-auth-library`）＋ LINE Login（`@line/bot-sdk`） |
| 部署 | Render（後端 Web Service，root=`server/`；前端 Static Site，發布 `dist/`），流程記載於 `DEPLOYMENT.md` |
| 環境變數管理 | 純 `.env` 檔（根目錄 + `server/.env`，已列入 `.gitignore`，未提交版控），**沒有使用 Secret Manager/Vault 等集中式機密管理服務** |
| 快取層 | **無**（全庫掃描 `redis`/`node-cache`/`memoize` 皆無結果，見第 4 節） |
| 檔案上傳 | **無**（`multer`/`formidable` 等套件皆未安裝，任務佐證照片實際上是字串欄位，見第 9 節） |
| 測試框架 | **無**（無 Jest/Vitest），`server/test_*.js` 為直接連正式/開發資料庫執行的手動腳本 |
| Migration 機制 | **無框架**，`server/*_migration.js` 為個別手寫腳本，`run_all_migrations.js` 依序執行；`schema.sql` 已與正式環境有落差（見第 5 節） |

### 2. 主要資料流程圖

```
① 登入
LoginPortal.jsx → api.js → POST /api/auth/{login|google|line}
  → authController.js
    - 密碼登入：查 users 表 + bcrypt.compareSync
    - Google：google-auth-library 驗證 idToken 簽章/audience → 查/建 users, families, children
    - LINE：後端以 code 向 LINE 換 token → jwt.decode()（未驗簽）→ 查/建 users, families
  → 簽發 JWT（7天，內含 id/email/role/family_id/child_id）→ 存於瀏覽器 localStorage
  → App.jsx 掛載後續發 ~13 支序列 API（GET /auth/me、/family、/family/leaderboard、
     /users/children、/tasks、/items/inventory、/family/goals、/family/wishlist、
     /items/redeem-logs、/family/weekly-comp、/family/event-logs、/proverbs ×2）
    → 觸及資料表：users, families, children, tasks, inventory, parent_goals,
      wishlist, redeem_logs, weekly_competition, event_logs, daily_proverbs

② 任務指派／抽取
家長：ParentPortal → POST /api/tasks（addTask）→ tasks 表 INSERT（可批次）
小孩：KidPortal 自建任務／抽取每日任務池（前端從 mockData.js 的 TASK_TEMPLATES 隨機挑選，
      非資料庫驅動，見第 5 節）→ POST /api/tasks → tasks 表 INSERT

③ 小孩完成並送出審核
KidPortal → POST /api/tasks/:id/submit（submitTask）
  → tasks.status='待覆核', tasks.submission（JSONB：notes + photo）
  → 產生一次性 line_review_token，透過 LINE Bot 推播通知家長（server/utils/lineBot.js）
  ⚠ 目前未驗證送出者是否為該任務的 assigned_to 本人（見第 7 節 Critical #2）

④ 家長審核
ParentPortal → POST /api/tasks/:id/review（reviewTask，parent-only）
  或 家長直接在 LINE 訊息點按鈕 → LINE Webhook → lineBotController.js（驗證簽章＋一次性 token）
  → approve：UPDATE children（exp/level/gold/tickets/attributes）、
             UPDATE families.growth_score、UPDATE tasks.status='已完成'
  → reject：UPDATE tasks.status='進行中' + rejection_reason

⑤ 抽卡獎勵
KidPortal（前端以 Math.random() 決定稀有度與卡片，見第 7 節 Critical #1）
  → POST /api/items/gacha（drawGachaCard）
  → 檢查 type/rarity 是否在允許清單、資源卡數值上限、7天內重複冷卻
  → INSERT inventory、UPDATE children.tickets（⚠ 無鎖，見第 7 節 Critical #4）
核銷：POST /inventory/:id/redeem-request（狀態→待核銷）
     → 家長 POST /inventory/:id/redeem-review（approve）
     → UPDATE inventory.status='已使用'、INSERT redeem_logs、UPDATE families.growth_score+50

⑥ 成長報告 / 排行榜
FamilyLeaderboardView.jsx → GET /api/family/leaderboard
  → SELECT 全平台所有 families ORDER BY growth_score（無 family_id 篩選，見第 4、8 節）
AdminPortal → GET /api/admin/stats（getAdminStats）
  → JOIN users/families/children/event_logs 全表彙總（無分頁）
weekly_competition 表由外部/手動流程寫入（未在 API 中找到自動產生的排程工作）
```

---

## 第二步：資料庫讀取效率體檢

### 3. N+1 查詢問題

**`server/controllers/taskController.js:148-225`（`addTask` 批次指派任務）**
在 `for (const task of tasksData)` 迴圈中，只要任務有指派對象（`dbAssignedTo`），每筆任務都各自發一次 30 天內重複完成的檢查查詢（第 171-184 行），再各自執行一次 `INSERT`（第 189-200 行）。若家長一次匯入 10～20 筆任務範本，等於 2N 次序列化查詢包在同一個交易內。

- **影響**：批次量越大、資料庫延遲越高，交易持有連線的時間越長。
- **建議修法**：把冷卻檢查改成 `WHERE assigned_to = ANY($1) AND status='已完成' AND completed_at >= NOW() - INTERVAL '30 days'` 一次查完，並改用多列 `INSERT ... VALUES (...),(...),(...)` 一次寫入。

其餘 controller（`adminController.js`、`feedbackController.js`、`familyController.js`、`userController.js`）皆用單一 JOIN/彙總查詢，未發現迴圈內查詢的典型 N+1。

### 4. 高頻讀取路徑檢查

**（a）每日任務載入 — `server/controllers/taskController.js:27-71`（`getTasks`）**
```sql
SELECT ... FROM tasks WHERE family_id = $1 ORDER BY created_at DESC   -- 無 LIMIT
```
- `tasks.family_id` **完全沒有索引**（`schema.sql` 全文除主鍵與 2 個 UNIQUE 外無任何 `CREATE INDEX`）。
- 沒有依日期/狀態篩選、**沒有 LIMIT**，每次載入會撈出該家庭史上所有任務（含已完成/已退回的歷史），且找不到任何排程工作會封存或清除舊任務。
- **修法**：`CREATE INDEX idx_tasks_family_id_created ON tasks(family_id, created_at DESC)`；「當前任務」與「歷史任務」拆成不同、有分頁的端點。

**（b）排行榜 — `server/controllers/familyController.js:473-489`（`getFamilyLeaderboard`）**
```sql
SELECT id, name, family_nickname, growth_score FROM families ORDER BY growth_score DESC LIMIT 10
```
- **無 `WHERE` 條件**，每次呼叫都掃描並排序**全平台所有家庭**，而非只查自己家庭。`App.jsx` 在每個使用者的每次登入都會呼叫這支 API — 隨著平台家庭數增加，**所有人的登入速度都會被拖慢**，是本次體檢影響面最廣的單一查詢。
- `growth_score` 無索引；leaderboard 本質上不需要即時，卻完全沒有快取。
- **修法**：`CREATE INDEX idx_families_growth_score ON families(growth_score DESC)`，並將 Top 10 結果快取 1～5 分鐘。

**（c）背包道具載入 — `server/controllers/itemController.js:18-68`（`getInventory`）**
- 小孩路徑：`WHERE child_id = $1 ORDER BY date_acquired DESC`（第 32 行）— `inventory.child_id` 無索引，無 LIMIT。
- 家長路徑：`inventory → children → users` 兩層 JOIN 篩 `users.family_id`（第 36-43 行）— `children.user_id`、`users.family_id` 皆無索引。
- 同樣的未索引 `child_id` 篩選也用在**每次抽卡**的 7 天冷卻檢查（`itemController.js:180-185`），是高頻小孩操作。
- **修法**：`CREATE INDEX idx_inventory_child_id ON inventory(child_id, date_acquired DESC)`；再加 `idx_children_user_id`、`idx_users_family_id` — 這兩個索引會同時加速全站幾乎所有的 JOIN。

**快取現況：全站零快取。** 全庫搜尋 `redis|node-cache|memoize|cache` 沒有任何應用層快取（只有 `public/sw.js` 的瀏覽器 Service Worker 快取與無關的文件字串）。兩個明顯適合快取卻完全沒做的例子：
- `server/controllers/proverbController.js:36-61`（`getDailyProverb`）：每次呼叫都跑 2 條查詢（`COUNT(*)` + `SELECT ... WHERE id=$1`），但每日一句的內容一天只變一次。`App.jsx` 每次載入會呼叫 2 次（小孩版 + 家長版）= 每次 session 開啟就是 4 條查詢查同樣的內容。
- 上述（b）排行榜。

**`SELECT *` 撈全欄位後只用少數欄位**：`itemController.js:460`（`toggleEquipItem`）、`taskController.js:517`（`reviewTask`）皆為 `SELECT * FROM ... WHERE id=$1` 但只用到 2-4 欄，屬於可優化但非急迫的浪費。

### 5. 任務庫 / 獎勵庫（100+ 任務、30+ 獎勵）載入方式

**結論：目前並非以資料庫為主的正式資料表在驅動，而是前端硬編碼常數 `src/utils/mockData.js`（`TASK_TEMPLATES`、`GACHA_POOL`），且與資安問題直接相關：**

- `TASK_TEMPLATES` 供 `ParentPortal.jsx`「任務工作坊」UI 與小孩自建任務使用；`GACHA_POOL`（或 `families.gacha_pool` 覆寫版）供 `KidPortal.jsx` 呈現轉蛋機率與卡片內容。這些**不是每次請求重新查資料庫**，而是隨前端 bundle 一起下載的靜態 JS，效率上沒問題，但代表：
  - `addTask`（`taskController.js:149-200`）直接信任 `req.body` 傳來的 `expReward`/`goldReward`/`ticketReward` 等數值，**沒有對照任何資料庫端的權威範本表做驗證**，只做必填/長度檢查（見第 9、10 節）。
  - `families.gacha_pool` 是資料庫中**唯一**與獎勵池相關的資料表欄位（每次抽卡讀一次，`itemController.js:170-173`），但抽卡結果的挑選邏輯本身在**前端**執行（見第 7 節 Critical #1），資料庫端只做部分事後檢查。
- **`schema.sql` 已與正式環境不同步**：程式碼中實際使用的 `family_nickname`、`gacha_pool`、`settings`、`line_id`、`line_review_token`、`reviewed_at`、`redeemed_at`、`onboarding_completed` 等欄位都**不在** `schema.sql` 中，代表這些變更是透過個別 migration 腳本直接施作在正式資料庫，未回寫更新 `schema.sql`。這會讓新環境依 `schema.sql` 建置時缺欄位，也讓稽核/新人難以掌握真實 schema。**建議：定期用 `pg_dump --schema-only` 重新產生 `schema.sql`，或改用具版本控制的 migration 工具。**

### 6. Top 5 效率問題（影響 × 修改成本排序）

| 順位 | 問題 | 影響 | 成本 | 理由 |
|---|---|---|---|---|
| 1 | **補齊索引**：`tasks.family_id`、`inventory.child_id`、`children.user_id`、`users.family_id`、`families.growth_score` | 高 | 極低 | `schema.sql` 目前除主鍵/UNIQUE 外零索引；純 `CREATE INDEX`，零程式碼變更、零風險，同時加速本報告列出的幾乎所有熱路徑查詢。CP 值最高。 |
| 2 | **快取排行榜與每日一句** | 高（隨家庭數增長持續惡化） | 低 | 排行榜掃描全平台、每日一句一天只變一次卻查 4 次/session，皆為讀多寫少、可放心用行程內快取（不需引入 Redis）。 |
| 3 | **`getTasks`／`getInventory`／`getRedeemLogs` 加分頁與上限＋任務歷史封存** | 高（隨帳齡持續惡化，最可能造成正式環境效能事故） | 中 | 是核心高頻端點，且完全沒有筆數上限與封存機制；需前後端協同（分頁 UI、界定「當前」vs「歷史」），故排在純資料庫端修法之後。 |
| 4 | **修正 `addTask` 批次指派的 N+1 查詢** | 中（目前批次量小，功能擴大後會放大） | 中 | 屬於明確可理解的重構（合併查詢＋多列 INSERT），範圍侷限在單一函式。 |
| 5 | **`App.jsx` 的 `fetchAllData` 序列 API 呼叫改用 `Promise.all`** | 中～高（放大以上所有修法的效益） | 極低 | 純前端修改、無資料庫風險，~13 支互不依賴的 API 目前逐一等待、應併發呼叫，是最低成本的立即改善。 |

---

## 第三步：資安結構體檢

> 本節特別嚴格檢視，因涉及兒童個資與帳號安全。以下依「認證授權」「資料保護」「常見漏洞掃描」分節列出，第 10 節再彙整成完整分級清單。

### 7. 認證與授權

**Google OAuth 實作正確。** `server/controllers/authController.js:12-18`：
```js
const verifyGoogleToken = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  return ticket.getPayload();
};
```
正確驗證簽章與 `audience`，`googleLogin`（第 203 行）、`linkGoogleAccount`（第 337 行）皆正確呼叫。JWT 也有設定 7 天效期（`generateToken`，第 20-32 行），並非永久有效。

**🔴 Critical #1 — 轉蛋抽卡結果完全由前端決定，伺服器未驗證卡片真偽**
- `src/components/KidPortal.jsx:1219-1280`（`startDrawCard`）：稀有度與卡片皆由瀏覽器端 `Math.random()` 決定（第 1228-1259 行），再把「已抽到的卡片物件」透過 `onDrawCard(cardSelected, 1)`（第 1271 行）送給後端。
- `server/controllers/itemController.js:100-280`（`drawGachaCard`）只驗證 `card.type`/`card.rarity` 是否在允許清單內（第 119-127 行）、資源卡數值上限（第 130-148 行）、7 天冷卻（第 169-195 行），**從未檢查 `card.id`/`card.name` 是否真的存在於 `familyGachaPool[card.rarity].cards` 中**，即第 177 行建立的 `rarityCardIds` 只用在冷卻比對，未當作白名單使用。
- **可被利用情境**：用瀏覽器開發者工具直接呼叫 `POST /api/items/gacha`，帶入自行捏造的卡片物件（例：`{ "id":"x","name":"自訂神卡","type":"收藏卡","rarity":"Mythic","desc":"..." }`），即可用最低票券成本取得任意稀有度、任意名稱的卡片，完全繞過家長在 `updateFamilyGachaPool` 設定的機率與內容。
- **建議修法**：把「依機率挑選稀有度與卡片」的邏輯整個搬到伺服器端（依 `familyGachaPool`/`GACHA_POOL` 用伺服器亂數決定），前端只送出 `costTickets`（甚至不用送），改由伺服器回傳抽到的卡片。永遠不要信任前端傳來的 `card` 物件內容直接寫入 `inventory`。

**🔴 Critical #2 — 任務送出審核未檢查是否為指派對象本人，獎勵可被冒領**
- `server/controllers/taskController.js:435-443`（`submitTask`）：
  ```js
  const verifyTask = await pool.query(
    'SELECT id FROM tasks WHERE id = $1 AND family_id = $2', [taskId, familyId]
  );
  ```
  只檢查任務是否屬於同一家庭，**從未檢查 `assigned_to` 是否等於送出者的 `req.user.child_id`**。
- 更嚴重的是，`reviewTask`（`taskController.js:531`）決定獎勵歸屬的邏輯是：
  ```js
  const childId = task.submission?.childId || task.assigned_to;
  ```
  而 `submission.childId`（第 448 行）正是**送出任務的那個小孩自己**填入的，優先權還高於 `assigned_to`。
- **可被利用情境**：任一小孩帳號都能讀到全家任務清單（`GET /api/tasks`），只要對兄弟姊妹的任務 id 或未指派的「共用任務」呼叫 `POST /api/tasks/:id/submit`（可自行捏造 notes/photo），家長在正常審核流程中點下「核准」時，獎勵就會悄悄發給送出者而非原本指派的孩子。
- **建議修法**：`submitTask` 查詢需改為 `WHERE id=$1 AND family_id=$2 AND (assigned_to=$3 OR assigned_to IS NULL)`；且 `reviewTask` 發放獎勵時一律以 `task.assigned_to` 為準，不可再參考攻擊者可控的 `submission.childId`。

**🔴 Critical #3 — 正式環境的流量限制（Rate Limiting）可能完全失效**
- `server/index.js:72,82`：`authLimiter`/`generalLimiter` 皆設定 `skip: () => process.env.NODE_ENV !== 'production'`，也就是**只有在 `NODE_ENV` 精確等於 `'production'` 時才會生效**。
- `DEPLOYMENT.md:55-59` 列出的 Render 後端環境變數清單為 `DATABASE_URL`、`JWT_SECRET`、`PORT`、`GOOGLE_CLIENT_ID`，**沒有 `NODE_ENV`**；repo 中也沒有 `render.yaml`/`Procfile` 會自動帶入。Render 對一般 Node Web Service **不會**自動注入 `NODE_ENV=production`。
- **結果**：若正式站是照 `DEPLOYMENT.md` 的指示部署，`/api/auth/login`（暴力破解密碼）、`/api/items/gacha`（刷抽卡/刷經濟）等所有 `/api/*` 端點目前**極可能完全沒有流量限制**。
- **建議修法**：立即在 Render 後端服務的環境變數新增 `NODE_ENV=production`（並補進 `DEPLOYMENT.md`），長期建議把 `skip` 邏輯反過來（預設開啟限流，只有明確設定 `DISABLE_RATE_LIMIT=true` 才關閉），避免同類部署疏漏再次讓防護「寫了但沒生效」。

**🔴 Critical #4 — 抽卡券／金幣兌換存在競爭條件（Race Condition），可被平行請求刷道具**
- `server/controllers/itemController.js:151-234`（`drawGachaCard`）：先 `SELECT ... tickets`（第 156-159 行，**無 `FOR UPDATE` 鎖**），JS 端算出 `newTickets = child.tickets - safeCost`（第 198 行），再用絕對值 `SET tickets = $1`（第 229-234 行）寫回。在 PostgreSQL 預設的 READ COMMITTED 隔離等級下，同一小孩同時發出多個請求會各自讀到相同的起始票數、各自通過餘額檢查、各自寫回自己算出的（過期）數值，且**每個請求仍各自發放一張卡片** — 相當於花一次票券的錢抽多次卡。
- `itemController.js:533-559`（`buyTicketWithGold`）也是同樣的「先讀、JS 算、絕對值寫回」模式，同樣可用平行請求少花金幣換多張票券。
- 對照之下，`taskController.js:590-597`（`reviewTask` 核准）金幣/票券欄位是用 SQL 原子遞增（`gold = gold + $4`）寫法，此類寫法才是安全的（但該端點僅限家長角色，風險本就較低）。
- **建議修法**：在兩個交易內對 `children` 該列加 `SELECT ... FOR UPDATE`，或改用單一原子語句 `UPDATE children SET tickets = tickets - $1 WHERE id=$2 AND tickets >= $1 RETURNING tickets`（不再「先讀後寫」）。並針對 `/api/items/gacha`、`/api/items/buy-ticket` 這類會消耗虛擬貨幣的端點，額外加上更嚴格的單獨限流（例如每分鐘 10-20 次）。

**其餘授權檢查結果（多數為良好實作，逐一列出以利核對）**：
- `taskRoutes.js`：任務審核 `POST /:taskId/review` 有 `requireRole('parent')`，小孩帳號在路由層即被擋下，家庭範圍查詢正確 — **無問題**。
- `familyRoutes.js`/`userRoutes.js`：家庭願望清單、家長目標、事件日誌、新增/刪除小孩與家長等端點皆正確以 `req.user.family_id` 限定範圍，未發現跨家庭資料外洩 — **無問題**，唯一例外是排行榜（見下方 Medium 區）。
- `updateChildProfile`（`userController.js:168-300`）雖然路由層沒有加 `requireRole`，但 controller 內手動實作了完整防呆：小孩只能改自己的資料（第 177-180 行），且會過濾掉 `gold`/`level`/`exp` 等禁止欄位（第 182-183 行）— **無漏洞**，但建議仍在路由層補上 `requireRole('parent','kid')` 以利閱讀與縱深防禦。
- **管理員（admin）角色沒有任何 API 路徑可以建立或升級**：`registerParent`/`googleLogin`（白名單 `['parent','kid']`）/`lineLogin` 皆寫死角色，唯一設定 `role='admin'` 的地方是 `server/admin_migration.js`（需直接對資料庫執行的獨立腳本，非 HTTP 端點）— **無漏洞**。
- LINE Webhook（`lineBotController.js`）在處理審核 postback 前會驗證 `X-Line-Signature`（第 23 行）、比對一次性 `line_review_token`、並以 `pu.line_id = parentLineId` 限定同一家庭 — **無跨家庭問題**（僅 `approveTask` 第一組 JOIN 條件 `u.family_id = c.user_id` 寫錯導致必定落到備援查詢，屬程式碼品質瑕疵，非資安漏洞，見第 10 節「低」）。

**🟡 Medium — 其他授權/認證相關發現**：
- **JWT 無撤銷機制**（`authController.js:20-32`）：登出（`src/utils/api.js` 的 `logout()`）僅是前端清除 `localStorage`，伺服器沒有 token 版本號/黑名單機制。已簽出的 token 在 7 天內即使「登出」或家長改密碼後仍然有效；且 token 存於 `localStorage`（而非 httpOnly cookie），是較容易被 XSS 竊取的儲存位置，對兒童常見的共用裝置情境風險更高。
- **`ALLOW_GOOGLE_MOCK` 測試後門仍在正式版程式碼中**（`authController.js:186-212, 329-344`）：目前 `server/.env` 未設定此變數（已確認為關閉狀態），但程式碼本身仍會在部署環境誤設 `ALLOW_GOOGLE_MOCK=true` 時，允許任何人以指定的測試帳號名稱免密碼登入。建議將此路徑整個移出正式建置（用編譯期開關），而非僅靠環境變數旗標防呆。
- **LINE ID Token 僅用 `jwt.decode()` 解析，未驗證簽章/aud/iss**（`authController.js:459, 598`）。因為 `id_token` 是伺服器直接向 LINE 的 token endpoint 用 `client_secret` 換來的（而非前端直接把 token 丟給後端），風險比 Google 流程低，但仍建議依 LINE OIDC 規範驗證 `aud`/`iss`/`exp`，屬縱深防禦。
- **願望清單兌換（`redeemWishlist`）沒有家長審核關卡**（`familyRoutes.js:22`、`familyController.js:146-194`）：小孩可以單方面把全家的成長積分兌換掉願望項目，與抽卡核銷（`reviewRedeem`）、任務審核（`reviewTask`）皆需家長審核的模式不一致。若非刻意設計，建議加上審核流程或「需家長核准」旗標。
- **排行榜跨家庭資料外洩**（`familyController.js:473-489`）：任何已登入使用者（含小孩）可看到全平台 Top 10 家庭的 `name`（預設為「`{家長姓名}的家庭`」）、`family_nickname`、`growth_score`。若家庭尚未設定暱稱，會直接洩漏其他家長的真實姓名衍生字串給陌生家庭。建議排行榜一律只顯示 `family_nickname`（未設定則顯示匿名代稱），不要顯示 `name`。

### 8. 資料保護

- **兒童個資（姓名、年齡、生日）明碼儲存，未加密**：`schema.sql:44-56`，`children` 表的 `name`/`age`/`birthday` 皆為一般 `VARCHAR`/`INT`，僅 `password_hash` 有經過雜湊。對 6-14 歲兒童資料的應用而言，屬 **中風險**；建議至少對 `birthday`（精確生日屬敏感度較高的個資）在應用層加密，或明確記錄「保護完全依賴資料庫存取控管與傳輸加密」的風險決策。
- **連線字串／金鑰管理**：`DATABASE_URL`、`JWT_SECRET`、`GOOGLE_CLIENT_ID`、`VAPID_*`、`LINE_*` 皆透過 `.env`／`server/.env` 讀取（已列入 `.gitignore`，確認未提交版控），**程式碼中沒有找到寫死的連線字串或金鑰**。唯一的缺口是這些機密沒有集中式管理（如 Render 的 Environment Groups 或 Vault），純靠檔案存放，人為疏漏風險（如第 7 節 Critical #3 的 `NODE_ENV`、`ALLOWED_ORIGINS` 未列入部署文件）已實際發生。
- **敏感資料寫入 log**：整體乾淨。掃描 `server/controllers/*.js`、`server/middleware/*.js`、`server/utils/*.js` 的 `console.log/error/warn`，絕大多數只印 `Error` 物件本身（訊息＋堆疊），沒有找到整包 `req.body`、密碼、JWT 明文被印出的情況。`lineBotController.js:17-21` 在 webhook 除錯時會印出簽章與前 200 字元的 raw body，屬除錯用途留在正式碼中，建議正式環境降低日誌詳細度或改用可調式的 log level。
- **密碼雜湊**：`bcryptjs` + `genSaltSync(10)`，鹽值輪數為業界建議標準，註冊/登入/改密碼流程皆正確使用 `hashSync`/`compareSync` — **實作正確，無問題**。
- **傳輸加密（HTTPS）**：`server/index.js` 的 `helmet()` 設定沒有停用 HSTS，預設的 `strict-transport-security` header 仍會送出；但**應用程式本身沒有寫任何 HTTP→HTTPS 強制轉址邏輯**，完全依賴 Render 平台層是否對該服務/自訂網域自動處理。建議明確確認 Render 上該服務（尤其若日後掛自訂網域）確實有開啟強制 HTTPS。

### 9. 常見漏洞掃描

**（1）SQL Injection — 結論：整體安全。**
掃描 `server/` 內 104 處 `pool.query()`/`client.query()` 呼叫，**幾乎全數使用參數化查詢（`$1, $2, ...`）**，沒有發現把使用者輸入的「值」直接字串拼接進 SQL 的案例。
- 唯一使用字串樣板插入「欄位/表名」的地方：`server/controllers/proverbController.js:36,59,66`（`` `SELECT COUNT(*) FROM ${tableName}` ``）與 `taskController.js`/`userController.js` 的動態 `UPDATE ... SET` 組裝器 —— 但這些位置的變數皆只能來自**寫死的白名單**（如 `tableName` 只會是 `'daily_proverbs'` 或 `'daily_adult_proverbs'` 兩者之一），並非直接帶入攻擊者輸入，**目前不可利用**。仍建議改成明確的物件對照表寫法，讓「安全的原因」在程式碼中一目了然，避免未來修改時不慎破壞這個前提。

**（2）XSS — 結論：未發現漏洞。**
- 全庫搜尋 `dangerouslySetInnerHTML`/`eval(` 於 `src/` 下**零筆命中**。僅有的 2 處 `innerHTML = ""` 只是在渲染 Google 官方登入按鈕前清空容器，未賦值任何不可信字串。
- 任務名稱/描述（含 AI 生成內容）透過 `renderTextWithZhuyin()`（`KidPortal.jsx:106-281`）輸出為一般 JSX `<span>` 子元素，由 React 自動跳脫。
- 小孩送出的 `submission.notes` 在 `ParentPortal.jsx:2011` 以純 JSX 文字子節點渲染 — 安全。
- `submission.photo` 在 `ParentPortal.jsx:2014, 2282` 是綁定在 `<img src={...}>` 屬性，非 `innerHTML`，即使字串內容惡意也無法執行腳本。
- 全庫沒有安裝任何 HTML 消毒套件（`dompurify`/`xss` 等），目前也**不需要**，因為沒有任何地方把不可信字串當 HTML 渲染。

**（3）任務佐證照片：檔案型別驗證、大小限制、存取權限**
- **並非真正的檔案上傳**：全庫搜尋 `multer`/`formidable`/`upload.single`/`multipart` 皆為零筆，沒有任何檔案落地伺服器磁碟或雲端儲存服務。`submission.photo` 是儲存在 `tasks.submission` JSONB 欄位中的**字串**。
- **小孩正式送出審核的路徑（`POST /api/tasks/:id/submit`，`taskController.js:420-432`）已有妥善防護**：以正規表示式驗證必須是 `data:image/(png|jpeg|jpg);base64,` 開頭的 base64 圖片，並限制長度對應原始檔案約 5MB 以內（超過 7MB base64 長度即拒絕）— 這部分實作良好。
- **但同一欄位若透過家長可用的通用編輯端點寫入（`PUT /api/tasks/:id`，`editTask`，`taskController.js:326,339`）則完全沒有格式檢查** — `submission` 欄位只是被泛用的欄位對照表直接 `JSON.stringify()` 寫入，未套用 `submitTask` 的 base64 驗證。由於此路徑僅限家長角色（`requireRole('parent')`），風險低於小孩可觸及的端點，但仍屬**同一欄位兩套不一致防護邏輯**的設計瑕疵，且早期 `schema.sql` 的種子資料（第 190 行）也顯示 `photo` 欄位歷史上曾直接存外部 URL（如 unsplash 連結）。
- **不存在「猜網址看到別家孩子照片」的風險**：因為沒有 `/api/photos/:id` 這類以可猜測 ID 提供檔案的端點，照片內容本身封裝在既有的、已依家庭/任務所有權授權過的 `tasks` 資料列中。
- **殘留風險（低）**：因為 `editTask` 路徑未驗證格式，理論上可寫入任意字串（含任意網址）；若之後在 `ParentPortal` 用 `<img src=...>` 渲染，家長瀏覽器會對該網址發出真實請求，可能被用來當作追蹤像素外洩家長的 IP/瀏覽器資訊（屬被動、非伺服器端 SSRF）。建議 `editTask` 對 `submission.photo` 套用與 `submitTask` 相同的驗證，或改為唯讀（審核端點不應允許家長任意竄改小孩的提交內容）。

**（4）API Rate Limiting（防刷抽卡、刷金幣）**
- 詳見第 7 節 Critical #3（`NODE_ENV` 未設定導致全域限流可能失效）與 Critical #4（`drawGachaCard`/`buyTicketWithGold` 的競爭條件）。
- 除全域 `generalLimiter`（500 次/15分鐘/IP）外，`/api/items/gacha`、`/api/items/buy-ticket` 等消耗虛擬貨幣的端點**沒有任何單獨限流**。

**（5）CORS**
- `server/index.js:47-64`：未設定 `ALLOWED_ORIGINS` 環境變數時，CORS 會**允許任意來源**且 `credentials: true`。`DEPLOYMENT.md:55-59` 的 Render 環境變數清單同樣**沒有列出 `ALLOWED_ORIGINS`**，與 Critical #3 的 `NODE_ENV` 是同一個根因（部署文件未涵蓋程式碼支援的安全性環境變數）。由於 JWT 存於 `localStorage` 而非 cookie，`credentials: true` 的實際影響較有限，但開放式 CORS 仍會削弱防止跨網域資料蒐集/重放的縱深防禦層。建議在 `DEPLOYMENT.md` 的環境變數清單中一併補上 `NODE_ENV=production` 與 `ALLOWED_ORIGINS=https://<正式前端網域>`。

### 10. 完整分級清單

#### 【嚴重－立即修】

| # | 問題 | 位置 |
|---|---|---|
| C1 | 轉蛋抽卡結果由前端 `Math.random()` 決定，伺服器未驗證卡片是否存在於獎池 → 可偽造任意稀有度/內容的卡片 | `src/components/KidPortal.jsx:1219-1280`；`server/controllers/itemController.js:100-280` |
| C2 | 任務送出未檢查是否為指派對象本人，獎勵可被冒領 | `server/controllers/taskController.js:435-443, 448, 531` |
| C3 | Rate limiting 因 `NODE_ENV` 未在部署文件中設定，正式站極可能完全失效（含登入暴力破解、經濟系統刷取） | `server/index.js:72,82`；`DEPLOYMENT.md:55-59` |
| C4 | 抽卡券／金幣兌換存在競爭條件，可用平行請求刷道具/票券 | `server/controllers/itemController.js:151-234, 533-559` |

#### 【高－一週內】

| # | 問題 | 位置 |
|---|---|---|
| H1 | 家長/小孩自建任務的獎勵數值（exp/gold/ticket）無伺服器端上限驗證 | `server/controllers/taskController.js:149-200` |
| H2 | CORS 預設完全開放（含 `credentials:true`），部署文件未指示設定 `ALLOWED_ORIGINS` | `server/index.js:47-64`；`DEPLOYMENT.md:55-59` |
| H3 | 資料庫除主鍵/UNIQUE 外零索引，`tasks`/`inventory`/`children`/`users` 等高頻查詢皆為全表掃描 | `schema.sql` 全文；`taskController.js:31-37`；`itemController.js:29-43` |
| H4 | 全平台排行榜查詢無索引、掃描所有家庭、且可能洩漏其他家庭家長真實姓名衍生字串 | `server/controllers/familyController.js:473-489` |

#### 【中－排入計畫】

| # | 問題 | 位置 |
|---|---|---|
| M1 | JWT 無撤銷機制，7 天內登出/改密碼後舊 token 仍有效，且存於 `localStorage` | `server/controllers/authController.js:20-32`；`src/utils/api.js` |
| M2 | `ALLOW_GOOGLE_MOCK` 測試登入後門程式碼留在正式版原始碼中 | `server/controllers/authController.js:186-212, 329-344` |
| M3 | LINE ID Token 僅 `jwt.decode()`，未驗證簽章/aud/iss | `server/controllers/authController.js:459, 598` |
| M4 | 兒童個資（姓名/年齡/生日）明碼存於資料庫，無欄位加密 | `schema.sql:44-56` |
| M5 | 願望清單兌換無家長審核關卡，與抽卡核銷/任務審核的審核模式不一致 | `server/routes/familyRoutes.js:22`；`familyController.js:146-194` |
| M6 | `getTasks`/`getInventory`/`getRedeemLogs` 無分頁或筆數上限，隨帳齡持續增長 | `taskController.js:31-37`；`itemController.js:29-43, 76-81` |
| M7 | 高頻端點（排行榜、每日一句）缺乏快取 | `familyController.js:473-489`；`proverbController.js:36-61` |
| M8 | 任務庫/獎勵庫為前端硬編碼常數而非資料庫驅動；`schema.sql` 已與正式環境欄位不同步 | `src/utils/mockData.js`；`server/controllers/itemController.js:3`；`schema.sql` |
| M9 | `addTask` 批次指派任務為 N+1 查詢模式 | `server/controllers/taskController.js:148-225` |
| M10 | `editTask` 端點的 `submission.photo` 欄位未套用與 `submitTask` 相同的格式驗證 | `server/controllers/taskController.js:326, 339` |

#### 【低－記錄即可】

| # | 問題 | 位置 |
|---|---|---|
| L1 | LINE webhook 除錯 log 印出簽章與 raw body 片段，建議正式站降低詳細度 | `server/controllers/lineBotController.js:17-21` |
| L2 | `push/unsubscribe` 未綁定 `req.user.id`，僅用 `endpoint` 刪除訂閱 | `server/routes/pushRoutes.js:34-51` |
| L3 | `clearAllFamilyData`（GDPR 硬刪除）沒有二次驗證/re-auth 步驟 | `server/controllers/userController.js:454-471` |
| L4 | 部分端點寫回後又重新查詢已知資料，或用 `SELECT *` 撈取用不到的欄位 | `taskController.js:517, 621-626`；`itemController.js:262-266, 460, 579-583`；`userController.js:106-109` |
| L5 | `lineBotController.js` `approveTask` 第一組 JOIN 條件寫錯（`u.family_id = c.user_id`），實際靠備援查詢運作 | `server/controllers/lineBotController.js:91-103` |
| L6 | `feedbackController.js` 用行程內記憶體（`Map`）實作限流，若日後改多執行個體水平擴展部署會失效 | `server/controllers/feedbackController.js:4-6` |
| L7 | `App.jsx` 的 `fetchAllData` 以序列 `await` 呼叫 ~13 支互不依賴的 API，未使用 `Promise.all` | `src/App.jsx`（`fetchAllData`） |

---

## 附錄：已確認的良好實踐

為求平衡呈現，以下是本次稽核中確認**已正確實作、不需重工**的部分：

- Google OAuth 的 `verifyIdToken` 簽章/audience 驗證正確。
- 密碼雜湊（bcryptjs, salt rounds=10）實作正確。
- 全站 104 處 SQL 查詢中，絕大多數皆為參數化查詢，**未發現可利用的 SQL Injection**。
- **未發現 XSS 漏洞**：無 `dangerouslySetInnerHTML`、無 HTML 拼接、React 預設跳脫。
- 管理員角色**沒有任何可透過 API 取得**的路徑，僅能透過離線 migration 腳本設定。
- LINE Webhook 有正確驗證簽章、一次性 token、家庭範圍限定。
- 抽卡的資源卡數值、卡片型別/稀有度已有部分伺服器端白名單與上限驗證（雖仍不足，見 C1）。
- 敏感資料未見寫入 log；`.env` 機密未提交版控、程式碼中未發現寫死的金鑰/連線字串。
- `admin_stats` 端點已對 email 做遮罩處理，展現資料最小化意識。
- 家庭範圍（`family_id`）授權在絕大多數端點都正確實作，僅排行榜為刻意的跨家庭設計（但暴露欄位需收斂，見 H4）。
