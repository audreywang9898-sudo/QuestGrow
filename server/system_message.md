# QuestGrow System Messages

This file contains all server-side messages for the QuestGrow application. 
Messages are parsed at startup by the `messageManager.js` utility and can contain dynamic placeholders like `{name}`, `{role}`, or `{status}`.
Bilingual translations are defined in `Chinese Message | English Message` format.

## Middleware & Server Configuration
- **AUTH_TOKEN_MISSING**: 未提供驗證金鑰，請重新登入。 | Authentication token missing, please log in again.
- **AUTH_TOKEN_INVALID**: 金鑰無效或已過期，請重新登入。 | Invalid or expired authentication token, please log in again.
- **INSUFFICIENT_PERMISSION**: 權限不足。需要 {role} 權限。 | Insufficient permission. Needs {role} permission.
- **SERVER_RUNNING**: QuestGrow API 伺服器運行順暢。 | QuestGrow API Server is running smoothly.
- **UNEXPECTED_SERVER_ERROR**: 伺服器發生未預期的錯誤，請聯絡開發團隊。 | An unexpected server error occurred, please contact the development team.

## Auth Controller Messages
- **REGISTRATION_REQUIRED_FIELDS**: 信箱、密碼與姓名為必填項目。 | Email, password, and name are required fields.
- **EMAIL_ALREADY_REGISTERED**: 此電子信箱已被註冊。 | This email is already registered.
- **REGISTRATION_SUCCESS**: 註冊成功！ | Registration successful!
- **REGISTRATION_ERROR**: 伺服器錯誤，註冊失敗。 | Server error, registration failed.
- **LOGIN_REQUIRED_FIELDS**: 請輸入電子信箱與密碼。 | Please enter your email and password.
- **INVALID_CREDENTIALS**: 帳號或密碼錯誤。 | Invalid email or password.
- **LOGIN_SUCCESS**: 登入成功！ | Login successful!
- **LOGIN_ERROR**: 伺服器錯誤，登入失敗。 | Server error, login failed.
- **GOOGLE_TOKEN_MISSING**: 缺少 Google 登入驗證憑證 (idToken)。 | Google sign-in credential (idToken) is missing.
- **GOOGLE_TOKEN_INVALID**: Google 登入憑證無效或已過期。 | Google sign-in credential is invalid or expired.
- **GOOGLE_LOGIN_SUCCESS**: Google 登入成功！ | Google login successful!
- **GOOGLE_REG_LOGIN_SUCCESS**: Google 註冊登入成功！ | Google registration and login successful!
- **GOOGLE_LOGIN_ERROR**: 伺服器錯誤，Google 登入失敗。 | Server error, Google login failed.
- **LINK_GOOGLE_TOKEN_MISSING**: 缺少 Google 驗證憑證 (idToken)。 | Google verification credential (idToken) is missing.
- **LINK_GOOGLE_TOKEN_INVALID**: Google 驗證憑證無效或已過期。 | Google verification credential is invalid or expired.
- **LINK_GOOGLE_SUCCESS**: 成功連結 Google 帳戶！今後可使用 Google 快速登入。 | Google account linked successfully! You can now use Google to quick login.
- **LINK_GOOGLE_ERROR**: 伺服器錯誤，連結 Google 帳戶失敗。 | Server error, failed to link Google account.
- **GOOGLE_ALREADY_LINKED**: 此 Google 帳戶已被其他 QuestGrow 帳號綁定！ | This Google account is already linked to another QuestGrow account!

