# QuestGrow 部署指南 (Render & Vercel Deployment Guide)

本專案已完全改版為「React 前端 + Express 後端 + PostgreSQL 資料庫」架構。以下是本機開發測試及部署至 Render/Vercel 的完整指南。

---

## 一、 本機運行與測試 (Local Development)

### 1. 資料庫準備
請先在本機啟動 PostgreSQL 服務，建立名為 `questgrow` 的資料庫，並對該資料庫執行專案根目錄下的 [schema.sql](file:///c:/code/aipm6/QuestGrow/schema.sql) 以建立所有資料表與初始化種子資料。

### 2. 後端伺服器運行
進入 `server/` 資料夾：
```bash
cd server
npm run dev
```
後端預設會在 `http://localhost:5000` 啟動，請確認 `server/.env` 中的 `DATABASE_URL` 與 `JWT_SECRET` 是否正確。

### 3. 前端 App 運行
回到專案根目錄，啟動 Vite 開發伺服器：
```bash
npm run dev
```
前端將在 `http://localhost:3000` 運行，會自動連接本機的 `http://localhost:5000/api`。

---

## 二、 部署資料庫 (Render PostgreSQL)

1. 登入 [Render Dashboard](https://dashboard.render.com/)，點選 **New +** -> **PostgreSQL**。
2. 填寫資料庫設定：
   * **Name**: `questgrow-db`
   * **Database**: `questgrow`
   * **User**: *(維持預設或自訂)*
   * **Region**: *(建議與您的後端服務在同個區域，如 Oregon)*
3. 點選 **Create Database**。
4. 建立完成後，複製 **External Connection String** (本機連接用) 與 **Internal Connection String** (Render 後端服務連接用)。
5. **初始化資料庫結構**：
   * 使用資料庫管理工具（如 pgAdmin、DBeaver 或透過 psql 指令）連線至剛剛建立的雲端資料庫。
   * 將 [schema.sql](file:///c:/code/aipm6/QuestGrow/schema.sql) 的內容複製並在資料庫中執行，以建立所有必要的 Tables 與初始測試資料。

---

## 三、 部署後端 API (Render Web Service)

1. 在 Render Dashboard 點選 **New +** -> **Web Service**。
2. 連結您的 GitHub / GitLab 專案。
3. 填寫 Web Service 設定：
   * **Name**: `questgrow-backend`
   * **Language**: `Node`
   * **Root Directory**: `server` (⚠️ **非常重要！這會指定只建立後端資料夾**)
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
4. 點選下方的 **Advanced**，新增以下環境變數 (Environment Variables)：
   * `DATABASE_URL`: *(填入剛剛複製的 PostgreSQL **Internal Connection String**)*
   * `JWT_SECRET`: *(填入一組隨機複雜的密鑰字串，例如 `my_questgrow_super_secret_jwt_key_2026`)*
   * `PORT`: `5000`
   * `GOOGLE_CLIENT_ID`: *(填入您的 Google Client ID，例如 `723480361066-5v0ujs9tm810ncqu9cne1s0raoleup05.apps.googleusercontent.com`)*
   * `NODE_ENV`: `production` (⚠️ **必填！否則正式站的錯誤訊息會外洩堆疊細節給使用者，見 `server/utils/validation.js` 的 `safeErrorMessage`**)
   * `ALLOWED_ORIGINS`: *(填入前端網域，例如 `https://questgrow.onrender.com`，多個網域以逗號分隔；**強烈建議設定**，否則 CORS 會開放給任意來源存取 API)*
   * `PII_ENCRYPTION_KEY`: *(⚠️ **必填！**用來加密兒童生日欄位的 AES-256 金鑰，須為 base64 編碼的 32 bytes 隨機值。可用 `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` 產生。**遺失此金鑰將導致所有已加密的生日資料無法復原，請務必安全備份**，且正式站與本機開發不應共用同一把金鑰)*
5. 點選 **Create Web Service** 進行部署。
6. 若資料庫中已有既有的兒童資料（例如從舊版遷移過來），部署後需手動執行一次 `node server/encrypt_birthday_migration.js`（連線到正式資料庫）以加密既有的明碼生日資料。此腳本可重複執行、不會重複加密已加密的欄位。
6. 部署成功後，複製該 Web Service 的網址 (例如 `https://questgrow-backend.onrender.com`)。

---

## 四、 部署前端網頁

您可以自由選擇部署在 **Render (Static Site)** 或 **Vercel (專案根目錄)**。

### 選擇 1：部署在 Render (Static Site) — ⭐️ 推薦
1. 在 Render Dashboard 點選 **New +** -> **Static Site**。
2. 連結同一個 GitHub 專案。
3. 填寫設定：
   * **Name**: `questgrow`
   * **Root Directory**: *(留空)*
   * **Build Command**: `npm run build`
   * **Publish Directory**: `dist`
4. 點選 **Advanced**，新增環境變數：
   * `VITE_API_URL`: `https://questgrow-backend.onrender.com/api` *(填入您部署的後端 API 網址，結尾加上 `/api`)*
   * `VITE_GOOGLE_CLIENT_ID`: *(填入與後端相同的 Google Client ID)*
5. 點選 **Create Static Site** 完成部署。

### 選擇 2：部署在 Vercel
1. 登入 [Vercel Dashboard](https://vercel.com/)，點選 **Add New...** -> **Project**。
2. 匯入您的 GitHub 專案。
3. 在設定面板中，展開 **Environment Variables**，新增：
   * **Key**: `VITE_API_URL`
   * **Value**: `https://questgrow-backend.onrender.com/api` *(您的後端 API 網址)*
   * **Key**: `VITE_GOOGLE_CLIENT_ID`
   * **Value**: *(您的 Google Client ID)*
4. 點選 **Deploy** 即可開始部署。由於 Vite 會自動讀取這個變數，編譯時將自動連結至雲端後端。

---

## 五、 路由問題解決 (僅限 Static Site / SPA)
由於這是單頁應用程式 (React SPA)，若重新整理子頁面（例如 `/dashboard`）可能會出現 Render 404。
請至 **Render Static Site 後台 -> Redirects/Rewrites** 新增一條規則：
* **Source**: `/*`
* **Destination**: `/index.html`
* **Action**: `Rewrite`
