import React, { useState, useEffect, useRef } from 'react';
import { triggerConfetti, playCoinSound, playLevelUpSound } from './utils/sfx';
import { 
  EMPTY_CHILD_STATS,
  INITIAL_TASKS, 
  INITIAL_INVENTORY, 
  INITIAL_PARENT_GOALS, 
  INITIAL_WISHLIST, 
  INITIAL_REDEEM_LOGS, 
  INITIAL_WEEKLY_COMPETITION,
  GACHA_POOL
} from './utils/mockData';
import ParentPortal from './components/ParentPortal';
import KidPortal from './components/KidPortal';
import AdminPortal from './components/AdminPortal';
import LoginPortal from './components/LoginPortal';
import Avatar from './components/Avatar';
import { useLanguage } from './components/LanguageContext';
import FeedbackModal from './components/FeedbackModal';
import { setupPushNotifications } from './utils/pushManager';
import { Trophy, ShieldAlert, Sparkles, User, Users, RefreshCw, AlertCircle, CheckCircle, Info, LogOut, Mail } from 'lucide-react';
import { api } from './utils/api';

function App() {
  const { language, toggleLanguage, t } = useLanguage();
  
  // --- Authentication States ---
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('questgrow_current_user');
    if (local) {
      try {
        const user = JSON.parse(local);
        if (user && user.child_id && !user.childId) {
          user.childId = user.child_id;
        }
        return user;
      } catch (e) {}
    }
    return null;
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
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Initialize Auth configuration and verify/restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1. Fetch Google Client ID
        try {
          const config = await api.getAuthConfig();
          if (config && config.googleClientId) {
            setGoogleClientId(config.googleClientId);
          }
        } catch (error) {
          console.error('Failed to fetch auth config:', error);
        }

        // 2. Fetch updated user profile & fresh token if logged in
        const token = localStorage.getItem('questgrow_jwt_token');
        if (token) {
          try {
            const res = await api.getMe();
            if (res && res.user) {
              const mappedUser = {
                ...res.user,
                childId: res.user.childId || res.user.child_id
              };
              setCurrentUser(mappedUser);
              if (mappedUser.role === 'admin') {
                setRole('admin');
              } else if (mappedUser.role === 'kid') {
                setRole('kid');
              }
            }
          } catch (error) {
            console.error('Failed to restore session:', error);
            // If the token is invalid/expired or user is not found, clear current user
            setCurrentUser(null);
            setRole('kid');
          }
        }
      } finally {
        setIsRestoringSession(false);
      }
    };
    initAuth();
  }, []);

  // --- Core States ---
  const [children, setChildren] = useState([]);
  const [activeChildId, setActiveChildId] = useState('');
  const [drawnTasksMap, setDrawnTasksMap] = useState(() => {
    const local = localStorage.getItem('questgrow_drawn_tasks_map');
    return local ? JSON.parse(local) : {};
  });
  
  const [tasks, setTasks] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [parentGoals, setParentGoals] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [redeemLogs, setRedeemLogs] = useState([]);
  const [familyScore, setFamilyScore] = useState(0);
  const [weeklyComp, setWeeklyComp] = useState(INITIAL_WEEKLY_COMPETITION);
  const [eventLogs, setEventLogs] = useState([]);
  const [members, setMembers] = useState([]); // Replaces usersDB
  const [gachaPool, setGachaPool] = useState(GACHA_POOL);
  const [familySettings, setFamilySettings] = useState({ zhuyinUnder8: true });
  const [familyNickname, setFamilyNickname] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [dailyProverb, setDailyProverb] = useState({
    contentZh: "千里之行，始於足下。",
    contentEn: "A journey of a thousand miles begins with a single step."
  });
  const [dailyAdultProverb, setDailyAdultProverb] = useState({
    contentZh: "教育的秘訣在於尊重學生。",
    contentEn: "The secret of education lies in respecting the pupil."
  });

  // --- Task Conflict Confirmation Modals ---
  const [taskConflict, setTaskConflict] = useState(null); // { type, message, task, conflictingTaskId }
  
  // --- Toast State ---
  const [toasts, setToasts] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isAssigningTasks, setIsAssigningTasks] = useState(false);
  const [taskAssignProgress, setTaskAssignProgress] = useState(0);
  const [showLongWaitMessage, setShowLongWaitMessage] = useState(false);

  useEffect(() => {
    let timer;
    if (isAssigningTasks) {
      setShowLongWaitMessage(false);
      timer = setTimeout(() => {
        setShowLongWaitMessage(true);
      }, 10000);
    } else {
      setShowLongWaitMessage(false);
    }
    return () => clearTimeout(timer);
  }, [isAssigningTasks]);

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

  const childStats = children.find(c => c.id === activeChildId) || children[0] || EMPTY_CHILD_STATS;

  // --- Dynamic Level Up Detection & Confetti Celebration ---
  const prevLevelRef = useRef(childStats?.level);
  useEffect(() => {
    if (childStats && childStats.id) {
      if (prevLevelRef.current !== undefined && childStats.level > prevLevelRef.current) {
        triggerConfetti();
        playLevelUpSound();
        showToast(`🎉 恭喜！你升級到了 Lv. ${childStats.level}！`, 'success');
      }
      prevLevelRef.current = childStats.level;
    } else {
      prevLevelRef.current = undefined;
    }
  }, [childStats, children]);

  // --- Fetch Data from Backend ---
  const fetchAllData = async () => {
    if (!currentUser) return;
    try {
      const familyData = await api.getFamilyData();
      if (familyData) {
        setFamilyScore(familyData.growthScore);
        setFamilyNickname(familyData.familyNickname || '');
        if (familyData.gachaPool) {
          setGachaPool(familyData.gachaPool);
        } else {
          setGachaPool(GACHA_POOL);
        }
        if (familyData.settings) {
          setFamilySettings(familyData.settings);
        } else {
          setFamilySettings({ zhuyinUnder8: true });
        }
      }

      const childrenData = await api.getChildren();
      // Normalize: ensure each child's attributes is always a valid object (never null)
      const normalizedChildren = childrenData.map(c => ({
        ...c,
        attributes: c.attributes || { Wisdom: 0, Responsibility: 0, Courage: 0, Empathy: 0, Creativity: 0 }
      }));
      setChildren(normalizedChildren);
      
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

      try {
        const leaderboard = await api.getFamilyLeaderboard();
        setLeaderboardData(leaderboard);
      } catch (e) {
        console.error("Leaderboard fetch error:", e);
      }

      try {
        const proverbData = await api.getDailyProverb(getSimulatedDateString(), 'kid');
        if (proverbData) {
          setDailyProverb(proverbData);
        }
      } catch (e) {
        console.error("Proverb fetch error:", e);
      }

      try {
        const adultProverbData = await api.getDailyProverb(getSimulatedDateString(), 'parent');
        if (adultProverbData) {
          setDailyAdultProverb(adultProverbData);
        }
      } catch (e) {
        console.error("Adult Proverb fetch error:", e);
      }
    } catch (error) {
      console.error('Fetch all data error:', error);
      showToast(error.message || '載入雲端資料失敗！', 'error');
    }
  };

  // Fetch data on login session established
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
      setupPushNotifications(currentUser);
    }
  }, [currentUser]);

  // Auth local storage synchronization
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('questgrow_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'kid') {
        setRole('kid');
      } else if (currentUser.role === 'admin') {
        setRole('admin');
      }
    } else {
      localStorage.removeItem('questgrow_current_user');
      api.logout();
    }
  }, [currentUser]);

  // Listen for storage changes to handle multi-tab session synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'questgrow_jwt_token' || e.key === 'questgrow_current_user') {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('questgrow_active_child_id', activeChildId);
  }, [activeChildId]);

  useEffect(() => {
    localStorage.setItem('questgrow_drawn_tasks_map', JSON.stringify(drawnTasksMap));
  }, [drawnTasksMap]);

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
    setIsLoggingIn(true);

    try {
      if (isRegister) {
        await api.register(email, password, name, avatar);
        showToast('註冊成功，請登入！', 'success');
        return true;
      }

      if (isGoogle) {
        const data = await api.googleLogin(credential, selectedRole);
        const mappedUser = {
          ...data.user,
          childId: data.user.childId || data.user.child_id
        };
        setCurrentUser(mappedUser);
        setRole(data.user.role);
        showToast(`歡迎回來，${data.user.name}！`, 'success');
        return true;
      }

      // Standard Login
      const data = await api.login(email, password);
      const mappedUser = {
        ...data.user,
        childId: data.user.childId || data.user.child_id
      };
      setCurrentUser(mappedUser);
      setRole(data.user.role);
      showToast(`歡迎回來，${data.user.name}！`, 'success');
      return true;
    } catch (error) {
      showToast(error.message || '身分驗證失敗，請檢查輸入。', 'error');
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logEvent("user_logout", { email: currentUser?.email || '' });
    setCurrentUser(null);
    setChildren([]);
    setActiveChildId('');
    setTasks([]);
    setInventory([]);
    setWishlist([]);
    setRedeemLogs([]);
    setFamilyScore(0);
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
      const res = await api.addChild({
        name: newChildData.name,
        age: newChildData.age,
        birthday: newChildData.birthday,
        avatar: newChildData.avatar,
        email: newChildData.email,
        password: newChildData.password
      });

      const createdChild = res.child;

      // Update custom starting job class and attributes if selected in wizard
      if (createdChild && (newChildData.jobClass || newChildData.attributes)) {
        await api.updateChildProfile(createdChild.id, {
          job_class: newChildData.jobClass,
          attributes: newChildData.attributes
        });
      }

      // Automatically assign selected initial starter quests
      if (createdChild && newChildData.initialTasks && newChildData.initialTasks.length > 0) {
        await Promise.all(newChildData.initialTasks.map(task => {
          return api.addTask({
            name: task.name,
            description: task.description,
            type: task.type,
            difficulty: task.difficulty,
            expReward: task.expReward,
            goldReward: task.goldReward,
            ticketReward: task.ticketReward,
            attributeReward: task.attributeReward,
            period: task.period,
            assignedTo: createdChild.id,
            status: '進行中'
          });
        }));
      }

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
      const res = await api.updateChildProfile(targetId, data);
      showToast('小孩角色資料已更新！', 'success');

      // Update current user state and local storage if the logged-in child's own profile was updated
      if (currentUser && currentUser.role === 'kid' && currentUser.childId === targetId) {
        const updatedUser = {
          ...currentUser,
          avatar: res.child.avatar,
          name: res.child.name
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('questgrow_current_user', JSON.stringify(updatedUser));
      }

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

  const handleUpdateFamilyNickname = async (nickname) => {
    try {
      await api.updateFamilyNickname(nickname);
      setFamilyNickname(nickname);
      showToast('家庭暱稱已更新！', 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '更新家庭暱稱失敗。', 'error');
      return false;
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      await api.completeOnboarding();
      // Update currentUser onboardingCompleted local state
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          onboardingCompleted: true
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('questgrow_current_user', JSON.stringify(updatedUser));
      }
      showToast('🎉 恭喜完成家長設定引導！', 'success');
      fetchAllData();
      return true;
    } catch (error) {
      showToast(error.message || '更新引導進度失敗。', 'error');
      return false;
    }
  };

  // --- Task Operations ---
  const handleAddTask = async (newTaskOrTasks, taskIdToSwap, force = false) => {
    const isArray = Array.isArray(newTaskOrTasks);
    const isBatch = isArray && newTaskOrTasks.length > 1;

    let progressInterval;
    if (isBatch) {
      setIsAssigningTasks(true);
      setTaskAssignProgress(0);

      progressInterval = setInterval(() => {
        setTaskAssignProgress(prev => {
          if (prev >= 92) return prev;
          const increment = Math.floor(Math.random() * 8) + 3;
          return Math.min(prev + increment, 92);
        });
      }, 120);
    }

    try {
      const isArray = Array.isArray(newTaskOrTasks);
      const isActuallyBatch = isArray && newTaskOrTasks.length > 1;
      let createdTasks = [];

      if (isActuallyBatch) {
        // Send a single batch request
        const apiTasksData = newTaskOrTasks.map(task => ({
          name: task.name,
          description: task.description,
          type: task.type,
          difficulty: task.difficulty,
          expReward: task.expReward,
          goldReward: task.goldReward,
          ticketReward: task.ticketReward,
          attributeReward: task.attributeReward,
          period: task.period,
          assignedTo: task.assignedTo || activeChildId,
          status: task.status,
          force: force,
          swapCount: task.swapCount || 0
        }));

        const res = await api.addTask(apiTasksData);
        createdTasks = res.tasks || [];
      } else {
        // Single task (or array of length 1)
        const singleTask = isArray ? newTaskOrTasks[0] : newTaskOrTasks;
        const apiTaskData = {
          name: singleTask.name,
          description: singleTask.description,
          type: singleTask.type,
          difficulty: singleTask.difficulty,
          expReward: singleTask.expReward,
          goldReward: singleTask.goldReward,
          ticketReward: singleTask.ticketReward,
          attributeReward: singleTask.attributeReward,
          period: singleTask.period,
          assignedTo: singleTask.assignedTo || activeChildId,
          status: singleTask.status,
          force: force,
          swapCount: singleTask.swapCount || 0
        };

        const res = await api.addTask(apiTaskData);
        createdTasks = res.task ? [res.task] : [];
      }

      if (role === 'kid') {
        if (isArray && newTaskOrTasks.length > 0) {
          const newDrawnIds = createdTasks.map(t => t.id);
          setDrawnTasksMap(prev => {
            const existingIds = prev[activeChildId] || [];
            const merged = Array.from(new Set([...existingIds, ...newDrawnIds])).slice(-5);
            return { ...prev, [activeChildId]: merged };
          });
          if (newTaskOrTasks.length === 5) {
            showToast('🎉 抽選成功！德、智、體、群、美各 1 張任務已加入你的冒險任務庫。', 'success');
          } else {
            showToast(`🎉 成功補充 ${newTaskOrTasks.length} 個任務！`, 'success');
          }
        } else if (taskIdToSwap) {
          const realNewId = createdTasks[0]?.id;
          if (realNewId) {
            setDrawnTasksMap(prev => {
              const currentIds = prev[activeChildId] || [];
              const updatedIds = currentIds.map(id => id === taskIdToSwap ? realNewId : id);
              return { ...prev, [activeChildId]: updatedIds };
            });
          }

          // Delete the old swapped task from database to prevent clutter
          try {
            await api.deleteTask(taskIdToSwap);
          } catch (e) {
            console.error("Failed to delete swapped task from DB:", e);
          }
        }
      } else {
        if (isBatch) {
          showToast(`成功指派了 ${newTaskOrTasks.length} 個任務！`, 'success');
        } else {
          showToast('任務指派成功！', 'success');
        }
      }

      if (isBatch) {
        if (progressInterval) clearInterval(progressInterval);
        setTaskAssignProgress(100);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      await fetchAllData();
      return createdTasks;
    } catch (error) {
      if (progressInterval) clearInterval(progressInterval);
      if (error.code === 'TASK_DUPLICATE_WARNING') {
        return new Promise((resolve) => {
          setTaskConflict({
            type: 'duplicate',
            message: error.message,
            task: newTaskOrTasks,
            conflictingTaskId: error.conflictingTaskId,
            onConfirm: async () => {
              setTaskConflict(null);
              const result = await handleAddTask(newTaskOrTasks, taskIdToSwap, true);
              resolve(result);
            },
            onReplace: async () => {
              setTaskConflict(null);
              if (isBatch) setIsAssigningTasks(true);
              try {
                // Delete duplicate task first
                await api.deleteTask(error.conflictingTaskId);
                // Assign new task with force=true
                const result = await handleAddTask(newTaskOrTasks, taskIdToSwap, true);
                showToast('已成功取代舊任務！', 'success');
                resolve(result);
              } catch (e) {
                showToast(e.message || '取代任務失敗。', 'error');
                resolve(false);
              } finally {
                if (isBatch) setIsAssigningTasks(false);
              }
            },
            onCancel: () => {
              setTaskConflict(null);
              resolve(false);
            }
          });
        });
      }
      if (error.code === 'TASK_COOLDOWN_WARNING') {
        return new Promise((resolve) => {
          setTaskConflict({
            type: 'cooldown',
            message: error.message,
            task: newTaskOrTasks,
            onConfirm: async () => {
              setTaskConflict(null);
              const result = await handleAddTask(newTaskOrTasks, taskIdToSwap, true);
              resolve(result);
            },
            onCancel: () => {
              setTaskConflict(null);
              resolve(false);
            }
          });
        });
      }
      showToast(error.message || '任務指派失敗。', 'error');
      return false;
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setIsAssigningTasks(false);
    }
  };

  const handleEditTask = async (taskId, updatedFields, force = false) => {
    try {
      await api.editTask(taskId, { ...updatedFields, force });
      await fetchAllData();
      return true;
    } catch (error) {
      if (error.code === 'TASK_COOLDOWN_WARNING') {
        return new Promise((resolve) => {
          setCooldownWarning({
            message: error.message,
            onConfirm: async () => {
              setCooldownWarning(null);
              const result = await handleEditTask(taskId, updatedFields, true);
              resolve(result);
            },
            onCancel: () => {
              setCooldownWarning(null);
              resolve(false);
            }
          });
        });
      }
      showToast(error.message || '編輯任務失敗。', 'error');
      return false;
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

  const handleUpdateGachaPool = async (newPool) => {
    try {
      await api.updateGachaPool(newPool);
      setGachaPool(newPool);
      showToast('轉蛋獎勵卡片更新成功！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '更新轉蛋池失敗。', 'error');
    }
  };

  const handleUpdateFamilySettings = async (newSettings) => {
    try {
      await api.updateFamilySettings(newSettings);
      setFamilySettings(newSettings);
      showToast('共同設定更新成功！', 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '更新共同設定失敗。', 'error');
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
      playCoinSound();
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

  const handleBulkApproveTasks = async () => {
    const pendingTasks = tasks.filter(t => t.status === '待覆核');
    if (pendingTasks.length === 0) return;
    try {
      await Promise.all(pendingTasks.map(task => api.reviewTask(task.id, 'approve')));
      showToast('所有待核准任務已完成審核並發放獎勵！', 'success');
      playCoinSound();
      fetchAllData();
    } catch (error) {
      showToast(error.message || '一鍵審核任務失敗。', 'error');
      fetchAllData();
    }
  };

  const handleBulkApproveRedeems = async () => {
    const pendingRedemptions = inventory.filter(i => i.status === '待核銷');
    if (pendingRedemptions.length === 0) return;
    try {
      await Promise.all(pendingRedemptions.map(item => api.reviewRedeem(item.inventoryId, 'approve')));
      showToast('所有待核銷特權已核准使用！', 'success');
      playCoinSound();
      fetchAllData();
    } catch (error) {
      showToast(error.message || '一鍵核銷特權失敗。', 'error');
      fetchAllData();
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

  // --- Buy Ticket with Gold (Vending Machine) ---
  const handleBuyTicketWithGold = async () => {
    try {
      await api.buyTicketWithGold();
      showToast('🎉 成功使用 300 金幣兌換 1 張抽卡券！', 'success');
      playCoinSound();
      fetchAllData();
    } catch (error) {
      showToast(error.message || '兌換失敗，請稍後再試。', 'error');
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

  const handleCancelRedeem = async (inventoryId) => {
    try {
      await api.cancelRedeem(inventoryId);
      showToast('已取消核銷申請，卡片已還原。', 'info');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '取消卡片核銷失敗。', 'error');
    }
  };

  const handleApproveRedeem = async (inventoryId) => {
    try {
      await api.reviewRedeem(inventoryId, 'approve');
      showToast('已核准卡片使用！全家獲得 +50 積分！', 'success');
      playCoinSound();
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

  const handleToggleEquip = async (inventoryId) => {
    try {
      const data = await api.toggleEquipItem(inventoryId);
      showToast(data.message, 'success');
      fetchAllData();
    } catch (error) {
      showToast(error.message || '操作失敗。', 'error');
    }
  };

  const getActiveBadge = (childId) => {
    const activeItem = inventory.find(i => i.childId === childId && i.type === '收藏卡' && i.status === '已使用');
    return activeItem ? activeItem.id : null;
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
    
    // Weight map based on difficulty
    const DIFFICULTY_WEIGHTS = {
      "簡單": 1,
      "中等": 2,
      "較難": 3,
      "終極": 4
    };

    const dimensions = ['德', '智', '體', '群', '美'];
    const TARGET_POINTS = 4; // Weekly target score per dimension

    let totalCappedScore = 0;
    dimensions.forEach(dim => {
      const dimTasks = completedTasks.filter(t => t.type === dim);
      const score = dimTasks.reduce((sum, t) => sum + (DIFFICULTY_WEIGHTS[t.difficulty] || 1), 0);
      const capped = Math.min(TARGET_POINTS, score);
      totalCappedScore += (capped / TARGET_POINTS);
    });

    return Math.round((totalCappedScore / 5) * 100);
  };

  if (isRestoringSession || isLoggingIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EBF4FC] select-none relative">
        {/* Background glowing effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="glass-panel p-8 border border-white/50 bg-white/70 shadow-2xl space-y-6 text-center max-w-sm w-full relative z-10">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border border-white/20 relative animate-spin">
            <div className="absolute inset-1 rounded-full bg-white/90"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full absolute top-1 left-1/2 -ml-1.5"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800 tracking-wider">
              {isLoggingIn ? '正在進行身分驗證...' : '正在載入冒險世界...'}
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              {isLoggingIn ? '冒險之門即將開啟，請稍候。' : '正在進行安全驗證與資料同步，請稍候。'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <LoginPortal 
          onLogin={handleLogin} 
          googleClientId={googleClientId} 
          onOpenFeedback={() => setShowFeedbackModal(true)} 
        />
        {showFeedbackModal && (
          <FeedbackModal 
            onClose={() => setShowFeedbackModal(false)} 
            currentUser={null}
            showToast={showToast}
          />
        )}
      </>
    );
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

      {/* ── Top Header: Premium QuestGrow Navigation ── */}
      <header className="questgrow-header sticky top-0 z-40 px-4 py-0 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 h-14">

          {/* ── Left: Logo + Wordmark ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Logo Icon - Shield with sprout */}
            <div className="questgrow-logo-icon w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer flex-shrink-0" title="QuestGrow">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Shield body */}
                <path d="M11 2L3 5.5V11C3 15.4 6.4 19.5 11 21C15.6 19.5 19 15.4 19 11V5.5L11 2Z" fill="white" fillOpacity="0.25"/>
                <path d="M11 2L3 5.5V11C3 15.4 6.4 19.5 11 21C15.6 19.5 19 15.4 19 11V5.5L11 2Z" stroke="white" strokeWidth="1.2" strokeLinejoin="round"/>
                {/* Sprout stem */}
                <line x1="11" y1="15" x2="11" y2="10" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round"/>
                {/* Left leaf */}
                <path d="M11 12.5C11 12.5 9 11.5 8.5 10C9.5 10 11 11 11 12.5Z" fill="#6ee7b7"/>
                {/* Right leaf */}
                <path d="M11 12.5C11 12.5 13 11.5 13.5 10C12.5 10 11 11 11 12.5Z" fill="#34d399"/>
                {/* Top bud */}
                <circle cx="11" cy="9.5" r="1.2" fill="#fbbf24"/>
                {/* Star sparkle top-right */}
                <path d="M16.5 5L16.8 6L17.8 6L17 6.6L17.3 7.6L16.5 7L15.7 7.6L16 6.6L15.2 6L16.2 6L16.5 5Z" fill="#fde68a" fillOpacity="0.9"/>
              </svg>
            </div>

            {/* Wordmark */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[17px] font-black leading-none questgrow-wordmark">
                  QuestGrow
                </h1>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', letterSpacing: '0.05em' }}>
                  BETA
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="hidden sm:block text-[11px] font-semibold" style={{ color: '#94a3b8' }}>
                  {t('tagline')}
                </span>
                {/* Family score chip */}
                <span className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', color: '#d97706', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <span className="w-3 h-3 rounded-sm flex items-center justify-center text-[7px] font-black" style={{ background: '#f59e0b', color: '#fff' }}>★</span>
                  {familyScore.toLocaleString()} Pts
                </span>
              </div>
            </div>
          </div>

          {/* ── Right: Nav Controls ── */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">

            {/* Child switcher (parent viewing kid mode with multiple kids) */}
            {role === 'kid' && currentUser && currentUser.role === 'parent' && children.length > 1 && (
              <div className="flex items-center gap-1 p-1 rounded-xl border" style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                {children.map(child => {
                  const isSelf = currentUser && currentUser.role === 'kid' && currentUser.childId === child.id;
                  const isActive = activeChildId === child.id;
                  return (
                    <button
                      key={child.id}
                      onClick={() => setActiveChildId(child.id)}
                      className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg border transition-all ${
                        isActive
                          ? 'border-indigo-300 bg-indigo-50 scale-105 shadow-sm'
                          : 'border-transparent hover:bg-slate-100 opacity-60 hover:opacity-100'
                      }`}
                      title={language === 'zh' ? `切換至 ${child.name}` : `Switch to ${child.name}`}
                    >
                      <Avatar
                        avatar={child.avatar}
                        role="kid"
                        badge={getActiveBadge(child.id)}
                        className={`w-7 h-7 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-violet-400 to-cyan-400 ${
                          isActive ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-white' : ''
                        }`}
                      />
                      <span className="text-[9px] font-bold leading-none truncate max-w-[55px]" style={{ color: isActive ? '#6366f1' : '#64748b' }}>
                        {child.name}{isSelf ? (language === 'zh' ? ' (我)' : ' (Me)') : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Switch mode button (parent only) */}
            {currentUser.role === 'parent' && (
              <button
                onClick={() => { setRole(prev => prev === 'kid' ? 'parent' : 'kid'); }}
                className="header-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
              >
                <span className="text-sm">{role === 'kid' ? '👨‍👩‍👧' : '🎮'}</span>
                {role === 'kid' ? t('viewParentMode') : t('viewKidMode')}
              </button>
            )}

            {/* Divider */}
            <div className="w-px h-5 rounded-full mx-0.5 hidden sm:block" style={{ background: '#e2e8f0' }} />

            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="header-btn-secondary flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all"
              title={language === 'zh' ? '切換至英文' : 'Switch to English'}
            >
              🌐 {language === 'zh' ? 'EN' : '中'}
            </button>

            {/* Divider */}
            <div className="w-px h-5 rounded-full mx-0.5 hidden sm:block" style={{ background: '#e2e8f0' }} />

            {/* User avatar + logout */}
            <div className="header-user-pill flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold">
              <Avatar
                avatar={currentUser.avatar}
                role={currentUser.role}
                badge={currentUser.role === 'kid' ? getActiveBadge(currentUser.childId) : null}
                className="w-5 h-5 rounded-full flex items-center justify-center overflow-hidden"
              />
              <span className="truncate max-w-[80px] hidden sm:block font-black" style={{ color: '#334155' }} title={currentUser.name}>
                {currentUser.name}
              </span>
              <button
                onClick={handleLogout}
                className="p-0.5 rounded-lg transition-colors hover:bg-rose-50"
                style={{ color: '#94a3b8' }}
                title={t('logout')}
                onMouseEnter={e => e.currentTarget.style.color = '#f43f5e'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {role === 'admin' ? (
          <AdminPortal currentUser={currentUser} onLogout={handleLogout} />
        ) : role === 'kid' ? (
          <KidPortal 
            stats={childStats} 
            tasks={tasks.filter(t => !t.assignedTo || t.assignedTo === activeChildId)} 
            inventory={inventory.filter(i => i.childId === activeChildId)} 
            wishlist={wishlist}
            familyScore={familyScore}
            familyNickname={familyNickname}
            leaderboardData={leaderboardData}
            onSubmitTask={handleSubmitTask}
            onDrawCard={handleAwardGachaCard}
            onRequestRedeem={handleRequestRedeem}
            onCancelRedeem={handleCancelRedeem}
            onConfirmRedeem={handleApproveRedeem}
            balancedIndex={getBalancedDevelopmentIndex()}
            onClaimWishlistItem={handleRedeemWishlist}
            simulatedDate={getSimulatedDateString()}
            drawnTaskIds={drawnTasksMap[activeChildId] || []}
            onUpdateDrawnTasks={(newIds) => {
              setDrawnTasksMap(prev => ({ ...prev, [activeChildId]: newIds }));
            }}
            onUpdateChildProfile={handleUpdateChildProfile}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onLinkGoogleAccount={handleLinkGoogleAccount}
            isReadOnly={currentUser && currentUser.role === 'kid' && activeChildId !== currentUser.childId}
            googleClientId={googleClientId}
            onToggleEquip={handleToggleEquip}
            gachaPool={gachaPool}
            familySettings={familySettings}
            onBuyTicketWithGold={handleBuyTicketWithGold}
            dailyProverb={dailyProverb}
          />
        ) : (
          <ParentPortal 
            stats={childStats}
            tasks={tasks}
            onOpenFeedback={() => setShowFeedbackModal(true)}
            inventory={inventory}
            wishlist={wishlist}
            familyScore={familyScore}
            familyNickname={familyNickname}
            leaderboardData={leaderboardData}
            onUpdateFamilyNickname={handleUpdateFamilyNickname}
            onCompleteOnboarding={handleCompleteOnboarding}
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
            onBulkApproveTasks={handleBulkApproveTasks}
            onBulkApproveRedeems={handleBulkApproveRedeems}
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
            gachaPool={gachaPool}
            onUpdateGachaPool={handleUpdateGachaPool}
            familySettings={familySettings}
            onUpdateFamilySettings={handleUpdateFamilySettings}
            dailyProverb={dailyAdultProverb}
            onClaimWishlistItem={handleRedeemWishlist}
          />
        )}
      </main>

      {/* ⚠️ 任務衝突管理員 (Task Conflict Manager Modal) */}
      {taskConflict && (
        <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 border border-amber-500/30 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
              <h3 className="text-lg font-black text-amber-500 animate-pulse">
                {taskConflict.type === 'duplicate' 
                  ? (language === 'zh' ? '🛡️ 進行中任務衝突管理' : '🛡️ Active Task Conflict')
                  : (language === 'zh' ? '⚠️ 任務重複指派提醒' : '⚠️ Duplicate Task Cooldown')
                }
              </h3>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
              {taskConflict.message}
            </p>
            
            <div className="border-t border-slate-200/20 dark:border-white/5 pt-4 space-y-2">
              {taskConflict.type === 'duplicate' ? (
                <>
                  <button
                    type="button"
                    onClick={taskConflict.onReplace}
                    className="w-full px-4 py-2.5 rounded-[4px] text-xs font-black bg-[#FF4747] text-white hover:bg-[#ff3030] transition-colors"
                  >
                    {language === 'zh' ? '取代舊任務 (刪除原本重複任務，改指派新任務)' : 'Replace (Delete Existing)'}
                  </button>
                  <button
                    type="button"
                    onClick={taskConflict.onConfirm}
                    className="w-full px-4 py-2.5 rounded-[4px] text-xs font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-colors"
                  >
                    {language === 'zh' ? '重複指派 (增加為第二個進行中任務)' : 'Duplicate Assign (Keep Both)'}
                  </button>
                  <button
                    type="button"
                    onClick={taskConflict.onCancel}
                    className="w-full px-4 py-2.5 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-white hover:bg-[#35363a] transition-colors"
                  >
                    {language === 'zh' ? '取消指派' : 'Cancel Assignment'}
                  </button>
                </>
              ) : (
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={taskConflict.onConfirm}
                    className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-colors"
                  >
                    {language === 'zh' ? '確認強制指派' : 'Force Assign'}
                  </button>
                  <button
                    type="button"
                    onClick={taskConflict.onCancel}
                    className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-white hover:bg-[#35363a] transition-colors"
                  >
                    {language === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-200/20 mt-auto space-y-2">
        <p>© 2026 QuestGrow Family Growth OS. 遵循台灣個資法、兒少權益保障法及 PWA, COPPA & GDPR-K 隱私法規精神設計。</p>
        <p className="flex items-center justify-center gap-1.5 text-slate-400">
          <Mail className="h-3.5 w-3.5 text-indigo-400" />
          <span>有任何疑問或想法？歡迎：</span>
          <button 
            onClick={() => setShowFeedbackModal(true)}
            className="font-bold text-indigo-500 hover:text-indigo-600 underline transition-colors focus:outline-none"
          >
            填寫線上意見回饋表單
          </button>
        </p>
      </footer>

      {/* 懸浮意見回饋按鈕 */}
      <button 
        onClick={() => setShowFeedbackModal(true)} 
        className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-lg shadow-indigo-600/30 border border-white/20 transition-all hover:scale-110 active:scale-95 group flex items-center justify-center cursor-pointer focus:outline-none"
        title="意見回饋 (Feedback)"
      >
        <Mail className="h-5 w-5" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-bold text-xs transition-all duration-300 ease-in-out whitespace-nowrap">
          聯絡與回饋
        </span>
      </button>

      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)} 
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {isAssigningTasks && (
        <div 
          className="fixed inset-0 backdrop-blur-md z-[9999] flex flex-col items-center justify-center space-y-4"
          style={{ backgroundColor: 'rgba(9, 13, 22, 0.92)' }}
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin"></div>
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-amber-400 animate-pulse" style={{ filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))' }} />
          </div>
          <div className="text-center space-y-2 px-4">
            <h3 className="text-xl font-black text-amber-400 tracking-wider animate-pulse" style={{ textShadow: '0 0 12px rgba(251, 191, 36, 0.4)' }}>
              正在指派冒險任務...
            </h3>
            <p className="text-xs text-slate-300 font-bold max-w-sm leading-relaxed">
              冒險者公會正在為英雄們準備新的挑戰，請稍候 ⚔️
            </p>
            
            {/* Progress Bar */}
            <div className="flex flex-col items-center gap-1.5 mt-4">
              <div className="w-64 bg-white/10 h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300 h-full rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  style={{ width: `${taskAssignProgress}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-amber-400 font-black tracking-wider animate-pulse">
                {taskAssignProgress}%
              </div>

              {showLongWaitMessage && (
                <div className="text-[11px] text-amber-400 font-black tracking-normal animate-bounce mt-4 max-w-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                  ✨ 快要完成了！感謝您的等候 ✨
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