## User Controller Messages
- **FETCH_MEMBERS_ERROR**: 無法獲取家庭成員資料。 | Failed to fetch family member data.
- **FETCH_CHILDREN_ERROR**: 無法獲取小孩角色資料。 | Failed to fetch children character profiles.
- **ADD_CHILD_REQUIRED_FIELDS**: 姓名、信箱與密碼為必填項目。 | Name, email, and password are required fields.
- **EMAIL_ALREADY_USED**: 此電子信箱已被其他帳號使用。 | This email is already in use by another account.
- **MAX_CHILDREN_LIMIT**: 最多只能新增 8 位小孩。 | You can add at most 8 children.
- **ADD_CHILD_SUCCESS**: 成功新增冒險者「{name}」！ | Adventurer "{name}" added successfully!
- **ADD_CHILD_ERROR**: 伺服器錯誤，新增小孩失敗。 | Server error, failed to add child.
- **CHILD_NOT_FOUND**: 找不到該小孩資料，或無權限操作。 | Child not found, or access denied.
- **MIN_CHILDREN_LIMIT**: 至少需要保留 1 位小孩，無法全部刪除。 | You must keep at least 1 child, deletion aborted.
- **DELETE_CHILD_SUCCESS**: 已成功刪除該小孩的角色與帳號資料。 | Child profile and account deleted successfully.
- **DELETE_CHILD_ERROR**: 伺服器錯誤，刪除失敗。 | Server error, deletion failed.
- **EMAIL_IN_USE**: 此電子信箱已被使用。 | This email is already in use.
- **UPDATE_CHILD_SUCCESS**: 角色資料更新成功！ | Character profile updated successfully!
- **UPDATE_CHILD_ERROR**: 伺服器錯誤，更新失敗。 | Server error, update failed.
- **ADD_PARENT_REQUIRED_FIELDS**: 姓名、信箱與密碼為必填項目。 | Name, email, and password are required fields.
- **MAX_PARENTS_LIMIT**: 最多只能新增 8 位家長。 | You can add at most 8 parents.
- **ADD_PARENT_SUCCESS**: 成功新增家長「{name}」！ | Parent "{name}" added successfully!
- **ADD_PARENT_ERROR**: 伺服器錯誤，新增家長失敗。 | Server error, failed to add parent.
- **DELETE_SELF_PARENT_ERROR**: 您不能刪除目前正在登入的家長帳號！ | You cannot delete the parent account you are currently logged in with!
- **PARENT_NOT_FOUND**: 找不到該家長資料，或無權限操作。 | Parent not found, or access denied.
- **MIN_PARENTS_LIMIT**: 至少需要保留 1 位家長。 | You must keep at least 1 parent.
- **DELETE_PARENT_SUCCESS**: 已成功刪除家長「{name}」的帳號。 | Parent "{name}" account deleted successfully.
- **DELETE_PARENT_ERROR**: 伺服器錯誤，刪除家長失敗。 | Server error, failed to delete parent.
- **UPDATE_PARENT_REQUIRED_FIELDS**: 未提供更新欄位。 | No update fields provided.
- **UPDATE_PARENT_SUCCESS**: 家長個人資料更新成功！ | Parent profile updated successfully!
- **UPDATE_PARENT_ERROR**: 伺服器錯誤，更新失敗。 | Server error, update failed.
- **DESTROY_DATA_SUCCESS**: 隱私保護安全：所有家庭與兒童個資已從資料庫完全銷毀！ | Privacy security: All family and child personal data have been completely destroyed from the database!
- **DESTROY_DATA_ERROR**: 無法銷毀家庭數據。 | Failed to destroy family data.

