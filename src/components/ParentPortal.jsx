import React, { useState, useEffect } from 'react';
import { TASK_TEMPLATES, GACHA_POOL } from '../utils/mockData';
import Avatar from './Avatar';
import { useLanguage } from './LanguageContext';
import { 
  Plus, Check, X, ShieldAlert, Sparkles, BookOpen, 
  HelpCircle, Trash2, Award, ClipboardCheck, LayoutGrid, 
  Eye, Heart, MessageSquare, Compass, BarChart3, AlertCircle,
  Database, ShieldCheck, Trophy, Users, Search,
  ListTodo, Settings, ChevronDown, Mail, Bell, Volume2, VolumeX
} from 'lucide-react';

const difficultyRewardsMap = {
  "簡單": { exp: 100, gold: 50, ticket: 1 },
  "中等": { exp: 200, gold: 100, ticket: 1 },
  "較難": { exp: 400, gold: 200, ticket: 2 },
  "終極": { exp: 800, gold: 400, ticket: 3 }
};

const STARTER_QUESTS_TEMPLATES = [
  { name: '📖 閱讀好書 20 分鐘', description: '閱讀一本自己喜歡的課外書20分鐘，並與爸爸媽媽分享心得。', type: '智', difficulty: '簡單', expReward: 100, goldReward: 50, ticketReward: 1, attributeReward: 'Wisdom', period: '每日' },
  { name: '🧹 自主整理個人物品與書包', description: '自己整理書包、書桌以及個人物品，維持環境乾淨。', type: '德', difficulty: '中等', expReward: 200, goldReward: 100, ticketReward: 1, attributeReward: 'Responsibility', period: '每日' },
  { name: '👁️ 眼球保健體操與拉筋', description: '看螢幕或看書後，進行眼球舒緩操並做全身伸展拉筋。', type: '體', difficulty: '簡單', expReward: 100, goldReward: 50, ticketReward: 1, attributeReward: 'Courage', period: '每日' },
  { name: '🍽️ 主動協助餐後收拾與擦餐桌', description: '吃完飯後，主動把碗盤拿到水槽，並幫忙擦乾淨餐桌。', type: '群', difficulty: '簡單', expReward: 100, goldReward: 50, ticketReward: 1, attributeReward: 'Empathy', period: '每日' },
  { name: '🎨 畫一幅畫或手作一件創意作品', description: '發揮創意，動手畫一幅畫或者利用家中材料做出創意手作品。', type: '美', difficulty: '較難', expReward: 400, goldReward: 200, ticketReward: 2, attributeReward: 'Creativity', period: '每日' }
];

const JOB_CLASSES = {
  Explorer: {
    nameZh: '⚔️ 探索者 (Explorer)',
    nameEn: '⚔️ Explorer',
    descZh: '能力完全均衡。初始屬性：德+10、智+10、體+10、群+10、美+10',
    descEn: 'Perfect balance. Initial attributes: Responsibility: 10, Wisdom: 10, Courage: 10, Empathy: 10, Creativity: 10',
    attributes: { Wisdom: 10, Responsibility: 10, Courage: 10, Empathy: 10, Creativity: 10 }
  },
  Sage: {
    nameZh: '🔮 智者 (Sage)',
    nameEn: '🔮 Sage',
    descZh: '偏重智力學習。初始屬性：智+18、德+10、體+10、群+10、美+12',
    descEn: 'Focused on learning. Initial attributes: Wisdom: 18, Responsibility: 10, Courage: 10, Empathy: 10, Creativity: 12',
    attributes: { Wisdom: 18, Responsibility: 10, Courage: 10, Empathy: 10, Creativity: 12 }
  },
  Guardian: {
    nameZh: '🛡️ 守護者 (Guardian)',
    nameEn: '🛡️ Guardian',
    descZh: '偏重責任與體能。初始屬性：德+18、體+18、智+8、群+10、美+6',
    descEn: 'Focused on responsibility & physics. Initial attributes: Responsibility: 18, Courage: 18, Wisdom: 8, Empathy: 10, Creativity: 6',
    attributes: { Wisdom: 8, Responsibility: 18, Courage: 18, Empathy: 10, Creativity: 6 }
  },
  Creator: {
    nameZh: '🎨 創造者 (Creator)',
    nameEn: '🎨 Creator',
    descZh: '偏重藝術與創意。初始屬性：美+18、智+12、德+10、體+8、群+12',
    descEn: 'Focused on art & creativity. Initial attributes: Creativity: 18, Wisdom: 12, Responsibility: 10, Courage: 8, Empathy: 12',
    attributes: { Wisdom: 12, Responsibility: 10, Courage: 8, Empathy: 12, Creativity: 18 }
  }
};

