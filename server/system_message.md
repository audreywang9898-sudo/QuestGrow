# QuestGrow System Messages

This file contains all server-side messages for the QuestGrow application. 
Messages are parsed at startup by the `messageManager.js` utility and can contain dynamic placeholders like `{name}`, `{role}`, or `{status}`.

## Middleware & Server Configuration
- **AUTH_TOKEN_MISSING**: 未提供驗證金鑰，請重新登入。
- **AUTH_TOKEN_INVALID**: 金鑰無效或已過期，請重新登入。
- **INSUFFICIENT_PERMISSION**: 權限不足。需要 {role} 權限。
- **SERVER_RUNNING**: QuestGrow API Server is running smoothly.
- **UNEXPECTED_SERVER_ERROR**: 伺服器發生未預期的錯誤，請聯絡開發團隊。

## Auth Controller Messages
- **REGISTRATION_REQUIRED_FIELDS**: 信箱、密碼與姓名為必填項目。
- **EMAIL_ALREADY_REGISTERED**: 此電子信箱已被註冊。
- **REGISTRATION_SUCCESS**: 註冊成功！
- **REGISTRATION_ERROR**: 伺服器錯誤，註冊失敗。
- **LOGIN_REQUIRED_FIELDS**: 請輸入電子信箱與密碼。
- **INVALID_CREDENTIALS**: 帳號或密碼錯誤。
- **LOGIN_SUCCESS**: 登入成功！
- **LOGIN_ERROR**: 伺服器錯誤，登入失敗。
- **GOOGLE_TOKEN_MISSING**: 缺少 Google 登入驗證憑證 (idToken)。
- **GOOGLE_TOKEN_INVALID**: Google 登入憑證無效或已過期。
- **GOOGLE_LOGIN_SUCCESS**: Google 登入成功！
- **GOOGLE_REG_LOGIN_SUCCESS**: Google 註冊登入成功！
- **GOOGLE_LOGIN_ERROR**: 伺服器錯誤，Google 登入失敗。
- **LINK_GOOGLE_TOKEN_MISSING**: 缺少 Google 驗證憑證 (idToken)。
- **LINK_GOOGLE_TOKEN_INVALID**: Google 驗證憑證無效或已過期。
- **LINK_GOOGLE_SUCCESS**: 成功連結 Google 帳戶！今後可使用 Google 快速登入。
- **LINK_GOOGLE_ERROR**: 伺服器錯誤，連結 Google 帳戶失敗。
- **GOOGLE_ALREADY_LINKED**: 此 Google 帳戶已被其他 QuestGrow 帳號綁定！

## User Controller Messages
- **FETCH_MEMBERS_ERROR**: 無法獲取家庭成員資料。
- **FETCH_CHILDREN_ERROR**: 無法獲取小孩角色資料。
- **ADD_CHILD_REQUIRED_FIELDS**: 姓名、信箱與密碼為必填項目。
- **EMAIL_ALREADY_USED**: 此電子信箱已被其他帳號使用。
- **MAX_CHILDREN_LIMIT**: 最多只能新增 8 位小孩。
- **ADD_CHILD_SUCCESS**: 成功新增冒險者「{name}」！
- **ADD_CHILD_ERROR**: 伺服器錯誤，新增小孩失敗。
- **CHILD_NOT_FOUND**: 找不到該小孩資料，或無權限操作。
- **MIN_CHILDREN_LIMIT**: 至少需要保留 1 位小孩，無法全部刪除。
- **DELETE_CHILD_SUCCESS**: 已成功刪除該小孩的角色與帳號資料。
- **DELETE_CHILD_ERROR**: 伺服器錯誤，刪除失敗。
- **EMAIL_IN_USE**: 此電子信箱已被使用。
- **UPDATE_CHILD_SUCCESS**: 角色資料更新成功！
- **UPDATE_CHILD_ERROR**: 伺服器錯誤，更新失敗。
- **ADD_PARENT_REQUIRED_FIELDS**: 姓名、信箱與密碼為必填項目。
- **MAX_PARENTS_LIMIT**: 最多只能新增 8 位家長。
- **ADD_PARENT_SUCCESS**: 成功新增家長「{name}」！
- **ADD_PARENT_ERROR**: 伺服器錯誤，新增家長失敗。
- **DELETE_SELF_PARENT_ERROR**: 您不能刪除目前正在登入的家長帳號！
- **PARENT_NOT_FOUND**: 找不到該家長資料，或無權限操作。
- **MIN_PARENTS_LIMIT**: 至少需要保留 1 位家長。
- **DELETE_PARENT_SUCCESS**: 已成功刪除家長「{name}」的帳號。
- **DELETE_PARENT_ERROR**: 伺服器錯誤，刪除家長失敗。
- **UPDATE_PARENT_REQUIRED_FIELDS**: 未提供更新欄位。
- **UPDATE_PARENT_SUCCESS**: 家長個人資料更新成功！
- **UPDATE_PARENT_ERROR**: 伺服器錯誤，更新失敗。
- **DESTROY_DATA_SUCCESS**: 隱私保護安全：所有家庭與兒童個資已從資料庫完全銷毀！
- **DESTROY_DATA_ERROR**: 無法銷毀家庭數據。