## Family Controller Messages
- **FAMILY_NOT_FOUND**: 找不到家庭資料。 | Family data not found.
- **FETCH_FAMILY_ERROR**: 無法獲取家庭資料。 | Failed to fetch family data.
- **FETCH_WISHLIST_ERROR**: 無法獲取家庭願望清單。 | Failed to fetch family wishlist.
- **WISHLIST_REQUIRED_FIELDS**: 願望名稱與所需積分為必填項目。 | Wishlist title and points needed are required fields.
- **ADD_WISH_SUCCESS**: 成功新增家庭願望：「{title}」 | Family wish "{title}" added successfully!
- **CREATE_WISH_ERROR**: 無法建立家庭願望。 | Failed to create family wish.
- **WISH_NOT_FOUND**: 找不到該願望項目。 | Wish item not found.
- **UPDATE_WISH_SUCCESS**: 家庭願望更新成功！ | Family wish updated successfully!
- **UPDATE_WISH_ERROR**: 更新家庭願望失敗。 | Failed to update family wish.
- **DELETE_WISH_PERMISSION_ERROR**: 找不到該願望，或無權限操作。 | Wish not found, or access denied.
- **DELETE_WISH_SUCCESS**: 成功刪除家庭願望！ | Family wish deleted successfully!
- **DELETE_WISH_ERROR**: 刪除家庭願望失敗。 | Failed to delete family wish.
- **REDEEM_WISH_SUCCESS**: 🎉 家庭共同願望「{title}」已兌換成功！ | 🎉 Family joint wish "{title}" redeemed successfully!
- **REDEEM_WISH_ERROR**: 兌換失敗。 | Redemption failed.
- **FETCH_PARENT_GOALS_ERROR**: 無法獲取家長目標列表。 | Failed to fetch parent goals.
- **GOAL_REQUIRED_FIELDS**: 目標類別與目標名稱為必填項目。 | Goal category and title are required fields.
- **ADD_GOAL_SUCCESS**: 成功新增家長目標：「{title}」 | Parent goal "{title}" added successfully!
- **CREATE_GOAL_ERROR**: 建立家長目標失敗。 | Failed to create parent goal.
- **GOAL_PROGRESS_INVALID**: 請提供 0 到 100 之間的新進度。 | Please provide a new progress between 0 and 100.
- **UPDATE_GOAL_SUCCESS**: 目標進度更新成功！ | Goal progress updated successfully!
- **UPDATE_GOAL_ERROR**: 更新目標進度失敗。 | Failed to update goal progress.
- **DELETE_GOAL_PERMISSION_ERROR**: 找不到該目標，或無權限操作。 | Goal not found, or access denied.
- **DELETE_GOAL_SUCCESS**: 成功刪除家長目標！ | Parent goal deleted successfully!
- **DELETE_GOAL_ERROR**: 刪除目標失敗。 | Failed to delete goal.
- **FETCH_WEEKLY_REPORT_ERROR**: 無法獲取每週結算賽事報告。 | Failed to fetch weekly summary report.
- **FETCH_EVENT_LOGS_ERROR**: 無法獲取系統事件日誌。 | Failed to fetch system event logs.
- **EVENT_TYPE_REQUIRED**: 缺少事件類型（eventType）。 | Event type (eventType) is missing.
- **EVENT_LOGGED_SUCCESS**: 事件已成功記錄。 | Event logged successfully.
- **EVENT_LOG_ERROR**: 記錄系統事件失敗。 | Failed to log system event.

## Task Controller Messages
- **FETCH_TASKS_ERROR**: 無法獲取任務列表。 | Failed to fetch tasks list.
- **TASK_REQUIRED_FIELDS**: 任務名稱、屬性類型與難度為必填項目。 | Task name, type, and difficulty are required fields.
- **ADD_TASK_SUCCESS**: 成功指派新任務：「{name}」 | New task "{name}" assigned successfully!
- **CREATE_TASK_ERROR**: 伺服器錯誤，無法建立任務。 | Server error, failed to create task.
- **TASK_NOT_FOUND**: 找不到該任務，或無權限操作。 | Task not found, or access denied.
- **TASK_FIELDS_MISSING**: 未提供更新欄位。 | No update fields provided.
- **UPDATE_TASK_SUCCESS**: 任務更新成功！ | Task updated successfully!
- **UPDATE_TASK_ERROR**: 伺服器錯誤，更新任務失敗。 | Server error, failed to update task.
- **DELETE_TASK_SUCCESS**: 已成功刪除任務：「{name}」 | Task "{name}" deleted successfully!
- **DELETE_TASK_ERROR**: 伺服器錯誤，刪除任務失敗。 | Server error, failed to delete task.
- **CLEAR_TASKS_SUCCESS**: 任務清除成功。 | Quests cleared successfully.
- **CLEAR_TASKS_ERROR**: 伺服器錯誤，清除任務失敗。 | Server error, failed to clear quests.
- **SUBMIT_TASK_ROLE_ERROR**: 只有小孩帳號可提交任務。 | Only kid accounts can submit tasks.
- **TASK_STATUS_INVALID**: 該任務目前狀態為「{status}」，無法提交。 | This task is currently in "{status}" status and cannot be submitted.
- **SUBMIT_TASK_SUCCESS**: 任務已成功送出，等待爸媽審核！ | Task submitted successfully, waiting for parent review!
- **SUBMIT_TASK_ERROR**: 伺服器錯誤，無法提交任務. | Server error, failed to submit task.
- **REVIEW_ACTION_MISSING**: 必須提供審核動作（action）。 | Review action is required.
- **REVIEW_TASK_STATUS_INVALID**: 該任務不處於待覆核狀態。 | This task is not in pending review status.
- **APPROVE_TASK_SUCCESS**: 審核成功！「{name}」任務已核准，獎勵已發放。 | Review successful! Task "{name}" approved and rewards issued.
- **REJECT_TASK_REQUIRED_FIELDS**: 駁回任務必須填寫原因！ | Rejection reason is required to reject a task!
- **REJECT_TASK_SUCCESS**: 已將「{name}」任務駁回，等待小孩修正。 | Task "{name}" rejected, waiting for kid's correction.
- **REVIEW_TASK_ERROR**: 伺服器錯誤，審核操作失敗。 | Server error, review operation failed.
- **RESET_SLOTS_ROLE_ERROR**: 只有小孩帳號可以操作抽取任務。 | Only kid accounts can draw adventure tasks.
- **RESET_SLOTS_SUCCESS**: 今日冒險任務抽取成功！ | Daily quests drawn successfully!
- **RESET_SLOTS_ERROR**: 伺服器錯誤，抽取任務失敗。 | Server error, failed to draw tasks.

