import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CHILD_STATS, 
  INITIAL_TASKS, 
  INITIAL_INVENTORY, 
  INITIAL_PARENT_GOALS, 
  INITIAL_WISHLIST, 
  INITIAL_REDEEM_LOGS, 
  INITIAL_WEEKLY_COMPETITION 
} from './utils/mockData';
import ParentPortal from './components/ParentPortal';
import KidPortal from './components/KidPortal';
import LoginPortal from './components/LoginPortal';
import Avatar from './components/Avatar';
import { useLanguage } from './components/LanguageContext';
import { Trophy, ShieldAlert, Sparkles, User, Users, RefreshCw, AlertCircle, CheckCircle, Info, LogOut } from 'lucide-react';
import { api } from './utils/api';

function App() {
  const { language, toggleLanguage, t } = useLanguage();
  
  // --- Authentication States ---
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('questgrow_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [role, setRole] = useState(() => {
    const localUser = localStorage.getItem('questgrow_current_user');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        return parsed.role;
      } catch (e) {}
    }
    return localStorage.getItem('questgrow_role') || 'kid';
  });

  const [googleClientId, setGoogleClientId] = useState('');

  // Fetch Google Client ID from backend config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await api.getAuthConfig();
        if (config && config.googleClientId) {
          setGoogleClientId(config.googleClientId);
        }
      } catch (error) {
        console.error('Failed to fetch auth config:', error);
      }
    };
    fetchConfig();
  }, []);

  // --- Core States ---
  const [children, setChildren] = useState([INITIAL_CHILD_STATS]);
  const [activeChildId, setActiveChildId] = useState('child-default');
  const [drawnTaskIds, setDrawnTaskIds] = useState(() => {
    const local = localStorage.getItem('questgrow_drawn_task_ids');
    return local ? JSON.parse(local) : [];
  });
  
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [parentGoals, setParentGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [redeemLogs, setRedeemLogs] = useState([]);
  const [familyScore, setFamilyScore] = useState(6420);
  const [weeklyComp, setWeeklyComp] = useState(INITIAL_WEEKLY_COMPETITION);
  const [eventLogs, setEventLogs] = useState([]);
  const [members, setMembers] = useState([]); // Replaces usersDB
  
  // --- Toast State ---
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const getSimulatedDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const childStats = children.find(c => c.id === activeChildId) || children[0] || INITIAL_CHILD_STATS;

  // --- Fetch Data from Backend ---
  const fetchAllData = async () => {
    if (!currentUser) return;
    try {
      const familyData = await api.getFamilyData();
      if (familyData) setFamilyScore(familyData.growthScore);

      const childrenData = await api.getChildren();
      setChildren(childrenData);
      
      // Restore or set active child
      if (currentUser.role === 'kid' && currentUser.childId) {
        setActiveChildId(currentUser.childId);
      } else {
        const localActiveId = localStorage.getItem('questgrow_active_child_id');
        if (localActiveId && childrenData.some(c => c.id === localActiveId)) {
          setActiveChildId(localActiveId);
        } else if (childrenData.length > 0) {
          setActiveChildId(childrenData[0].id);
        }
      }

      const tasksData = await api.getTasks();
      setTasks(tasksData);

      const invData = await api.getInventory();
      setInventory(invData);

      const goalsData = await api.getParentGoals();
      setParentGoals(goalsData);

      const wishData = await api.getWishlist();
      setWishlist(wishData);

      const logsData = await api.getRedeemLogs();
      setRedeemLogs(logsData);

      const compData = await api.getWeeklyComp();
      if (compData) setWeeklyComp(compData);

      const eventsData = await api.getEventLogs();
      setEventLogs(eventsData);

      const membersData = await api.getMembers();
      setMembers(membersData);
    } catch (error) {
      console.error('Fetch all data error:', error);
      showToast(error.message || '載入雲端資料失敗！', 'error');
    }
  };

  // Fetch data on login session established
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // Auth local storage synchronization
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('questgrow_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'kid') {
        setRole('kid');
      }
    } else {
      localStorage.removeItem('questgrow_current_user');
      api.logout();
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('questgrow_active_child_id', activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    localStorage.setItem('questgrow_drawn_task_ids', JSON.stringify(drawnTaskIds));
  }, [drawnTaskIds]);

  useEffect(() => {
    localStorage.setItem('questgrow_role', role);
  }, [role]);

  // --- Event Logger ---
  const logEvent = async (eventType, metadata = {}) => {
    try {
      await api.addEventLog(eventType, metadata);
      // Re-fetch event logs to update UI
      const eventsData = await api.getEventLogs();
      setEventLogs(eventsData);
    } catch (e) {
      console.error('logEvent error:', e);
    }
  };

  // --- Auth Handlers ---
  const handleLogin = async (authData) => {
    const { email, password, name, role: selectedRole, isRegister, isGoogle, credential, avatar } = authData;

    try {
      if (isRegister) {
        await api.register(email, password, name, avatar);
        showToast('註冊成功，請登入！', 'success');
        return true;
      }

      if (isGoogle) {
        const data = await api.googleLogin(credential, selectedRole);
        setCurrentUser(data.user);
        setRole(data.user.role);
        showToast(`歡迎回來，${data.user.name}！`, 'success');
        return true;
      }

      // Standard Login
      const data = await api.login(email, password);
      setCurrentUser(data.user);
      setRole(data.user.role);
      showToast(`歡迎回來，${data.user.name}！`, 'success');
      return true;
    } catch (error) {
      showToast(error.message || '身分驗證失敗，請檢查輸入。', 'error');
      return false;
    }
  };

  const handleLogout = () => {
    logEvent("user_logout", { email: currentUser.email });
    setCurrentUser(null);
    showToast('已成功登出。', 'info');
  };

  const handleLinkGoogleAccount = async (idToken) => {
    try {
      await api.linkGoogle(idToken);
      showToast('🎉 成功連結 Google 帳戶！', 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '綁定 Google 帳戶失敗。', 'error');
      return false;
    }
  };

  // --- Family Member Management ---
  const handleAddChild = async (newChildData) => {
    try {
      await api.addChild(newChildData);
      showToast(`成功新增冒險者「${newChildData.name}」！`, 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '新增小孩帳號失敗。', 'error');
      return false;
    }
  };

  const handleDeleteChild = async (childId) => {
    if (window.confirm('確定要刪除此小孩的全部角色資料與登入帳號嗎？此操作無法還原。')) {
      try {
        await api.deleteChild(childId);
        showToast('已刪除小孩帳號與資料。', 'info');
        fetchAllData();
      } catch (error) {
        showToast(error.message || '刪除失敗。', 'error');
      }
    }
  };

  const handleUpdateChildProfile = async (childId, profileData) => {
    let targetId = childId;
    let data = profileData;
    if (typeof childId === 'object' && !profileData) {
      targetId = activeChildId;
      data = childId;
    }

    try {
      await api.updateChildProfile(targetId, data);
      showToast('小孩角色資料已更新！', 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '更新小孩資料失敗。', 'error');
      return false;
    }
  };

  const handleAddParent = async (newParentData) => {
    try {
      await api.addParent(newParentData);
      showToast(`成功新增家長「${newParentData.name}」！`, 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '新增家長帳號失敗。', 'error');
      return false;
    }
  };

  const handleDeleteParent = async (parentEmail) => {
    if (window.confirm(`確定要刪除家長 ${parentEmail} 的帳號嗎？`)) {
      try {
        await api.deleteParent(parentEmail);
        showToast('已成功刪除該家長帳號。', 'info');
        fetchAllData();
      } catch (error) {
        showToast(error.message || '刪除失敗。', 'error');
      }
    }
  };

  const handleUpdateParent = async (oldEmail, updatedData) => {
    try {
      const data = await api.updateParent(updatedData);
      showToast('個人資料更新成功！', 'success');
      setCurrentUser(data.user);
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '更新失敗。', 'error');
      return false;
    }
  };

  // --- Task Operations ---
  const handleAddTask = async (newTask) => {
    try {
      // Map frontend task structure to backend API expected format
      const apiTaskData = {
        name: newTask.name,
        description: newTask.description,
        type: newTask.type,
        difficulty: newTask.difficulty,
        expReward: newTask.expReward,
        goldReward: newTask.goldReward,
        ticketReward: newTask.ticketReward,
        attributeReward: newTask.attributeReward,
        period: newTask.period,
        assignedTo: newTask.assignedTo,
        status: newTask.status
      };
      await api.addTask(apiTaskData);
      showToast('任務指派成功！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '任務指派失敗。', 'error');
    }
  };

  const handleEditTask = async (taskId, updatedFields) => {
    try {
      await api.editTask(taskId, updatedFields);
      fetchAllData();
    } catch (error) {
      showToast(error.message || '編輯任務失敗。', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      showToast('任務已刪除。', 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '刪除任務失敗。', 'error');
    }
  };

  const handleClearAllTasks = async (targetFilter = 'all') => {
    try {
      await api.clearAllTasks(targetFilter);
      
      let msg = '';
      if (targetFilter === 'all') {
        msg = language === 'zh' ? '已成功清除所有小孩的全部任務。' : 'Successfully cleared all quests for all children.';
      } else if (targetFilter === 'general') {
        msg = language === 'zh' ? '已成功清除所有通用任務。' : 'Successfully cleared all general quests.';
      } else {
        const targetChild = children.find(c => c.id === targetFilter);
        const childName = targetChild ? targetChild.name : '';
        if (childName) {
          msg = language === 'zh' ? `已成功清除指派給「${childName}」的任務。` : `Successfully cleared all quests assigned to "${childName}".`;
        } else {
          msg = language === 'zh' ? '任務清除成功。' : 'Quests cleared successfully.';
        }
      }
      
      showToast(msg, 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || (language === 'zh' ? '清除任務失敗。' : 'Failed to clear quests.'), 'error');
    }
  };

  const handleSubmitTask = async (taskId, submissionData) => {
    try {
      await api.submitTask(taskId, submissionData.notes, submissionData.photo);
      showToast('任務已提交覆核，請等待確認！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '提交任務審核失敗。', 'error');
    }
  };

  const handleApproveTask = async (taskId) => {
    try {
      await api.reviewTask(taskId, 'approve');
      showToast('任務審核通過，發放獎勵！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '審核通過動作失敗。', 'error');
    }
  };

  const handleRejectTask = async (taskId, reason) => {
    try {
      await api.reviewTask(taskId, 'reject', reason);
      showToast('任務已退回修正。', 'warning');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '駁回失敗。', 'error');
    }
  };

  // --- Gacha / Card Draw ---
  const handleAwardGachaCard = async (card, costTickets = 1) => {
    try {
      await api.drawGachaCard(card, costTickets);
      showToast(`召喚成功！獲得 ${card.name}`, 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '召喚失敗。', 'error');
    }
  };

  // --- Card Redemption ---
  const handleRequestRedeem = async (inventoryId) => {
    try {
      await api.requestRedeem(inventoryId);
      showToast('已提交卡片使用申請，請等待確認。', 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '卡片申請失敗。', 'error');
    }
  };

  const handleApproveRedeem = async (inventoryId) => {
    try {
      await api.reviewRedeem(inventoryId, 'approve');
      showToast('已核准卡片使用！全家獲得 +50 積分！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '核准卡片使用失敗。', 'error');
    }
  };

  const handleRejectRedeem = async (inventoryId) => {
    try {
      await api.reviewRedeem(inventoryId, 'reject');
      showToast('已駁回使用申請，卡片已退回背包。', 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '駁回卡片使用失敗。', 'error');
    }
  };

  // --- Parent Goals ---
  const handleUpdateGoalProgress = async (goalId, newProgress) => {
    try {
      await api.updateGoalProgress(goalId, newProgress);
      fetchAllData();
    } catch (error) {
      showToast(error.message || '更新進度失敗。', 'error');
    }
  };

  // --- Family Wishlist ---
  const handleAddWishlistItem = async (title, points) => {
    try {
      await api.addWishlistItem(title, points);
      showToast(`成功新增家庭願望：「${title}」`, 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '新增家庭願望失敗。', 'error');
    }
  };

  const handleEditWishlistItem = async (id, title, points) => {
    try {
      await api.editWishlistItem(id, title, points);
      showToast('成功更新家庭願望！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '更新家庭願望失敗。', 'error');
    }
  };

  const handleDeleteWishlistItem = async (id) => {
    try {
      await api.deleteWishlistItem(id);
      showToast('家庭願望已刪除。', 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '刪除願望失敗。', 'error');
    }
  };

  const handleRedeemWishlist = async (wishlistId) => {
    try {
      await api.redeemWishlist(wishlistId);
      showToast('共同願望已兌換成功！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '兌換失敗。', 'error');
    }
  };

  // --- Telemetry &合規安全銷毀 ---
  const handleClearAllData = async () => {
    if (window.confirm('❗ 隱私與兒童個資保護提醒：這會永久刪除此家庭與孩子的所有個人資料、任務及數據。確定要繼續嗎？')) {
      try {
        await api.clearAllFamilyData();
        showToast('所有個資已完全銷毀！將自動登出。', 'success');
        setCurrentUser(null);
      } catch (error) {
        showToast(error.message || '銷毀失敗。', 'error');
      }
    }
  };

  const getBalancedDevelopmentIndex = (childId) => {
    const targetId = childId || activeChildId;
    const completedTasks = tasks.filter(t => t.status === '已完成' && (!t.assignedTo || t.assignedTo === targetId));
    const completedTypes = new Set(completedTasks.map(t => t.type));
    return (completedTypes.size / 5) * 100;
  };

  if (!currentUser) {
    return <LoginPortal onLogin={handleLogin} googleClientId={googleClientId} />;
  }

  return (
    <div className="min-h-screen flex flex-col relative pb-20 bg-[#EBF4FC] text-slate-800">
      
      {/* Toast Alert Popups */}
      <div className="toast-container">
        {toasts.map(t => (
          <div 
            key={t.id} 
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className={`toast-notification text-xs font-bold text-slate-100 ${
              t.type === 'success' ? 'toast-success' :
              t.type === 'error' ? 'toast-error' :
              t.type === 'warning' ? 'toast-warning' : 'toast-info'
            }`}
            title="點擊以關閉此通知"
          >
            {t.type === 'success' && <CheckCircle className="h-4 w-4 text-[#00E676] shrink-0" />}
            {t.type === 'error' && <AlertCircle className="h-4 w-4 text-[#FF4747] shrink-0" />}
            {t.type === 'warning' && <AlertCircle className="h-4 w-4 text-[#FF9F1C] shrink-0" />}
            {t.type === 'info' && <Info className="h-4 w-4 text-[#3661FF] shrink-0" />}
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Top Header - Roblox Navigation Bar Style */}
      <header className="bg-[#1B1B1D] border-b border-[#35363A] sticky top-0 z-40 px-4 py-2.5 w-full">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Shield Logo matching favicon */}
            <div className="w-8 h-8 bg-[#252529] border border-[#35363A] rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:scale-115 hover:rotate-6 transition-all duration-200 shrink-0" title="QuestGrow">
              <span className="text-lg select-none">🛡️</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2 font-sans flex-wrap">
                <span className="flex items-center gap-1.5">
                  QuestGrow
                  <span className="text-[9px] bg-[#3661FF] text-white px-1.5 py-0.5 rounded font-black tracking-normal normal-case">BETA</span>
                </span>
                <span className="text-xs text-slate-400 font-bold normal-case border-l border-slate-700 pl-2 ml-0.5">
                  {t('tagline')}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                {/* R$ Robux Coin Icon */}
                <span className="text-[#FF9F1C] bg-[#FF9F1C]/10 px-2 py-0.5 rounded border border-[#FF9F1C]/30 font-bold flex items-center gap-1 text-[11px]">
                  <span className="inline-block w-3.5 h-3.5 bg-[#FF9F1C] transform rotate-12 rounded-sm flex items-center justify-center text-[8px] text-[#111216] font-black">R$</span>
                  {familyScore.toLocaleString()} Pts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {role === 'kid' && currentUser && currentUser.role === 'parent' && children.length > 1 && (
              <div className="flex items-center gap-1 bg-[#252529] p-1 rounded border border-[#35363A] mx-1">
                {children.map(child => {
                  const isSelf = currentUser && currentUser.role === 'kid' && currentUser.childId === child.id;
                  const isActive = activeChildId === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setActiveChildId(child.id)}
                      className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg border transition-all ${
                        isActive
                          ? isSelf
                            ? 'border-[#00E676] bg-[#00E676]/10 scale-105 font-black text-[#00E676]'
                            : 'border-[#3661FF] bg-[#3661FF]/10 scale-105 font-black text-[#3661FF]'
                          : isSelf
                            ? 'border-[#00E676]/40 bg-[#00E676]/5 opacity-90 text-[#00E676]'
                            : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100 text-slate-400'
                      }`}
                      title={language === 'zh' ? `切換至 ${child.name}` : `Switch to ${child.name}`}
                    >
                      <Avatar 
                        avatar={child.avatar} 
                        role="kid" 
                        className={`w-7 h-7 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 ${
                          isSelf ? 'ring-2 ring-[#00E676] ring-offset-1 ring-offset-[#252529] shadow-[0_0_8px_rgba(0,230,118,0.4)]' : ''
                        }`} 
                      />
                      <span className="text-[9px] font-bold leading-none truncate max-w-[55px]">
                        {child.name}{isSelf ? (language === 'zh' ? ' (我)' : ' (Me)') : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {role === 'parent' && currentUser && (
              <div className="flex items-center gap-1 bg-[#252529] p-1 rounded border border-[#35363A] mx-1">
                <div
                  className="flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg border border-[#00E676] bg-[#00E676]/10 scale-105 font-black text-[#00E676]"
                >
                  <Avatar 
                    avatar={currentUser.avatar} 
                    role="parent" 
                    className="w-7 h-7 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-rose-600 to-amber-400 ring-2 ring-[#00E676] ring-offset-1 ring-offset-[#252529] shadow-[0_0_8px_rgba(0,230,118,0.4)]" 
                  />
                  <span className="text-[9px] font-bold leading-none truncate max-w-[70px]">
                    {currentUser.name}{language === 'zh' ? ' (我)' : ' (Me)'}
                  </span>
                </div>
              </div>
            )}

            {currentUser.role === 'parent' && (
              <>
                <div className="w-[1px] h-5 bg-[#35363A] mx-1 hidden sm:block"></div>
                <button
                  onClick={() => {
                    setRole(prev => prev === 'kid' ? 'parent' : 'kid');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors shadow-sm mr-1"
                >
                  {role === 'kid' ? t('viewParentMode') : t('viewKidMode')}
                </button>
              </>
            )}

            <div className="w-[1px] h-5 bg-[#35363A] mx-1 hidden sm:block"></div>

            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#252529] border border-[#35363A] text-slate-300 hover:text-white transition-colors shadow-sm mr-1"
              title={language === 'zh' ? '切換至英文' : 'Switch to English'}
            >
              🌐 {language === 'zh' ? 'English' : '中文'}
            </button>

            <div className="w-[1px] h-5 bg-[#35363A] mx-1 hidden sm:block"></div>

            {/* User Profile & Logout pill */}
            <div className="flex items-center gap-2 bg-[#252529] border border-[#35363A] px-3 py-1.5 rounded-[4px] text-xs font-bold text-slate-350 shrink-0">
              <Avatar avatar={currentUser.avatar} role={currentUser.role} className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden" />
              <span className="truncate max-w-[85px] text-slate-300" title={currentUser.name}>
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-1 text-slate-500 hover:text-[#FF4747] rounded transition-colors"
                title={t('logout')}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {role === 'kid' ? (
          <KidPortal 
            stats={childStats} 
            tasks={tasks} 
            inventory={inventory.filter(i => !i.ownerId || i.ownerId === activeChildId)} 
            wishlist={wishlist}
            familyScore={familyScore}
            onSubmitTask={handleSubmitTask}
            onDrawCard={handleAwardGachaCard}
            onRequestRedeem={handleRequestRedeem}
            onConfirmRedeem={handleApproveRedeem}
            balancedIndex={getBalancedDevelopmentIndex()}
            onClaimWishlistItem={handleRedeemWishlist}
            simulatedDate={getSimulatedDateString()}
            drawnTaskIds={drawnTaskIds}
            onUpdateDrawnTasks={setDrawnTaskIds}
            onUpdateChildProfile={handleUpdateChildProfile}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onLinkGoogleAccount={handleLinkGoogleAccount}
            isReadOnly={currentUser && currentUser.role === 'kid' && activeChildId !== currentUser.childId}
          />
        ) : (
          <ParentPortal 
            stats={childStats}
            tasks={tasks}
            inventory={inventory}
            wishlist={wishlist}
            familyScore={familyScore}
            redeemLogs={redeemLogs}
            eventLogs={eventLogs}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onClearAllTasks={handleClearAllTasks}
            onApproveTask={handleApproveTask}
            onRejectTask={handleRejectTask}
            onApproveRedeem={handleApproveRedeem}
            onRejectRedeem={handleRejectRedeem}
            onAddWishlist={handleAddWishlistItem}
            onEditWishlist={handleEditWishlistItem}
            onDeleteWishlist={handleDeleteWishlistItem}
            onClearData={handleClearAllData}
            balancedIndex={getBalancedDevelopmentIndex()}
            simulatedDate={getSimulatedDateString()}
            onUpdateChildProfile={handleUpdateChildProfile}
            children={children}
            onAddChild={handleAddChild}
            onDeleteChild={handleDeleteChild}
            currentUser={currentUser}
            onLinkGoogleAccount={handleLinkGoogleAccount}
            usersDB={members}
            onAddParent={handleAddParent}
            onDeleteParent={handleDeleteParent}
            onUpdateParent={handleUpdateParent}
          />
        )}
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-white/5 mt-auto">
        <p>© 2026 QuestGrow Family Growth OS. 符合 PWA, COPPA & GDPR-K 隱私合規規範。</p>
      </footer>
    </div>
  );
}

export default App;
