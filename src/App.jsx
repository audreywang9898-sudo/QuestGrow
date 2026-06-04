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

function App() {
  const { language, toggleLanguage, t } = useLanguage();
  // --- Authentication States ---
  const [currentUser, setCurrentUser] = useState(() => {
    const local = localStorage.getItem('questgrow_current_user');
    return local ? JSON.parse(local) : null;
  });

  const [usersDB, setUsersDB] = useState(() => {
    const local = localStorage.getItem('questgrow_users_db');
    let db = [];
    if (local) {
      try {
        db = JSON.parse(local);
      } catch (e) {
        db = [];
      }
    }
    if (!Array.isArray(db) || db.length === 0) {
      db = [
        { email: 'parent@questgrow.com', password: 'password123', name: 'Audrey & Richard', role: 'parent', googleId: null, avatar: 'girl' },
        { email: 'kid@questgrow.com', password: 'password123', name: '小格林 (Leo)', role: 'kid', googleId: null, avatar: 'boy', childId: 'child-default' }
      ];
    }
    
    // Ensure childId is mapped on the default kid account
    db = db.map(u => u.email === 'kid@questgrow.com' && !u.childId ? { ...u, childId: 'child-default' } : u);

    // Merge default children accounts
    const defaultKids = [
      { email: 'michelle@questgrow.com', password: 'password123', name: 'Michelle', role: 'kid', googleId: null, avatar: 'girl', childId: 'child-michelle' },
      { email: 'daniel@questgrow.com', password: 'password123', name: 'Daniel', role: 'kid', googleId: null, avatar: 'boy', childId: 'child-daniel' }
    ];
    defaultKids.forEach(dk => {
      const exists = db.some(u => u.email.toLowerCase() === dk.email.toLowerCase());
      if (!exists) {
        db.push(dk);
      }
    });

    localStorage.setItem('questgrow_users_db', JSON.stringify(db));
    return db;
  });

  // --- LocalStorage Sync State ---
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


  const getSimulatedDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getSimulatedDateTime = () => {
    return Date.now();
  };

  // --- Core States ---
  const [children, setChildren] = useState(() => {
    const local = localStorage.getItem('questgrow_children');
    let list = [];
    if (local) {
      try {
        list = JSON.parse(local);
      } catch (e) {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) {
      const singleChildLocal = localStorage.getItem('questgrow_child_stats');
      if (singleChildLocal) {
        list = [{ ...INITIAL_CHILD_STATS, ...JSON.parse(singleChildLocal), id: 'child-default' }];
      } else {
        list = [{ ...INITIAL_CHILD_STATS, id: 'child-default' }];
      }
    }

    // Ensure list has child-default ID
    list = list.map((c, idx) => idx === 0 && !c.id ? { ...c, id: 'child-default' } : c);

    // Merge Michelle & Daniel default profiles
    const defaultProfiles = [
      {
        id: "child-michelle",
        name: "Michelle",
        age: 8,
        birthday: "05/12",
        avatar: "girl",
        level: 2,
        exp: 150,
        expNeeded: 700,
        gold: 200,
        tickets: 3,
        jobClass: "Guardian (守護者) 🛡️",
        attributes: { Wisdom: 12, Responsibility: 18, Courage: 10, Empathy: 16, Creativity: 14 }
      },
      {
        id: "child-daniel",
        name: "Daniel",
        age: 12,
        birthday: "09/30",
        avatar: "boy",
        level: 4,
        exp: 300,
        expNeeded: 1200,
        gold: 500,
        tickets: 4,
        jobClass: "Sage (智者) 🔮",
        attributes: { Wisdom: 22, Responsibility: 12, Courage: 15, Empathy: 10, Creativity: 18 }
      }
    ];

    defaultProfiles.forEach(dp => {
      const exists = list.some(c => c.id === dp.id);
      if (!exists) {
        list.push(dp);
      }
    });

    localStorage.setItem('questgrow_children', JSON.stringify(list));
    return list;
  });

  const [activeChildId, setActiveChildId] = useState(() => {
    const local = localStorage.getItem('questgrow_active_child_id');
    return local || (children[0]?.id || 'child-default');
  });

  const childStats = children.find(c => c.id === activeChildId) || children[0] || INITIAL_CHILD_STATS;

  const [drawnTaskIds, setDrawnTaskIds] = useState(() => {
    const local = localStorage.getItem('questgrow_drawn_task_ids');
    if (local) return JSON.parse(local);
    return []; // Start empty so child must draw their 3 quests
  });

  const [tasks, setTasks] = useState(() => {
    const local = localStorage.getItem('questgrow_tasks');
    if (local) {
      const parsed = JSON.parse(local);
      const numToStringMap = {
        1: "簡單",
        2: "簡單",
        3: "中等",
        4: "較難",
        5: "終極"
      };
      return parsed.map(t => {
        if (typeof t.difficulty === 'number') {
          return {
            ...t,
            difficulty: numToStringMap[t.difficulty] || "中等",
            goldReward: t.goldReward || (t.difficulty * 50) || 100,
            expReward: t.expReward || (t.difficulty * 100) || 200,
            ticketReward: t.ticketReward || (t.difficulty >= 4 ? 2 : 1)
          };
        }
        return t;
      });
    }
    return INITIAL_TASKS;
  });

  const [inventory, setInventory] = useState(() => {
    const local = localStorage.getItem('questgrow_inventory');
    return local ? JSON.parse(local) : INITIAL_INVENTORY;
  });

  const [parentGoals, setParentGoals] = useState(() => {
    const local = localStorage.getItem('questgrow_parent_goals');
    return local ? JSON.parse(local) : INITIAL_PARENT_GOALS;
  });

  const [wishlist, setWishlist] = useState(() => {
    const local = localStorage.getItem('questgrow_wishlist');
    return local ? JSON.parse(local) : INITIAL_WISHLIST;
  });

  const [redeemLogs, setRedeemLogs] = useState(() => {
    const local = localStorage.getItem('questgrow_redeem_logs');
    return local ? JSON.parse(local) : INITIAL_REDEEM_LOGS;
  });

  const [familyScore, setFamilyScore] = useState(() => {
    const local = localStorage.getItem('questgrow_family_score');
    return local ? parseInt(local, 10) : 6420;
  });

  const [weeklyComp, setWeeklyComp] = useState(() => {
    const local = localStorage.getItem('questgrow_weekly_comp');
    return local ? JSON.parse(local) : INITIAL_WEEKLY_COMPETITION;
  });

  // --- V2 Event Telemetry State ---
  const [eventLogs, setEventLogs] = useState(() => {
    const local = localStorage.getItem('questgrow_event_logs');
    return local ? JSON.parse(local) : [];
  });

  // --- V2 Toast State ---
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const safeSaveLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`LocalStorage write failed for key ${key}:`, e);
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        showToast("⚠️ 儲存空間已滿，部分變更將無法永久儲存！建議清除舊資料。", "warning");
      }
    }
  };

  const logEvent = (eventType, metadata = {}) => {
    const newLog = {
      id: "log-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      user_id: "leo_kid",
      family_id: "family_grow_1",
      event_type: eventType,
      timestamp: new Date(getSimulatedDateTime()).toISOString(),
      metadata: JSON.stringify(metadata)
    };
    setEventLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 100); // Keep last 100 logs
      safeSaveLocalStorage('questgrow_event_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Auth Sync & Actions ---
  useEffect(() => {
    if (currentUser) {
      safeSaveLocalStorage('questgrow_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'kid') {
        setRole('kid');
        if (currentUser.childId) {
          setActiveChildId(currentUser.childId);
        }
      }
    } else {
      localStorage.removeItem('questgrow_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_users_db', JSON.stringify(usersDB));
  }, [usersDB]);

  const handleLogin = (authData) => {
    const { email, password, name, role: selectedRole, isRegister, isGoogle, googleId, avatar } = authData;

    if (isRegister) {
      // Check if user exists
      const exists = usersDB.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) return false;

      const newUser = {
        email: email.toLowerCase(),
        password,
        name,
        role: selectedRole,
        googleId: null,
        avatar: avatar || (selectedRole === 'kid' ? 'boy' : 'girl')
      };
      setUsersDB(prev => [...prev, newUser]);
      return true;
    }

    if (isGoogle) {
      // Find by googleId or email
      let user = usersDB.find(u => (u.googleId && u.googleId === googleId) || u.email.toLowerCase() === email.toLowerCase());
      
      if (user) {
        // Link Google ID if not already linked
        if (!user.googleId) {
          const updatedDB = usersDB.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, googleId } : u);
          setUsersDB(updatedDB);
          user = { ...user, googleId };
        }
        setCurrentUser(user);
        setRole(user.role);
        logEvent("user_login", { email: user.email, method: "google" });
        showToast(`歡迎回來，${user.name}！`, "success");
        return true;
      } else {
        // Auto register new Google user
        const newGoogleUser = {
          email: email.toLowerCase(),
          password: 'google-oauth-managed-' + Math.random().toString(36).substr(2, 9),
          name: name || email.split('@')[0],
          role: selectedRole || 'parent',
          googleId,
          avatar: avatar || 'boy'
        };
        setUsersDB(prev => [...prev, newGoogleUser]);
        setCurrentUser(newGoogleUser);
        setRole(newGoogleUser.role);
        logEvent("user_signup", { email: newGoogleUser.email, method: "google" });
        showToast(`註冊成功，歡迎 ${newGoogleUser.name}！`, "success");
        return true;
      }
    }

    // Standard Login
    const foundUser = usersDB.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (foundUser) {
      setCurrentUser(foundUser);
      setRole(foundUser.role);
      logEvent("user_login", { email: foundUser.email, method: "password" });
      showToast(`歡迎回來，${foundUser.name}！`, "success");
      return true;
    }

    return false;
  };

  const handleLogout = () => {
    if (currentUser) {
      logEvent("user_logout", { email: currentUser.email });
    }
    setCurrentUser(null);
    showToast("已成功登出。", "info");
  };

  const handleLinkGoogleAccount = (googleId, googleEmail) => {
    if (!currentUser) return false;
    
    // Check if this googleId is already linked to another account
    const isLinked = usersDB.some(u => u.googleId === googleId);
    if (isLinked) {
      showToast("⚠️ 此 Google 帳戶已被其他帳號綁定！", "error");
      return false;
    }

    const updatedDB = usersDB.map(u => u.email.toLowerCase() === currentUser.email.toLowerCase() ? { ...u, googleId } : u);
    setUsersDB(updatedDB);
    
    const updatedUser = { ...currentUser, googleId };
    setCurrentUser(updatedUser);
    
    logEvent("account_linked", { email: currentUser.email, googleEmail });
    showToast("🎉 成功連結 Google 帳戶！今後可使用 Google 快速登入。", "success");
    return true;
  };

  // --- Sync Effects ---
  useEffect(() => {
    if (currentUser && currentUser.role === 'kid' && role !== 'kid') {
      setRole('kid');
      safeSaveLocalStorage('questgrow_role', 'kid');
    } else {
      safeSaveLocalStorage('questgrow_role', role);
    }
  }, [role, currentUser]);


  useEffect(() => {
    safeSaveLocalStorage('questgrow_children', JSON.stringify(children));
  }, [children]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_active_child_id', activeChildId);
  }, [activeChildId]);

  // Lock activeChildId to logged-in kid's childId to prevent switching
  useEffect(() => {
    if (currentUser && currentUser.role === 'kid' && currentUser.childId && activeChildId !== currentUser.childId) {
      setActiveChildId(currentUser.childId);
    }
  }, [currentUser, activeChildId]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_drawn_task_ids', JSON.stringify(drawnTaskIds));
  }, [drawnTaskIds]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_parent_goals', JSON.stringify(parentGoals));
  }, [parentGoals]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_redeem_logs', JSON.stringify(redeemLogs));
  }, [redeemLogs]);

  useEffect(() => {
    safeSaveLocalStorage('questgrow_family_score', familyScore.toString());
  }, [familyScore]);

  // --- V2 Expiry & Time Trigger Loops ---
  useEffect(() => {
    // 1. Expiration check for inventory cards
    const currentDate = getSimulatedDateString();
    let hasChanges = false;
    
    const updatedInventory = inventory.map(item => {
      if (item.status === '未使用' && item.expireAt && item.expireAt < currentDate) {
        hasChanges = true;
        showToast(`卡片過期通知: 「${item.name}」已過期！`, 'warning');
        logEvent("card_expired", { card_id: item.id, card_name: item.name });
        return { ...item, status: '已過期' };
      }
      return item;
    });

    if (hasChanges) {
      setInventory(updatedInventory);
    }

    // 2. Sunday Reset Check (Reset Tournament at Sunday 23:59:59 UTC+8)
    // base start 2026-06-01 is Monday.
    // Sunday of this first week is 2026-06-07.
    // Let's compute target Sunday based on days added.
    const startWeekSunday = new Date("2026-06-07T23:59:59+08:00");
    const currentSimTime = getSimulatedDateTime();
    
    const targetSundayTime = startWeekSunday.getTime();
    const storedLastSunday = localStorage.getItem('questgrow_last_sunday_reset');
    
    // Check if current simulated time is past Sunday 23:59:59
    if (currentSimTime > targetSundayTime && (!storedLastSunday || storedLastSunday !== "2026-06-07")) {
      safeSaveLocalStorage('questgrow_last_sunday_reset', "2026-06-07");
      
      // Perform Sunday Reset
      setWeeklyComp(prev => ({
        ...prev,
        weekRange: "06/01 ~ 06/07 [上期結算完畢]",
        familyTitle: "「榮耀探險巨星」👑",
      }));
      
      logEvent("weekly_report_viewed", { message: "Sunday Reset Executed" });
      showToast("📅 台灣時間週日 23:59:59 已達，每週賽事排行榜已結算！", "info");
    }
  }, [inventory]);

  // --- RPG Class Dynamic Update ---
  const determineJobClass = (attrs) => {
    const mapping = {
      Courage: "Explorer (探索者) ⚔️",
      Wisdom: "Sage (智者) 🔮",
      Creativity: "Creator (創造者) 🎨",
      Responsibility: "Guardian (守護者) 🛡️",
      Empathy: "Companion (夥伴者) 🤝"
    };
    let maxAttr = 'Courage';
    let maxVal = -1;
    Object.entries(attrs).forEach(([key, val]) => {
      if (val > maxVal) {
        maxVal = val;
        maxAttr = key;
      }
    });
    return mapping[maxAttr] || "Explorer (探索者) ⚔️";
  };

  // --- State Handlers ---

  // GDPR-K / COPPA Reset all data to defaults
  const handleClearAllData = () => {
    if (window.confirm("❗ 隱私與兒童個資保護提醒：這會永久刪除此家庭與孩子的所有個人資料、任務照片及統計數據。確定要繼續嗎？")) {
      localStorage.clear();
      setChildren([INITIAL_CHILD_STATS]);
      setDrawnTaskIds([]); // Reset so child must draw fresh quests
      setTasks(INITIAL_TASKS);
      setInventory(INITIAL_INVENTORY);
      setParentGoals(INITIAL_PARENT_GOALS);
      setWishlist(INITIAL_WISHLIST);
      setRedeemLogs(INITIAL_REDEEM_LOGS);
      setFamilyScore(6420);
      setWeeklyComp(INITIAL_WEEKLY_COMPETITION);
      setEventLogs([]);

      
      // Log event of data deletion
      const tempLog = {
        id: "log-delete-" + Date.now(),
        user_id: "leo_kid",
        family_id: "family_grow_1",
        event_type: "data_deleted",
        timestamp: new Date().toISOString(),
        metadata: JSON.stringify({ reason: "COPPA_compliance_parent_request" })
      };
      setEventLogs([tempLog]);
      safeSaveLocalStorage('questgrow_event_logs', JSON.stringify([tempLog]));
      
      showToast("隱私與合規安全：所有家庭與兒童個資已完全銷毀！", "success");
    }
  };

  const handleAddChild = (newChildData) => {
    if (children.length >= 8) {
      showToast("最多只能新增 5 位小孩喔！", "error");
      return false;
    }
    const newChildId = "child-" + Date.now();
    const newChild = {
      ...INITIAL_CHILD_STATS,
      id: newChildId,
      name: newChildData.name,
      age: newChildData.age,
      birthday: newChildData.birthday,
      avatar: newChildData.avatar || 'boy',
      level: 1,
      exp: 0,
      expNeeded: 400,
      gold: 100,
      tickets: 1,
      attributes: { Wisdom: 10, Responsibility: 10, Courage: 10, Empathy: 10, Creativity: 10 }
    };

    const targetEmail = (newChildData.email || `${newChildData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}@questgrow.com`).toLowerCase();
    const targetPassword = newChildData.password || 'password123';

    // Verify duplication
    const exists = usersDB.some(u => u.email.toLowerCase() === targetEmail);
    if (exists) {
      showToast(`電子郵件重複 ${targetEmail}已被使用`, "error");
      return false;
    }

    const newKidUser = {
      email: targetEmail,
      password: targetPassword,
      name: newChildData.name,
      role: 'kid',
      googleId: null,
      avatar: newChildData.avatar || 'boy',
      childId: newChildId
    };

    setChildren(prev => [...prev, newChild]);
    setUsersDB(prev => [...prev, newKidUser]);
    showToast(`成功新增冒險者「${newChild.name}」，帳號為 ${targetEmail}！`, "success");
    logEvent("child_added", { childId: newChild.id, name: newChild.name, email: targetEmail });
    return true;
  };

  const handleDeleteChild = (childId) => {
    if (children.length <= 1) {
      showToast("至少需要保留 1 位小孩喔！", "error");
      return;
    }
    const targetChild = children.find(c => c.id === childId);
    if (!targetChild) return;
    
    if (window.confirm(`確定要刪除小孩「${targetChild.name}」的全部角色資料、背包與登入帳號嗎？此操作無法還原。`)) {
      setChildren(prev => prev.filter(c => c.id !== childId));
      setTasks(prev => prev.filter(t => t.assignedTo !== childId));
      setInventory(prev => prev.filter(i => i.ownerId !== childId));
      setUsersDB(prev => prev.filter(u => u.childId !== childId)); // delete user account
      
      if (activeChildId === childId) {
        const remaining = children.filter(c => c.id !== childId);
        setActiveChildId(remaining[0].id);
      }
      
      showToast(`已刪除小孩「${targetChild.name}」的角色與帳號資料。`, "info");
      logEvent("child_deleted", { childId, name: targetChild.name });
    }
  };

  const handleUpdateChildProfile = (childId, profileData) => {
    let targetId = childId;
    let data = profileData;
    if (typeof childId === 'object' && !profileData) {
      targetId = activeChildId;
      data = childId;
    }

    if (data.email) {
      const emailExists = usersDB.some(u => u.childId !== targetId && u.email.toLowerCase() === data.email.toLowerCase());
      if (emailExists) {
        showToast(`電子郵件重複 ${data.email}已被使用`, "error");
        return false;
      }
    }

    setChildren(prev => prev.map(c => c.id === targetId ? { ...c, ...data } : c));

    if (data.name || data.avatar || data.email || data.password) {
      setUsersDB(prev => prev.map(u => {
        if (u.childId === targetId) {
          const updated = { ...u };
          if (data.name) updated.name = data.name;
          if (data.avatar) updated.avatar = data.avatar;
          if (data.email) updated.email = data.email.toLowerCase();
          if (data.password) updated.password = data.password;
          return updated;
        }
        return u;
      }));

      if (currentUser && currentUser.childId === targetId) {
        const updatedUser = { ...currentUser };
        if (data.name) updatedUser.name = data.name;
        if (data.avatar) updatedUser.avatar = data.avatar;
        if (data.email) updatedUser.email = data.email.toLowerCase();
        if (data.password) updatedUser.password = data.password;
        setCurrentUser(updatedUser);
      }
    }

    showToast("兒童角色資料已更新！", "success");
    logEvent("child_profile_updated", { childId: targetId, ...data });
    return true;
  };

  const handleAddParent = (newParentData) => {
    const parentCount = usersDB.filter(u => u.role === 'parent').length;
    if (parentCount >= 8) {
      showToast("最多只能新增 5 位家長喔！", "error");
      return false;
    }

    const targetEmail = newParentData.email.toLowerCase();
    const exists = usersDB.some(u => u.email.toLowerCase() === targetEmail);
    if (exists) {
      showToast(`電子郵件重複 ${targetEmail}已被使用`, "error");
      return false;
    }

    const newParent = {
      email: targetEmail,
      password: newParentData.password || 'password123',
      name: newParentData.name,
      role: 'parent',
      googleId: null,
      avatar: newParentData.avatar || 'girl'
    };

    setUsersDB(prev => [...prev, newParent]);
    showToast(`成功新增家長「${newParent.name}」，帳號為 ${targetEmail}！`, "success");
    logEvent("parent_added", { name: newParent.name, email: targetEmail });
    return true;
  };

  const handleDeleteParent = (parentEmail) => {
    const parentCount = usersDB.filter(u => u.role === 'parent').length;
    if (parentCount <= 1) {
      showToast("至少需要保留 1 位家長喔！", "error");
      return;
    }

    if (currentUser && currentUser.email.toLowerCase() === parentEmail.toLowerCase()) {
      showToast("⚠️ 您不能刪除目前正在登入的家長帳號！", "error");
      return;
    }

    const targetParent = usersDB.find(u => u.email.toLowerCase() === parentEmail.toLowerCase());
    if (!targetParent) return;

    if (window.confirm(`確定要刪除家長「${targetParent.name}」的帳號嗎？此操作無法還原。`)) {
      setUsersDB(prev => prev.filter(u => u.email.toLowerCase() !== parentEmail.toLowerCase()));
      showToast(`已刪除家長「${targetParent.name}」的帳號。`, "info");
      logEvent("parent_deleted", { email: parentEmail, name: targetParent.name });
    }
  };

  const handleUpdateParent = (oldEmail, updatedData) => {
    const targetEmail = updatedData.email.toLowerCase();
    
    if (oldEmail.toLowerCase() !== targetEmail) {
      const emailExists = usersDB.some(u => u.email.toLowerCase() !== oldEmail.toLowerCase() && u.email.toLowerCase() === targetEmail);
      if (emailExists) {
        showToast(`電子郵件重複 ${targetEmail}已被使用`, "error");
        return false;
      }
    }

    setUsersDB(prev => prev.map(u => {
      if (u.email.toLowerCase() === oldEmail.toLowerCase()) {
        return {
          ...u,
          name: updatedData.name,
          avatar: updatedData.avatar,
          email: targetEmail,
          password: updatedData.password
        };
      }
      return u;
    }));

    if (currentUser && currentUser.email.toLowerCase() === oldEmail.toLowerCase()) {
      setCurrentUser(prev => ({
        ...prev,
        name: updatedData.name,
        avatar: updatedData.avatar,
        email: targetEmail,
        password: updatedData.password
      }));
    }

    showToast("家長角色資料已更新！", "success");
    logEvent("parent_profile_updated", { oldEmail, email: targetEmail, name: updatedData.name });
    return true;
  };

  // Helper to add card duration in YYYY-MM-DD
  const getExpirationDate = (dateAcquired, rarity) => {
    let days = 9999;
    if (rarity === 'Rare') days = 7;
    else if (rarity === 'Epic') days = 30;
    
    const date = new Date(dateAcquired);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  // 1. Task Operations
  const handleAddTask = (newTask) => {
    if (Array.isArray(newTask)) {
      setTasks(prev => [...newTask, ...prev]);
      showToast(language === 'zh' ? `🎉 成功指派 ${newTask.length} 個任務！` : `🎉 Successfully assigned ${newTask.length} quests!`, "success");
    } else {
      setTasks(prev => [newTask, ...prev]);
      showToast(`成功指派新任務：「${newTask.name}」`, "success");
    }
  };

  const handleEditTask = (taskId, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t));
  };

  const handleDeleteTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (task) showToast(`已刪除任務：「${task.name}」`, "info");
  };

  const handleClearAllTasks = (targetFilter = 'all') => {
    if (targetFilter === 'all') {
      setTasks([]);
      showToast(language === 'zh' ? "已成功清除所有任務！" : "Successfully cleared all quests!", "info");
    } else if (targetFilter === 'general') {
      setTasks(prev => prev.filter(t => children.some(c => c.id === t.assignedTo)));
      showToast(language === 'zh' ? "已成功清除所有通用任務！" : "Successfully cleared all general quests!", "info");
    } else {
      const child = children.find(c => c.id === targetFilter);
      const childName = child ? child.name : '';
      setTasks(prev => prev.filter(t => t.assignedTo !== targetFilter));
      showToast(language === 'zh' ? `已成功清除「${childName}」的所有任務！` : `Successfully cleared all quests for ${childName}!`, "info");
    }
  };

  const handleSubmitTask = (taskId, submissionData) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: '待覆核',
          submission: submissionData,
          rejectionReason: null
        };
      }
      return t;
    }));
    logEvent("task_completed", { task_id: taskId, notes: submissionData.notes });
    showToast("任務已提交覆核，請等待爸媽確認！", "success");
  };

  const handleApproveTask = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const childId = task.submission?.childId || activeChildId;

    // Difficulty rewards maps
    const difficultyAttrMap = {
      "簡單": 1,
      "中等": 2,
      "較難": 3,
      "終極": 5
    };
    const difficultyFamilyScoreMap = {
      "簡單": 25,
      "中等": 50,
      "較難": 100,
      "終極": 200
    };

    const attrPoints = difficultyAttrMap[task.difficulty] || 1;
    const goldReward = task.goldReward || 50;
    const familyScoreAdd = difficultyFamilyScoreMap[task.difficulty] || 25;

    // 1. Calculate new child stats
    setChildren(prevChildren => prevChildren.map(c => {
      if (c.id === childId) {
        const addedExp = task.expReward;
        let newExp = c.exp + addedExp;
        let newLevel = c.level;
        let expNeeded = c.level * 300 + 400;

        while (newExp >= expNeeded) {
          newExp -= expNeeded;
          newLevel += 1;
          expNeeded = newLevel * 300 + 400;
          setTimeout(() => {
            showToast(`🎉 恭喜${c.name}升級！目前等級 Level ${newLevel}`, "success");
          }, 100);
        }

        const newAttrs = { ...c.attributes };
        if (task.attributeReward && newAttrs[task.attributeReward] !== undefined) {
          newAttrs[task.attributeReward] += attrPoints;
        }

        return {
          ...c,
          level: newLevel,
          exp: newExp,
          expNeeded: expNeeded,
          gold: c.gold + goldReward,
          tickets: c.tickets + (task.ticketReward || 1),
          jobClass: determineJobClass(newAttrs),
          attributes: newAttrs
        };
      }
      return c;
    }));

    // 2. Increase Family Growth Score
    setFamilyScore(prev => prev + familyScoreAdd);

    // 3. Update task status
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: '已完成' } : t));

    logEvent("task_review_approved", { task_id: taskId, task_name: task.name, childId });
    showToast(`任務「${task.name}」審核通過，發放獎勵！`, "success");
  };

  const handleRejectTask = (taskId, reason) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: '進行中', rejectionReason: reason };
      }
      return t;
    }));

    logEvent("task_review_rejected", { task_id: taskId, reason });
    if (task) showToast(`任務「${task.name}」已退回修正。`, "warning");
  };

  // 2. Gacha / Card Draw (Atomic Transaction)
  const handleAwardGachaCard = (card, costTickets = 1) => {
    const activeChildObj = children.find(c => c.id === activeChildId) || children[0];
    if (!activeChildObj || activeChildObj.tickets < costTickets) {
      showToast("抽卡券不足！", "error");
      return;
    }

    // Atomic Update block
    setChildren(prevChildren => prevChildren.map(c => {
      if (c.id === activeChildId) {
        const update = { ...c, tickets: Math.max(0, c.tickets - costTickets) };
        
        if (card.type === "資源卡") {
          if (card.value.gold) update.gold += card.value.gold;
          if (card.value.tickets) update.tickets += card.value.tickets;
          if (card.value.exp) {
            let newExp = update.exp + card.value.exp;
            let newLevel = update.level;
            let expNeeded = update.level * 300 + 400;
            while (newExp >= expNeeded) {
              newExp -= expNeeded;
              newLevel += 1;
              expNeeded = newLevel * 300 + 400;
            }
            update.level = newLevel;
            update.exp = newExp;
            update.expNeeded = expNeeded;
          }
        }
        return update;
      }
      return c;
    }));

    if (card.type === "資源卡" && card.value.growthScore) {
      setFamilyScore(prev => prev + card.value.growthScore);
    }

    if (card.type !== "資源卡") {
      const currentDate = getSimulatedDateString();
      const newItem = {
        inventoryId: "inv-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
        id: card.id,
        name: card.name,
        type: card.type,
        rarity: card.rarity,
        desc: card.desc,
        status: "未使用",
        dateAcquired: currentDate,
        expireAt: getExpirationDate(currentDate, card.rarity),
        ownerId: activeChildId
      };
      setInventory(prev => [newItem, ...prev]);
    }

    logEvent("gacha_draw", { card_id: card.id, card_name: card.name, rarity: card.rarity });
    showToast(`召喚成功！獲得 ${card.name}`, "success");
  };

  // 3. Redeem/Backpack Flow
  const handleRequestRedeem = (inventoryId) => {
    const item = inventory.find(i => i.inventoryId === inventoryId);
    if (!item) return;

    if (item.status === '已過期') {
      showToast("此卡片已過期，無法申請核銷！", "error");
      return;
    }

    setInventory(prev => prev.map(i => 
      i.inventoryId === inventoryId ? { ...i, status: '待核銷' } : i
    ));

    logEvent("card_redeem_requested", { inventory_id: inventoryId, card_name: item.name });
    showToast(`已向爸媽申請使用「${item.name}」，等待審核中。`, "info");
  };

  const handleApproveRedeem = (inventoryId) => {
    const item = inventory.find(i => i.inventoryId === inventoryId);
    if (!item) return;

    // Double check expiration at time of approval
    const currentDate = getSimulatedDateString();
    if (item.expireAt && item.expireAt < currentDate) {
      showToast("審核失敗：此卡片已過期！無法進行核銷。", "error");
      setInventory(prev => prev.map(i => 
        i.inventoryId === inventoryId ? { ...i, status: '已過期' } : i
      ));
      return;
    }

    setInventory(prev => prev.map(i => 
      i.inventoryId === inventoryId ? { ...i, status: '已使用' } : i
    ));

    const newLog = {
      id: "rl-" + Date.now(),
      cardName: item.name,
      kidName: children.find(c => c.id === item.ownerId)?.name || childStats.name,
      dateRedeemed: currentDate,
      status: "已核銷",
      reviewer: role === 'parent' ? "媽媽 (Audrey)" : "系統確認"
    };
    setRedeemLogs(prev => [newLog, ...prev]);
    setFamilyScore(prev => prev + 50);

    logEvent("card_redeem_approved", { inventory_id: inventoryId, card_name: item.name });
    showToast(`已核准使用「${item.name}」，全家獲得 +50 積分！`, "success");
  };

  const handleRejectRedeem = (inventoryId) => {
    const item = inventory.find(i => i.inventoryId === inventoryId);
    setInventory(prev => prev.map(i => 
      i.inventoryId === inventoryId ? { ...i, status: '未使用' } : i
    ));
    if (item) showToast(`已駁回「${item.name}」的核銷申請，卡片已退回背包。`, "info");
  };

  // 4. Parent Goal management
  const handleUpdateGoalProgress = (goalId, newProgress) => {
    setParentGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const status = newProgress >= 100 ? '已達成' : '進行中';
        if (newProgress > g.progress) {
          const diff = newProgress - g.progress;
          setFamilyScore(s => s + Math.round(diff * 2));
        }
        return { ...g, progress: newProgress, status };
      }
      return g;
    }));
    logEvent("goal_progress_updated", { goal_id: goalId, progress: newProgress });
  };

  // 5. Wishlist Management
  const handleAddWishlistItem = (title, points) => {
    const newItem = {
      id: "wl-" + Date.now(),
      title,
      pointsNeeded: points,
      pointsCurrent: familyScore,
      isUltimate: false,
      isRedeemed: false
    };
    setWishlist(prev => [...prev, newItem]);
    showToast(`成功新增家庭願望：「${title}」`, "success");
  };

  const handleEditWishlistItem = (id, title, points) => {
    setWishlist(prev => prev.map(w => w.id === id ? { ...w, title, pointsNeeded: points } : w));
    showToast("成功更新家庭願望！", "success");
  };

  const handleDeleteWishlistItem = (id) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
    showToast("成功刪除家庭願望！", "success");
  };

  const handleRedeemWishlist = (wishlistId) => {
    const item = wishlist.find(w => w.id === wishlistId);
    if (!item || familyScore < item.pointsNeeded) return;

    setFamilyScore(prev => Math.max(0, prev - item.pointsNeeded));
    setWishlist(prev => prev.map(w => w.id === wishlistId ? { ...w, isRedeemed: true } : w));
    showToast(`🎉 家庭共同願望「${item.title}」已兌換成功！`, "success");
  };

  const getBalancedDevelopmentIndex = (childId) => {
    const targetId = childId || activeChildId;
    const completedTasks = tasks.filter(t => t.status === '已完成' && (!t.assignedTo || t.assignedTo === targetId));
    const completedTypes = new Set(completedTasks.map(t => t.type));
    return (completedTypes.size / 5) * 100;
  };

  if (!currentUser) {
    return <LoginPortal onLogin={handleLogin} googleClientId="" />;
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
            usersDB={usersDB}
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