## Item Controller Messages
- **FETCH_INVENTORY_ERROR**: 無法獲取背包道具。 | Failed to fetch inventory items.
- **FETCH_REDEEM_LOGS_ERROR**: 無法獲取核銷紀錄。 | Failed to fetch redemption logs.
- **GACHA_DRAW_ROLE_ERROR**: 只有小孩帳號可進行召喚抽卡。 | Only kid accounts can summon gacha cards.
- **GACHA_DRAW_FIELDS_MISSING**: 請提供卡片資料與抽卡券扣除數量。 | Please provide card details and number of tickets to deduct.
- **CHILD_STATS_NOT_FOUND**: 找不到此小孩的角色資料。 | Child character profile not found.
- **GACHA_INSUFFICIENT_TICKETS**: 抽卡券不足！ | Insufficient gacha tickets!
- **GACHA_DRAW_SUCCESS**: 召喚成功！獲得 {name} | Summon successful! Obtained {name}
- **GACHA_DRAW_ERROR**: 伺服器錯誤，召喚失敗。 | Server error, summon failed.
- **REDEEM_REQUEST_ROLE_ERROR**: 只有小孩帳號可以申請使用卡片。 | Only kid accounts can request card usage.
- **REDEEM_REQUEST_CARD_NOT_FOUND**: 找不到此背包卡片。 | Inventory card not found.
- **REDEEM_REQUEST_STATUS_INVALID**: 卡片目前狀態為「{status}」，無法申請使用。 | Card status is "{status}" and cannot be requested for usage.
- **REDEEM_REQUEST_CARD_EXPIRED**: 此卡片已過期，無法申請使用！ | This card has expired and cannot be requested for usage!
- **REDEEM_REQUEST_SUCCESS**: 已成功申請使用「{name}」，等待爸媽確認。 | Requested usage of "{name}" successfully, waiting for parent validation.
- **REDEEM_REQUEST_ERROR**: 伺服器錯誤，申請使用失敗。 | Server error, failed to request usage.
- **REVIEW_REDEEM_ACTION_MISSING**: 必須提供審核動作（action）。 | Review action is required.
- **REVIEW_REDEEM_NOT_FOUND**: 找不到該申請，或無權限操作。 | Request not found, or access denied.
- **REVIEW_REDEEM_STATUS_INVALID**: 此卡片不處於待核銷狀態。 | This card is not pending redemption.
- **REVIEW_REDEEM_REJECT_SUCCESS**: 已駁回「{name}」的核銷申請，卡片已退回小孩背包。 | Rejected redemption request for "{name}". Card returned to kid's inventory.
- **REVIEW_REDEEM_EXPIRED**: 審核失敗：此卡片已過期！無法進行核銷。 | Review failed: This card has expired! Cannot redeem.
- **REVIEW_REDEEM_APPROVE_SUCCESS**: 已核准使用「{name}」，全家獲得 +50 成長積分！ | Approved usage of "{name}", family earned +50 growth points!
- **REVIEW_REDEEM_ERROR**: 伺服器錯誤，審核失敗。 | Server error, review failed.