function ParentPortal({
  stats,
  tasks,
  inventory,
  wishlist,
  familyScore,
  redeemLogs,
  eventLogs = [],
  onAddTask,
  onEditTask,
  onDeleteTask,
  onClearAllTasks,
  onApproveTask,
  onRejectTask,
  onApproveRedeem,
  onRejectRedeem,
  onBulkApproveTasks,
  onBulkApproveRedeems,
  onAddWishlist,
  onEditWishlist,
  onDeleteWishlist,
  onClearData,
  balancedIndex,
  simulatedDate,
  onUpdateChildProfile,
  children = [],
  onAddChild,
  onDeleteChild,
  currentUser,
  onLinkGoogleAccount,
  onUnlinkLineAccount,
  usersDB = [],
  onAddParent,
  onDeleteParent,
  onUpdateParent,
  gachaPool,
  onUpdateGachaPool,
  familySettings,
  onUpdateFamilySettings,
  familyNickname,
  leaderboardData,
  onUpdateFamilyNickname,
  onCompleteOnboarding,
  onOpenFeedback,
  dailyProverb,
  onClaimWishlistItem
}) {
  const { t, language } = useLanguage();
  const triggerLineLink = () => {
    const channelId = import.meta.env.VITE_LINE_CHANNEL_ID || '2006240212';
    const redirectUri = window.location.origin + '/';
    const state = 'bind-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('questgrow_line_state', state);
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
  };

  const [activeTab, setActiveTab] = useState('audit');
  const [showHistoryLogs, setShowHistoryLogs] = useState(false);
  const [showLineBanner, setShowLineBanner] = useState(() => localStorage.getItem('questgrow_show_line_banner') !== 'false');

  // Onboarding Tour state
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('questgrow_parent_tour_seen') !== 'true';
  });
  const [tourStep, setTourStep] = useState(1);

  // TTS Voice Synthesis States and Functions
  const [proverbSpeaking, setProverbSpeaking] = useState(false);
  const isProverbSpeakingRef = React.useRef(false);
  const activeUtterancesRef = React.useRef([]);

  const keepUtteranceAlive = (utterance) => {
    if (!activeUtterancesRef.current) activeUtterancesRef.current = [];
    activeUtterancesRef.current.push(utterance);
    if (typeof window !== 'undefined') {
      window._activeUtterances = window._activeUtterances || [];
      window._activeUtterances.push(utterance);
    }
  };

  const clearAliveUtterances = () => {
    activeUtterancesRef.current = [];
    if (typeof window !== 'undefined') {
      window._activeUtterances = [];
    }
  };

  const stopAllSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.cancel();
      } catch (e) {
        console.error('Failed to cancel speech synthesis:', e);
      }
    }
    clearAliveUtterances();
    setProverbSpeaking(false);
    isProverbSpeakingRef.current = false;
  };

  const speakProverb = () => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'zh' ? '您的瀏覽器不支援語音播放功能。' : 'Your browser does not support voice playback.');
      return;
    }

    if (proverbSpeaking) {
      stopAllSpeech();
      return;
    }

    stopAllSpeech();
    setProverbSpeaking(true);
    isProverbSpeakingRef.current = true;

    // 100ms delay to clear call stack and allow obedience to stopAllSpeech's cancel
    setTimeout(() => {
      if (!isProverbSpeakingRef.current) return;

      const prefixZh = language === 'zh' ? '每日鼓勵：' : 'Daily Encouragement: ';
      const utterZh = new SpeechSynthesisUtterance(prefixZh + dailyProverb.contentZh);
      utterZh.lang = 'zh-TW';
      utterZh.rate = 0.9;
      utterZh.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferredZhNames = ['hanhan', 'yating', 'ting-ting', 'tingting', 'google 國語', 'google 臺灣', 'xiaoxiao', 'hsiaoyu', 'yaoyao', 'mei-jia', 'sin-ji'];
      let selectedZhVoice = null;
      for (const name of preferredZhNames) {
        const found = voices.find(v => v.name.toLowerCase().includes(name) && (v.lang.includes('zh') || v.lang.includes('zho')));
        if (found) {
          selectedZhVoice = found;
          break;
        }
      }
      if (!selectedZhVoice) {
        selectedZhVoice = voices.find(v => v.lang.toLowerCase().includes('zh'));
      }
      if (selectedZhVoice) {
        utterZh.voice = selectedZhVoice;
      }

      const utterEn = new SpeechSynthesisUtterance(dailyProverb.contentEn);
      utterEn.lang = 'en-US';
      utterEn.rate = 0.9;
      utterEn.pitch = 1.0;

      const preferredEnNames = ['zira', 'samantha', 'aria', 'jenny', 'google us english'];
      let selectedEnVoice = null;
      for (const name of preferredEnNames) {
        const found = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.includes('en'));
        if (found) {
          selectedEnVoice = found;
          break;
        }
      }
      if (!selectedEnVoice) {
        selectedEnVoice = voices.find(v => v.lang.toLowerCase().includes('en'));
      }
      if (selectedEnVoice) {
        utterEn.voice = selectedEnVoice;
      }

      utterZh.onend = () => {
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterZh);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterZh);
        }
        // Chain En speech only if proverb speaking is still active (not cancelled mid-speech)
        if (isProverbSpeakingRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.speak(utterEn);
        }
      };

      utterEn.onend = () => {
        isProverbSpeakingRef.current = false;
        setProverbSpeaking(false);
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterEn);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterEn);
        }
      };

      const handleErr = (u) => {
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(item => item !== u);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(item => item !== u);
        }
        if (u === utterZh && isProverbSpeakingRef.current) {
          // If Zh failed, fall back to speak En if still active
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.speak(utterEn);
          }
        } else {
          isProverbSpeakingRef.current = false;
          setProverbSpeaking(false);
        }
      };

      utterZh.onerror = () => handleErr(utterZh);
      utterEn.onerror = () => handleErr(utterEn);

      keepUtteranceAlive(utterZh);
      keepUtteranceAlive(utterEn);

      window.speechSynthesis.speak(utterZh);
    }, 100);
  };

  // Initialize voices and stop synthesis when component unmounts
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopAllSpeech();
    };
  }, []);

  React.useEffect(() => {
    if (!showTour) return;
    if (tourStep === 2) {
      setActiveTab('audit');
    } else if (tourStep === 3) {
      setActiveTab('workshop');
    } else if (tourStep === 4) {
      setActiveTab('gacha');
    } else if (tourStep === 5) {
      setActiveTab('wishlist');
    } else if (tourStep === 6) {
      setActiveTab('reports');
    } else if (tourStep === 7) {
      setActiveTab('settings');
      setSettingsSubTab('parent');
    }
  }, [tourStep, showTour]);
 
  React.useEffect(() => {
    if (currentUser && currentUser.onboardingCompleted) {
      const justCompleted = sessionStorage.getItem('questgrow_just_completed_onboarding');
      if (justCompleted === 'true') {
        sessionStorage.removeItem('questgrow_just_completed_onboarding');
        setTourStep(1);
        setShowTour(true);
        localStorage.removeItem('questgrow_parent_tour_seen');
      }
    }
  }, [currentUser?.onboardingCompleted]);

  
  // Workshop Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskType, setTaskType] = useState('智');
  const [taskDifficulty, setTaskDifficulty] = useState('中等');
  const [taskPeriod, setTaskPeriod] = useState('每日');
  const [taskAssignedTo, setTaskAssignedTo] = useState('all');

  // Workshop Subtab States
  const [workshopSubTab, setWorkshopSubTab] = useState('import'); // 'import', 'manage', 'add'
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importAssignedTo, setImportAssignedTo] = useState('all');
  const [reportsUserFilter, setReportsUserFilter] = useState('summary');
  // AI Coach interactive states
  const [aiCoachTab, setAiCoachTab] = useState('diagnostic'); // 'diagnostic', 'chat'
  const [aiCoachMessages, setAiCoachMessages] = useState(() => {
    return [
      {
        sender: 'coach',
        content: '你好！我是你的 AI 家庭成長教練。我會分析孩子的冒險數據，提供五育全人成長的引導與專屬建議。有什麼我可以幫忙的嗎？'
      }
    ];
  });
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiCoachInput, setAiCoachInput] = useState('');
  const [manageTasksFilter, setManageTasksFilter] = useState('all');
  const [settingsSubTab, setSettingsSubTab] = useState('parent'); // 'parent', 'child'

  // Optimized templates search, filter & visible counts state
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [templateVisibleCounts, setTemplateVisibleCounts] = useState({
    '德': 12,
    '智': 12,
    '體': 12,
    '群': 12,
    '美': 12
  });

  // Group and filter templates efficiently
  const filteredTemplates = React.useMemo(() => {
    const result = { '德': [], '智': [], '體': [], '群': [], '美': [] };
    const searchLower = templateSearch.toLowerCase().trim();
    
    TASK_TEMPLATES.forEach(tpl => {
      // 1. Category Filter
      if (templateCategoryFilter !== 'all' && tpl.type !== templateCategoryFilter) {
        return;
      }
      // 2. Search Filter
      if (searchLower) {
        const nameMatch = tpl.name?.toLowerCase().includes(searchLower);
        const descMatch = tpl.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch) {
          return;
        }
      }
      
      if (result[tpl.type]) {
        result[tpl.type].push(tpl);
      }
    });
    return result;
  }, [templateSearch, templateCategoryFilter]);

  const hasMatches = React.useMemo(() => {
    return Object.values(filteredTemplates).some(arr => arr.length > 0);
  }, [filteredTemplates]);

  const visibleCategories = React.useMemo(() => {
    const allCats = [
      { type: '德', label: language === 'zh' ? '德 — 責任與品德' : '德 Responsibility', color: 'text-[#16a34a]', border: 'border-[#16a34a]/20', bg: 'bg-[#16a34a]/5' },
      { type: '智', label: language === 'zh' ? '智 — 智慧與學習' : '智 Wisdom',         color: 'text-[#0284c7]', border: 'border-[#0284c7]/20', bg: 'bg-[#0284c7]/5' },
      { type: '體', label: language === 'zh' ? '體 — 體能與勇氣' : '體 Courage',        color: 'text-[#ea580c]', border: 'border-[#ea580c]/20', bg: 'bg-[#ea580c]/5' },
      { type: '群', label: language === 'zh' ? '群 — 群育與同理' : '群 Empathy',        color: 'text-[#db2777]', border: 'border-[#db2777]/20', bg: 'bg-[#db2777]/5' },
      { type: '美', label: language === 'zh' ? '美 — 美育與創意' : '美 Creativity',     color: 'text-[#7c3aed]', border: 'border-[#7c3aed]/20', bg: 'bg-[#7c3aed]/5' },
    ];
    if (templateCategoryFilter === 'all') {
      return allCats;
    }
    return allCats.filter(cat => cat.type === templateCategoryFilter);
  }, [templateCategoryFilter, language]);

  // Multi-Child Form States
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(10);
  const [newChildBirthday, setNewChildBirthday] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('boy');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [newChildPassword, setNewChildPassword] = useState('password123');

  // Wizard Setup States
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedJobClass, setSelectedJobClass] = useState('Explorer');
  const [selectedStarterQuests, setSelectedStarterQuests] = useState([]);
  const [wizardStep2Error, setWizardStep2Error] = useState('');

  // New onboarding, nickname & leaderboard states
  const [settingsNickname, setSettingsNickname] = useState(familyNickname || '');
  const [nicknameWarning, setNicknameWarning] = useState(''); // REQUIRED: used in handleSaveSettingsNickname & common settings panel
  const [showChildWizardOnAudit, setShowChildWizardOnAudit] = useState(false);

  React.useEffect(() => {
    setSettingsNickname(familyNickname || '');
  }, [familyNickname]);

  const handleSaveSettingsNickname = async () => {
    const nameToSave = settingsNickname || '';
    if (!nameToSave.trim()) {
      setNicknameWarning(language === 'zh' ? '家庭暱稱不能為空。' : 'Nickname cannot be empty.');
      return;
    }
    if (nameToSave.length > 20) {
      setNicknameWarning(language === 'zh' ? '家庭暱稱最多 20 個字元。' : 'Family nickname cannot exceed 20 characters.');
      return;
    }
    const success = await onUpdateFamilyNickname(nameToSave);
    if (success) {
      setNicknameWarning('');
    }
  };

  const [editingChildId, setEditingChildId] = useState(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildAge, setEditChildAge] = useState(10);
  const [editChildBirthday, setEditChildBirthday] = useState('');
  const [editChildEmail, setEditChildEmail] = useState('');
  const [editChildPassword, setEditChildPassword] = useState('');
  const [editChildAvatar, setEditChildAvatar] = useState('boy');
  const [newParentName, setNewParentName] = useState('');

  const [newParentAvatar, setNewParentAvatar] = useState('girl');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('password123');

  // Multi-Parent Form States

  const [editingParentEmail, setEditingParentEmail] = useState(null);
  const [editParentName, setEditParentName] = useState('');
  const [editParentAvatar, setEditParentAvatar] = useState('girl');
  const [editParentEmail, setEditParentEmail] = useState('');
  const [editParentPassword, setEditParentPassword] = useState('');

  // Backward compatibility state
  const [childName, setChildName] = useState(stats.name || '');
  const [childAge, setChildAge] = useState(stats.age || 10);
  const [childBirthday, setChildBirthday] = useState(stats.birthday || '');

  // Wishlist Editing States
  const [editingWishlistId, setEditingWishlistId] = useState(null);
  const [editWishlistTitle, setEditWishlistTitle] = useState('');
  const [editWishlistPoints, setEditWishlistPoints] = useState(100);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null, title: '' });

  // Custom Gacha Pool States
  const [gachaPoolEdit, setGachaPoolEdit] = useState(null);
  const [activeGachaRarity, setActiveGachaRarity] = useState('Common');
  
  const [newGachaName, setNewGachaName] = useState('');
  const [newGachaType, setNewGachaType] = useState('資源卡'); // 資源卡, 特權卡, 體驗卡, 收藏卡
  const [newGachaDesc, setNewGachaDesc] = useState('');
  const [newGachaDuration, setNewGachaDuration] = useState('');
  const [newGachaStyle, setNewGachaStyle] = useState('neon-orange');
  const [newGachaGold, setNewGachaGold] = useState(100);
  const [newGachaExp, setNewGachaExp] = useState(150);
  const [newGachaTickets, setNewGachaTickets] = useState(1);
  const [newGachaGrowthScore, setNewGachaGrowthScore] = useState(100);

  // Sync state with prop
  React.useEffect(() => {
    if (gachaPool) {
      setGachaPoolEdit(JSON.parse(JSON.stringify(gachaPool)));
    }
  }, [gachaPool]);

  const handleDeleteGachaCard = (rarity, cardId) => {
    if (!gachaPoolEdit) return;
    const updated = { ...gachaPoolEdit };
    updated[rarity].cards = updated[rarity].cards.filter(c => c.id !== cardId);
    setGachaPoolEdit(updated);
  };

  const handleAddGachaCardSubmit = (e) => {
    e.preventDefault();
    if (!gachaPoolEdit || !newGachaName || !newGachaDesc) return;

    const newCard = {
      id: `custom_${newGachaType === '資源卡' ? 'c' : newGachaType === '特權卡' ? 'r' : newGachaType === '體驗卡' ? 'e' : 'l'}_${Date.now()}`,
      name: newGachaName,
      type: newGachaType,
      rarity: activeGachaRarity,
      desc: newGachaDesc
    };

    if (newGachaType === '資源卡') {
      const val = {};
      if (newGachaGold) val.gold = parseInt(newGachaGold, 10);
      if (newGachaExp) val.exp = parseInt(newGachaExp, 10);
      if (newGachaTickets) val.tickets = parseInt(newGachaTickets, 10);
      if (newGachaGrowthScore) val.growthScore = parseInt(newGachaGrowthScore, 10);
      newCard.value = val;
    } else if (newGachaType === '特權卡' || newGachaType === '體驗卡') {
      newCard.duration = newGachaDuration || '7天內有效';
    } else if (newGachaType === '收藏卡') {
      newCard.style = newGachaStyle || 'neon-orange';
    }

    const updated = { ...gachaPoolEdit };
    updated[activeGachaRarity].cards = [...updated[activeGachaRarity].cards, newCard];
    setGachaPoolEdit(updated);

    // Reset Form
    setNewGachaName('');
    setNewGachaDesc('');
    setNewGachaDuration('');
    setNewGachaGold(100);
    setNewGachaExp(150);
    setNewGachaTickets(1);
    setNewGachaGrowthScore(100);
  };

  const handleSaveGachaPool = () => {
    if (onUpdateGachaPool && gachaPoolEdit) {
      onUpdateGachaPool(gachaPoolEdit);
    }
  };

  const handleResetGachaPool = () => {
    if (window.confirm(language === 'zh' ? "確定要重設轉蛋池為系統預設值嗎？這將會覆蓋您自訂的所有卡片。" : "Are you sure you want to reset the gacha pool to system defaults? This will overwrite your custom cards.")) {
      if (onUpdateGachaPool) {
        onUpdateGachaPool(GACHA_POOL);
      }
    }
  };

  React.useEffect(() => {
    if (stats) {
      setChildName(stats.name || '');
      setChildAge(stats.age || 10);
      setChildBirthday(stats.birthday || '');
    }
  }, [stats]);

  // Rejection Dialog State
  const [rejectingTaskId, setRejectingTaskId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedCannedReason, setSelectedCannedReason] = useState('');

  // Wishlist Form State
  const [wishlistTitle, setWishlistTitle] = useState('');
  const [wishlistPoints, setWishlistPoints] = useState(1000);

  // Photo viewer state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);

  // Bulk Review Confirmation States
  const [showBulkTasksConfirm, setShowBulkTasksConfirm] = useState(false);
  const [showBulkRedeemsConfirm, setShowBulkRedeemsConfirm] = useState(false);

  const cannedReasons = [
    t('cannedReason1'),
    t('cannedReason2'),
    t('cannedReason3'),
    t('cannedReason4')
  ];

  const translatePeriod = (period) => {
    if (period === '每日') return t('taskPeriodDaily');
    if (period === '每週') return t('taskPeriodWeekly');
    return period;
  };

  const translateDifficulty = (diff) => {
    if (diff === '簡單') return t('difficultyEasy');
    if (diff === '中等') return t('difficultyMedium');
    if (diff === '較難') return t('difficultyHard');
    if (diff === '終極') return t('difficultyUltimate');
    return diff;
  };

  const translateType = (type) => {
    if (type === '智') return t('attrWisdom');
    if (type === '德') return t('attrResponsibility');
    if (type === '體') return t('attrCourage');
    if (type === '群') return t('attrEmpathy');
    if (type === '美') return t('attrCreativity');
    return type;
  };

  const translateStatus = (status) => {
    if (status === '進行中') return t('taskStatusActive');
    if (status === '待覆核') return t('taskStatusPending');
    if (status === '已完成') return t('taskStatusCompleted');
    if (status === '需修正') return t('taskStatusRejected');
    return status;
  };

  const typeToAttrMap = {
    '德': 'Responsibility',
    '智': 'Wisdom',
    '體': 'Courage',
    '群': 'Empathy',
    '美': 'Creativity'
  };

  const getAttributeColor = (type) => {
    switch (type) {
      case '智': return 'text-[#0284c7] border-[#0284c7]/20 bg-[#0284c7]/5';
      case '德': return 'text-[#16a34a] border-[#16a34a]/20 bg-[#16a34a]/5';
      case '體': return 'text-[#ea580c] border-[#ea580c]/20 bg-[#ea580c]/5';
      case '群': return 'text-[#db2777] border-[#db2777]/20 bg-[#db2777]/5';
      case '美': return 'text-[#7c3aed] border-[#7c3aed]/20 bg-[#7c3aed]/5';
      default: return 'text-slate-400 border-white/10';
    }
  };

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'Common': return 'badge-common';
      case 'Rare': return 'badge-rare';
      case 'Epic': return 'badge-epic';
      case 'Legendary': return 'badge-legendary';
      case 'Mythic': return 'badge-mythic';
      default: return 'bg-slate-500/20';
    }
  };

  const submitNewTask = async (e) => {
    e.preventDefault();
    if (!taskName) return;

    const rewards = difficultyRewardsMap[taskDifficulty] || difficultyRewardsMap["中等"];
    
    if (taskAssignedTo === 'all') {
      const promises = children.map(child => {
        const newTask = {
          id: "task-custom-" + Date.now() + "-" + child.id,
          name: `${taskName} (${child.name})`,
          description: taskDesc || "點擊完成任務以獲得獎勵！",
          type: taskType,
          difficulty: taskDifficulty,
          expReward: rewards.exp,
          goldReward: rewards.gold,
          ticketReward: rewards.ticket,
          attributeReward: typeToAttrMap[taskType] || 'Wisdom',
          period: taskPeriod,
          status: '進行中',
          assignedTo: child.id,
          dateCreated: new Date().toISOString().split('T')[0]
        };
        return onAddTask(newTask);
      });
      const results = await Promise.all(promises);
      if (results.some(r => r === false)) {
        return; // Stay open on failure/cancellation
      }
    } else {
      const selectedChildObj = children.find(c => c.id === taskAssignedTo);
      const newTask = {
        id: "task-custom-" + Date.now(),
        name: selectedChildObj ? `${taskName} (${selectedChildObj.name})` : taskName,
        description: taskDesc || "點擊完成任務以獲得獎勵！",
        type: taskType,
        difficulty: taskDifficulty,
        expReward: rewards.exp,
        goldReward: rewards.gold,
        ticketReward: rewards.ticket,
        attributeReward: typeToAttrMap[taskType] || 'Wisdom',
        period: taskPeriod,
        status: '進行中',
        assignedTo: taskAssignedTo,
        dateCreated: new Date().toISOString().split('T')[0]
      };
      const result = await onAddTask(newTask);
      if (result === false) return; // Stay open on failure/cancellation
    }

    setTaskName('');
    setTaskDesc('');
    setTaskType('智');
    setTaskDifficulty('中等');
    setTaskPeriod('每日');
    setTaskAssignedTo('all');
    setShowAddForm(false);
    setWorkshopSubTab('manage');
  };

  const submitAddChild = async (e) => {
    e.preventDefault();
    if (!newChildName) return;
    
    const suggestedEmail = newChildEmail || `${newChildName.toLowerCase().replace(/[^a-z0-9]/g, '')}@questgrow.com`;
    const suggestedPassword = newChildPassword || 'password123';

    const initialTasks = selectedStarterQuests.map(idx => STARTER_QUESTS_TEMPLATES[idx]);

    const success = await onAddChild({
      name: newChildName,
      age: parseInt(newChildAge, 10) || 10,
      birthday: newChildBirthday || '',
      avatar: newChildAvatar || 'boy',
      email: suggestedEmail,
      password: suggestedPassword,
      jobClass: selectedJobClass,
      attributes: JOB_CLASSES[selectedJobClass].attributes,
      initialTasks: initialTasks
    });

    if (success !== false) {
      setNewChildName('');
      setNewChildAge(10);
      setNewChildBirthday('');
      setNewChildAvatar('boy');
      setNewChildEmail('');
      setNewChildPassword('password123');
      setWizardStep(1);
      setSelectedJobClass('Explorer');
      setSelectedStarterQuests([]);
      setShowAddChildForm(false);
      setShowChildWizardOnAudit(false);
    }
  };

  const submitEditChild = (e) => {
    e.preventDefault();
    if (!editChildName || !editingChildId) return;
    const success = onUpdateChildProfile(editingChildId, {
      name: editChildName,
      age: parseInt(editChildAge, 10) || 10,
      birthday: editChildBirthday || '',
      email: editChildEmail,
      password: editChildPassword,
      avatar: editChildAvatar
    });
    if (success !== false) {
      setEditingChildId(null);
      setEditChildEmail('');
      setEditChildPassword('');
    }
  };

  const submitAddParent = (e) => {
    e.preventDefault();
    if (!newParentName) return;
    
    const suggestedEmail = newParentEmail || `${newParentName.toLowerCase().replace(/[^a-z0-9]/g, '')}@questgrow.com`;
    const suggestedPassword = newParentPassword || 'password123';

    const success = onAddParent({
      name: newParentName,
      avatar: newParentAvatar,
      email: suggestedEmail,
      password: suggestedPassword
    });

    if (success !== false) {
      setNewParentName('');
      setNewParentAvatar('girl');
      setNewParentEmail('');
      setNewParentPassword('password123');
    }
  };

  const submitEditParent = (e) => {
    e.preventDefault();
    if (!editParentName || !editingParentEmail) return;
    if (editingParentEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      alert(language === 'zh' ? '無權修改其他家長帳號' : 'No permission to modify other parent accounts');
      return;
    }
    const success = onUpdateParent(editingParentEmail, {
      name: editParentName,
      avatar: editParentAvatar,
      email: editParentEmail,
      password: editParentPassword
    });
    if (success !== false) {
      setEditingParentEmail(null);
      setEditParentEmail('');
      setEditParentPassword('');
    }
  };

  const addTemplateTask = (template) => {
    const tasksToAdd = [];
    if (importAssignedTo === 'all') {
      children.forEach(child => {
        const newTask = {
          id: "task-tpl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5) + "-" + child.id,
          name: `${template.name} (${child.name})`,
          description: template.description,
          type: template.type,
          difficulty: template.difficulty,
          expReward: template.expReward,
          goldReward: template.goldReward,
          ticketReward: template.ticketReward,
          attributeReward: template.attributeReward,
          period: template.period,
          status: '進行中',
          assignedTo: child.id,
          dateCreated: new Date().toISOString().split('T')[0]
        };
        tasksToAdd.push(newTask);
      });
    } else if (importAssignedTo === 'general') {
      const newTask = {
        id: "task-tpl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5) + "-general",
        name: template.name,
        description: template.description,
        type: template.type,
        difficulty: template.difficulty,
        expReward: template.expReward,
        goldReward: template.goldReward,
        ticketReward: template.ticketReward,
        attributeReward: template.attributeReward,
        period: template.period,
        status: '進行中',
        assignedTo: 'general',
        dateCreated: new Date().toISOString().split('T')[0]
      };
      tasksToAdd.push(newTask);
    } else {
      const child = children.find(c => c.id === importAssignedTo);
      if (child) {
        const newTask = {
          id: "task-tpl-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5) + "-" + child.id,
          name: `${template.name} (${child.name})`,
          description: template.description,
          type: template.type,
          difficulty: template.difficulty,
          expReward: template.expReward,
          goldReward: template.goldReward,
          ticketReward: template.ticketReward,
          attributeReward: template.attributeReward,
          period: template.period,
          status: '進行中',
          assignedTo: child.id,
          dateCreated: new Date().toISOString().split('T')[0]
        };
        tasksToAdd.push(newTask);
      }
    }

    if (tasksToAdd.length > 0) {
      onAddTask(tasksToAdd);
    }
  };

  const importAllCategoryTasks = (type) => {
    const group = TASK_TEMPLATES.filter(t => t.type === type);
    if (group.length === 0) return;

    const tasksToAdd = [];

    if (importAssignedTo === 'all') {
      children.forEach(child => {
        group.forEach((template, index) => {
          const newTask = {
            id: "task-tpl-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substr(2, 5) + "-" + child.id,
            name: `${template.name} (${child.name})`,
            description: template.description,
            type: template.type,
            difficulty: template.difficulty,
            expReward: template.expReward,
            goldReward: template.goldReward,
            ticketReward: template.ticketReward,
            attributeReward: template.attributeReward,
            period: template.period,
            status: '進行中',
            assignedTo: child.id,
            dateCreated: new Date().toISOString().split('T')[0]
          };
          tasksToAdd.push(newTask);
        });
      });
    } else if (importAssignedTo === 'general') {
      group.forEach((template, index) => {
        const newTask = {
          id: "task-tpl-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substr(2, 5) + "-general",
          name: template.name,
          description: template.description,
          type: template.type,
          difficulty: template.difficulty,
          expReward: template.expReward,
          goldReward: template.goldReward,
          ticketReward: template.ticketReward,
          attributeReward: template.attributeReward,
          period: template.period,
          status: '進行中',
          assignedTo: 'general',
          dateCreated: new Date().toISOString().split('T')[0]
        };
        tasksToAdd.push(newTask);
      });
    } else {
      const child = children.find(c => c.id === importAssignedTo);
      if (child) {
        group.forEach((template, index) => {
          const newTask = {
            id: "task-tpl-" + Date.now() + "-" + index + "-" + Math.random().toString(36).substr(2, 5) + "-" + child.id,
            name: `${template.name} (${child.name})`,
            description: template.description,
            type: template.type,
            difficulty: template.difficulty,
            expReward: template.expReward,
            goldReward: template.goldReward,
            ticketReward: template.ticketReward,
            attributeReward: template.attributeReward,
            period: template.period,
            status: '進行中',
            assignedTo: child.id,
            dateCreated: new Date().toISOString().split('T')[0]
          };
          tasksToAdd.push(newTask);
        });
      }
    }

    if (tasksToAdd.length > 0) {
      onAddTask(tasksToAdd);
    }
  };

  const submitRejection = () => {
    const finalReason = selectedCannedReason || rejectReason || "請重新檢查任務是否完成。";
    onRejectTask(rejectingTaskId, finalReason);
    setRejectingTaskId(null);
    setRejectReason('');
    setSelectedCannedReason('');
  };

  const handleAddWishlistSubmit = (e) => {
    e.preventDefault();
    if (!wishlistTitle || wishlistPoints <= 0) return;
    onAddWishlist(wishlistTitle, parseInt(wishlistPoints, 10));
    setWishlistTitle('');
    setWishlistPoints(1000);
  };

  const submitEditWishlist = (e, id) => {
    e.preventDefault();
    if (!editWishlistTitle || editWishlistPoints <= 0) return;
    onEditWishlist(id, editWishlistTitle, parseInt(editWishlistPoints, 10));
    setEditingWishlistId(null);
  };

  const handleUpdateProfileSubmit = (e) => {
    e.preventDefault();
    onUpdateChildProfile({
      name: childName,
      age: parseInt(childAge, 10),
      birthday: childBirthday
    });
  };

  const pendingTasks = tasks.filter(t => t.status === '待覆核');
  const pendingRedemptions = inventory.filter(i => i.status === '待核銷');

  // Push notifications generator (mocking FCM messages for parent)
  const getFCMNotifications = () => {
    const list = [];
    pendingTasks.forEach(t => {
      list.push({
        id: `fcm-task-${t.id}`,
        title: language === 'zh' ? "📝 新的任務待覆核" : "📝 New Task for Review",
        body: language === 'zh' ? `「${t.name}」已提交，請覆核成果。` : `"${t.name}" has been submitted for review.`,
        time: language === 'zh' ? "待處理" : "Pending"
      });
    });

    pendingRedemptions.forEach(i => {
      list.push({
        id: `fcm-redeem-${i.inventoryId}`,
        title: language === 'zh' ? "🎁 新的願望核銷請求" : "🎁 New Wish Redemption Request",
        body: language === 'zh' ? `願望「${i.name}」已被兌換，請予以核銷。` : `Wish "${i.name}" has been redeemed.`,
        time: language === 'zh' ? "待處理" : "Pending"
      });
    });

    return list;
  };

  const fcmNotifications = getFCMNotifications();

  if (currentUser && currentUser.role === 'parent' && !currentUser.onboardingCompleted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-10 w-full px-4 animate-success">
        <ParentOnboardingWizard 
          familyNickname={familyNickname}
          onUpdateFamilyNickname={onUpdateFamilyNickname}
          onAddChild={onAddChild}
          onAddTask={onAddTask}
          onCompleteOnboarding={onCompleteOnboarding}
          children={children}
          t={t}
          language={language}
        />
      </div>
    );
  }

  const maxPointsWish = (() => {
    if (!wishlist || wishlist.length === 0) return null;
    const activeWishes = wishlist.filter(w => !w.isRedeemed);
    if (activeWishes.length === 0) return null;
    return activeWishes.reduce((max, w) => w.pointsNeeded > max.pointsNeeded ? w : max, activeWishes[0]);
  })();

  return (
    <div className="space-y-6">
      
      {/* ── Header Banner: Notifications + Simulation Date + Restart Tour ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          {/* Notification status indicator */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
            <Bell className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-xs font-semibold">
            <span className="text-slate-450 mr-1">PWA 推播通知中心 :</span>
            <span className="text-slate-300 font-semibold">
              {fcmNotifications.length > 0 ? t('newActivities', { count: fcmNotifications.length }) : t('noNewActivities')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:block">{t('simulatedDateLabel')} {simulatedDate}</span>
          <button
            type="button"
            onClick={() => {
              setTourStep(1);
              setShowTour(true);
              localStorage.removeItem('questgrow_parent_tour_seen');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 hover:scale-105"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
            title={t('reopenTourBtn')}
          >
            <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{t('reopenTourBtn')}</span>
          </button>
        </div>
      </div>

      {/* ── LINE Official Account Banner ── */}
      {showLineBanner && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gradient-to-r from-emerald-550/15 via-[#06C755]/10 to-indigo-500/5 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-[#06C755]/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
          <button
            type="button"
            onClick={() => {
              setShowLineBanner(false);
              localStorage.setItem('questgrow_show_line_banner', 'false');
            }}
            className="absolute top-2 right-2.5 text-slate-400 hover:text-slate-200 transition-colors text-sm font-bold w-5 h-5 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
            title="關閉"
          >
            &times;
          </button>
          
          <div className="flex items-center gap-3 pr-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#06C755] text-white shadow-md shadow-emerald-950/20 group-hover:rotate-6 transition-transform shrink-0">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M22 10.5C22 6.36 17.52 3 12 3S2 6.36 2 10.5C2 14.23 5.61 17.34 10.5 17.93C10.83 17.97 10.43 18.73 10.33 19.16C10.22 19.64 9.9 20.9 10.85 20.35C11.8 19.8 15.35 17.7 17.2 16.27C19.98 14.99 22 12.89 22 10.5Z"/>
              </svg>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider">
                💬 {language === 'zh' ? '訂閱 LINE 一鍵審核通知' : 'Subscribe to LINE Review Alerts'}
              </h4>
              <p className="text-[10px] text-slate-400 font-bold leading-normal">
                {language === 'zh' 
                  ? '加入官方帳號並在個人設定中完成綁定，即可隨時在 LINE 上直接批准/拒絕任務與兌換！' 
                  : 'Join our Official Account and link it to approve/reject tasks instantly in chat!'}
              </p>
            </div>
          </div>
          <a
            href="https://line.me/R/ti/p/@494ebzej"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 bg-[#06C755] hover:bg-[#05b34c] text-white font-extrabold text-xs rounded-xl text-center transition-all shadow-md active:scale-95 duration-150 flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>{language === 'zh' ? '➕ 加入好友' : '➕ Add Friend'}</span>
          </a>
        </div>
      )}

      {/* ── Merged: Daily Encouragement + Family Goal Banner ── */}
      {(dailyProverb || maxPointsWish) && (
        <div className="daily-goal-banner rounded-2xl overflow-hidden flex flex-col sm:flex-row">

          {/* Left: Daily Proverb */}
          {dailyProverb && (
            <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0" style={{ borderRight: maxPointsWish ? '1px solid rgba(99,102,241,0.12)' : 'none' }}>
              {/* Icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <Sparkles className="h-4 w-4" style={{ color: '#7c3aed' }} />
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: '#8b5cf6' }}>
                  {t('dailyProverbLabel')}
                </div>
                <div className="text-sm font-extrabold leading-snug truncate" style={{ color: '#1e293b' }}>
                  {dailyProverb.contentZh}
                </div>
                <div className="text-[11px] italic truncate mt-0.5" style={{ color: '#64748b', fontFamily: 'monospace' }}>
                  {dailyProverb.contentEn}
                </div>
              </div>
              {/* Speak button */}
              <button
                onClick={speakProverb}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                  proverbSpeaking
                    ? 'animate-pulse'
                    : ''
                }`}
                style={{
                  background: proverbSpeaking ? 'rgba(244,63,94,0.12)' : 'rgba(139,92,246,0.1)',
                  border: proverbSpeaking ? '1px solid rgba(244,63,94,0.3)' : '1px solid rgba(139,92,246,0.2)',
                  color: proverbSpeaking ? '#f43f5e' : '#8b5cf6',
                }}
                title={proverbSpeaking ? t('stopSpeaking') : t('startSpeaking')}
              >
                {proverbSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          )}

          {/* Highest Points Active Family Wish Card */}
          {maxPointsWish && (
            <div className="flex items-center gap-3 px-4 py-3 sm:w-[42%] flex-shrink-0">
              {/* Trophy icon */}
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Trophy className="h-4 w-4" style={{ color: '#d97706' }} />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-black truncate" style={{ color: '#1e293b' }}>
                    {maxPointsWish.title}
                  </span>
                  <span className="flex-shrink-0 text-[10px] font-black tabular-nums" style={{ color: '#d97706' }}>
                    {(familyScore || 0).toLocaleString()}<span style={{ color: '#94a3b8' }}>/{(maxPointsWish.pointsNeeded || 0).toLocaleString()}</span>
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, ((familyScore || 0) / (maxPointsWish.pointsNeeded || 1)) * 100)}%`,
                      background: (familyScore || 0) >= (maxPointsWish.pointsNeeded || 0)
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] font-bold" style={{ color: '#94a3b8' }}>
                    {Math.min(100, Math.round(((familyScore || 0) / (maxPointsWish.pointsNeeded || 1)) * 100))}%
                  </span>
                  <span className="text-[10px] font-bold" style={{ color: '#94a3b8' }}>
                    {(familyScore || 0) >= (maxPointsWish.pointsNeeded || 0)
                      ? '🎉 ' + (language === 'zh' ? '可兌換！' : 'Ready!')
                      : `還差 ${Math.max(0, (maxPointsWish.pointsNeeded || 0) - (familyScore || 0)).toLocaleString()} Pts`}
                  </span>
                </div>
              </div>
              {/* Claim button if unlocked */}
              {familyScore >= maxPointsWish.pointsNeeded && (
                <button
                  onClick={() => onClaimWishlistItem(maxPointsWish.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                >
                  {language === 'zh' ? '領取' : 'Claim'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl overflow-x-auto mb-6 shadow-inner">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'audit' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 2 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <ClipboardCheck className={`h-4 w-4 ${activeTab === 'audit' ? 'text-white' : 'text-[#3661FF]'}`} />
          {t('tabAudit')}
          {(pendingTasks.length + pendingRedemptions.length) > 0 && (
            <span className="bg-[#FF4747] text-white px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">
              {pendingTasks.length + pendingRedemptions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workshop')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'workshop' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 3 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <LayoutGrid className={`h-4 w-4 ${activeTab === 'workshop' ? 'text-white' : 'text-[#3661FF]'}`} />
          {t('tabWorkshop')}
        </button>
        <button
          onClick={() => setActiveTab('gacha')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'gacha' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 4 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Sparkles className={`h-4 w-4 ${activeTab === 'gacha' ? 'text-white' : 'text-violet-400'}`} />
          {t('tabGachaPool')}
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'wishlist' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#111216] shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 5 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Trophy className={`h-4 w-4 ${activeTab === 'wishlist' ? 'text-[#111216]' : 'text-[#FF9F1C]'}`} />
          {t('tabWishlist')}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'reports' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 shadow-[0_0_12px_rgba(16,185,129,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 6 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <BarChart3 className={`h-4 w-4 ${activeTab === 'reports' ? 'text-slate-900' : 'text-[#FF9F1C]'}`} />
          {t('tabReports')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeTab === 'settings' ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-[0_0_12px_rgba(71,85,105,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 7 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Settings className={`h-4 w-4 ${activeTab === 'settings' ? 'text-white' : 'text-[#00E676]'}`} />
          {t('tabSettings')}
        </button>
      </div>

      {previewPhotoUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-2xl w-full glass-panel p-4 border border-white/20">
            <button 
              className="absolute top-2 right-2 p-2 bg-slate-950/60 rounded-full hover:bg-slate-900 text-white"
              onClick={() => setPreviewPhotoUrl(null)}
            >
              <X className="h-5 w-5" />
            </button>
            <img 
              src={previewPhotoUrl} 
              alt="Kid Submission Proof" 
              className="w-full h-auto rounded-lg max-h-[75vh] object-contain"
            />
          </div>
        </div>
      )}

      {showClearConfirm && (() => {
        const targetChild = children.find(c => c.id === manageTasksFilter);
        const childName = targetChild ? targetChild.name : '';
        
        let titleZh, titleEn;
        let descZh, descEn;
        
        if (manageTasksFilter === 'all') {
          titleZh = <span>確定要清除<strong className="text-[#FF4747] font-black">所有小孩的全部任務</strong>嗎？</span>;
          titleEn = <span>Are you sure you want to clear <strong className="text-[#FF4747] font-black">all quests for all children</strong>?</span>;
          descZh = <span>這將會永久刪除此家庭指派的所有任務。<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ 此動作將無法復原！</span></span>;
          descEn = <span>This will permanently delete all quests in this family.<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ This action cannot be undone!</span></span>;
        } else if (manageTasksFilter === 'general') {
          titleZh = <span>確定要清除<strong className="text-[#FF4747] font-black">所有通用任務</strong>嗎？</span>;
          titleEn = <span>Are you sure you want to clear <strong className="text-[#FF4747] font-black">all general quests</strong>?</span>;
          descZh = <span>這將會永久刪除此家庭的所有通用任務。<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ 此動作將無法復原！</span></span>;
          descEn = <span>This will permanently delete all general quests in this family.<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ This action cannot be undone!</span></span>;
        } else {
          titleZh = <span>確定要清除「<strong className="text-[#FF4747] font-black">{childName}</strong>」的所有任務嗎？</span>;
          titleEn = <span>Are you sure you want to clear all quests for "<strong className="text-[#FF4747] font-black">{childName}</strong>"?</span>;
          descZh = <span>這將會永久刪除指派給「{childName}」的所有任務。<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ 此動作將無法復原！</span></span>;
          descEn = <span>This will permanently delete all quests assigned to "{childName}".<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ This action cannot be undone!</span></span>;
        }

        return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 border border-rose-500/30 max-w-md w-full space-y-4 animate-scale-up">
              <div className="flex items-center gap-3 text-rose-500">
                <AlertCircle className="h-6 w-6 text-rose-500 shrink-0" />
                <h3 className="text-lg font-black">
                  {language === 'zh' ? titleZh : titleEn}
                </h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {language === 'zh' ? descZh : descEn}
              </p>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClearAllTasks(manageTasksFilter);
                    setShowClearConfirm(false);
                  }}
                  className="px-4 py-2 rounded-[4px] text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                >
                  {t('confirmClearBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {showBulkTasksConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 border border-[#00E676]/30 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-[#00E676]">
              <ShieldCheck className="h-6 w-6 text-[#00E676] shrink-0" />
              <h3 className="text-lg font-black text-slate-100">
                {t('confirmBulkApproveTasksTitle')}
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('confirmBulkApproveTasksDesc')}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  onBulkApproveTasks();
                  setShowBulkTasksConfirm(false);
                }}
                className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors"
              >
                {t('confirmApproveBtn')}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkTasksConfirm(false)}
                className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkRedeemsConfirm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 border border-[#00E676]/30 max-w-md w-full space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-[#00E676]">
              <ShieldCheck className="h-6 w-6 text-[#00E676] shrink-0" />
              <h3 className="text-lg font-black text-slate-100">
                {t('confirmBulkApproveRedeemsTitle')}
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {t('confirmBulkApproveRedeemsDesc')}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  onBulkApproveRedeems();
                  setShowBulkRedeemsConfirm(false);
                }}
                className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors"
              >
                {t('confirmApproveBtn')}
              </button>
              <button
                type="button"
                onClick={() => setShowBulkRedeemsConfirm(false)}
                className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-success">
          {/* Left Column: Children list & Setup Wizard toggle */}
          <div className="lg:col-span-1 space-y-6">
            {children.length === 0 || showChildWizardOnAudit ? (
              <div className="glass-panel p-5 border border-violet-500/20 bg-slate-955/20 space-y-6 relative animate-success">
                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowChildWizardOnAudit(false)}
                    className="absolute top-4 right-4 text-xs font-black text-slate-400 hover:text-white"
                  >
                    {t('close')}
                  </button>
                )}
                <div>
                  <h3 className="text-md font-black text-zinc-100 flex items-center gap-2">
                    <span className="text-xl">🧙‍♂️</span>
                    {language === 'zh' ? '兒童角色設定嚮導' : 'Adventurer Setup Wizard'}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    {language === 'zh' ? '跟著五步驟，輕鬆又任務化地為孩子建立專屬角色與起步任務！' : '5 steps to set up your child\'s RPG profile & starter quests!'}
                  </p>
                </div>

                {children.length < 8 ? (
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    {/* Stepper progress indicator */}
                    <div className="flex items-center justify-between mb-4">
                      {[1, 2, 3, 4, 5].map((step) => (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center relative">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] transition-all duration-300 ${
                              wizardStep === step 
                                ? 'bg-[#3661FF] text-white ring-2 ring-[#3661FF]/20 shadow-[0_0_8px_rgba(54,97,255,0.4)] font-black' 
                                : wizardStep > step 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-zinc-800 text-zinc-400 border border-white/10'
                            }`}>
                              {wizardStep > step ? <Check className="h-3 w-3" /> : step}
                            </div>
                            <span className="text-[8px] font-bold text-zinc-400 mt-1 whitespace-nowrap">
                              {step === 1 ? (language === 'zh' ? '暱稱' : 'Profile') :
                               step === 2 ? (language === 'zh' ? '個資' : 'Consent') :
                               step === 3 ? (language === 'zh' ? '職業' : 'Job') :
                               step === 4 ? (language === 'zh' ? '登入' : 'Login') :
                               (language === 'zh' ? '任務' : 'Quests')}
                            </span>
                          </div>
                          {step < 5 && (
                            <div className="flex-1 h-0.5 mx-0.5 bg-slate-855 relative">
                              <div 
                                className="absolute top-0 left-0 h-full bg-[#3661FF] transition-all duration-300" 
                                style={{ width: wizardStep > step ? '100%' : '0%' }} 
                              />
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Step 1: Profile & Avatar */}
                    {wizardStep === 1 && (
                      <div className="space-y-4 animate-success">
                        <h4 className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                          🎭 {language === 'zh' ? '步驟 1：暱稱與外觀角色' : 'Step 1: Profile Name & Avatar'}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                              {language === 'zh' ? '冒險者暱稱' : 'Child Nickname'} <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input 
                                type="text" 
                                required 
                                maxLength={12}
                                value={newChildName} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setNewChildName(val);
                                  const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                                  if (clean) {
                                    setNewChildEmail(`${clean}@questgrow.com`);
                                  } else {
                                    setNewChildEmail('');
                                  }
                                }}
                                placeholder={language === 'zh' ? '例如：小明' : 'e.g. Leo'}
                                className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 pr-14 text-xs text-slate-200 focus:outline-none focus:ring-1 transition-all ${
                                  newChildName.length > 12
                                    ? 'border-rose-500/60 focus:ring-rose-500'
                                    : 'border-white/10 focus:ring-[#3661FF]'
                                }`}
                              />
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums pointer-events-none ${
                                newChildName.length >= 10 ? 'text-rose-500' : 'text-zinc-400'
                              }`}>
                                {newChildName.length}/12
                              </span>
                            </div>
                            {newChildName.length > 12 && (
                              <p className="mt-1 text-[9px] font-bold text-rose-400">
                                ⚠️ {language === 'zh' ? '暱稱最多 12 個字元' : 'Nickname must be 12 characters or fewer'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-2">
                              {language === 'zh' ? '選擇外觀頭像' : 'Select Avatar'}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                type="button"
                                onClick={() => setNewChildAvatar('boy')}
                                className={`p-2.5 rounded-xl flex flex-col items-center justify-center border transition-all hover:scale-105 active:scale-95 ${
                                  newChildAvatar === 'boy' 
                                    ? 'border-cyan-500 bg-cyan-600/10 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                                    : 'border-white/5 bg-white/5 hover:border-white/20'
                                }`}
                              >
                                <span className="text-2xl mb-1">👦</span>
                                <span className="text-[9px] font-bold text-zinc-300">
                                  {language === 'zh' ? '小男孩 (Boy)' : 'Boy'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewChildAvatar('girl')}
                                className={`p-2.5 rounded-xl flex flex-col items-center justify-center border transition-all hover:scale-105 active:scale-95 ${
                                  newChildAvatar === 'girl' 
                                    ? 'border-pink-500 bg-pink-600/10 shadow-[0_0_12px_rgba(236,72,153,0.15)]' 
                                    : 'border-white/5 bg-white/5 hover:border-white/20'
                                }`}
                              >
                                <span className="text-2xl mb-1">👧</span>
                                <span className="text-[9px] font-bold text-zinc-300">
                                  {language === 'zh' ? '小女孩 (Girl)' : 'Girl'}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Demographics & Consent */}
                    {wizardStep === 2 && (
                      <div className="space-y-4 animate-success">
                        <h4 className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                          🎂 {language === 'zh' ? '步驟 2：成長印記與個資授權' : 'Step 2: Demographics & Consent'}
                        </h4>

                        {wizardStep2Error && (
                          <div className="flex items-start gap-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-success">
                            <span className="text-rose-400 text-sm shrink-0">🚫</span>
                            <div>
                              <p className="text-[10px] font-black text-rose-500">{language === 'zh' ? '輸入有誤，無法進行下一步' : 'Input error — please fix before continuing'}</p>
                              <p className="text-[9px] font-semibold text-rose-300 mt-0.5 leading-relaxed">{wizardStep2Error}</p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                              {language === 'zh' ? '年齡' : 'Age'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="number" 
                              required 
                              min="3" 
                              max="14" 
                              value={newChildAge} 
                              onChange={(e) => { setNewChildAge(parseInt(e.target.value, 10)); setWizardStep2Error(''); }}
                              className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 transition-all ${
                                newChildAge < 3 || newChildAge > 14
                                  ? 'border-rose-500/60 focus:ring-rose-500'
                                  : 'border-white/10 focus:ring-[#3661FF]'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                              {language === 'zh' ? '生日 (MM/DD)' : 'Birthday (MM/DD)'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required 
                              value={newChildBirthday} 
                              onChange={(e) => { setNewChildBirthday(e.target.value); setWizardStep2Error(''); }}
                              placeholder="e.g. 10/24"
                              className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 transition-all ${
                                newChildBirthday.trim() && (() => {
                                  const parts = newChildBirthday.trim().split('/');
                                  if (parts.length !== 2) return true;
                                  const mm = parseInt(parts[0], 10);
                                  const dd = parseInt(parts[1], 10);
                                  if (isNaN(mm) || isNaN(dd) || mm < 1 || mm > 12) return true;
                                  const daysInMonth = [31,29,31,30,31,30,31,31,30,31,30,31];
                                  return dd < 1 || dd > daysInMonth[mm - 1];
                                })()
                                  ? 'border-rose-500/60 focus:ring-rose-500'
                                  : 'border-white/10 focus:ring-[#3661FF]'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Taiwan PDPA/Consent Warning box */}
                        <div className={`p-3 rounded-xl border text-[10px] leading-relaxed transition-all duration-300 ${
                          newChildAge < 8 
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                            : 'bg-[#3661FF]/10 border-[#3661FF]/20 text-[#4e75ff]'
                        }`}>
                          <div className="flex gap-2 items-start">
                            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                            <div>
                              <h5 className="font-bold mb-0.5">
                                {language === 'zh' ? '🛡️ 個資與隱私保護說明' : '🛡️ Child Data Protection & Privacy Consent'}
                              </h5>
                              <p className="text-[9px] text-zinc-300">
                                {language === 'zh' 
                                  ? `QuestGrow 依據年齡適配冒險任務。符合台灣個資法第8條規範：` 
                                  : `QuestGrow adapts adventure tasks based on age. In compliance with Taiwan PDPA:`}
                              </p>
                              <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-[8.5px] text-zinc-400">
                                <li>
                                  {language === 'zh'
                                    ? '僅收集暱稱、生日、年齡以計算全人成長指數。'
                                    : 'Only nickname, birthday, age are collected.'}
                                </li>
                                {newChildAge < 8 && (
                                  <li className="text-amber-400 font-bold">
                                    {language === 'zh'
                                      ? '⚠️ 偵測到小孩小於 8 歲：系統將在孩子登入時自動啟用【注音輔助模式】，協助孩子順暢識字成長！'
                                      : '⚠️ Under 8 detected: System will automatically enable [Zhuyin Assistive Mode] to help them read!'}
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Starting Job Class */}
                    {wizardStep === 3 && (
                      <div className="space-y-4 animate-success">
                        <h4 className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                          ⚔️ {language === 'zh' ? '步驟 3：初始職業與屬性傾向' : 'Step 3: Starting Job Class'}
                        </h4>
                        <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
                          {Object.entries(JOB_CLASSES).map(([key, config]) => {
                            const isSelected = selectedJobClass === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => setSelectedJobClass(key)}
                                className={`p-2.5 rounded-lg border text-left transition-all hover:scale-[1.01] active:scale-95 ${
                                  isSelected 
                                    ? 'border-violet-500 bg-violet-600/10 shadow-[0_0_8px_rgba(124,58,237,0.15)]' 
                                    : 'border-white/5 bg-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-[11px] font-black text-zinc-200">
                                    {language === 'zh' ? config.nameZh : config.nameEn}
                                  </span>
                                  {isSelected && (
                                    <span className="bg-violet-500 text-white rounded-full p-0.5">
                                      <Check className="h-2.5 w-2.5" />
                                    </span>
                                  )}
                                </div>
                                <p className="text-[9px] text-zinc-400 mb-1 leading-relaxed">
                                  {language === 'zh' ? config.descZh : config.descEn}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Login Account Setup */}
                    {wizardStep === 4 && (
                      <div className="space-y-4 animate-success">
                        <h4 className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                          🔑 {language === 'zh' ? '步驟 4：傳送門鑰匙 (帳號密碼)' : 'Step 4: Login Account Key'}
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                              {language === 'zh' ? '登入信箱 (Email)' : 'Login Email'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="email" 
                              required 
                              value={newChildEmail} 
                              onChange={(e) => setNewChildEmail(e.target.value)}
                              placeholder="e.g. michelle@questgrow.com"
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">
                              {language === 'zh' ? '密碼' : 'Password'} <span className="text-rose-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              required 
                              value={newChildPassword} 
                              onChange={(e) => setNewChildPassword(e.target.value)}
                              placeholder="密碼"
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Starter Quests assignment */}
                    {wizardStep === 5 && (
                      <div className="space-y-4 animate-success">
                        <h4 className="text-[11px] font-black text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                          🚀 {language === 'zh' ? '步驟 5：第一份冒險合約' : 'Step 5: Starter Quests'}
                        </h4>
                        <p className="text-[9px] text-zinc-400">
                          {language === 'zh' ? '可直接勾選下方任務，建立成功時會立即指派給孩子！' : 'Select starting quests to assign immediately.'}
                        </p>
                        <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                          {STARTER_QUESTS_TEMPLATES.map((quest, index) => {
                            const isChecked = selectedStarterQuests.includes(index);
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedStarterQuests(prev => prev.filter(i => i !== index));
                                  } else {
                                    setSelectedStarterQuests(prev => [...prev, index]);
                                  }
                                }}
                                className={`w-full p-2 rounded-lg border text-left transition-all flex items-start gap-2 ${
                                  isChecked ? 'border-emerald-500 bg-emerald-600/10' : 'border-white/5 bg-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="pt-0.5">
                                  <div className={`w-3 h-3 rounded border flex items-center justify-center transition-all ${
                                    isChecked ? 'bg-emerald-500 border-emerald-500 text-white animate-scale-up' : 'border-white/20'
                                  }`}>
                                    {isChecked && <Check className="h-2 w-2" />}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center gap-1 mb-0.5">
                                    <span className="text-[10px] font-black text-zinc-200 truncate">
                                      {quest.name}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Back / Next buttons */}
                    <div className="flex gap-2 justify-between border-t border-white/5 pt-3">
                      {wizardStep > 1 ? (
                        <button
                          type="button"
                          onClick={() => setWizardStep(prev => prev - 1)}
                          className="px-2.5 py-1.5 rounded bg-[#252529] border border-[#35363A] text-[#b5b7bc] text-[10px] font-bold hover:text-white transition-all active:scale-95"
                        >
                          {language === 'zh' ? '上一步' : 'Back'}
                        </button>
                      ) : (
                        <div />
                      )}

                      {wizardStep < 5 ? (
                        <button
                          type="button"
                          onClick={() => {
                            // Validation
                            if (wizardStep === 1) {
                              if (!newChildName.trim()) {
                                alert(language === 'zh' ? '請輸入冒險者暱稱！' : 'Please enter nickname!');
                                return;
                              }
                              if (newChildName.trim().length > 12) {
                                alert(language === 'zh' ? '暱稱最多 12 個字元！' : 'Nickname must be 12 characters or fewer!');
                                return;
                              }
                            }
                            if (wizardStep === 2) {
                              if (!newChildAge || isNaN(newChildAge) || newChildAge < 3 || newChildAge > 14) {
                                setWizardStep2Error(language === 'zh' ? '年齡需介於 3～14 歲之間' : 'Age must be between 3 and 14');
                                return;
                              }
                              const bdayTrim = newChildBirthday.trim();
                              if (!bdayTrim) {
                                setWizardStep2Error(language === 'zh' ? '請輸入生日 (MM/DD)' : 'Please enter birthday (MM/DD)');
                                return;
                              }
                              const parts = bdayTrim.split('/');
                              if (parts.length !== 2) {
                                setWizardStep2Error(language === 'zh' ? '請依 MM/DD 格式輸入，例如 10/24' : 'Use MM/DD format, e.g. 10/24');
                                return;
                              }
                              const mm = parseInt(parts[0], 10);
                              const dd = parseInt(parts[1], 10);
                              if (isNaN(mm) || isNaN(dd) || mm < 1 || mm > 12) {
                                setWizardStep2Error(language === 'zh' ? '月份需為 01～12' : 'Month must be 01–12');
                                return;
                              }
                              const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                              if (dd < 1 || dd > daysInMonth[mm - 1]) {
                                setWizardStep2Error(language === 'zh' ? `${mm} 月的日期需為 1～${daysInMonth[mm-1]}` : `Day for month ${mm} must be 1–${daysInMonth[mm-1]}`);
                                return;
                              }
                              setWizardStep2Error('');
                            }
                            if (wizardStep === 4) {
                              if (!newChildEmail.trim() || !newChildPassword.trim()) {
                                alert(language === 'zh' ? '請輸入登入帳號及密碼！' : 'Please enter login credentials!');
                                return;
                              }
                            }
                            setWizardStep(prev => prev + 1);
                          }}
                          className="px-3 py-1.5 rounded bg-[#3661FF] text-white text-[10px] font-black hover:bg-[#4e75ff] transition-all active:scale-95"
                        >
                          {language === 'zh' ? '下一步' : 'Next'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={submitAddChild}
                          className="px-4 py-1.5 rounded bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 text-[10px] font-black hover:from-emerald-400 hover:to-cyan-400 transition-all active:scale-95"
                        >
                          {language === 'zh' ? '完成建立 🚀' : 'Complete 🚀'}
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center space-y-1">
                    <ShieldAlert className="h-6 w-6 text-rose-400 mx-auto animate-pulse" />
                    <h4 className="text-[10px] font-black text-rose-350">{t('maxChildLimit')}</h4>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-5 border border-white/5 bg-slate-950/20 space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h3 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-violet-400" />
                    {language === 'zh' ? '家庭冒險小隊' : 'Family Adventurers'} ({children.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setWizardStep(1);
                      setNewChildName('');
                      setNewChildAge(10);
                      setNewChildBirthday('');
                      setNewChildAvatar('boy');
                      setNewChildEmail('');
                      setNewChildPassword('password123');
                      setSelectedJobClass('Explorer');
                      setSelectedStarterQuests([]);
                      setWizardStep2Error('');
                      setShowChildWizardOnAudit(true);
                    }}
                    className="px-2.5 py-1 bg-violet-600/20 hover:bg-violet-605/35 border border-violet-500/30 text-violet-400 hover:text-violet-350 text-[9px] font-black rounded-lg transition-all active:scale-95"
                  >
                    ➕ {language === 'zh' ? '新增兒童角色' : 'Add Child'}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {children.map(child => (
                    <div key={child.id} className="p-2.5 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        <Avatar 
                          avatar={child.avatar} 
                          role="kid" 
                          badge={inventory.find(i => i.childId === child.id && i.type === '收藏卡' && i.status === '已使用')?.id}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-200 truncate">{child.name}</h4>
                        <p className="text-[9px] text-slate-500 font-semibold mt-0.5">
                          Lv. {child.level} • {child.age} Y/O
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pending Audits & History Logs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel p-6 border border-white/5 bg-slate-950/20 space-y-6 rounded-2xl shadow-xl">
              {/* Pending Tasks */}
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2 tracking-wider">
                    <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                    {t('auditTitleTasks')} ({pendingTasks.length})
                  </h3>
                  {pendingTasks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBulkTasksConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all shadow-md transform hover:scale-105 active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('bulkApproveTasksBtn')}
                    </button>
                  )}
                </div>

                {pendingTasks.length === 0 ? (
                  <div className="bg-slate-955/40 border border-white/5 rounded-xl p-8 text-center text-slate-400 text-sm shadow-inner">
                    {t('noPendingTasks')}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTasks.map((task) => {
                      const isBoss = task.difficulty === '較難' || task.difficulty === '終極';
                      const getBossLabel = (diff) => {
                        if (diff === '較難') return t('eliteBossLabel');
                        if (diff === '終極') return t('ultimateBossLabel');
                        return null;
                      };
                      const cardClass = `p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all relative rounded-2xl ${
                        isBoss ? 'boss-quest-card' : 'bg-slate-900/60 border border-white/5 text-slate-100 shadow-sm'
                      }`;

                      return (
                        <div key={task.id} className={cardClass}>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              {isBoss && (
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm mr-1">
                                  {getBossLabel(task.difficulty)}
                                </span>
                              )}
                              <span className={`text-md font-bold ${isBoss ? 'text-slate-200' : 'text-slate-100 font-extrabold'}`}>
                                  {task.name}
                              </span>
                              {task.isRepeated && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                  isBoss 
                                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {language === 'zh' ? '⚠️ 30天內重複完成任務' : '⚠️ 30-Day Repeated Quest'}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAttributeColor(task.type)}`}>
                                {translateType(task.type)} | {language === 'zh' ? '難度' : 'Difficulty'} {translateDifficulty(task.difficulty)}
                              </span>
                            </div>
                            
                            <p className={`text-xs ${isBoss ? 'text-slate-400' : 'text-slate-400 font-medium'}`}>
                              {task.description}
                            </p>
                          
                            {task.submission && (
                              <div className={`p-3 rounded-xl space-y-2 border ${
                                isBoss ? 'bg-white/5 border-white/5' : 'bg-slate-950/40 border border-white/5'
                              }`}>
                                <div className={`text-[11px] flex items-center gap-1 ${
                                  isBoss ? 'text-slate-400' : 'text-slate-400'
                                }`}>
                                  <MessageSquare className="h-3 w-3" />
                                  {t('childNotesLabel')}
                                </div>
                                <p className={`text-xs font-semibold ${
                                  isBoss ? 'text-slate-200' : 'text-slate-200'
                                }`}>{task.submission.notes}</p>
                                {task.submission.photo && (
                                  <button 
                                    onClick={() => setPreviewPhotoUrl(task.submission.photo)}
                                    className={`flex items-center gap-1 text-[11px] font-bold ${
                                      isBoss ? 'text-cyan-400 hover:text-cyan-300' : 'text-indigo-400 hover:text-indigo-300'
                                    }`}
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    {t('viewProofPhoto')}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 whitespace-nowrap">
                            <button
                              onClick={() => onApproveTask(task.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors shadow-sm"
                            >
                              <Check className="h-4 w-4" />
                              {t('approve')}
                            </button>
                            <button
                              onClick={() => setRejectingTaskId(task.id)}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-black bg-[#FF4747] text-white hover:bg-[#ff3030] transition-colors shadow-sm"
                            >
                              <X className="h-4 w-4" />
                              {t('reject')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {rejectingTaskId && (
                <div className="glass-panel p-5 border border-rose-500/30 bg-[#1e1717] space-y-4 max-w-md animate-success rounded-2xl shadow-xl">
                  <h4 className="text-sm font-extrabold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertCircle className="h-5 w-5" />
                    {t('rejectionReasonTitle')}
                  </h4>
                  
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                      {t('cannedReasonTitle')}
                    </label>
                    <div className="grid grid-cols-1 gap-1">
                      {cannedReasons.map((reason, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedCannedReason(reason);
                            setRejectReason('');
                          }}
                          className={`p-2 text-left text-xs rounded transition-colors ${
                            selectedCannedReason === reason 
                              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' 
                              : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-200 font-bold uppercase tracking-wider">
                      {t('customReasonLabel')}
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        setSelectedCannedReason('');
                      }}
                      placeholder={t('rejectionPlaceholder')}
                      className="w-full bg-[#111216] border border-[#35363A] text-slate-200 text-xs p-3 rounded focus:outline-none focus:border-rose-500/50 resize-none h-20"
                    />
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button onClick={submitRejection} className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#FF4747] text-white hover:bg-[#ff3030]">{t('confirmReject')}</button>
                    <button onClick={() => { setRejectingTaskId(null); setRejectReason(''); setSelectedCannedReason(''); }} className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white">{t('cancel')}</button>
                  </div>
                </div>
              )}

              {/* Pending Redemptions with V2 Expired warning and block protection */}
              <div className="space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h3 className="text-sm font-black text-slate-100 flex items-center gap-2 tracking-wider">
                    <ClipboardCheck className="h-5 w-5 text-indigo-400" />
                    {t('auditTitleRedeems')} ({pendingRedemptions.length})
                  </h3>
                  {pendingRedemptions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowBulkRedeemsConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all shadow-md transform hover:scale-105 active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {t('bulkApproveRedeemsBtn')}
                    </button>
                  )}
                </div>

                {pendingRedemptions.length === 0 ? (
                  <div className="bg-slate-955/40 border border-white/5 rounded-xl p-8 text-center text-slate-400 text-sm shadow-inner">
                    {t('noPendingRedeems')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingRedemptions.map((item) => {
                      const isExpired = item.expireAt && item.expireAt < simulatedDate;
                      return (
                        <div 
                          key={item.inventoryId} 
                          className={`p-5 border flex flex-col justify-between gap-4 rounded-2xl ${
                            isExpired 
                              ? 'border-rose-500/30 bg-rose-955/10 text-slate-300 shadow-sm' 
                              : 'bg-slate-900/60 border border-white/5 text-slate-100 shadow-sm'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${getRarityBadge(item.rarity)}`}>
                                {item.rarity} | {item.type}
                              </span>
                              <span className={`text-[10px] font-bold ${isExpired ? 'text-slate-450' : 'text-slate-400'}`}>
                                {t('applicantLabel', { name: children.find(c => c.id === item.ownerId)?.name || stats.name })}
                              </span>
                            </div>
                            <h4 className={`text-md font-bold ${isExpired ? 'text-slate-100' : 'text-slate-100'}`}>
                              {item.name}
                            </h4>
                            <p className={`text-xs ${isExpired ? 'text-slate-450' : 'text-slate-400 font-medium'}`}>
                              {item.desc}
                            </p>
                            {item.expireAt && (
                              <p className={`text-[10px] font-extrabold ${isExpired ? 'text-rose-500' : 'text-slate-400'}`}>
                                {t('expiredLabel')} {item.expireAt} {isExpired && t('expiredAlert')}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2 border-t border-black/5 pt-3 mt-1">
                            <button
                              disabled={isExpired}
                              onClick={() => onApproveRedeem(item.inventoryId)}
                              className={`flex-1 py-2 rounded-[4px] text-xs font-black transition-all ${
                                isExpired 
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                  : 'bg-[#00E676] text-[#111216] hover:bg-[#00c867] shadow-sm'
                              }`}
                            >
                              {isExpired ? t('cardExpiredBlock') : t('confirmApprove')}
                            </button>
                            <button
                              onClick={() => onRejectRedeem(item.inventoryId)}
                              className="px-3 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors shadow-sm"
                            >
                              {isExpired ? t('reclaimCard') : t('rejectRedeem')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            
            {/* Collapsible History Section */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  {language === 'zh' ? '歷史審核與核銷紀錄' : 'History Logs'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowHistoryLogs(prev => !prev)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 hover:border-white/20 text-slate-200 text-xs font-bold rounded-full shadow-sm transition-all duration-200 active:scale-95"
                >
                  <span>{showHistoryLogs ? (language === 'zh' ? '收起記錄' : 'Hide History') : (language === 'zh' ? '展開記錄' : 'Show History')}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${showHistoryLogs ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showHistoryLogs && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-success">
                  {/* Completed Tasks History */}
                  <div className="glass-panel p-5 space-y-4 bg-slate-950/20">
                    <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
                      ✅ {language === 'zh' ? '已完成任務歷史' : 'Completed Quests'}
                    </h4>
                    {tasks.filter(t => t.status === '已完成').length === 0 ? (
                      <p className="text-xs text-slate-300 text-center py-6">{language === 'zh' ? '無已完成的任務紀錄。' : 'No completed quest records.'}</p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {tasks.filter(t => t.status === '已完成').map(task => (
                          <div key={task.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{task.name}</span>
                              <span className="text-[10px] text-slate-400">{task.dateCreated}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">{task.description}</p>
                            <div className="flex items-center justify-between text-[9px] text-emerald-450 font-bold mt-1">
                              <span>{language === 'zh' ? '指派給：' : 'Assigned to: '}{children.find(c => c.id === task.assignedTo)?.name || '通用'}</span>
                              <span>+{task.expReward} EXP | 🪙 {task.goldReward}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Redeemed Cards History */}
                  <div className="glass-panel p-5 space-y-4 bg-slate-950/20">
                    <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-2">
                      🎫 {language === 'zh' ? '已核銷獎勵歷史' : 'Redeemed Cards'}
                    </h4>
                    {redeemLogs.length === 0 ? (
                      <p className="text-xs text-slate-300 text-center py-6">{language === 'zh' ? '無已核銷的獎勵紀錄。' : 'No redeemed card records.'}</p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {redeemLogs.map(log => (
                          <div key={log.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{log.cardName}</span>
                              <span className="text-[10px] text-slate-400">{log.dateRedeemed}</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                              <span>{language === 'zh' ? '使用者：' : 'User: '}<strong className="text-cyan-400">{log.kidName}</strong></span>
                              <span>{language === 'zh' ? '審核者：' : 'Reviewer: '}<strong className="text-slate-300">{log.reviewer || '系統'}</strong></span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}





      {/* --- Tab 2: Quest Workshop --- */}
      {activeTab === 'workshop' && (
        <div className="space-y-6 animate-success">
          {/* Sub Navigation Bar for Workshop */}
          <div className="flex gap-2 p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl overflow-x-auto mb-6 shadow-inner">
            <button
              onClick={() => setWorkshopSubTab('import')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black transition-all whitespace-nowrap rounded-xl ${
                workshopSubTab === 'import' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)]' 
                  : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className={`h-3.5 w-3.5 ${workshopSubTab === 'import' ? 'text-white' : 'text-[#3661FF]'}`} />
              {t('workshopTabImport')}
            </button>
            <button
              onClick={() => setWorkshopSubTab('manage')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black transition-all whitespace-nowrap rounded-xl ${
                workshopSubTab === 'manage' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)]' 
                  : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
              }`}
            >
              <ListTodo className={`h-3.5 w-3.5 ${workshopSubTab === 'manage' ? 'text-white' : 'text-[#3661FF]'}`} />
              {t('workshopTabManage')}
              {tasks.length > 0 && (
                <span className="bg-[#FF4747] text-white px-1.5 py-0.5 rounded-full text-[10px] font-black ml-1 shadow-sm">
                  {tasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setWorkshopSubTab('add')}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-black transition-all whitespace-nowrap rounded-xl ${
                workshopSubTab === 'add' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)]' 
                  : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
              }`}
            >
              <Plus className={`h-3.5 w-3.5 ${workshopSubTab === 'add' ? 'text-white' : 'text-[#00E676]'}`} />
              {t('workshopTabAdd')}
            </button>
          </div>

          {/* Sub-tab 1: Quick Import Templates */}
          {workshopSubTab === 'import' && (
            <div className="space-y-4">
              {/* Target Kid Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">{t('importAssignLabel')}</h4>
                  <p className="text-[11px] text-slate-500">{t('importAssignDesc')}</p>
                </div>
                <select
                  value={importAssignedTo}
                  onChange={(e) => setImportAssignedTo(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none min-w-[180px]"
                >
                  <option value="all">{t('allChildren')}</option>
                  <option value="general">{language === 'zh' ? '👥 通用任務 (未指派，任何小孩均可看見)' : '👥 General Task (Unassigned, visible to all)'}</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <h3 className="text-md font-extrabold uppercase tracking-widest text-slate-400">
                    {t('quickImportTitle')}
                  </h3>

                  {/* Filters and Search Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { key: 'all', label: language === 'zh' ? '全部' : 'All' },
                        { key: '德', label: '德' },
                        { key: '智', label: '智' },
                        { key: '體', label: '體' },
                        { key: '群', label: '群' },
                        { key: '美', label: '美' },
                      ].map(cat => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setTemplateCategoryFilter(cat.key)}
                          className={`px-2.5 py-1 text-xs font-black rounded-lg transition-all border ${
                            templateCategoryFilter === cat.key
                              ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border-indigo-500/40 text-white shadow-md'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Search input */}
                    <div className="relative min-w-[160px]">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder={language === 'zh' ? '搜尋模板名稱/描述...' : 'Search template...'}
                        className="bg-slate-950/60 border border-white/10 rounded-lg pl-8 pr-7 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 w-full"
                      />
                      {templateSearch && (
                        <button
                          type="button"
                          onClick={() => setTemplateSearch('')}
                          className="absolute right-2 top-1.5 text-slate-400 hover:text-white text-xs px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Templates Grid / Sections */}
                <div className="space-y-6">
                  {!hasMatches ? (
                    <div className="bg-slate-950/40 border border-white/5 rounded-xl p-8 text-center text-slate-400 text-sm shadow-inner">
                      {language === 'zh' ? '🔍 找不到符合的冒險模板，試試看其他關鍵字吧！' : '🔍 No matching adventure templates found, try other keywords!'}
                    </div>
                  ) : (
                    visibleCategories.map(({ type, label, color, border, bg }) => {
                      const group = filteredTemplates[type] || [];
                      if (group.length === 0) return null;

                      const limit = templateVisibleCounts[type] || 12;
                      const displayedItems = group.slice(0, limit);
                      const hasMore = group.length > limit;

                      return (
                        <div key={type} className="space-y-2">
                          <div className={`flex items-center justify-between pb-1.5 border-b ${border} flex-wrap gap-2`}>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-black ${color}`}>{label}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${color} ${bg} border ${border}`}>
                                {group.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => importAllCategoryTasks(type)}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-[4px] border transition-all hover:scale-[1.02] ${color} ${bg} ${border} hover:brightness-125`}
                            >
                              {language === 'zh' ? `匯入全部「${type}」任務` : `Import All "${type}"`}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {displayedItems.map((tpl) => (
                              <button
                                key={tpl.id}
                                onClick={() => addTemplateTask(tpl)}
                                className={`glass-panel p-3 border text-left transition-all flex flex-col justify-between gap-2 hover:scale-[1.02] ${border} ${bg} hover:brightness-110`}
                              >
                                <div>
                                  <div className="text-xs font-black text-slate-100 leading-snug">{tpl.name}</div>
                                  <div className="text-[10px] text-slate-500 mt-1">{translatePeriod(tpl.period)} | {language === 'zh' ? '難度' : 'Diff.'} {translateDifficulty(tpl.difficulty)}</div>
                                </div>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${color} ${bg} border ${border}`}>
                                  +{tpl.expReward} EXP
                                </span>
                              </button>
                            ))}
                          </div>

                          {hasMore && (
                            <div className="flex justify-center pt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setTemplateVisibleCounts(prev => ({
                                    ...prev,
                                    [type]: prev[type] + 24
                                  }));
                                }}
                                className="text-[10px] font-black px-4 py-1.5 rounded-lg border transition-all bg-white/5 hover:bg-white/10 border-white/5 text-slate-300 hover:text-white hover:scale-[1.02]"
                              >
                                {language === 'zh' ? `➕ 載入更多 (還有 ${group.length - limit} 個)` : `➕ Load More (${group.length - limit} remaining)`}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab 2: Manage Existing Tasks */}
          {workshopSubTab === 'manage' && (() => {
            const groups = {};
            children.forEach(child => {
              groups[child.id] = { name: child.name, avatar: child.avatar, tasks: [] };
            });
            const generalGroupKey = 'general';
            groups[generalGroupKey] = {
              name: language === 'zh' ? '所有小孩 / 通用任務' : 'All Children / General Quests',
              avatar: 'all',
              tasks: []
            };
            tasks.forEach(task => {
              if (task.assignedTo && groups[task.assignedTo]) {
                groups[task.assignedTo].tasks.push(task);
              } else {
                groups[generalGroupKey].tasks.push(task);
              }
            });

            const filteredTasksCount = manageTasksFilter === 'all'
              ? tasks.length
              : (groups[manageTasksFilter] ? groups[manageTasksFilter].tasks.length : 0);

            let clearButtonText = '';
            if (manageTasksFilter === 'all') {
              clearButtonText = language === 'zh' ? '一鍵清除所有任務' : 'Clear All Quests';
            } else if (manageTasksFilter === 'general') {
              clearButtonText = language === 'zh' ? '清除通用任務' : 'Clear General Quests';
            } else {
              const targetChild = children.find(c => c.id === manageTasksFilter);
              const childName = targetChild ? targetChild.name : '';
              clearButtonText = language === 'zh' ? `清除「${childName}」的任務` : `Clear Quests for ${childName}`;
            }

            const visibleGroupKeys = Object.keys(groups).filter(gk => {
              if (manageTasksFilter !== 'all' && manageTasksFilter !== gk) return false;
              return groups[gk].tasks.length > 0;
            });

            return (
              <div className="space-y-6">
                {/* Header with task count and clear button */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-200">{t('taskListTitle')} ({tasks.length})</h3>
                  {filteredTasksCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors active:scale-95 transform duration-150"
                    >
                      <Trash2 className="h-4 w-4" />
                      {clearButtonText}
                    </button>
                  )}
                </div>

                {/* Filter bar */}
                {tasks.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 font-bold mr-1">{language === 'zh' ? '篩選對象：' : 'Filter by:'}</span>
                    <button
                      type="button"
                      onClick={() => setManageTasksFilter('all')}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 duration-100 ${
                        manageTasksFilter === 'all'
                          ? 'bg-[#3661FF] text-white shadow-md shadow-[#3661FF]/30'
                          : 'bg-[#252529] border border-[#35363A] text-slate-400 hover:text-white hover:bg-[#35363A]'
                      }`}
                    >
                      <span>👪</span> {language === 'zh' ? '全部小孩' : 'All Children'}
                    </button>
                    {children.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => setManageTasksFilter(child.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 duration-100 ${
                          manageTasksFilter === child.id
                            ? 'bg-[#00E676] text-[#111216] shadow-md shadow-[#00E676]/30'
                            : 'bg-[#252529] border border-[#35363A] text-slate-400 hover:text-white hover:bg-[#35363A]'
                        }`}
                      >
                        <span>{child.avatar === 'girl' ? '👧' : child.avatar === 'boy' ? '👦' : '👤'}</span>
                        {child.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setManageTasksFilter('general')}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black transition-all active:scale-95 duration-100 ${
                        manageTasksFilter === 'general'
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                          : 'bg-[#252529] border border-[#35363A] text-slate-400 hover:text-white hover:bg-[#35363A]'
                      }`}
                    >
                      <span>👥</span> {language === 'zh' ? '通用任務' : 'General Tasks'}
                    </button>
                  </div>
                )}

                {/* Task list */}
                {tasks.length === 0 ? (
                  <div className="glass-panel p-8 text-center text-slate-400 text-sm">
                    {language === 'zh' ? '目前沒有任何現有任務，請前往「快速匯入」或「新增任務」！' : 'No existing quests found, go to "Quick Import" or "Add Quest"!'}
                  </div>
                ) : filteredTasksCount === 0 ? (
                  <div className="glass-panel p-8 text-center text-slate-400 text-xs font-semibold">
                    🔒 {language === 'zh'
                      ? `「${groups[manageTasksFilter] ? groups[manageTasksFilter].name : ''}」目前沒有被指派任何任務。`
                      : `No quests assigned to "${groups[manageTasksFilter] ? groups[manageTasksFilter].name : ''}" yet.`}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {visibleGroupKeys.map(groupKey => {
                      const group = groups[groupKey];
                      return (
                        <div key={groupKey} className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            {group.avatar === 'all' ? (
                              <span className="text-lg">👥</span>
                            ) : (
                              <div className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400">
                                <Avatar 
                                  avatar={group.avatar} 
                                  role="kid" 
                                  badge={inventory.find(i => i.childId === groupKey && i.type === '收藏卡' && i.status === '已使用')?.id}
                                  className="w-full h-full" 
                                />
                              </div>
                            )}
                            <h4 className="text-sm font-black text-slate-200">
                              {group.name} {language === 'zh' ? '的任務' : 'Quests'} ({group.tasks.length})
                            </h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {group.tasks.map((task) => {
                              const isBoss = task.difficulty === '較難' || task.difficulty === '終極';
                              const getBossLabel = (diff) => {
                                if (diff === '較難') return t('eliteBossLabel');
                                if (diff === '終極') return t('ultimateBossLabel');
                                return null;
                              };
                              const cardClass = `p-4 flex flex-col justify-between gap-4 relative transition-all ${
                                isBoss ? 'boss-quest-card' : 'bg-slate-900/60 border border-white/5 rounded-xl'
                              }`;

                              return (
                                <div key={task.id} className={cardClass}>
                                  <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <h4 className="text-md font-bold text-slate-200 flex items-center gap-2 flex-wrap">
                                          {isBoss && (
                                            <span className="bg-red-650 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm mr-1">
                                              {getBossLabel(task.difficulty)}
                                            </span>
                                          )}
                                          {task.name}
                                          {task.isRepeated && (
                                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0">
                                              {language === 'zh' ? '⚠️ 30天內重複完成任務' : '⚠️ 30-Day Repeated Quest'}
                                            </span>
                                          )}
                                        </h4>
                                        <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getAttributeColor(task.type)}`}>
                                        {translateType(task.type)} | {language === 'zh' ? '難度' : 'Difficulty'} {translateDifficulty(task.difficulty)}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-100/80 p-2 rounded-lg border border-slate-200/60">
                                      <span>{language === 'zh' ? '週期：' : 'Frequency: '}<span className="text-slate-800 font-bold">{translatePeriod(task.period)}</span></span>
                                      <span>{t('expLabel')}：<span className="text-violet-600 font-bold">+{task.expReward} EXP</span></span>
                                      <span>{t('goldLabel')}：<span className="text-amber-700 font-bold">🪙 {task.goldReward || 0}</span></span>
                                      <span>{t('ticketsLabel')}：<span className="text-cyan-600 font-bold">🎫 {task.ticketReward || 1}</span></span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                      task.status === '已完成' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                      task.status === '待覆核' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                                      'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                    }`}>
                                      {language === 'zh' ? '狀態' : 'Status'}: {translateStatus(task.status)}
                                    </span>
                                    <button
                                      onClick={() => setDeleteConfirm({ show: true, type: 'task', id: task.id, title: task.name })}
                                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Sub-tab 3: Add Custom Quest */}
          {workshopSubTab === 'add' && (
            <div className="space-y-4">
              <form onSubmit={submitNewTask} className="glass-panel p-5 border border-white/10 space-y-4 max-w-xl animate-success">
                <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wider">{t('addCustomTask')}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskNameLabel')}</label>
                    <input 
                      type="text" required value={taskName} onChange={(e) => setTaskName(e.target.value)}
                      placeholder={t('taskNamePlaceholder')}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskTypeLabel')}</label>
                    <select
                      value={taskType} onChange={(e) => setTaskType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="德">{t('Responsibility')}</option>
                      <option value="智">{t('Wisdom')}</option>
                      <option value="體">{t('Courage')}</option>
                      <option value="群">{t('Empathy')}</option>
                      <option value="美">{t('Creativity')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskDifficultyLabel')}</label>
                    <select
                      value={taskDifficulty} onChange={(e) => setTaskDifficulty(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="簡單">{t('difficultyEasy')}</option>
                      <option value="中等">{t('difficultyMedium')}</option>
                      <option value="較難">{t('difficultyHard')}</option>
                      <option value="終極">{t('difficultyUltimate')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskPeriodLabel')}</label>
                    <select
                      value={taskPeriod} onChange={(e) => setTaskPeriod(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="每日">{t('taskPeriodDaily')}</option>
                      <option value="每週">{t('taskPeriodWeekly')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskAssignLabel')}</label>
                    <select
                      value={taskAssignedTo} onChange={(e) => setTaskAssignedTo(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="all">{t('allChildren')}</option>
                      <option value="general">{language === 'zh' ? '👥 通用任務 (未指派，任何小孩均可看見)' : '👥 General Task (Unassigned, visible to all)'}</option>
                      {children.map(child => (
                        <option key={child.id} value={child.id}>{child.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* Auto Rewards Display */}
                <div className="p-3 bg-slate-100/80 border border-slate-200/60 rounded-xl text-xs font-semibold text-slate-600">
                  <span className="block text-[10px] text-slate-700 font-bold uppercase mb-1">{t('rewardsPreview')}</span>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span>{t('expLabel')}: <span className="text-violet-600 font-bold">+{difficultyRewardsMap[taskDifficulty]?.exp} EXP</span></span>
                    <span>{t('goldLabel')}: <span className="text-amber-700 font-bold">🪙 {difficultyRewardsMap[taskDifficulty]?.gold}</span></span>
                    <span>{t('ticketsLabel')}: <span className="text-cyan-600 font-bold">🎫 {difficultyRewardsMap[taskDifficulty]?.ticket} {language === 'zh' ? '張' : ''}</span></span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('taskDescLabel')}</label>
                  <textarea 
                    value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                    placeholder={t('taskDescPlaceholder')}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                    rows="3"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="submit" className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867]">{t('publishTask')}</button>
                  <button type="button" onClick={() => setWorkshopSubTab('manage')} className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white">{t('cancel')}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* --- Consolidated Settings Sub-tabs --- */}
      {activeTab === 'settings' && (
        <div className="flex gap-2 p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl overflow-x-auto mb-6 shadow-inner">
          <button
            type="button"
            onClick={() => setSettingsSubTab('parent')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl active:scale-95 duration-100 ${
              settingsSubTab === 'parent' 
                ? 'bg-[#3661FF] text-white shadow-[0_0_12px_rgba(54,97,255,0.4)]' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className={`h-4 w-4 transition-colors ${settingsSubTab === 'parent' ? 'text-white' : 'text-[#3661FF]'}`} />
            {t('tabParent')}
          </button>
          <button
            type="button"
            onClick={() => setSettingsSubTab('child')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl active:scale-95 duration-100 ${
              settingsSubTab === 'child' 
                ? 'bg-[#00E676] text-[#111216] shadow-[0_0_12px_rgba(0,230,118,0.4)]' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className={`h-4 w-4 transition-colors ${settingsSubTab === 'child' ? 'text-[#111216]' : 'text-[#00E676]'}`} />
            {t('tabChild')}
          </button>
          <button
            type="button"
            onClick={() => setSettingsSubTab('common')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl active:scale-95 duration-100 ${
              settingsSubTab === 'common' 
                ? 'bg-[#FF9F1C] text-[#111216] shadow-[0_0_12px_rgba(255,159,28,0.4)]' 
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className={`h-4 w-4 transition-colors ${settingsSubTab === 'common' ? 'text-[#111216]' : 'text-[#FF9F1C]'}`} />
            {t('tabCommon')}
          </button>
        </div>
      )}

      {/* --- Tab 5: Wishlist Config (New Standalone Tab) --- */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-success">
          {/* Wishlist Config Form */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200">{t('wishlistBuilderTitle')}</h3>
            <p className="text-xs text-slate-400">
              {t('wishlistBuilderDesc')}
            </p>
            <form onSubmit={handleAddWishlistSubmit} className="space-y-4 bg-white/5 border border-white/5 p-4 rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('wishlistNameLabel')}</label>
                  <input 
                    type="text" required value={wishlistTitle} onChange={(e) => setWishlistTitle(e.target.value)}
                    placeholder={t('wishlistNamePlaceholder')}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('wishlistPointsLabel')}</label>
                  <input 
                    type="number" min="100" required value={wishlistPoints} onChange={(e) => setWishlistPoints(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-1 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867]">
                <Plus className="h-3.5 w-3.5" /> {t('addWishlistBtn')}
              </button>
            </form>
          </div>

          {/* Current Wishlist Items List for Parent */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200">{t('currentWishlistTitle')} ({wishlist.length})</h3>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {wishlist.length === 0 ? (
                <p className="text-xs text-slate-300 text-center py-8">{t('noWishlistItems')}</p>
              ) : (
                wishlist.map((wish) => {
                  const isEditing = editingWishlistId === wish.id;
                  const percent = Math.min(100, Math.round((familyScore / wish.pointsNeeded) * 100));

                  if (isEditing) {
                    return (
                      <form 
                        key={wish.id} 
                        onSubmit={(e) => submitEditWishlist(e, wish.id)}
                        className="p-3 bg-white/5 border border-[#3661FF]/45 rounded-xl space-y-3 animate-success"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">{t('wishlistNameLabel')}</label>
                            <input 
                              type="text" required value={editWishlistTitle} onChange={(e) => setEditWishlistTitle(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">{t('wishlistPointsLabel')}</label>
                            <input 
                              type="number" min="100" required value={editWishlistPoints} onChange={(e) => setEditWishlistPoints(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="submit" className="px-2.5 py-1 rounded text-[10px] font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-colors">{t('saveChanges')}</button>
                          <button type="button" onClick={() => setEditingWishlistId(null)} className="px-2.5 py-1 rounded text-[10px] font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors">{t('cancel')}</button>
                        </div>
                      </form>
                    );
                  }

                  return (
                    <div key={wish.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <h4 className="text-xs font-black text-slate-200 truncate">{wish.title}</h4>
                          <div className="mt-0.5">
                            <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                              {language === 'zh' ? '需要' : 'Requires'} {wish.pointsNeeded} Pts {wish.isUltimate && <span className="text-amber-400 font-bold">{t('ultimatePrize')}</span>}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                          wish.isRedeemed 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                            : percent >= 100 
                              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {wish.isRedeemed ? t('wishlistRedeemed') : percent >= 100 ? t('wishlistCanRedeem') : `${t('wishlistProgress')} ${percent}%`}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            wish.isRedeemed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingWishlistId(wish.id);
                            setEditWishlistTitle(wish.title);
                            setEditWishlistPoints(wish.pointsNeeded);
                          }}
                          className="px-3 py-1 rounded-[4px] text-xs font-black bg-[#3661FF]/10 hover:bg-[#3661FF]/25 text-[#3661FF] border border-[#3661FF]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {language === 'zh' ? '編輯' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ show: true, type: 'wishlist', id: wish.id, title: wish.title })}
                          className="px-3 py-1 rounded-[4px] text-xs font-black bg-rose-600/10 hover:bg-rose-600/25 text-rose-400 border border-rose-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {language === 'zh' ? '刪除' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3: Parent Settings panel --- */}
      {activeTab === 'settings' && settingsSubTab === 'parent' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-success">
          {/* Left Column: Parent list and Growth Goals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Parent Profiles Management */}
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Users className="h-5 w-5 text-violet-400" />
                  {t('parentManagementTitle')} ({usersDB.filter(u => u.role === 'parent').length} / 8)
                </h3>
                <p className="text-xs text-slate-400 mt-1">{t('parentManagementDesc')}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {usersDB.filter(u => u.role === 'parent').map(parent => {
                  const isEditingParent = editingParentEmail === parent.email;
                  const parentCount = usersDB.filter(u => u.role === 'parent').length;
                  return (
                    <div 
                      key={parent.email} 
                      className={`p-4 bg-white/5 border rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                        isEditingParent ? 'border-[#3661FF]/60 bg-[#3661FF]/5 ring-1 ring-[#3661FF]/30' : 'border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar avatar={parent.avatar} role="parent" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-200 truncate">{parent.name}</h4>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {language === 'zh' ? '帳號: ' : 'Account: '}{parent.email}
                          </p>
                          <p className="text-[10px] text-cyan-400 font-bold mt-0.5">
                            {t('parentRoleLabel')}
                          </p>
                        </div>
                      </div>

                      {!isEditingParent ? (
                        <div className="flex gap-2 border-t border-white/5 pt-3">
                          {parent.email.toLowerCase() === currentUser.email.toLowerCase() ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingParentEmail(parent.email);
                                  setEditParentName(parent.name);
                                  setEditParentAvatar(parent.avatar || 'girl');
                                  setEditParentEmail(parent.email);
                                  setEditParentPassword(parent.password || '');
                                }}
                                className="flex-1 py-1.5 rounded bg-[#3661FF] hover:bg-[#4e75ff] text-white text-[11px] font-bold text-center transition-colors"
                              >
                                {t('editSettings')}
                              </button>
                              <button
                                type="button"
                                disabled={parentCount <= 1}
                                onClick={() => setDeleteConfirm({ show: true, type: 'parent', id: parent.email, title: parent.name })}
                                className={`flex-1 py-1.5 rounded text-[11px] font-bold text-center transition-all ${
                                  parentCount <= 1
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                                }`}
                              >
                                {t('deleteRole')}
                              </button>
                            </>
                          ) : (
                            <div className="flex-1 text-center py-2 text-[10px] text-slate-500 font-bold bg-white/5 rounded border border-white/5 flex items-center justify-center gap-1.5">
                              <span>🔒</span>
                              <span>{language === 'zh' ? '無權修改其他家長帳號' : 'No permission to modify other parent accounts'}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <form onSubmit={submitEditParent} className="border-t border-white/10 pt-4 space-y-4 animate-success">
                          <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                            {t('editParentSettingsTitle', { name: parent.name })}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('parentNameLabel')}</label>
                              <input 
                                type="text" required value={editParentName} onChange={(e) => setEditParentName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">{t('avatarSelectLabel')}</label>
                              <div className="flex gap-4">
                                <button
                                  type="button"
                                  onClick={() => setEditParentAvatar('boy')}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all overflow-hidden ${
                                    editParentAvatar === 'boy' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                                  }`}
                                >
                                  <Avatar avatar="father" className="w-full h-full flex items-center justify-center" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditParentAvatar('girl')}
                                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all overflow-hidden ${
                                    editParentAvatar === 'girl' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                                  }`}
                                >
                                  <Avatar avatar="mother" className="w-full h-full flex items-center justify-center" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('emailLabel')}</label>
                              <input 
                                type="email" required value={editParentEmail} onChange={(e) => setEditParentEmail(e.target.value)}
                                placeholder="email@questgrow.com"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('passwordLabelChild')}</label>
                              <input 
                                type="text" required value={editParentPassword} onChange={(e) => setEditParentPassword(e.target.value)}
                                placeholder="新密碼"
                                className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
                            <button type="submit" className="px-4 py-1.5 rounded text-xs font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-colors">{t('saveChanges')}</button>
                            <button type="button" onClick={() => setEditingParentEmail(null)} className="px-4 py-1.5 rounded text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors">{t('cancel')}</button>
                          </div>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>


          </div>

          {/* Right Column: Add Parent, Security, and Compliance */}
          <div className="space-y-6">
            {/* Add Parent panel */}
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  {t('addNewParentTitle')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('addNewParentDesc')}
                </p>
              </div>

              {usersDB.filter(u => u.role === 'parent').length < 8 ? (
                <form onSubmit={submitAddParent} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4 animate-success">
                  <h4 className="text-xs font-black text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Plus className="h-4 w-4" /> {t('fillParentData')}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-slate-300 font-bold uppercase mb-1">{t('parentNameLabel')}</label>
                      <input 
                        type="text" required value={newParentName} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewParentName(val);
                          const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                          if (clean) {
                            setNewParentEmail(`${clean}@questgrow.com`);
                          } else {
                            setNewParentEmail('');
                          }
                        }}
                        placeholder="e.g. Richard"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-bold uppercase mb-1">{t('emailLabel')}</label>
                      <input 
                        type="email" required value={newParentEmail} onChange={(e) => setNewParentEmail(e.target.value)}
                        placeholder="e.g. richard@questgrow.com"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-bold uppercase mb-1">{t('passwordLabel')}</label>
                      <input 
                        type="text" required value={newParentPassword} onChange={(e) => setNewParentPassword(e.target.value)}
                        placeholder="密碼"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-300 font-bold uppercase mb-2">{t('avatarSelectLabel')}</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setNewParentAvatar('boy')}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all overflow-hidden ${
                            newParentAvatar === 'boy' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                          }`}
                        >
                          <Avatar avatar="father" className="w-full h-full flex items-center justify-center" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewParentAvatar('girl')}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all overflow-hidden ${
                            newParentAvatar === 'girl' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                          }`}
                        >
                          <Avatar avatar="mother" className="w-full h-full flex items-center justify-center" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 rounded text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all">
                    {t('confirmAddParent')}
                  </button>
                </form>
              ) : (
                <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center space-y-2">
                  <ShieldAlert className="h-8 w-8 text-rose-400 mx-auto animate-pulse" />
                  <h4 className="text-xs font-black text-rose-350">{t('maxParentLimit')}</h4>
                  <p className="text-[10px] text-slate-500">
                    {t('maxParentLimitDesc')}
                  </p>
                </div>
              )}
            </div>

            {/* Account Security & Google Linking */}
            <div className="glass-panel p-6 border border-indigo-500/20 bg-white/5 space-y-4">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                {t('securityTitle')}
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <p>{t('currentUserLabel')}<span className="text-slate-200 font-bold">{currentUser?.email}</span></p>
                <p>{t('accountTypeLabel')}<span className="text-slate-200 font-bold">{currentUser?.googleId ? t('googleLinkedType') : t('passwordAccountType')}</span></p>
              </div>
              {currentUser?.googleId ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl">
                  {t('googleLinkedSuccessText')}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500">{t('googleLinkPrompt')}</p>
                  <button
                    onClick={() => {
                      const email = prompt("請輸入欲連結的 Google 帳戶 Email:", "parent@gmail.com");
                      if (email) {
                        const mockToken = "google-mock-" + email.replace(/[^a-zA-Z0-9]/g, "");
                        onLinkGoogleAccount(mockToken);
                      }
                    }}
                    type="button"
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-400 text-xs font-black rounded-[4px] border border-indigo-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {t('googleLinkLabel')}
                  </button>
                </div>
              )}
            </div>

            {/* LINE Integration & Review Notification Linking */}
            <div className="glass-panel p-6 border border-emerald-500/20 bg-white/5 space-y-4">
              <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                <svg className="h-5 w-5 fill-current text-emerald-400" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.036 9.564.39.084.922.258 1.058.592.12.296.08.759.04 1.058l-.173 1.04c-.052.314-.251 1.229 1.084.67 1.333-.559 7.185-4.229 9.805-7.236 1.91-2.036 3.15-4.321 3.15-6.988z"/>
                </svg>
                {language === 'zh' ? 'LINE 審核通知設定' : 'LINE Review Notification Settings'}
              </h3>
              <div className="text-xs text-slate-400 space-y-1">
                <p>
                  {language === 'zh' ? 'LINE 綁定狀態：' : 'LINE Link Status: '}
                  <span className={`font-bold ${currentUser?.line_id ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentUser?.line_id 
                      ? (language === 'zh' ? '已連結 ✅' : 'Linked ✅') 
                      : (language === 'zh' ? '未連結 ❌' : 'Not Linked ❌')}
                  </span>
                </p>
                <p className="text-[11px] text-slate-500">
                  {language === 'zh' 
                    ? '連結您的 LINE 帳號後，每當小孩提交任務或申請兌換獎勵時，您將在 LINE 上即時收到「一鍵審核」的對話通知。' 
                    : 'After linking your LINE account, you will receive instant push notifications on LINE with single-tap buttons to approve/reject tasks or rewards.'}
                </p>
              </div>

              {currentUser?.line_id ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl flex items-center justify-between">
                    <span>{language === 'zh' ? '已成功啟用 LINE 一鍵審核通知' : 'LINE One-tap notifications active'}</span>
                    <span className="text-[10px] text-emerald-500/70 font-mono">ID: {currentUser.line_id.substring(0, 10)}...</span>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(language === 'zh' ? '確定要解除 LINE 帳號的連結嗎？您將無法再收到 LINE 審核通知。' : 'Are you sure you want to unlink your LINE account? You will stop receiving notifications.')) {
                        await onUnlinkLineAccount();
                      }
                    }}
                    type="button"
                    className="w-full py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 text-xs font-black rounded-[4px] border border-rose-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {language === 'zh' ? '解除 LINE 帳號連結' : 'Unlink LINE Account'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={triggerLineLink}
                    type="button"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-black rounded-[4px] border border-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    {language === 'zh' ? '🔗 連結您的 LINE 帳號' : '🔗 Link Your LINE Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3.5: Child Role Settings panel --- */}
      {activeTab === 'settings' && settingsSubTab === 'child' && (
        <div className="max-w-4xl mx-auto animate-success">
          {/* Children list */}
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users className="h-5 w-5 text-violet-400" />
                {t('childManagementTitle')} ({children.length} / 8)
              </h3>
              <p className="text-xs text-slate-400 mt-1">{t('childManagementDesc')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {children.map(child => {
                const isEditing = editingChildId === child.id;
                const childUser = usersDB?.find(u => (u.child_id || u.childId) === child.id);
                const isGoogleLinked = !!(childUser && (childUser.google_id || childUser.googleId));
                return (
                  <div 
                    key={child.id} 
                    className={`p-4 bg-white/5 border rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                      isEditing ? 'border-[#3661FF]/60 bg-[#3661FF]/5 ring-1 ring-[#3661FF]/30' : 'border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar 
                        avatar={child.avatar} 
                        role="kid" 
                        badge={inventory.find(i => i.childId === child.id && i.type === '收藏卡' && i.status === '已使用')?.id}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-200 truncate">{child.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Level {child.level} • {child.age}{language === 'zh' ? '歲' : ' Y/O'} • {language === 'zh' ? '生日' : 'Birthday'} {child.birthday || '--'}
                        </p>
                        <p className="text-[10px] text-amber-400 font-bold mt-0.5">
                          🪙 {child.gold} {t('goldLabel')} | 🎫 {child.tickets} {t('ticketsLabel')}
                        </p>
                      </div>
                    </div>


                    {!isEditing ? (
                      <div className="flex gap-2 border-t border-white/5 pt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingChildId(child.id);
                            setEditChildName(child.name);
                            setEditChildAge(child.age);
                            setEditChildBirthday(child.birthday || '');
                            setEditChildAvatar(child.avatar || 'boy');
                            const childUser = usersDB?.find(u => (u.childId || u.child_id) === child.id);
                            setEditChildEmail(childUser ? childUser.email : '');
                            setEditChildPassword('');
                          }}
                          className="flex-1 py-1.5 rounded bg-[#3661FF] hover:bg-[#4e75ff] text-white text-[11px] font-bold text-center transition-colors"
                        >
                          {t('editSettings')}
                        </button>
                        <button
                          type="button"
                          disabled={children.length <= 1}
                          onClick={() => setDeleteConfirm({ show: true, type: 'child', id: child.id, title: child.name })}
                          className={`flex-1 py-1.5 rounded text-[11px] font-bold text-center transition-all ${
                            children.length <= 1
                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {t('deleteRole')}
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={submitEditChild} className="border-t border-white/10 pt-4 space-y-4 animate-success">
                        <h4 className="text-xs font-black text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                          {t('editChildSettingsTitle', { name: child.name })}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('childNameLabel')}</label>
                            <input 
                              type="text" required value={editChildName} onChange={(e) => setEditChildName(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('childAgeLabel')}</label>
                            <input 
                              type="number" required min="1" max="18" value={editChildAge} onChange={(e) => setEditChildAge(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('childBirthdayLabel')}</label>
                            <input 
                              type="text" required value={editChildBirthday} onChange={(e) => setEditChildBirthday(e.target.value)}
                              placeholder="e.g. 10/24"
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{language === 'zh' ? '兒童性別' : 'Child Gender'}</label>
                            <select
                              value={editChildAvatar}
                              onChange={(e) => setEditChildAvatar(e.target.value)}
                              className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                            >
                              <option value="boy">{language === 'zh' ? '男孩子 👦' : 'Boy 👦'}</option>
                              <option value="girl">{language === 'zh' ? '女孩子 👧' : 'Girl 👧'}</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('emailLabelChild')}</label>
                            <input 
                              type="email" 
                              required 
                              disabled={isGoogleLinked}
                              value={editChildEmail} 
                              onChange={(e) => setEditChildEmail(e.target.value)}
                              placeholder="email@questgrow.com"
                              className={`w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                                isGoogleLinked ? 'text-slate-500 cursor-not-allowed opacity-60' : 'text-slate-200'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('passwordLabelChild')}</label>
                            <input 
                              type="text" 
                              disabled={isGoogleLinked}
                              value={editChildPassword} 
                              onChange={(e) => setEditChildPassword(e.target.value)}
                              placeholder={isGoogleLinked ? (language === 'zh' ? '已聯動 Google (唯讀)' : 'Linked to Google (Read-only)') : (language === 'zh' ? '輸入新密碼以重設' : 'Enter new password to reset')}
                              className={`w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none ${
                                isGoogleLinked ? 'text-slate-500 cursor-not-allowed opacity-60' : 'text-slate-200'
                              }`}
                            />
                          </div>
                        </div>
                        {isGoogleLinked && (
                          <div className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg flex items-center gap-1.5 animate-success">
                            <span>⚠️</span>
                            <span>
                              {language === 'zh' 
                                ? '此帳號已與 Google 帳戶聯動，其登入信箱與密碼認證資訊處於唯讀模式。' 
                                : 'This account is linked to Google; its login email and password are in read-only mode.'}
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2 justify-end border-t border-white/5 pt-3">
                          <button type="submit" className="px-4 py-1.5 rounded text-xs font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-colors">{t('saveChanges')}</button>
                          <button type="button" onClick={() => setEditingChildId(null)} className="px-4 py-1.5 rounded text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors">{t('cancel')}</button>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* --- Tab 3.5.5: Common Settings panel --- */}
      {activeTab === 'settings' && settingsSubTab === 'common' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 space-y-6 animate-success">
          <div>
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#FF9F1C]" />
              {t('commonSettingsTitle')}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{t('commonSettingsDesc')}</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-200">{t('zhuyinToggleLabel')}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t('zhuyinToggleDesc')}</p>
              </div>
              <div className="flex items-center pt-1">
                <label className="custom-toggle-label">
                  <input
                    type="checkbox"
                    checked={familySettings && familySettings.zhuyinUnder8 !== false}
                    onChange={(e) => {
                      if (onUpdateFamilySettings) {
                        onUpdateFamilySettings({
                          ...familySettings,
                          zhuyinUnder8: e.target.checked
                        });
                      }
                    }}
                    className="custom-toggle-input"
                  />
                  <div className="custom-toggle-slider"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4 animate-success">
            <h4 className="text-sm font-bold text-slate-200">{t('familyNicknameLabel') || "家庭暱稱"}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === 'zh' ? '設定您的家庭在排行榜中顯示的專屬暱稱（最多 20 字）。' : 'Set your family nickname to be displayed on the leaderboard (max 20 characters).'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  maxLength={20}
                  value={settingsNickname}
                  onChange={(e) => {
                    setSettingsNickname(e.target.value);
                    if (e.target.value.length <= 20) {
                      setNicknameWarning('');
                    }
                  }}
                  placeholder={t('familyNicknamePlaceholder') || "例如：格林冒險隊"}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 pr-12 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FF9F1C] transition-all"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums pointer-events-none ${
                  (settingsNickname || '').length >= 18 ? 'text-rose-500' : 'text-slate-500'
                }`}>
                  {(settingsNickname || '').length}/20
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveSettingsNickname}
                className="px-4 py-2 bg-[#FF9F1C] hover:bg-[#ff8f00] text-slate-950 font-black text-xs rounded-lg transition-colors shadow-md shrink-0 w-full sm:w-auto font-bold"
              >
                {t('saveChanges')}
              </button>
            </div>
            {nicknameWarning && (
              <p className="text-xs font-bold text-rose-500">{nicknameWarning}</p>
            )}
          </div>

          {/* 意見回饋與支援 */}
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Mail className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-200">意見回饋與技術支援</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  如果您在使用 QuestGrow 系統中遇到任何問題，或者有功能上的建議與想法，歡迎隨時透過線上意見回饋表單與我們聯繫。
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={onOpenFeedback}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-lg transition-colors shadow-md flex items-center gap-1.5 focus:outline-none"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    填寫意見回饋表單
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* V2 COPPA & GDPR-K Compliance Settings */}
          <div className="glass-panel p-6 border border-rose-500/20 bg-rose-500/5 space-y-4">
            <h3 className="text-md font-bold text-rose-300 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              {t('coppaTitle')}
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              {t('coppaDesc')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClearData}
                type="button"
                className="w-full py-2 bg-[#FF4747] hover:bg-[#ff3030] text-white text-xs font-black rounded-[4px] transition-colors border border-rose-500/30 flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/20"
              >
                <Trash2 className="h-4 w-4" />
                {t('destroyDataBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3.6: Gacha Pool Settings panel --- */}
      {activeTab === 'gacha' && gachaPoolEdit && (
        <div className="space-y-6 animate-success">
          {/* Header Panel */}
          <div className="glass-panel p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-400" />
                {t('gachaPoolConfigTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('gachaPoolConfigDesc')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleResetGachaPool}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 hover:border-rose-500/50 text-rose-300 text-xs font-black rounded-[4px] transition-all flex items-center gap-1.5 shadow-md shadow-rose-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('gachaPoolResetBtn')}
              </button>
              <button
                onClick={handleSaveGachaPool}
                className="px-4 py-2 bg-[#00E676] hover:bg-[#00c867] text-[#111216] text-xs font-black rounded-[4px] transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
              >
                <Check className="h-3.5 w-3.5" />
                {t('gachaPoolSaveBtn')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Gacha rarity tabs & card list */}
            <div className="lg:col-span-2 glass-panel p-6 space-y-6">
              {/* Rarity Tabs */}
              <div className="flex border-b border-white/5 gap-2 pb-px overflow-x-auto">
                {Object.keys(gachaPoolEdit).map(rarity => {
                  const data = gachaPoolEdit[rarity];
                  const isActive = activeGachaRarity === rarity;
                  const labelMap = {
                    Common: language === 'zh' ? '普通 (60%)' : 'Common (60%)',
                    Rare: language === 'zh' ? '稀有 (25%)' : 'Rare (25%)',
                    Epic: language === 'zh' ? '史詩 (10%)' : 'Epic (10%)',
                    Legendary: language === 'zh' ? '傳說 (4%)' : 'Legendary (4%)',
                    Mythic: language === 'zh' ? '神話 (1%)' : 'Mythic (1%)'
                  };
                  return (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => setActiveGachaRarity(rarity)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap active:scale-95 duration-100 ${
                        isActive 
                          ? 'border-violet-400 text-violet-400 bg-violet-500/10' 
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      {labelMap[rarity]}
                    </button>
                  );
                })}
              </div>

              {/* Cards List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-violet-300 uppercase tracking-widest">
                  {t('gachaCurrentCardsTitle')} ({gachaPoolEdit[activeGachaRarity].cards.length})
                </h4>
                
                {gachaPoolEdit[activeGachaRarity].cards.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-300 border border-dashed border-white/10 rounded-xl">
                    {t('gachaNoCardsText')}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gachaPoolEdit[activeGachaRarity].cards.map(card => {
                      const getRarityTextAndStyle = (rarity) => {
                        const styleMap = {
                          Common: 'text-slate-400 bg-slate-500/10 border-slate-500/25',
                          Rare: 'text-blue-400 bg-blue-500/10 border-blue-500/25',
                          Epic: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
                          Legendary: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
                          Mythic: 'text-rose-400 bg-rose-500/10 border-rose-500/25'
                        };
                        return styleMap[rarity] || styleMap.Common;
                      };

                      return (
                        <div 
                          key={card.id}
                          className="bg-white/5 border border-white/5 hover:border-white/10 rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all relative group"
                        >
                          <button
                            onClick={() => handleDeleteGachaCard(activeGachaRarity, card.id)}
                            className="absolute top-3 right-3 p-1.5 text-slate-500 hover:text-[#FF4747] bg-white/0 hover:bg-white/5 rounded-lg transition-all"
                            title={t('deleteCardBtn') || '刪除卡片'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded uppercase ${getRarityTextAndStyle(card.rarity)}`}>
                                {card.rarity}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-slate-300">
                                {card.type}
                              </span>
                            </div>
                            <h5 className="text-sm font-black text-slate-200 mt-1">{card.name}</h5>
                            <p className="text-xs text-slate-400 leading-relaxed mt-0.5 pr-6">{card.desc}</p>
                          </div>

                          <div className="text-[10px] font-semibold text-slate-400 border-t border-white/5 pt-2.5 flex items-center justify-between">
                            {card.type === '資源卡' && card.value && (
                              <span className="flex flex-wrap gap-2 text-violet-400 font-bold">
                                {card.value.gold !== undefined && <span>🪙 {card.value.gold}</span>}
                                {card.value.exp !== undefined && <span>+{card.value.exp} EXP</span>}
                                {card.value.tickets !== undefined && <span>🎫 {card.value.tickets}</span>}
                                {card.value.growthScore !== undefined && <span>📈 {card.value.growthScore} Pts</span>}
                              </span>
                            )}
                            {(card.type === '特權卡' || card.type === '體驗卡') && (
                              <span>{t('cardValidityLabel')}：<span className="text-slate-300 font-bold">{card.duration}</span></span>
                            )}
                            {card.type === '收藏卡' && (
                              <span>{t('cardStyleLabel')}：<span className="text-amber-400 font-bold font-mono">{card.style}</span></span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Add Card form */}
            <div className="glass-panel p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  {t('addGachaCardTitle')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t('addGachaCardDesc') && t('addGachaCardDesc').replace('{rarity}', activeGachaRarity)}
                </p>
              </div>

              <form onSubmit={handleAddGachaCardSubmit} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4 animate-success">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('gachaCardNameLabel')}</label>
                    <input 
                      type="text" required value={newGachaName} onChange={(e) => setNewGachaName(e.target.value)}
                      placeholder={t('gachaCardNamePlaceholder')}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('gachaCardTypeLabel')}</label>
                    <select 
                      value={newGachaType} onChange={(e) => setNewGachaType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="資源卡">{t('cardTypeResource')}</option>
                      <option value="特權卡">{t('cardTypePrivilege')}</option>
                      <option value="體驗卡">{t('cardTypeExperience')}</option>
                      <option value="收藏卡">{t('cardTypeCollection')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('gachaCardDescLabel')}</label>
                    <textarea 
                      required value={newGachaDesc} onChange={(e) => setNewGachaDesc(e.target.value)}
                      placeholder={t('gachaCardDescPlaceholder')}
                      rows={3}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>

                  {/* Contextual parameters */}
                  {newGachaType === '資源卡' && (
                    <div className="space-y-2.5 p-3 bg-white/5 border border-white/5 rounded-lg">
                      <h5 className="text-[9px] font-black text-violet-300 uppercase tracking-wider mb-2">{t('resourceValuesTitle')}</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">{t('goldLabel')}</label>
                          <input 
                            type="number" min="0" max="200" value={newGachaGold} onChange={(e) => setNewGachaGold(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">EXP</label>
                          <input 
                            type="number" min="0" max="500" value={newGachaExp} onChange={(e) => setNewGachaExp(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">{t('ticketsLabel')}</label>
                          <input 
                            type="number" min="0" max="10" value={newGachaTickets} onChange={(e) => setNewGachaTickets(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-slate-500 font-bold uppercase mb-0.5">{t('familyScoreLabel') || '家庭成長積分'}</label>
                          <input 
                            type="number" min="0" max="200" value={newGachaGrowthScore} onChange={(e) => setNewGachaGrowthScore(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {(newGachaType === '特權卡' || newGachaType === '體驗卡') && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('cardValidityLabel')}</label>
                      <input 
                        type="text" value={newGachaDuration} onChange={(e) => setNewGachaDuration(e.target.value)}
                        placeholder="e.g. 7天內有效 / 30天內有效"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                  )}

                  {newGachaType === '收藏卡' && (
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">{t('cardStyleLabel')}</label>
                      <select 
                        value={newGachaStyle} onChange={(e) => setNewGachaStyle(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      >
                        <option value="neon-orange">橘光霓虹 (Neon Orange)</option>
                        <option value="neon-gold">金光霓虹 (Neon Gold)</option>
                        <option value="rainbow">七彩幻境 (Rainbow)</option>
                        <option value="cyan-pulse">脈衝青光 (Cyan Pulse)</option>
                      </select>
                    </div>
                  )}
                </div>
                <button type="submit" className="w-full py-2 rounded text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all flex items-center justify-center gap-1.5">
                  <Plus className="h-4 w-4" />
                  {t('addCardBtn') || '新增卡片至此分組'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 4: Analytics and Telemetry event log table --- */}
      {activeTab === 'reports' && (() => {
        const getCompletionRate = (childId) => {
          const targetTasks = childId === 'summary' 
            ? tasks 
            : tasks.filter(t => t.assignedTo === childId);
          if (targetTasks.length === 0) return 100;
          const completed = targetTasks.filter(t => t.status === '已完成').length;
          return Math.round((completed / targetTasks.length) * 100);
        };

        const getReportBalanceIndex = (childId) => {
          const targetTasks = childId === 'summary'
            ? tasks.filter(t => t.status === '已完成')
            : tasks.filter(t => t.status === '已完成' && t.assignedTo === childId);
          
          const DIFFICULTY_WEIGHTS = {
            "簡單": 1,
            "中等": 2,
            "較難": 3,
            "終極": 4
          };

          const dimensions = ['德', '智', '體', '群', '美'];
          const TARGET_POINTS = 4; // Target score per dimension

          let totalCappedScore = 0;
          dimensions.forEach(dim => {
            const dimTasks = targetTasks.filter(t => t.type === dim);
            const score = dimTasks.reduce((sum, t) => sum + (DIFFICULTY_WEIGHTS[t.difficulty] || 1), 0);
            const capped = Math.min(TARGET_POINTS, score);
            totalCappedScore += (capped / TARGET_POINTS);
          });

          return Math.round((totalCappedScore / 5) * 100);
        };

        const getSelectedReportData = () => {
          if (reportsUserFilter === 'summary') {
            const sumAttributes = {
              Wisdom: 0,
              Responsibility: 0,
              Empathy: 0,
              Creativity: 0,
              Courage: 0
            };
            let totalLevel = 0;
            let totalGold = 0;
            let totalTickets = 0;

            children.forEach(child => {
              sumAttributes.Wisdom += child.attributes?.Wisdom || 0;
              sumAttributes.Responsibility += child.attributes?.Responsibility || 0;
              sumAttributes.Empathy += child.attributes?.Empathy || 0;
              sumAttributes.Creativity += child.attributes?.Creativity || 0;
              sumAttributes.Courage += child.attributes?.Courage || 0;
              totalLevel += child.level || 1;
              totalGold += child.gold || 0;
              totalTickets += child.tickets || 0;
            });

            return {
              name: language === 'zh' ? '全家總表 (加總)' : 'Family Total (Summed)',
              level: totalLevel,
              gold: totalGold,
              tickets: totalTickets,
              attributes: sumAttributes,
              isSummary: true
            };
          } else {
            const child = children.find(c => c.id === reportsUserFilter) || children[0];
            return child ? { ...child, isSummary: false } : {
              name: '',
              level: 1,
              gold: 0,
              tickets: 0,
              attributes: { Wisdom: 10, Responsibility: 10, Empathy: 10, Creativity: 10, Courage: 10 },
              isSummary: false
            };
          }
        };

        const getAiCoachFeedback = () => {
          if (reportsUserFilter === 'summary') {
            return {
              highlight: language === 'zh' ? '🌟 全家合作無間' : '🌟 Excellent Family Collaboration',
              highlightDesc: language === 'zh' 
                ? `恭喜！全家本週累計完成了 ${tasks.filter(t => t.status === '已完成').length} 個任務，全體冒險者的金幣總數達到了 🪙 ${children.reduce((acc, c) => acc + c.gold, 0)}。家庭在「勇氣」與「智慧」屬性上進展最大！`
                : `Congratulations! The family completed ${tasks.filter(t => t.status === '已完成').length} tasks in total this week. All adventurers accumulated 🪙 ${children.reduce((acc, c) => acc + c.gold, 0)} gold. Great progress on Courage and Wisdom!`,
              improve: language === 'zh' ? '🔮 均衡屬性指引' : '🔮 Potentials to Balance',
              improveDesc: language === 'zh'
                ? '目前全家在「同理心」屬性的累計總分相對偏低，這表示社交與互助關懷類的冒險任務完成度仍有提升的空間。'
                : 'Currently, the family\'s combined score in Empathy is relatively low. There is room for improvement in social and mutual care tasks.',
              suggest: language === 'zh' ? '💡 推薦家庭協同任務' : '💡 Recommended Family Quests',
              suggestDesc: language === 'zh'
                ? '建議家長在「任務工坊」中指派「家庭大掃除」或「主動關心家人」等群育任務，邀請所有冒險者一起參與！'
                : 'We recommend assigning Empathy quests like "Family Cleaning Day" or "Caring for Family" to engage all adventurers!'
            };
          } else {
            const child = children.find(c => c.id === reportsUserFilter) || children[0];
            if (!child) {
              return {
                highlight: '🌟',
                highlightDesc: '',
                improve: '🔮',
                improveDesc: '',
                suggest: '💡',
                suggestDesc: ''
              };
            }
            const name = child.name;
            const attrs = child.attributes || { Wisdom: 10, Responsibility: 10, Empathy: 10, Creativity: 10, Courage: 10 };
            
            // Find highest and lowest attributes
            let highestAttr = 'Wisdom';
            let highestVal = -1;
            let lowestAttr = 'Wisdom';
            let lowestVal = 99999;

            Object.entries(attrs).forEach(([key, val]) => {
              if (val > highestVal) {
                highestVal = val;
                highestAttr = key;
              }
              if (val < lowestVal) {
                lowestVal = val;
                lowestAttr = key;
              }
            });

            // If highest and lowest are the same, choose separate defaults
            if (highestAttr === lowestAttr) {
              const keys = Object.keys(attrs);
              highestAttr = keys[0];
              lowestAttr = keys[1];
            }

            const feedbackMap = {
              highlight: {
                Wisdom: {
                  zh: `「智慧」能力值最高。孩子在學習、思考與邏輯思維上展現極佳的潛力，完成了許多智慧學習類的冒險任務。`,
                  en: `highest in "Wisdom". The child shows excellent potential in learning, critical thinking, and logical analysis, completing many wisdom-related quests.`
                },
                Responsibility: {
                  zh: `「責任感」表現優異。孩子在日常自律、家事分擔與自我執行力上非常有擔當，是一位可靠的家庭守護者。`,
                  en: `highest in "Responsibility". The child is extremely reliable in daily routines, sharing household chores, and self-discipline, acting as a trustworthy guardian.`
                },
                Courage: {
                  zh: `「勇氣」表現卓越。孩子在體能訓練、戶外活動與克服挑戰中展現出滿滿的力量，體育潛力正蓬勃發展。`,
                  en: `highest in "Courage". The child displays exceptional strength in physical training, outdoor adventure, and overcoming challenges. Athletic potential is developing strongly.`
                },
                Empathy: {
                  zh: `「同理心」極為出色。孩子非常關心家人與同儕，樂於主動協助他人，具備極高的團隊合作與人際溝通素養。`,
                  en: `highest in "Empathy". The child is deeply caring towards family and peers, willing to help others, and demonstrates outstanding team cooperation and communication skills.`
                },
                Creativity: {
                  zh: `「創造力」最為亮眼。孩子在繪畫、手作藝術或新穎想法上富有想像力，藝術與美育氣息濃厚。`,
                  en: `highest in "Creativity". The child is highly imaginative in drawing, crafting, or generating novel ideas. Artistic potential is shining brightly.`
                }
              },
              improve: {
                Wisdom: {
                  zh: `目前在「智慧」面向上的成長腳步相對較慢，可能因為近期課外閱讀或智識探索類的任務比重較低。`,
                  en: `currently has lower "Wisdom" growth, likely due to a lower proportion of reading or intellectual exploration quests recently.`
                },
                Responsibility: {
                  zh: `目前在「責任感」能力值上仍有進步空間，需多加引導孩子養成規律的生活習慣與分擔日常家務的習慣。`,
                  en: `shows room for growth in "Responsibility". The child needs guidance in establishing regular daily routines and helping with household chores.`
                },
                Courage: {
                  zh: `目前在「勇氣」面向的運動量與挑戰性任務稍嫌不足，適當的體能挑戰與戶外伸展能幫助能力值更均衡。`,
                  en: `has a slightly lower score in "Courage". Incorporating physical challenges or outdoor sports quests would help balance this growth.`
                },
                Empathy: {
                  zh: `目前在「同理心」數值稍微偏低，可以引導孩子多主動問候家人或進行團隊合作，增強社交與情感連結。`,
                  en: `is slightly low in "Empathy". Encouraging active communication with family or collaborative tasks can strengthen emotional and social bonds.`
                },
                Creativity: {
                  zh: `目前在「創造力」的藝術創作與美感練習次數較少，多接觸美工手作、塗鴉或創意發想將能活化想像力。`,
                  en: `shows fewer creative exercises in "Creativity". Engaging in crafts, drawing, or free brainstorming will spark their imagination.`
                }
              },
              suggest: {
                Wisdom: {
                  zh: `建議在任務工坊中指派「閱讀課外書20分鐘」或「挑戰一個數理謎題」等智慧學習任務。`,
                  en: `We suggest assigning Wisdom quests like "Read a book for 20 minutes" or "Solve a logical puzzle page".`
                },
                Responsibility: {
                  zh: `建議在任務工坊中指派「自己整理睡床與書桌」或「協助掃地與丟垃圾」等責任感養成項目。`,
                  en: `We suggest assigning Responsibility quests like "Organize desk and make bed" or "Help sweep or throw trash".`
                },
                Courage: {
                  zh: `建議在任務工坊中指派「進行戶外運動或跑步30分鐘」或「早起跟著影片做伸展操」等勇氣鍛鍊項目。`,
                  en: `We suggest assigning Courage quests like "Complete outdoor sports or run for 30 mins" or "Morning stretching exercises".`
                },
                Empathy: {
                  zh: `建議在任務工坊中指派「幫爸媽搥背按摩5分鐘」或「親手寫一張感謝卡給家人」等同理心訓練項目。`,
                  en: `We suggest assigning Empathy quests like "Give parents a 5-minute massage" or "Write a family thank-you card".`
                },
                Creativity: {
                  zh: `建議在任務工坊中指派「繪製一幅今日冒險塗鴉」或「動手做一件環保手工作品」等美育創意項目。`,
                  en: `We suggest assigning Creativity quests like "Draw a sketch of today's adventure" or "Craft something from recycled materials".`
                }
              }
            };

            const translateAttrName = (attr) => {
              if (attr === 'Wisdom') return '智慧';
              if (attr === 'Responsibility') return '責任感';
              if (attr === 'Courage') return '勇氣';
              if (attr === 'Empathy') return '同理心';
              if (attr === 'Creativity') return '創造力';
              return attr;
            };

            return {
              highlight: language === 'zh' ? `🌟 ${name} 的「${translateAttrName(highestAttr)}」潛能爆發` : `🌟 ${name}'s ${highestAttr} Potential Burst`,
              highlightDesc: feedbackMap.highlight[highestAttr][language] || feedbackMap.highlight[highestAttr]['zh'],
              improve: language === 'zh' ? `🔮 建議加強「${translateAttrName(lowestAttr)}」能力` : `🔮 Suggest Boosting ${lowestAttr}`,
              improveDesc: feedbackMap.improve[lowestAttr][language] || feedbackMap.improve[lowestAttr]['zh'],
              suggest: language === 'zh' ? `💡 適合 ${name} 的推薦任務` : `💡 Recommended Quests for ${name}`,
              suggestDesc: feedbackMap.suggest[lowestAttr][language] || feedbackMap.suggest[lowestAttr]['zh']
            };
          }
        };

        const handleAiAssignQuest = async () => {
          const isSummary = reportsUserFilter === 'summary';
          const targetChild = isSummary ? children[0] : children.find(c => c.id === reportsUserFilter);
          
          if (!targetChild) {
            alert(language === 'zh' ? '請先新增兒童角色！' : 'Please add a child profile first!');
            return;
          }

          const attrs = targetChild.attributes || { Wisdom: 10, Responsibility: 10, Empathy: 10, Creativity: 10, Courage: 10 };
          
          // Find lowest attribute
          let lowestAttr = 'Wisdom';
          let lowestVal = 99999;
          Object.entries(attrs).forEach(([key, val]) => {
            if (val < lowestVal) {
              lowestVal = val;
              lowestAttr = key;
            }
          });

          const questsMap = {
            Wisdom: {
              name: language === 'zh' ? '📚 冒險日誌：閱讀與心得分享' : '📚 Adventure Log: Reading & Share',
              type: '智',
              difficulty: '中等',
              desc: language === 'zh' 
                ? '閱讀一本課外書籍 30 分鐘，並向爸爸或媽媽分享書中最有趣的一個章節或知識點！' 
                : 'Read a book for 30 minutes and share the most interesting chapter with your parents!',
              exp: 100, gold: 50, ticket: 1, attr: 'Wisdom'
            },
            Responsibility: {
              name: language === 'zh' ? '🧹 領地守護：自主整理書桌與房間' : '🧹 Territory Guard: Organize Desk & Room',
              type: '德',
              difficulty: '簡單',
              desc: language === 'zh' 
                ? '主動將自己的書桌整理乾淨，並把玩具或書本放回原位，完成領地環境的守護任務！' 
                : 'Take the initiative to tidy up your desk and return toys/books to their places!',
              exp: 80, gold: 30, ticket: 0, attr: 'Responsibility'
            },
            Empathy: {
              name: language === 'zh' ? '💖 溫暖傳遞：幫爸爸媽媽搥背按摩' : '💖 Warmth Transfer: Massage for Parents',
              type: '群',
              difficulty: '簡單',
              desc: language === 'zh' 
                ? '幫辛苦工作的爸爸或媽媽搥背或按摩肩膀 5 分鐘，說一句溫暖的感謝話語！' 
                : 'Massage your parents shoulders for 5 minutes and say a warm thank-you!',
              exp: 80, gold: 30, ticket: 0, attr: 'Empathy'
            },
            Creativity: {
              name: language === 'zh' ? '🎨 想像之翼：繪製今日冒險塗鴉' : '🎨 Wings of Imagination: Daily Sketch',
              type: '美',
              difficulty: '中等',
              desc: language === 'zh' 
                ? '用彩色畫筆在一張白紙上，畫出今天你最開心的事或是想像中的怪獸，並展示給家人看！' 
                : 'Draw today\'s happiest moment or an imaginary monster, and show it to the family!',
              exp: 100, gold: 50, ticket: 1, attr: 'Creativity'
            },
            Courage: {
              name: language === 'zh' ? '🏃‍♂️ 體能鍛鍊：仰臥起坐與體育拉伸' : '🏃‍♂️ Physical Exercise: Sit-ups & Stretching',
              type: '體',
              difficulty: '中等',
              desc: language === 'zh' 
                ? '完成 15 次仰臥起坐或跟著拉伸影片進行 15 分鐘的體能鍛鍊，鍛鍊強健的體魄！' 
                : 'Complete 15 sit-ups or follow a 15-minute stretching video to train your body!',
              exp: 100, gold: 50, ticket: 1, attr: 'Courage'
            }
          };

          const targetQuest = questsMap[lowestAttr] || questsMap.Wisdom;
          
          const newTask = {
            name: targetQuest.name,
            description: targetQuest.desc,
            type: targetQuest.type,
            difficulty: targetQuest.difficulty,
            expReward: targetQuest.exp,
            goldReward: targetQuest.gold,
            ticketReward: targetQuest.ticket,
            attributeReward: targetQuest.attr,
            period: '每日',
            assignedTo: targetChild.id
          };

          await onAddTask(newTask);
          alert(language === 'zh' 
            ? `🤖 AI 成長教練已成功為 ${targetChild.name} 建立並指派任務：「${targetQuest.name}」！`
            : `🤖 AI Coach has successfully assigned quest "${targetQuest.name}" to ${targetChild.name}!`
          );
        };

        const generateCoachResponse = (q, rData) => {
          const lowercaseQ = q.toLowerCase();
          const name = reportsUserFilter === 'summary' ? (language === 'zh' ? '孩子們' : 'children') : rData.name;
          const attrs = rData.attributes;

          const translateAttr = (attr) => {
            const mapping = { Wisdom: '智慧', Responsibility: '責任感', Empathy: '同理心', Creativity: '創造力', Courage: '勇氣' };
            return mapping[attr] || attr;
          };

          let highestAttr = 'Wisdom';
          let highestVal = -1;
          let lowestAttr = 'Wisdom';
          let lowestVal = 99999;
          Object.entries(attrs).forEach(([key, val]) => {
            if (val > highestVal) {
              highestVal = val;
              highestAttr = key;
            }
            if (val < lowestVal) {
              lowestVal = val;
              lowestAttr = key;
            }
          });

          if (lowercaseQ.includes('弱') || lowercaseQ.includes('最') || lowercaseQ.includes('低') || lowercaseQ.includes('改善') || lowercaseQ.includes('提升') || lowercaseQ.includes('加強')) {
            return `### 🎯 針對弱項屬性「${translateAttr(lowestAttr)}」的改善建議：\n\n` +
              `目前 **${name}** 在「**${translateAttr(lowestAttr)}**」的屬性點數為 **${lowestVal}**，是目前相對落後的方向。我為您設計了以下 AI 導向的具體改善方案：\n\n` +
              `1. **日常協同指派**：在任務工坊中新增更多「${translateAttr(lowestAttr)}」相關的任務。例如，我們已在診斷報告中為您推薦了特別任務。\n` +
              `2. **微步增強原則**：將大任務拆解成容易執行的小冒險。例如：如果「責任感」偏低，可以從「自主整理餐具」或「倒垃圾」等簡單任務開始，讓孩子獲得即時成就感。\n` +
              `3. **關聯性激勵**：孩子完成弱項任務時，除了系統獎勵，家長可在現實中給予加倍的言語誇獎或心願卡集點點數！`;
          }

          if (lowercaseQ.includes('均衡') || lowercaseQ.includes('全人') || lowercaseQ.includes('評估') || lowercaseQ.includes('雷達') || lowercaseQ.includes('指數')) {
            const balance = getReportBalanceIndex(reportsUserFilter);
            const completion = getCompletionRate(reportsUserFilter);
            let evaluation = '';
            if (balance >= 75) {
              evaluation = '能力非常均衡！孩子在五育的長期發展非常健全。請繼續保持！';
            } else {
              evaluation = `目前的均衡指數為 **${balance}%**。雷達圖有些許偏斜，主要是「${translateAttr(lowestAttr)}」與「${translateAttr(highestAttr)}」差距較大。建議暫停增加已飽和的智育任務，多指派美育或群育等弱項。`;
            }

            return `### 📊 全人發展與均衡度評估報告：\n\n` +
              `- **全人均衡指數**：\`${balance}%\`\n` +
              `- **本週任務完成率**：\`${completion}%\`\n` +
              `- **AI 診斷結論**：${evaluation}\n\n` +
              `**💡 下週策略**：\n` +
              `下週指派任務時，請聯絡五育平衡，保持「德、智、體、群、美」各指派 1~2 個任務，這能大提升下週的均衡指標，並解鎖稀有的冒險稱號！`;
          }

          if (lowercaseQ.includes('獎勵') || lowercaseQ.includes('金幣') || lowercaseQ.includes('心願') || lowercaseQ.includes('吸引') || lowercaseQ.includes('激勵')) {
            return `### 🪙 如何設定吸引人的冒險獎勵系統：\n\n` +
              `家長的心願設定是讓孩子保持長久動力的核心。建議遵循以下 **AI 激勵模型**：\n\n` +
              `1. **日常小獎勵（抽卡券/金幣）**：金幣可用於兌換「日常特權」（如玩遊戲 30 分鐘、多吃一份點心）。這些需要設定適中的金幣價格（例如：50 金幣）。\n` +
              `2. **長期大夢想（心願清單）**：在「許願池」中放入孩子極度渴望的禮物（例如：去遊樂園、新的樂高積木），並設定較高的金幣價格（例如：500 金幣）。這能培養孩子儲蓄與長遠規劃的觀念。\n` +
              `3. **稀有獎勵（扭蛋卡片）**：鼓勵孩子存抽卡券抽卡。可以設定集滿特定主題卡片，即可額外解鎖隱藏的大獎，提升收藏樂趣！`;
          }

          if (lowercaseQ.includes('職業') || lowercaseQ.includes('角色') || lowercaseQ.includes('探索者') || lowercaseQ.includes('智者') || lowercaseQ.includes('守護者')) {
            return `### ⚔️ 冒險者職業與屬性關聯深度分析：\n\n` +
              `QuestGrow 目前支援三種核心職業，每種職業對應不同的成長重點：\n\n` +
              `1. **Scholar (智者) 🧙‍♂️**：關聯「智慧」與「創造力」。適合喜歡閱讀、寫作、科學探索的孩子。\n` +
              `2. **Explorer (探索者) ⚔️**：關聯「勇氣」與「體能」。適合喜歡體育、戶外活動、挑戰新事物的孩子。\n` +
              `3. **Guardian (守護者) 🛡️**：關聯「責任感」與「同理心」。適合喜歡協助家務、照顧寵物、關懷家人的孩子。\n\n` +
              `**💡 建議**：\n` +
              `目前 **${name}** 的屬性中，最高的屬性為「**${translateAttr(highestAttr)}**」，表現最適合發揮 **${highestAttr === 'Wisdom' ? '智者' : highestAttr === 'Courage' ? '探索者' : '守護者'}** 職業的特長。您可以引導孩子在角色頁面中轉職，或維持均衡全能發展！`;
          }

          return `### 🧙‍♂️ 冒險日誌評估與動態建議：\n\n` +
            `你好！已為您彙整 **${name}** 目前的冒險狀態：\n` +
            `- **累計等級**：\`Lv. ${rData.level}\` | **金幣**：\`🪙 ${rData.gold}\` | **抽卡券**：\`🎫 ${rData.tickets}\`\n` +
            `- **最強項能力**：\`${translateAttr(highestAttr)} (${highestVal})\`\n` +
            `- **最待加強能力**：\`${translateAttr(lowestAttr)} (${lowestVal})\`\n\n` +
            `這是一份精準的成長軌跡。如果您有以下特定疑問，可以直接點選下方的快捷按鈕，或輸入關鍵字詢問我：\n` +
            `- *點選「**改善最弱屬性**」按鈕查詢*\n` +
            `- *點選「**評估冒險者均衡度**」按鈕查詢*\n` +
            `- *點選「**設定吸引人獎勵**」按鈕查詢*`;
        };

        const handleSendAiQuestion = (text) => {
          if (!text.trim()) return;
          const userMsg = { sender: 'parent', content: text };
          setAiCoachMessages(prev => [...prev, userMsg]);
          setAiCoachInput('');
          setIsAiThinking(true);

          setTimeout(() => {
            const responseText = generateCoachResponse(text, getSelectedReportData());
            setAiCoachMessages(prev => [...prev, { sender: 'coach', content: responseText }]);
            setIsAiThinking(false);
          }, 800);
        };

        const getAdventurerRank = () => {
          const rate = getCompletionRate(reportsUserFilter);
          const balance = getReportBalanceIndex(reportsUserFilter);
          if (rate >= 80 && balance >= 70) return { title: '🏆 傳奇黃金冒險團隊', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5' };
          if (rate >= 50 && balance >= 50) return { title: '🛡️ 資深白銀冒險團隊', color: 'text-slate-300 border-slate-400/20 bg-slate-400/5' };
          if (rate >= 15 || balance >= 30) return { title: '⚔️ 新手青銅冒險團隊', color: 'text-orange-400 border-orange-500/20 bg-orange-500/5' };
          return { title: '🌱 初心見習冒險團隊', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' };
        };

        const reportData = getSelectedReportData();
        const aiFeedback = getAiCoachFeedback();
        const rank = getAdventurerRank();

        return (
          <div className="space-y-6 animate-success">
            {/* User Selection for Report */}
            <div className="flex border-b border-[#35363A] gap-1 pb-px overflow-x-auto">
              <button
                type="button"
                onClick={() => setReportsUserFilter('summary')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
                  reportsUserFilter === 'summary'
                    ? 'border-[#3661FF] text-white bg-[#252529]'
                    : 'border-transparent text-[#b5b7bc] hover:text-white'
                }`}
              >
                <Users className="h-3.5 w-3.5 text-violet-400" />
                {language === 'zh' ? '家庭總表 (加總)' : 'Family Summary (Sum)'}
              </button>
              {children.map(child => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setReportsUserFilter(child.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
                    reportsUserFilter === child.id
                      ? 'border-[#3661FF] text-white bg-[#252529]'
                      : 'border-transparent text-[#b5b7bc] hover:text-white'
                  }`}
                >
                  <Avatar 
                    avatar={child.avatar} 
                    role="kid" 
                    badge={inventory.find(i => i.childId === child.id && i.type === '收藏卡' && i.status === '已使用')?.id}
                    className="w-5 h-5 rounded-full shrink-0" 
                  />
                  {child.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/95 border border-slate-100/90 rounded-2xl shadow-md p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">
                      {t('growthDashboardTitle')} - {reportData.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-semibold">{t('growthDashboardDesc')}</p>
                  </div>
                  {/* AI Rank Badge */}
                  <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black shrink-0 flex items-center gap-1.5 shadow-sm ${
                    rank.title.includes('傳奇') ? 'text-amber-600 border-amber-200 bg-amber-50' :
                    rank.title.includes('資深') ? 'text-slate-600 border-slate-200 bg-slate-50' :
                    rank.title.includes('新手') ? 'text-orange-600 border-orange-200 bg-orange-50' :
                    'text-emerald-600 border-emerald-200 bg-emerald-50'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    {rank.title}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    {/* Weekly Completion Rate circular progress */}
                    {(() => {
                      const percentage = getCompletionRate(reportsUserFilter);
                      const radius = 22;
                      const circumference = 2 * Math.PI * radius; // ~138.2
                      const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
                      return (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all hover:bg-slate-100/50">
                          <div className="relative w-14 h-14 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="28" cy="28" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                              <circle cx="28" cy="28" r={radius} fill="none" stroke="#3661FF" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">{percentage}%</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('weeklyCompletionRate')}</div>
                            <div className="text-xl font-black text-[#3661FF] mt-0.5">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Weekly Balance Index circular progress */}
                    {(() => {
                      const percentage = getReportBalanceIndex(reportsUserFilter);
                      const radius = 22;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;
                      return (
                        <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm transition-all hover:bg-slate-100/50">
                          <div className="relative w-14 h-14 shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="28" cy="28" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="4.5" />
                              <circle cx="28" cy="28" r={radius} fill="none" stroke="#00E676" strokeWidth="4.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-slate-800">{percentage}%</span>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('weeklyBalanceIndex')}</div>
                            <div className="text-xl font-black text-[#00C851] mt-0.5">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* SVG Radar Chart Implementation */}
                  <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col items-center justify-center min-h-[220px]">
                    <div className="text-[10px] text-slate-500 font-black uppercase text-center mb-3 tracking-widest">{t('radarTitle')}</div>
                    {(() => {
                      const attrs = reportData.attributes || { Wisdom: 10, Responsibility: 10, Empathy: 10, Creativity: 10, Courage: 10 };
                      const keys = ['Wisdom', 'Responsibility', 'Empathy', 'Creativity', 'Courage'];
                      const labels = {
                        Wisdom: language === 'zh' ? '智' : 'Wis',
                        Responsibility: language === 'zh' ? '責' : 'Resp',
                        Empathy: language === 'zh' ? '同' : 'Emp',
                        Creativity: language === 'zh' ? '創' : 'Cre',
                        Courage: language === 'zh' ? '勇' : 'Cour'
                      };

                      const maxVal = Math.max(...keys.map(k => attrs[k] || 0), 10);
                      const scaleMax = maxVal < 50 ? 50 : Math.ceil(maxVal / 10) * 10;

                      const width = 180;
                      const height = 180;
                      const cx = width / 2;
                      const cy = height / 2;
                      const r = 55;

                      const getCoordinates = (val, i) => {
                        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                        const distance = (val / scaleMax) * r;
                        return {
                          x: cx + Math.cos(angle) * distance,
                          y: cy + Math.sin(angle) * distance
                        };
                      };

                      const gridLevels = [0.25, 0.5, 0.75, 1.0];
                      const gridPoints = gridLevels.map(level => {
                        return keys.map((_, i) => {
                          const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                          const x = cx + Math.cos(angle) * r * level;
                          const y = cy + Math.sin(angle) * r * level;
                          return `${x},${y}`;
                        }).join(' ');
                      });

                      const dataPoints = keys.map((key, i) => {
                        const coords = getCoordinates(attrs[key] || 0, i);
                        return `${coords.x},${coords.y}`;
                      }).join(' ');

                      const axisLines = keys.map((_, i) => {
                        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                        return {
                          x2: cx + Math.cos(angle) * r,
                          y2: cy + Math.sin(angle) * r
                        };
                      });

                      return (
                        <svg width={width} height={height} className="overflow-visible mx-auto">
                          <defs>
                            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#3661FF" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                            </radialGradient>
                          </defs>
                          
                          {/* Concentration Grid Rings */}
                          {gridPoints.map((points, idx) => (
                            <polygon
                              key={idx}
                              points={points}
                              fill="none"
                              stroke="#CBD5E1"
                              strokeWidth="0.75"
                              strokeDasharray={idx < 3 ? "2,2" : "none"}
                            />
                          ))}

                          {/* Axes */}
                          {axisLines.map((line, idx) => (
                            <line
                              key={idx}
                              x1={cx}
                              y1={cy}
                              x2={line.x2}
                              y2={line.y2}
                              stroke="#CBD5E1"
                              strokeWidth="0.75"
                            />
                          ))}

                          {/* Area Polygon */}
                          <polygon
                            points={dataPoints}
                            fill="url(#radarGlow)"
                            stroke="#3661FF"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />

                          {/* Labels and Vertices */}
                          {keys.map((key, i) => {
                            const val = attrs[key] || 0;
                            const coords = getCoordinates(val, i);
                            const labelAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                            const labelDistance = r + 13;
                            const labelX = cx + Math.cos(labelAngle) * labelDistance;
                            let labelY = cy + Math.sin(labelAngle) * labelDistance;
                            if (i === 0) labelY -= 1;
                            if (i === 2 || i === 3) labelY += 4;
                            
                            let textAnchor = "middle";
                            if (i === 1 || i === 2) textAnchor = "start";
                            if (i === 3 || i === 4) textAnchor = "end";

                            return (
                              <g key={key}>
                                <circle
                                  cx={coords.x}
                                  cy={coords.y}
                                  r="3"
                                  fill="#ffffff"
                                  stroke="#3661FF"
                                  strokeWidth="1.5"
                                />
                                <text
                                  x={labelX}
                                  y={labelY}
                                  textAnchor={textAnchor}
                                  className="fill-slate-700 font-extrabold text-[9px]"
                                >
                                  {labels[key]}({val})
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      );
                    })()}
                  </div>
                </div>

                {/* RPG Accumulated Stats Display */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs mt-3 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner transition-all hover:bg-slate-100/50">
                    <div className="text-slate-500 font-bold uppercase text-[9px] mb-1">{language === 'zh' ? '累計等級' : 'Total Level'}</div>
                    <div className="text-slate-800 font-black text-sm flex items-center justify-center gap-1">
                      <span className="text-indigo-500">⚡</span>
                      <span>Lv. {reportData.level}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner transition-all hover:bg-slate-100/50">
                    <div className="text-slate-500 font-bold uppercase text-[9px] mb-1">{language === 'zh' ? '累計金幣' : 'Total Gold'}</div>
                    <div className="text-slate-800 font-black text-sm flex items-center justify-center gap-1">
                      <span className="text-amber-500">🪙</span>
                      <span>{reportData.gold}</span>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner transition-all hover:bg-slate-100/50">
                    <div className="text-slate-500 font-bold uppercase text-[9px] mb-1">{language === 'zh' ? '累計抽卡券' : 'Total Tickets'}</div>
                    <div className="text-slate-800 font-black text-sm flex items-center justify-center gap-1">
                      <span className="text-cyan-500">🎫</span>
                      <span>{reportData.tickets}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Coach */}
              <div className="bg-white/95 border border-violet-100 rounded-2xl shadow-md p-6 flex flex-col justify-between min-h-[460px] bg-gradient-to-b from-violet-50/10 to-white">
                <div className="space-y-4">
                  {/* Card Header & Tabs */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-violet-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="h-4.5 w-4.5 text-violet-500 animate-float" />
                      {t('aiCoachTitle')}
                    </h3>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAiCoachTab('diagnostic')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${
                          aiCoachTab === 'diagnostic' 
                            ? 'bg-[#3661FF] text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-205'
                        }`}
                      >
                        {language === 'zh' ? '智能診斷' : 'Diagnostic'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiCoachTab('chat')}
                        className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${
                          aiCoachTab === 'chat' 
                            ? 'bg-[#3661FF] text-white shadow-sm' 
                            : 'text-slate-400 hover:text-slate-205'
                        }`}
                      >
                        {language === 'zh' ? '互動諮詢' : 'Coach Chat'}
                      </button>
                    </div>
                  </div>

                  {aiCoachTab === 'diagnostic' ? (
                    <div className="space-y-4 text-xs leading-relaxed text-slate-700">
                      <div className="space-y-1 bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100/80 border-l-4 border-l-emerald-500 shadow-sm transition-all">
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest block flex items-center gap-1">
                          <span>🌟</span>
                          <span>{aiFeedback.highlight}</span>
                        </span>
                        <p className="mt-1 text-slate-700 font-semibold">{aiFeedback.highlightDesc}</p>
                      </div>
                      <div className="space-y-1 bg-cyan-50/60 p-3.5 rounded-xl border border-cyan-100/80 border-l-4 border-l-cyan-500 shadow-sm transition-all">
                        <span className="text-[10px] font-black text-cyan-700 uppercase tracking-widest block flex items-center gap-1">
                          <span>📊</span>
                          <span>{aiFeedback.improve}</span>
                        </span>
                        <p className="mt-1 text-slate-700 font-semibold">{aiFeedback.improveDesc}</p>
                      </div>
                      <div className="space-y-2 bg-violet-50/60 p-3.5 rounded-xl border border-violet-100/80 border-l-4 border-l-violet-500 shadow-sm">
                        <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest block flex items-center gap-1">
                          <span>💡</span>
                          <span>{aiFeedback.suggest}</span>
                        </span>
                        <p className="mt-1 text-slate-700 font-semibold leading-relaxed">{aiFeedback.suggestDesc}</p>
                        
                        {/* Auto Quest Assignment Button */}
                        <button
                          type="button"
                          onClick={handleAiAssignQuest}
                          className="w-full mt-2 py-2 px-3 bg-[#3661FF] hover:bg-[#254edb] active:scale-95 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          <span>🤖</span>
                          {language === 'zh' ? '一鍵 AI 指派推薦任務' : 'One-Click AI Assign Quest'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Chat Tab Content */
                    <div className="flex flex-col h-[350px] justify-between">
                      {/* Message History */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-2 max-h-[250px]">
                        {aiCoachMessages.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`flex ${msg.sender === 'coach' ? 'justify-start' : 'justify-end'}`}
                          >
                            <div 
                              className={`max-w-[88%] p-2.5 rounded-xl text-[11px] leading-relaxed shadow-sm ${
                                msg.sender === 'coach'
                                  ? 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-medium'
                                  : 'bg-[#3661FF] text-white rounded-tr-none font-medium'
                              }`}
                            >
                              {/* Simple Markdown-like Renderer */}
                              {msg.content.split('\n\n').map((para, i) => (
                                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                                  {para.startsWith('###') ? (
                                    <span className="font-extrabold text-violet-700 block mb-1 text-xs">
                                      {para.replace('### ', '')}
                                    </span>
                                  ) : para.startsWith('- ') ? (
                                    <span className="block pl-1 space-y-1">
                                      {para.split('\n').map((li, j) => (
                                        <span key={j} className="block">{li}</span>
                                      ))}
                                    </span>
                                  ) : (
                                    para
                                  )}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                        {isAiThinking && (
                          <div className="flex justify-start">
                            <div className="bg-slate-50 text-slate-500 p-2.5 rounded-xl border border-slate-200 rounded-tl-none text-[10px] flex items-center gap-1.5 font-bold">
                              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                              <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                              {language === 'zh' ? 'AI 教練思考中...' : 'AI Coach is thinking...'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input & Suggestions */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {/* Quick Presets Pills */}
                        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
                          {[
                            language === 'zh' ? '改善最弱屬性' : 'Improve weak attributes?',
                            language === 'zh' ? '評估冒險者均衡度' : 'Assess balance index?',
                            language === 'zh' ? '設定吸引人獎勵' : 'How to set rewards?'
                          ].map((preset, i) => (
                            <button
                              key={i}
                              type="button"
                              disabled={isAiThinking}
                              onClick={() => handleSendAiQuestion(preset)}
                              className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[9px] font-bold text-violet-600 rounded-full hover:bg-violet-50 hover:text-violet-700 transition-all whitespace-nowrap"
                            >
                              💡 {preset}
                            </button>
                          ))}
                        </div>

                        {/* Input Box */}
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendAiQuestion(aiCoachInput);
                          }}
                          className="flex gap-1.5"
                        >
                          <input
                            type="text"
                            value={aiCoachInput}
                            disabled={isAiThinking}
                            onChange={(e) => setAiCoachInput(e.target.value)}
                            placeholder={language === 'zh' ? '輸入您的成長疑問...' : 'Ask the AI Coach...'}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#3661FF] disabled:opacity-50"
                          />
                          <button
                            type="submit"
                            disabled={isAiThinking || !aiCoachInput.trim()}
                            className="bg-[#3661FF] hover:bg-[#254edb] active:scale-95 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center"
                          >
                            {language === 'zh' ? '送出' : 'Send'}
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* V2 Telemetry Event Logs list table */}
            <div className="glass-panel p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Database className="h-5 w-5 text-cyan-400" />
                {t('telemetryLogsTitle')}
              </h3>
              <p className="text-xs text-slate-400">
                {t('telemetryLogsDesc')}
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold bg-white/5">
                      <th className="py-2.5 px-4">{t('colTimestamp')}</th>
                      <th className="py-2.5 px-4">{t('colEventName')}</th>
                      <th className="py-2.5 px-4">{t('colUserId')}</th>
                      <th className="py-2.5 px-4">{t('colMetadata')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {eventLogs.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 px-4 text-center text-slate-500">{t('noTelemetryLogs')}</td>
                      </tr>
                    ) : (
                      eventLogs.map((log) => {
                        const displayTime = log.timestamp 
                          ? (typeof log.timestamp === 'string' 
                              ? log.timestamp.replace('T', ' ').substring(0, 19) 
                              : new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19))
                          : '';
                        const metadataStr = log.metadata 
                          ? (typeof log.metadata === 'object' 
                              ? JSON.stringify(log.metadata) 
                              : String(log.metadata))
                          : '';

                        return (
                          <tr key={log.id} className="hover:bg-white/5 text-slate-300">
                            <td className="py-2 px-4 whitespace-nowrap text-slate-400">{displayTime}</td>
                            <td className="py-2 px-4 whitespace-nowrap font-bold text-cyan-400">{log.eventType || log.event_type}</td>
                            <td className="py-2 px-4 whitespace-nowrap text-slate-400">{log.userId || log.user_id}</td>
                            <td className="py-2 px-4 font-mono text-[10px] text-slate-500 truncate max-w-xs" title={metadataStr}>{metadataStr}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-md w-full p-6 border border-white/10 space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-500">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
              <h3 className="text-lg font-black">{language === 'zh' ? '安全確認' : 'Security Confirmation'}</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'zh' ? (
                <span>確定要刪除「<strong className="text-[#FF4747] font-black">{deleteConfirm.title}</strong>」嗎？<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ 此動作將無法復原！</span></span>
              ) : (
                <span>Are you sure you want to delete "<strong className="text-[#FF4747] font-black">{deleteConfirm.title}</strong>"?<br /><span className="text-[#FF4747] font-bold text-xs">⚠️ This action cannot be undone!</span></span>
              )}
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ show: false, type: '', id: null, title: '' })}
                className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-slate-400 hover:text-white hover:bg-[#35363A] transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirm.type === 'task') onDeleteTask(deleteConfirm.id);
                  else if (deleteConfirm.type === 'wishlist') onDeleteWishlist(deleteConfirm.id);
                  else if (deleteConfirm.type === 'parent') onDeleteParent(deleteConfirm.id);
                  else if (deleteConfirm.type === 'child') onDeleteChild(deleteConfirm.id);
                  setDeleteConfirm({ show: false, type: '', id: null, title: '' });
                }}
                className="px-4 py-2 rounded-[4px] text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors"
              >
                {language === 'zh' ? '確認刪除' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour Overlay for Parents */}
      {showTour && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 sm:px-0">
          <div className="bg-white border-2 border-[#3661FF] rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.18)] p-6 text-slate-800 flex flex-col gap-4 animate-success">
            
            {/* Step Header */}
            <div className="flex justify-between items-center">
              <span className="text-xs bg-[#3661FF] text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                {language === 'zh' ? `步驟 ${tourStep} / 7` : `Step ${tourStep} / 7`}
              </span>
              <button 
                onClick={() => {
                  setShowTour(false);
                  localStorage.setItem('questgrow_parent_tour_seen', 'true');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-black"
              >
                {t('tourSkip')}
              </button>
            </div>

            {/* Step Body */}
            <div>
              <h4 className="text-base font-extrabold text-slate-950 mb-2 flex items-center gap-1.5">
                {t(`parentTourStep${tourStep}Title`)}
              </h4>
              <p className="text-sm text-slate-650 font-medium leading-relaxed">
                {t(`parentTourStep${tourStep}Desc`)}
              </p>
            </div>

            {/* Step Navigation Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                disabled={tourStep === 1}
                onClick={() => setTourStep(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                {t('tourPrev')}
              </button>
              
              <button
                onClick={() => {
                  if (tourStep === 7) {
                    setShowTour(false);
                    localStorage.setItem('questgrow_parent_tour_seen', 'true');
                  } else {
                    setTourStep(prev => prev + 1);
                  }
                }}
                className="px-4 py-1.5 rounded-[4px] text-xs font-black bg-[#3661FF] hover:bg-[#254edb] text-white transition-colors shadow-md"
              >
                {tourStep === 7 ? t('tourFinish') : t('tourNext')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}


export function ParentOnboardingWizard({
  familyNickname,
  onUpdateFamilyNickname,
  onAddChild,
  onAddTask,
  onCompleteOnboarding,
  children = [],
  t,
  language
}) {
  const [step, setStep] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  // Step 2 State (Family Nickname)
  const [nickname, setNickname] = useState(familyNickname || '');
  const [nicknameWarning, setNicknameWarning] = useState('');

  // Step 3 State (Add Child Form)
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(10);
  const [childBirthday, setChildBirthday] = useState('');
  const [childAvatar, setChildAvatar] = useState('boy');
  const [childEmail, setChildEmail] = useState('');
  const [childPassword, setChildPassword] = useState('password123');
  const [selectedJob, setSelectedJob] = useState('Explorer');
  const [childStep2Error, setChildStep2Error] = useState('');
  const [childSuccessMsg, setChildSuccessMsg] = useState('');

  // Step 4 State (Starter Quests Checkboxes)
  const [selectedQuests, setSelectedQuests] = useState([0, 1, 2, 3, 4]); // all checked by default

  const handleNextStep2 = async () => {
    if (!nickname.trim()) {
      setNicknameWarning(language === 'zh' ? '家庭暱稱不能為空。' : 'Family nickname cannot be empty.');
      return;
    }
    if (nickname.length > 20) {
      setNicknameWarning(language === 'zh' ? '家庭暱稱最多 20 個字元。' : 'Family nickname cannot exceed 20 characters.');
      return;
    }
    const success = await onUpdateFamilyNickname(nickname);
    if (success) {
      setNicknameWarning('');
      setStep(3);
    }
  };

  const handleAddChildProfile = async (e) => {
    e.preventDefault();
    if (!childName.trim()) {
      alert(language === 'zh' ? '請輸入冒險者暱稱！' : 'Please enter child nickname!');
      return;
    }
    if (childName.length > 12) {
      alert(language === 'zh' ? '暱稱最多 12 個字元！' : 'Nickname must be 12 characters or fewer!');
      return;
    }

    // Age validation
    if (!childAge || isNaN(childAge) || childAge < 3 || childAge > 14) {
      setChildStep2Error(language === 'zh' ? '年齡需介於 3～14 歲之間。' : 'Age must be between 3 and 14.');
      return;
    }

    // Birthday MM/DD validation
    const bdayTrim = childBirthday.trim();
    if (!bdayTrim) {
      setChildStep2Error(language === 'zh' ? '請輸入生日 (MM/DD)' : 'Please enter birthday (MM/DD)');
      return;
    }
    const bdayParts = bdayTrim.split('/');
    if (bdayParts.length !== 2) {
      setChildStep2Error(language === 'zh' ? '請依 MM/DD 格式輸入生日。' : 'Use MM/DD format, e.g. 10/24.');
      return;
    }
    const bdayMM = parseInt(bdayParts[0], 10);
    const bdayDD = parseInt(bdayParts[1], 10);
    if (isNaN(bdayMM) || isNaN(bdayDD) || bdayMM < 1 || bdayMM > 12) {
      setChildStep2Error(language === 'zh' ? '月份需為 01～12 之間的數字。' : 'Month must be 01-12.');
      return;
    }
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (bdayDD < 1 || bdayDD > daysInMonth[bdayMM - 1]) {
      setChildStep2Error(language === 'zh' ? '輸入的日期有誤，請確認月份天數。' : 'Day is invalid for selected month.');
      return;
    }

    if (!childEmail.trim() || !childPassword.trim()) {
      alert(language === 'zh' ? '請輸入登入帳號及密碼！' : 'Please enter login credentials!');
      return;
    }

    setChildStep2Error('');

    const initialAttributes = JOB_CLASSES[selectedJob].attributes;

    const childData = {
      name: childName.trim(),
      age: childAge,
      birthday: bdayTrim,
      avatar: childAvatar,
      email: childEmail.trim(),
      password: childPassword,
      jobClass: selectedJob,
      attributes: initialAttributes
    };

    const success = await onAddChild(childData);
    if (success) {
      setChildSuccessMsg(language === 'zh' ? `🎉 成功建立冒險者「${childName}」！` : `Successfully created adventurer '${childName}'!`);
      setChildName('');
      setChildAge(10);
      setChildBirthday('');
      setChildAvatar('boy');
      setChildEmail('');
      setChildPassword('password123');
      setSelectedJob('Explorer');
      setTimeout(() => setChildSuccessMsg(''), 4000);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsCompleting(true);
    try {
      if (selectedQuests.length > 0 && children.length > 0) {
        for (const child of children) {
          for (const idx of selectedQuests) {
            const questTemplate = STARTER_QUESTS_TEMPLATES[idx];
            await onAddTask({
              name: questTemplate.name,
              description: questTemplate.description,
              type: questTemplate.type,
              difficulty: questTemplate.difficulty,
              expReward: questTemplate.expReward,
              goldReward: questTemplate.goldReward,
              ticketReward: questTemplate.ticketReward,
              attributeReward: questTemplate.attributeReward,
              period: questTemplate.period === '每日' ? '每日' : '每週',
              assignedTo: child.id
            });
          }
        }
      }
      sessionStorage.setItem('questgrow_just_completed_onboarding', 'true');
      sessionStorage.setItem('questgrow_just_switched_to_kid_first_time', 'true');
      await onCompleteOnboarding();
    } catch (err) {
      console.error('Error finishing onboarding:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const getQuestColor = (type) => {
    switch (type) {
      case '智': return 'bg-sky-100/10 text-sky-400 border-sky-400/20';
      case '德': return 'bg-emerald-100/10 text-emerald-400 border-emerald-400/20';
      case '體': return 'bg-rose-100/10 text-rose-400 border-rose-400/20';
      case '群': return 'bg-pink-100/10 text-pink-400 border-pink-400/20';
      case '美': return 'bg-violet-100/10 text-violet-400 border-violet-400/20';
      default: return 'bg-slate-800/10 text-slate-400 border-white/10';
    }
  };

  return (
    <div className="w-full max-w-xl glass-panel p-8 border border-white/10 space-y-6 relative overflow-hidden bg-gradient-to-b from-slate-900 to-indigo-950/40">
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {isCompleting && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-6 text-center space-y-6 backdrop-blur-sm animate-success">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border border-white/20 relative animate-spin">
            <div className="absolute inset-1 rounded-full bg-slate-950"></div>
            <div className="w-3 h-3 bg-emerald-400 rounded-full absolute top-1 left-1/2 -ml-1.5"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-105 tracking-wider">
              {language === 'zh' ? '正在建立角色與配置初始冒險...' : 'Setting up child profile & initial quests...'}
            </h3>
            <p className="text-[10px] text-slate-450 font-bold uppercase tracking-widest leading-relaxed">
              {language === 'zh' ? '冒險大門即將開啟，請稍候。' : 'Adventure gates are opening, please wait.'}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-4">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                step === s 
                  ? 'bg-[#3661FF] text-white ring-4 ring-[#3661FF]/20 shadow-[0_0_10px_rgba(54,97,255,0.4)] font-black' 
                  : step > s 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-zinc-800 text-zinc-400 border border-white/10'
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={`text-[10px] font-black tracking-wider hidden sm:inline ${
                step === s ? 'text-zinc-200' : 'text-zinc-500'
              }`}>
                {s === 1 ? (language === 'zh' ? '歡迎' : 'Welcome') :
                 s === 2 ? (language === 'zh' ? '家庭暱稱' : 'Family Nickname') :
                 s === 3 ? (language === 'zh' ? '兒童角色' : 'Child Setup') :
                 (language === 'zh' ? '起步任務' : 'Starter Quests')}
              </span>
            </div>
            {s < 4 && (
              <div className="flex-1 h-[2px] min-w-[20px] bg-slate-800 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-[#3661FF] transition-all duration-300" 
                  style={{ width: step > s ? '100%' : '0%' }} 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-success">
          <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg relative aspect-[1.618/1] bg-slate-950">
            <img 
              src="/onboarding_banner.jpg" 
              alt="QuestGrow Welcome" 
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-slate-100">{t('parentWizardStep1Title').replace('👋 ', '')}</h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              {t('parentWizardStep1Desc')}
            </p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-left space-y-2">
            <h4 className="text-xs font-black text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
              ✨ Quick Overview
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-300">
              <li>{language === 'zh' ? '給您的家庭設定暱稱，並與其他家庭友好競賽排行榜' : 'Give your family a nickname and compete on the leaderboards'}</li>
              <li>{language === 'zh' ? '為孩子建立專屬角色與職業（智者、探索者、守護者等）' : 'Set up adventurer roles & starting jobs for your children'}</li>
              <li>{language === 'zh' ? '指派基礎的德智體群美任務，開始賺取經驗值與金幣' : 'Assign five-attribute starter tasks to jumpstart their progress'}</li>
            </ul>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-[#3661FF] hover:bg-[#254edb] active:scale-95 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-indigo-950/40"
          >
            {language === 'zh' ? '開始引導 🧙‍♂️' : 'Start Guide 🧙‍♂️'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-success">
          <div className="space-y-1">
            <h3 className="text-md font-black text-slate-205 flex items-center gap-2">
              <span className="text-xl">🏰</span>
              {t('parentWizardStep2Title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('parentWizardStep2Desc')}
            </p>
          </div>

          <div className="space-y-3 bg-white/5 border border-white/5 p-5 rounded-2xl text-left">
            <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1.5">
              {t('familyNicknameLabel')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={20}
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (e.target.value.length <= 20) {
                    setNicknameWarning('');
                  }
                }}
                placeholder={t('familyNicknamePlaceholder')}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 pr-14 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF] transition-all"
              />
              <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold tabular-nums pointer-events-none ${
                nickname.length >= 18 ? 'text-rose-500' : 'text-slate-400'
              }`}>
                {nickname.length}/20
              </span>
            </div>
            {nicknameWarning && (
              <p className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                ⚠️ {nicknameWarning}
              </p>
            )}
            <p className="text-[9px] text-slate-500">
              {language === 'zh' ? '例如：「格林冒險小隊」、「馬斯克太空探索隊」。' : 'Example: "Green Adventurers", "Musk Space Team".'}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-all active:scale-95"
            >
              {language === 'zh' ? '上一步' : 'Back'}
            </button>
            <button
              onClick={handleNextStep2}
              className="flex-1 py-2.5 rounded-xl text-xs font-black bg-[#3661FF] text-white hover:bg-[#254edb] transition-all active:scale-95 shadow-md shadow-indigo-950/20"
            >
              {language === 'zh' ? '下一步' : 'Next'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-success">
          <div className="space-y-1">
            <h3 className="text-md font-black text-slate-205 flex items-center gap-2">
              <span className="text-xl">👶</span>
              {t('parentWizardStep3Title')}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('parentWizardStep3Desc')}
            </p>
          </div>

          {childSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-bold animate-success flex items-center gap-2">
              <span>🎉</span>
              <span>{childSuccessMsg}</span>
            </div>
          )}

          {childStep2Error && (
            <div className="flex items-start gap-2.5 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-success">
              <span className="text-rose-400 text-sm shrink-0">🚫</span>
              <p className="text-[10px] font-semibold text-rose-300 leading-relaxed">{childStep2Error}</p>
            </div>
          )}

          <form onSubmit={handleAddChildProfile} className="bg-white/5 border border-white/5 p-5 rounded-2xl space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-450 font-bold uppercase mb-1.5">
                  {t('childNameLabel')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={childName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setChildName(val);
                      const clean = val.toLowerCase().replace(/[^a-z0-9]/g, '');
                      if (clean) {
                        setChildEmail(`${clean}@questgrow.com`);
                      } else {
                        setChildEmail('');
                      }
                    }}
                    placeholder={t('childNamePlaceholder')}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 pr-12 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF] transition-all"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold tabular-nums ${
                    childName.length >= 10 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {childName.length}/12
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                  {t('childBirthdayLabel')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={childBirthday}
                  onChange={(e) => setChildBirthday(e.target.value)}
                  placeholder="e.g. 10/24"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                  {t('childAgeLabel')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="3"
                  max="14"
                  value={childAge}
                  onChange={(e) => setChildAge(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF] transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                  {t('avatarSelectLabel')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChildAvatar('boy')}
                    className={`py-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                      childAvatar === 'boy' ? 'border-cyan-500 bg-cyan-600/10' : 'border-white/5 bg-white/5'
                    }`}
                  >
                    <span className="text-sm">👦</span>
                    <span className="text-[9px] font-bold text-zinc-300">Boy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChildAvatar('girl')}
                    className={`py-1.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1 ${
                      childAvatar === 'girl' ? 'border-pink-500 bg-pink-600/10' : 'border-white/5 bg-white/5'
                    }`}
                  >
                    <span className="text-sm">👧</span>
                    <span className="text-[9px] font-bold text-zinc-300">Girl</span>
                  </button>
                </div>
              </div>
            </div>

            {childAge < 8 && (
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-[10px] leading-relaxed animate-success">
                <strong>⚠️ {language === 'zh' ? '已自動啟用注音輔助模式' : 'Bopomofo Assistive Mode Enabled'}</strong>
                <p className="text-[9px] text-zinc-400 mt-0.5">
                  {language === 'zh' ? '針對年齡小於 8 歲的小孩，系統會在登入時自動以注音標注所有中文文字，協助獨立識字閱讀。' : 'Since child is under 8, standard Bopomofo annotations will render on their UI.'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-white/5 pt-3 mt-1">
              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                  {t('emailLabelChild')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="e.g. leo@questgrow.com"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                  {t('passwordLabelChild')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={childPassword}
                  onChange={(e) => setChildPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#3661FF] focus:border-[#3661FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 font-bold uppercase mb-1.5">
                {language === 'zh' ? '選擇初始職業角色' : 'Starting Job Class'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Explorer', 'Sage', 'Guardian', 'Creator'].map(job => (
                  <button
                    key={job}
                    type="button"
                    onClick={() => setSelectedJob(job)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedJob === job ? 'border-violet-500 bg-violet-600/10' : 'border-white/5 bg-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="text-[10px] font-black text-zinc-200 mb-0.5">
                      {language === 'zh' ? JOB_CLASSES[job].nameZh : JOB_CLASSES[job].nameEn}
                    </div>
                    <p className="text-[8px] text-zinc-400 leading-tight">
                      {language === 'zh' ? JOB_CLASSES[job].descZh.split('。')[0] : JOB_CLASSES[job].descEn.split('.')[0]}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl transition-all shadow-md active:scale-95"
            >
              ➕ {language === 'zh' ? '確認新增冒險者角色' : 'Confirm Add Adventurer'}
            </button>
          </form>

          {children.length > 0 && (
            <div className="space-y-2 text-left">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {language === 'zh' ? '目前已建立的冒險者：' : 'Adventurers Created:'}
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {children.map(c => (
                  <div key={c.id} className="p-2 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2">
                    <span className="text-xl">{c.avatar === 'boy' ? '👦' : '👧'}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-zinc-200 block truncate">{c.name}</span>
                      <span className="text-[8.5px] text-zinc-400 font-bold block">Lv.{c.level} • {c.age} Y/O</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-all active:scale-95"
            >
              {language === 'zh' ? '上一步' : 'Back'}
            </button>
            <button
              type="button"
              disabled={children.length === 0}
              onClick={() => setStep(4)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 shadow-md ${
                children.length === 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                  : 'bg-[#3661FF] text-white hover:bg-[#254edb] shadow-indigo-950/20'
              }`}
            >
              {language === 'zh' ? '下一步' : 'Next'}
            </button>
          </div>
          {children.length === 0 && (
            <p className="text-[9px] text-zinc-300 font-bold text-center">
              * {language === 'zh' ? '請至少建立一位孩子角色以繼續引導。' : 'Please create at least one child profile to continue.'}
            </p>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-success">
          <div className="space-y-1">
            <h3 className="text-md font-black text-zinc-200 flex items-center gap-2">
              <span className="text-xl">📜</span>
              {t('parentWizardStep4Title')}
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed">
              {t('parentWizardStep4Desc')}
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 text-left">
            {STARTER_QUESTS_TEMPLATES.map((quest, index) => {
              const isChecked = selectedQuests.includes(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (isChecked) {
                      setSelectedQuests(prev => prev.filter(i => i !== index));
                    } else {
                      setSelectedQuests(prev => [...prev, index]);
                    }
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start gap-3 hover:scale-[1.01] active:scale-95 ${
                    isChecked 
                      ? 'border-emerald-500 bg-emerald-600/10' 
                      : 'border-white/5 bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="pt-0.5">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'border-white/20'
                    }`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-black text-slate-200 truncate">
                        {quest.name}
                      </span>
                      <span className={`text-[8.5px] px-1.5 py-0.5 rounded-full border shrink-0 font-bold ${getQuestColor(quest.type)}`}>
                        {quest.type}
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-normal">
                      {quest.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleFinishOnboarding}
              className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 hover:from-emerald-400 hover:to-cyan-400 transition-all active:scale-95 shadow-lg shadow-emerald-950/20"
            >
              {t('parentWizardFinishBtn')}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-all active:scale-95"
              >
                {language === 'zh' ? '上一步' : 'Back'}
              </button>
              <button
                onClick={async () => {
                  setIsCompleting(true);
                  try {
                    sessionStorage.setItem('questgrow_just_completed_onboarding', 'true');
                    sessionStorage.setItem('questgrow_just_switched_to_kid_first_time', 'true');
                    await onCompleteOnboarding();
                  } catch (err) {
                    console.error('Error completing onboarding:', err);
                  } finally {
                    setIsCompleting(false);
                  }
                }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-[#b5b7bc] hover:text-white transition-all active:scale-95"
              >
                {t('parentWizardSkipBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default ParentPortal;