## Family Controller Messages
- **FAMILY_NOT_FOUND**: 找不到家庭資料。
- **FETCH_FAMILY_ERROR**: 無法獲取家庭資料。
- **FETCH_WISHLIST_ERROR**: 無法獲取家庭願望清單。
- **WISHLIST_REQUIRED_FIELDS**: 願望名稱與所需積分為必填項目。
- **ADD_WISH_SUCCESS**: 成功新增家庭願望：「{title}」
- **CREATE_WISH_ERROR**: 無法建立家庭願望。
- **WISH_NOT_FOUND**: 找不到該願望項目。
- **UPDATE_WISH_SUCCESS**: 家庭願望更新成功！
- **UPDATE_WISH_ERROR**: 更新家庭願望失敗。
- **DELETE_WISH_PERMISSION_ERROR**: 找不到該願望，或無權限操作。
- **DELETE_WISH_SUCCESS**: 成功刪除家庭願望！
- **DELETE_WISH_ERROR**: 刪除家庭願望失敗。
- **REDEEM_WISH_SUCCESS**: 🎉 家庭共同願望「{title}」已兌換成功！
- **REDEEM_WISH_ERROR**: 兌換失敗。
- **FETCH_PARENT_GOALS_ERROR**: 無法獲取家長目標列表。
- **GOAL_REQUIRED_FIELDS**: 目標類別與目標名稱為必填項目。
- **ADD_GOAL_SUCCESS**: 成功新增家長目標：「{title}」
- **CREATE_GOAL_ERROR**: 建立家長目標失敗。
- **GOAL_PROGRESS_INVALID**: 請提供 0 到 100 之間的新進度。
- **UPDATE_GOAL_SUCCESS**: 目標進度更新成功！
- **UPDATE_GOAL_ERROR**: 更新目標進度失敗。
- **DELETE_GOAL_PERMISSION_ERROR**: 找不到該目標，或無權限操作。
- **DELETE_GOAL_SUCCESS**: 成功刪除家長目標！
- **DELETE_GOAL_ERROR**: 刪除目標失敗。
- **FETCH_WEEKLY_REPORT_ERROR**: 無法獲取每週結算賽事報告。
- **FETCH_EVENT_LOGS_ERROR**: 無法獲取系統事件日誌。
- **EVENT_TYPE_REQUIRED**: 缺少事件類型（eventType）。
- **EVENT_LOGGED_SUCCESS**: 事件已成功記錄。
- **EVENT_LOG_ERROR**: 記錄系統事件失敗。

## Task Controller Messages
- **FETCH_TASKS_ERROR**: 無法獲取任務列表。
- **TASK_REQUIRED_FIELDS**: 任務名稱、屬性類型與難度為必填項目。
- **ADD_TASK_SUCCESS**: 成功指派新任務：「{name}」
- **CREATE_TASK_ERROR**: 伺服器錯誤，無法建立任務。
- **TASK_NOT_FOUND**: 找不到該任務，或無權限操作。
- **TASK_FIELDS_MISSING**: 未提供更新欄位。
- **UPDATE_TASK_SUCCESS**: 任務更新成功！
- **UPDATE_TASK_ERROR**: 伺服器錯誤，更新任務失敗。
- **DELETE_TASK_SUCCESS**: 已成功刪除任務：「{name}」
- **DELETE_TASK_ERROR**: 伺服器錯誤，刪除任務失敗。
- **CLEAR_TASKS_SUCCESS**: 任務清除成功。
- **CLEAR_TASKS_ERROR**: 伺服器錯誤，清除任務失敗。
- **SUBMIT_TASK_ROLE_ERROR**: 只有小孩帳號可提交任務。
- **TASK_STATUS_INVALID**: 該任務目前狀態為「{status}」，無法提交。
- **SUBMIT_TASK_SUCCESS**: 任務已成功送出，等待爸媽審核！
- **SUBMIT_TASK_ERROR**: 伺服器錯誤，無法提交任務。
- **REVIEW_ACTION_MISSING**: 必須提供審核動作（action）。
- **REVIEW_TASK_STATUS_INVALID**: 該任務不處於待覆核狀態。
- **APPROVE_TASK_SUCCESS**: 審核成功！「{name}」任務已核准，獎勵已發放。
- **REJECT_TASK_REQUIRED_FIELDS**: 駁回任務必須填寫原因！
- **REJECT_TASK_SUCCESS**: 已將「{name}」任務駁回，等待小孩修正。
- **REVIEW_TASK_ERROR**: 伺服器錯誤，審核操作失敗。
- **RESET_SLOTS_ROLE_ERROR**: 只有小孩帳號可以操作抽取任務。
- **RESET_SLOTS_SUCCESS**: 今日冒險任務抽取成功！
- **RESET_SLOTS_ERROR**: 伺服器錯誤，抽取任務失敗。

## Item Controller Messages
- **FETCH_INVENTORY_ERROR**: 無法獲取背包道具。
- **FETCH_REDEEM_LOGS_ERROR**: 無法獲取核銷紀錄。
- **GACHA_DRAW_ROLE_ERROR**: 只有小孩帳號可進行召喚抽卡。
- **GACHA_DRAW_FIELDS_MISSING**: 請提供卡片資料與抽卡券扣除數量。
- **CHILD_STATS_NOT_FOUND**: 找不到此小孩的角色資料。
- **GACHA_INSUFFICIENT_TICKETS**: 抽卡券不足！
- **GACHA_DRAW_SUCCESS**: 召喚成功！獲得 {name}
- **GACHA_DRAW_ERROR**: 伺服器錯誤，召喚失敗。
- **REDEEM_REQUEST_ROLE_ERROR**: 只有小孩帳號可以申請使用卡片。
- **REDEEM_REQUEST_CARD_NOT_FOUND**: 找不到此背包卡片。
- **REDEEM_REQUEST_STATUS_INVALID**: 卡片目前狀態為「{status}」，無法申請使用。
- **REDEEM_REQUEST_CARD_EXPIRED**: 此卡片已過期，無法申請使用！
- **REDEEM_REQUEST_SUCCESS**: 已成功申請使用「{name}」，等待爸媽確認。
- **REDEEM_REQUEST_ERROR**: 伺服器錯誤，申請使用失敗。
- **REVIEW_REDEEM_ACTION_MISSING**: 必須提供審核動作（action）。
- **REVIEW_REDEEM_NOT_FOUND**: 找不到該申請，或無權限操作。
- **REVIEW_REDEEM_STATUS_INVALID**: 此卡片不處於待核銷狀態。
- **REVIEW_REDEEM_REJECT_SUCCESS**: 已駁回「{name}」的核銷申請，卡片已退回小孩背包。
- **REVIEW_REDEEM_EXPIRED**: 審核失敗：此卡片已過期！無法進行核銷。
- **REVIEW_REDEEM_APPROVE_SUCCESS**: 已核准使用「{name}」，全家獲得 +50 成長積分！
- **REVIEW_REDEEM_ERROR**: 伺服器錯誤，審核失敗。
