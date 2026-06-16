import React, { useState } from 'react';
import { TASK_TEMPLATES } from '../utils/mockData';
import Avatar from './Avatar';
import { useLanguage } from './LanguageContext';
import { 
  Plus, Check, X, ShieldAlert, Sparkles, BookOpen, 
  HelpCircle, Trash2, Award, ClipboardCheck, LayoutGrid, 
  Eye, Heart, MessageSquare, Compass, BarChart3, AlertCircle,
  Database, ShieldCheck, HelpCircle as HelpIcon, Trophy, Users,
  ListTodo, Settings
} from 'lucide-react';

const difficultyRewardsMap = {
  "簡單": { exp: 100, gold: 50, ticket: 1 },
  "中等": { exp: 200, gold: 100, ticket: 1 },
  "較難": { exp: 400, gold: 200, ticket: 2 },
  "終極": { exp: 800, gold: 400, ticket: 3 }
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
  usersDB = [],
  onAddParent,
  onDeleteParent,
  onUpdateParent
}) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('audit');
  const [showHistoryLogs, setShowHistoryLogs] = useState(false);

  // Onboarding Tour state
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('questgrow_parent_tour_seen') !== 'true';
  });
  const [tourStep, setTourStep] = useState(1);

  React.useEffect(() => {
    if (!showTour) return;
    if (tourStep === 2) {
      setActiveTab('audit');
    } else if (tourStep === 3) {
      setActiveTab('workshop');
    } else if (tourStep === 4) {
      setActiveTab('reports');
    } else if (tourStep === 5) {
      setActiveTab('settings');
      setSettingsSubTab('wishlist');
    }
  }, [tourStep, showTour]);

  
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
  const [manageTasksFilter, setManageTasksFilter] = useState('all');
  const [settingsSubTab, setSettingsSubTab] = useState('wishlist'); // 'wishlist', 'parent', 'child'

  // Multi-Child Form States
  const [showAddChildForm, setShowAddChildForm] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState(10);
  const [newChildBirthday, setNewChildBirthday] = useState('');
  const [newChildAvatar, setNewChildAvatar] = useState('boy');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [newChildPassword, setNewChildPassword] = useState('password123');

  const [editingChildId, setEditingChildId] = useState(null);
  const [editChildName, setEditChildName] = useState('');
  const [editChildAge, setEditChildAge] = useState(10);
  const [editChildBirthday, setEditChildBirthday] = useState('');
  const [editChildEmail, setEditChildEmail] = useState('');
  const [editChildPassword, setEditChildPassword] = useState('');

  // Multi-Parent Form States
  const [newParentName, setNewParentName] = useState('');
  const [newParentAvatar, setNewParentAvatar] = useState('girl');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPassword, setNewParentPassword] = useState('password123');

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

  const submitNewTask = (e) => {
    e.preventDefault();
    if (!taskName) return;

    const rewards = difficultyRewardsMap[taskDifficulty] || difficultyRewardsMap["中等"];
    
    if (taskAssignedTo === 'all') {
      children.forEach(child => {
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
        onAddTask(newTask);
      });
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
      onAddTask(newTask);
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

  const submitAddChild = (e) => {
    e.preventDefault();
    if (!newChildName) return;
    
    const suggestedEmail = newChildEmail || `${newChildName.toLowerCase().replace(/[^a-z0-9]/g, '')}@questgrow.com`;
    const suggestedPassword = newChildPassword || 'password123';

    const success = onAddChild({
      name: newChildName,
      age: parseInt(newChildAge, 10) || 10,
      birthday: newChildBirthday || '',
      avatar: newChildAvatar || 'boy',
      email: suggestedEmail,
      password: suggestedPassword
    });

    if (success !== false) {
      setNewChildName('');
      setNewChildAge(10);
      setNewChildBirthday('');
      setNewChildAvatar('boy');
      setNewChildEmail('');
      setNewChildPassword('password123');
      setShowAddChildForm(false);
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
      password: editChildPassword
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
        onAddTask(newTask);
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
      onAddTask(newTask);
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
        onAddTask(newTask);
      }
    }
  };

  const importAllCategoryTasks = (type) => {
    const group = TASK_TEMPLATES.filter(t => t.type === type);
    if (group.length === 0) return;

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
          onAddTask(newTask);
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
        onAddTask(newTask);
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
          onAddTask(newTask);
        });
      }
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

  return (
    <div className="space-y-6">
      
      {/* simulated date notice */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          {t('parentPrivacyNotice')}
        </span>
        <span className="text-xs text-slate-500 font-medium">{t('simulatedDateLabel')} {simulatedDate}</span>
      </div>

      {/* Restart Tour button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setTourStep(1);
            setShowTour(true);
            localStorage.removeItem('questgrow_parent_tour_seen');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
        >
          {t('reopenTourBtn')}
        </button>
      </div>

      <div className="flex border-b border-[#35363A] gap-1 pb-px overflow-x-auto">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
            activeTab === 'audit' ? 'border-[#3661FF] text-white bg-[#252529]' : 'border-transparent text-[#b5b7bc] hover:text-white'
          } ${showTour && tourStep === 2 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse rounded' : ''}`}
        >
          <ClipboardCheck className="h-4 w-4 text-[#3661FF]" />
          {t('tabAudit')}
          {(pendingTasks.length + pendingRedemptions.length) > 0 && (
            <span className="bg-[#FF4747] text-white px-1.5 py-0.5 rounded text-[10px] font-black">
              {pendingTasks.length + pendingRedemptions.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('workshop')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
            activeTab === 'workshop' ? 'border-[#3661FF] text-white bg-[#252529]' : 'border-transparent text-[#b5b7bc] hover:text-white'
          } ${showTour && tourStep === 3 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse rounded' : ''}`}
        >
          <LayoutGrid className="h-4 w-4 text-[#3661FF]" />
          {t('tabWorkshop')}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
            activeTab === 'reports' ? 'border-[#3661FF] text-white bg-[#252529]' : 'border-transparent text-[#b5b7bc] hover:text-white'
          } ${showTour && tourStep === 4 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse rounded' : ''}`}
        >
          <BarChart3 className="h-4 w-4 text-[#FF9F1C]" />
          {t('tabReports')}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap ${
            activeTab === 'settings' ? 'border-[#3661FF] text-white bg-[#252529]' : 'border-transparent text-[#b5b7bc] hover:text-white'
          } ${showTour && tourStep === 5 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse rounded' : ''}`}
        >
          <Settings className="h-4 w-4 text-[#00E676]" />
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
        <div className="space-y-6 animate-success">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-violet-400" />
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
              <div className="glass-panel p-8 text-center text-slate-500 text-sm">
                {t('noPendingTasks')}
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="glass-panel p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-md font-bold text-slate-200">{task.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getAttributeColor(task.type)}`}>
                          {translateType(task.type)} | {language === 'zh' ? '難度' : 'Difficulty'} {translateDifficulty(task.difficulty)}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-400">{task.description}</p>
                      
                      {task.submission && (
                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2">
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {t('childNotesLabel')}
                          </div>
                          <p className="text-xs text-slate-200 font-semibold">{task.submission.notes}</p>
                          {task.submission.photo && (
                            <button 
                              onClick={() => setPreviewPhotoUrl(task.submission.photo)}
                              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors"
                      >
                        <Check className="h-4 w-4" />
                        {t('approve')}
                      </button>
                      <button
                        onClick={() => setRejectingTaskId(task.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-[4px] text-xs font-black bg-[#FF4747] text-white hover:bg-[#ff3030] transition-colors"
                      >
                        <X className="h-4 w-4" />
                        {t('reject')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {rejectingTaskId && (
            <div className="glass-panel p-5 border border-rose-500/30 bg-rose-950/20 space-y-4 max-w-md animate-success">
              <h4 className="text-sm font-extrabold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="h-5 w-5" />
                {t('rejectionReasonTitle')}
              </h4>
              
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
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
                      className={`text-left px-3 py-1.5 text-xs rounded-lg border transition-all ${
                        selectedCannedReason === reason 
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-200' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t('customReasonTitle')}
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    setSelectedCannedReason('');
                  }}
                  placeholder={t('customReasonPlaceholder')}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button onClick={submitRejection} className="px-4 py-2 rounded-[4px] text-xs font-black bg-[#FF4747] text-white hover:bg-[#ff3030]">{t('confirmReject')}</button>
                <button onClick={() => { setRejectingTaskId(null); setRejectReason(''); setSelectedCannedReason(''); }} className="px-4 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white">{t('cancel')}</button>
              </div>
            </div>
          )}

          {/* Pending Redemptions with V2 Expired warning and block protection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
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
              <div className="glass-panel p-8 text-center text-slate-500 text-sm">
                {t('noPendingRedeems')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRedemptions.map((item) => {
                  const isExpired = item.expireAt && item.expireAt < simulatedDate;
                  return (
                    <div 
                      key={item.inventoryId} 
                      className={`glass-panel p-5 border flex flex-col justify-between gap-4 ${
                        isExpired ? 'border-rose-500/30 bg-rose-950/10' : 'border-amber-500/20 bg-amber-500/5'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${getRarityBadge(item.rarity)}`}>
                            {item.rarity} | {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{t('applicantLabel', { name: children.find(c => c.id === item.ownerId)?.name || stats.name })}</span>
                        </div>
                        <h4 className="text-md font-bold text-slate-100">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                        {item.expireAt && (
                          <p className={`text-[10px] font-extrabold ${isExpired ? 'text-rose-400' : 'text-slate-400'}`}>
                            {t('expiredLabel')} {item.expireAt} {isExpired && t('expiredAlert')}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-white/5 pt-3 mt-1">
                        <button
                          disabled={isExpired}
                          onClick={() => onApproveRedeem(item.inventoryId)}
                          className={`flex-1 py-2 rounded-[4px] text-xs font-black transition-all ${
                            isExpired 
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750' 
                              : 'bg-[#00E676] text-[#111216] hover:bg-[#00c867]'
                          }`}
                        >
                          {isExpired ? t('cardExpiredBlock') : t('confirmApprove')}
                        </button>
                        <button
                          onClick={() => onRejectRedeem(item.inventoryId)}
                          className="px-3 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
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
                className="px-4.5 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-550 hover:to-indigo-550 text-white text-xs font-black rounded-lg shadow-md hover:shadow-violet-600/25 active:scale-95 transition-all uppercase tracking-wider"
              >
                {showHistoryLogs ? (language === 'zh' ? '隱藏 ❌' : 'Hide ❌') : (language === 'zh' ? '展開 📂' : 'Expand 📂')}
              </button>
            </div>

            {showHistoryLogs && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-success">
                {/* Completed Tasks History */}
                <div className="glass-panel p-5 space-y-4 bg-slate-950/20">
                  <h4 className="text-sm font-extrabold text-slate-350 flex items-center gap-2 border-b border-white/5 pb-2">
                    ✅ {language === 'zh' ? '已完成任務歷史' : 'Completed Quests'}
                  </h4>
                  {tasks.filter(t => t.status === '已完成').length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">{language === 'zh' ? '無已完成的任務紀錄。' : 'No completed quest records.'}</p>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {tasks.filter(t => t.status === '已完成').map(task => (
                        <div key={task.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{task.name}</span>
                            <span className="text-[10px] text-slate-500">{task.dateCreated}</span>
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
                  <h4 className="text-sm font-extrabold text-slate-350 flex items-center gap-2 border-b border-white/5 pb-2">
                    🎫 {language === 'zh' ? '已核銷獎勵歷史' : 'Redeemed Cards'}
                  </h4>
                  {redeemLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-6">{language === 'zh' ? '無已核銷的獎勵紀錄。' : 'No redeemed card records.'}</p>
                  ) : (
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {redeemLogs.map(log => (
                        <div key={log.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{log.cardName}</span>
                            <span className="text-[10px] text-slate-500">{log.dateRedeemed}</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1">
                            <span>{language === 'zh' ? '使用者：' : 'User: '}<strong className="text-cyan-400">{log.kidName}</strong></span>
                            <span>{language === 'zh' ? '審核者：' : 'Reviewer: '}<strong className="text-slate-350">{log.reviewer || '系統'}</strong></span>
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
      )}

      {/* --- Tab 2: Quest Workshop --- */}
      {activeTab === 'workshop' && (
        <div className="space-y-6 animate-success">
          {/* Sub Navigation Bar for Workshop */}
          <div className="flex border-b border-white/10 gap-1 pb-px mb-4 overflow-x-auto">
            <button
              onClick={() => setWorkshopSubTab('import')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
                workshopSubTab === 'import' 
                  ? 'border-[#3661FF] text-white bg-[#252529]' 
                  : 'border-transparent text-[#b5b7bc] hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t('workshopTabImport')}
            </button>
            <button
              onClick={() => setWorkshopSubTab('manage')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
                workshopSubTab === 'manage' 
                  ? 'border-[#3661FF] text-white bg-[#252529]' 
                  : 'border-transparent text-[#b5b7bc] hover:text-white'
              }`}
            >
              <ListTodo className="h-3.5 w-3.5 text-[#3661FF]" />
              {t('workshopTabManage')}
              {tasks.length > 0 && (
                <span className="bg-[#FF4747] text-white px-1.5 py-0.5 rounded text-[10px] font-black ml-1 animate-pulse">
                  {tasks.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setWorkshopSubTab('add')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-black border-b-2 transition-all whitespace-nowrap ${
                workshopSubTab === 'add' 
                  ? 'border-[#3661FF] text-white bg-[#252529]' 
                  : 'border-transparent text-[#b5b7bc] hover:text-white'
              }`}
            >
              <Plus className="h-3.5 w-3.5 text-[#00E676]" />
              {t('workshopTabAdd')}
            </button>
          </div>

          {/* Sub-tab 1: Quick Import Templates */}
          {workshopSubTab === 'import' && (
            <div className="space-y-4">
              {/* Target Kid Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/5 p-4 rounded-xl">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-350 uppercase tracking-wider">{t('importAssignLabel')}</h4>
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

              <div className="space-y-3">
                <h3 className="text-md font-extrabold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                  {t('quickImportTitle')}
                </h3>
                <div className="space-y-5">
                  {[
                    { type: '德', label: language === 'zh' ? '德 — 責任與品德' : '德 Responsibility', color: 'text-[#16a34a]', border: 'border-[#16a34a]/20', bg: 'bg-[#16a34a]/5' },
                    { type: '智', label: language === 'zh' ? '智 — 智慧與學習' : '智 Wisdom',         color: 'text-[#0284c7]', border: 'border-[#0284c7]/20', bg: 'bg-[#0284c7]/5' },
                    { type: '體', label: language === 'zh' ? '體 — 體能與勇氣' : '體 Courage',        color: 'text-[#ea580c]', border: 'border-[#ea580c]/20', bg: 'bg-[#ea580c]/5' },
                    { type: '群', label: language === 'zh' ? '群 — 群育與同理' : '群 Empathy',        color: 'text-[#db2777]', border: 'border-[#db2777]/20', bg: 'bg-[#db2777]/5' },
                    { type: '美', label: language === 'zh' ? '美 — 美育與創意' : '美 Creativity',     color: 'text-[#7c3aed]', border: 'border-[#7c3aed]/20', bg: 'bg-[#7c3aed]/5' },
                  ].map(({ type, label, color, border, bg }) => {
                    const group = TASK_TEMPLATES.filter(t => t.type === type);
                    return (
                      <div key={type} className="space-y-2">
                        <div className={`flex items-center justify-between pb-1.5 border-b ${border} flex-wrap gap-2`}>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${color}`}>{label}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${color} ${bg} border ${border}`}>{group.length}</span>
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
                          {group.map((tpl) => (
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
                      </div>
                    );
                  })}
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
                  <div className="glass-panel p-8 text-center text-slate-500 text-sm">
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
                            {group.tasks.map((task) => (
                              <div key={task.id} className="p-4 bg-slate-900/60 border border-white/5 rounded-xl flex flex-col justify-between gap-4">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="text-md font-bold text-slate-200">{task.name}</h4>
                                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getAttributeColor(task.type)}`}>
                                      {translateType(task.type)} | {language === 'zh' ? '難度' : 'Difficulty'} {translateDifficulty(task.difficulty)}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 bg-white/5 p-2 rounded-lg border border-white/5">
                                    <span>{language === 'zh' ? '週期：' : 'Frequency: '}<span className="text-slate-200 font-bold">{translatePeriod(task.period)}</span></span>
                                    <span>{t('expLabel')}：<span className="text-violet-400 font-bold">+{task.expReward} EXP</span></span>
                                    <span>{t('goldLabel')}：<span className="text-amber-400 font-bold">🪙 {task.goldReward || 0}</span></span>
                                    <span>{t('ticketsLabel')}：<span className="text-cyan-400 font-bold">🎫 {task.ticketReward || 1}</span></span>
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
                            ))}
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
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-slate-400">
                  <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('rewardsPreview')}</span>
                  <div className="flex flex-wrap gap-4 mt-1">
                    <span>{t('expLabel')}: <span className="text-violet-400 font-bold">+{difficultyRewardsMap[taskDifficulty]?.exp} EXP</span></span>
                    <span>{t('goldLabel')}: <span className="text-amber-400 font-bold">🪙 {difficultyRewardsMap[taskDifficulty]?.gold}</span></span>
                    <span>{t('ticketsLabel')}: <span className="text-cyan-400 font-bold">🎫 {difficultyRewardsMap[taskDifficulty]?.ticket} {language === 'zh' ? '張' : ''}</span></span>
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
        <div className="flex border-b border-white/5 gap-2 pb-px overflow-x-auto">
          <button
            type="button"
            onClick={() => setSettingsSubTab('wishlist')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap active:scale-95 duration-100 ${
              settingsSubTab === 'wishlist' 
                ? 'border-[#FF9F1C] text-[#FF9F1C] bg-[#FF9F1C]/10 shadow-md shadow-[#FF9F1C]/5' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Trophy className={`h-4 w-4 transition-colors ${settingsSubTab === 'wishlist' ? 'text-[#FF9F1C]' : 'text-slate-500'}`} />
            {t('tabWishlist')}
          </button>
          <button
            type="button"
            onClick={() => setSettingsSubTab('parent')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap active:scale-95 duration-100 ${
              settingsSubTab === 'parent' 
                ? 'border-[#3661FF] text-[#3661FF] bg-[#3661FF]/10 shadow-md shadow-[#3661FF]/5' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className={`h-4 w-4 transition-colors ${settingsSubTab === 'parent' ? 'text-[#3661FF]' : 'text-slate-500'}`} />
            {t('tabParent')}
          </button>
          <button
            type="button"
            onClick={() => setSettingsSubTab('child')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black border-b-2 transition-all uppercase tracking-wider whitespace-nowrap active:scale-95 duration-100 ${
              settingsSubTab === 'child' 
                ? 'border-[#00E676] text-[#00E676] bg-[#00E676]/10 shadow-md shadow-[#00E676]/5' 
                : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className={`h-4 w-4 transition-colors ${settingsSubTab === 'child' ? 'text-[#00E676]' : 'text-slate-500'}`} />
            {t('tabChild')}
          </button>
        </div>
      )}

      {/* --- Tab 5: Wishlist Config (New Standalone Tab) --- */}
      {activeTab === 'settings' && settingsSubTab === 'wishlist' && (
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
                <p className="text-xs text-slate-500 text-center py-8">{t('noWishlistItems')}</p>
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
                      <label className="block text-[10px] text-slate-505 font-bold uppercase mb-1">{t('parentNameLabel')}</label>
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
                      <label className="block text-[10px] text-slate-550 font-bold uppercase mb-1">{t('emailLabel')}</label>
                      <input 
                        type="email" required value={newParentEmail} onChange={(e) => setNewParentEmail(e.target.value)}
                        placeholder="e.g. richard@questgrow.com"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase mb-1">{t('passwordLabel')}</label>
                      <input 
                        type="text" required value={newParentPassword} onChange={(e) => setNewParentPassword(e.target.value)}
                        placeholder="密碼"
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-550 font-bold uppercase mb-2">{t('avatarSelectLabel')}</label>
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
                  className="w-full py-2 bg-[#FF4747] hover:bg-[#ff3030] text-white text-xs font-black rounded-[4px] transition-colors border border-rose-500/30 flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                  {t('destroyDataBtn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 3.5: Child Role Settings panel --- */}
      {activeTab === 'settings' && settingsSubTab === 'child' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-success">
          {/* Left Column: Children list */}
          <div className="lg:col-span-2 glass-panel p-6 space-y-6">
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          {/* Right Column: Add Child form */}
          <div className="glass-panel p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" />
                {t('addNewChildTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('addNewChildDesc')}
              </p>
            </div>

            {children.length < 8 ? (
              <form onSubmit={submitAddChild} className="bg-white/5 border border-white/5 p-4 rounded-xl space-y-4 animate-success">
                <h4 className="text-xs font-black text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> {t('fillChildData')}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('childNameLabel')}</label>
                    <input 
                      type="text" required value={newChildName} 
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
                      placeholder="e.g. Michelle"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('childAgeLabel')}</label>
                    <input 
                      type="number" required min="1" max="18" value={newChildAge} onChange={(e) => setNewChildAge(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('childBirthdayLabel')}</label>
                    <input 
                      type="text" required value={newChildBirthday} onChange={(e) => setNewChildBirthday(e.target.value)}
                      placeholder="e.g. 10/24"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('emailLabelChild')}</label>
                    <input 
                      type="email" required value={newChildEmail} onChange={(e) => setNewChildEmail(e.target.value)}
                      placeholder="e.g. michelle@questgrow.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">{t('passwordLabelChild')}</label>
                    <input 
                      type="text" required value={newChildPassword} onChange={(e) => setNewChildPassword(e.target.value)}
                      placeholder="密碼"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold uppercase mb-2">{t('avatarSelectLabel')}</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setNewChildAvatar('boy')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all ${
                          newChildAvatar === 'boy' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                        }`}
                      >
                        👦
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewChildAvatar('girl')}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-all ${
                          newChildAvatar === 'girl' ? 'border-violet-500 bg-violet-600/20' : 'border-white/5 bg-white/5'
                        }`}
                      >
                        👧
                      </button>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full py-2 rounded text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all">
                  {t('confirmAdd')}
                </button>
              </form>
            ) : (
              <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-rose-400 mx-auto animate-pulse" />
                <h4 className="text-xs font-black text-rose-350">{t('maxChildLimit')}</h4>
                <p className="text-[10px] text-slate-500">
                  {t('maxChildLimitDesc')}
                </p>
              </div>
            )}
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
          const completedTypes = new Set(targetTasks.map(t => t.type));
          return (completedTypes.size / 5) * 100;
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

        const reportData = getSelectedReportData();
        const aiFeedback = getAiCoachFeedback();

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
              <div className="lg:col-span-2 glass-panel p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">
                    {t('growthDashboardTitle')} - {reportData.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{t('growthDashboardDesc')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div className="text-xs text-slate-400 font-bold uppercase">{t('weeklyCompletionRate')}</div>
                      <div className="text-2xl font-black text-cyan-400 mt-1">{getCompletionRate(reportsUserFilter)}%</div>
                    </div>
                    <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                      <div className="text-xs text-slate-400 font-bold uppercase">{t('weeklyBalanceIndex')}</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">{getReportBalanceIndex(reportsUserFilter)}%</div>
                    </div>
                  </div>
                  <div className="glass-panel p-4 border-white/5 bg-slate-950/40 space-y-4">
                    <div className="text-xs text-slate-400 font-bold uppercase text-center">{t('radarTitle')}</div>
                    <div className="flex justify-center">
                      <svg width="150" height="150" viewBox="0 0 200 200" className="w-36 h-36">
                        {[0.3, 0.6, 1.0].map((level, i) => (
                          <polygon key={i} points={[[0,0],[0,0],[0,0],[0,0],[0,0]].map((_, j) => {
                            const angle = (j * 2 * Math.PI / 5) - Math.PI / 2;
                            return `${100 + 65 * level * Math.cos(angle)},${100 + 65 * level * Math.sin(angle)}`;
                          }).join(' ')} className="radar-grid" />
                        ))}
                        <polygon 
                          points={[
                            reportData.attributes.Wisdom,
                            reportData.attributes.Responsibility,
                            reportData.attributes.Empathy,
                            reportData.attributes.Creativity,
                            reportData.attributes.Courage
                          ].map((val, i) => {
                            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                            const maxVal = reportData.isSummary ? Math.max(40 * children.length, 100) : 40;
                            const r = 65 * (Math.min(maxVal, Math.max(5, val)) / maxVal);
                            return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                          }).join(' ')} 
                          className="radar-polygon" 
                        />
                        {(() => {
                          const scores = [
                            reportData.attributes.Wisdom,
                            reportData.attributes.Responsibility,
                            reportData.attributes.Empathy,
                            reportData.attributes.Creativity,
                            reportData.attributes.Courage
                          ];
                          const colors = [
                            "#0284c7", // 智 (Wisdom - Cyan)
                            "#16a34a", // 德 (Responsibility - Green)
                            "#db2777", // 群 (Empathy - Pink)
                            "#7c3aed", // 美 (Creativity - Purple)
                            "#ea580c"  // 體 (Courage - Orange)
                          ];
                          const radarLabels = [t('attrWisdom'), t('attrResponsibility'), t('attrEmpathy'), t('attrCreativity'), t('attrCourage')];
                          return radarLabels.map((label, i) => {
                            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                            const x = 100 + 80 * Math.cos(angle);
                            const y = 100 + 80 * Math.sin(angle);
                            return (
                              <text 
                                key={i} 
                                x={x} 
                                y={y} 
                                fill={colors[i]} 
                                fontSize="11" 
                                fontWeight="900" 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                              >
                                {label}({scores[i]})
                              </text>
                            );
                          });
                        })()}
                      </svg>
                    </div>
                  </div>
                </div>

                {/* RPG Accumulated Stats Display */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mt-3 pt-3 border-t border-white/5">
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-400 font-bold uppercase text-[9px] mb-0.5">{language === 'zh' ? '累計等級' : 'Total Level'}</div>
                    <div className="text-white font-extrabold text-sm">Lv. {reportData.level}</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-400 font-bold uppercase text-[9px] mb-0.5">{language === 'zh' ? '累計金幣' : 'Total Gold'}</div>
                    <div className="text-amber-400 font-extrabold text-sm">🪙 {reportData.gold}</div>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    <div className="text-slate-400 font-bold uppercase text-[9px] mb-0.5">{language === 'zh' ? '累計抽卡券' : 'Total Tickets'}</div>
                    <div className="text-cyan-400 font-extrabold text-sm">🎫 {reportData.tickets}</div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 border border-violet-500/20 bg-gradient-to-b from-violet-500/5 to-transparent space-y-4">
                <h3 className="text-md font-bold text-violet-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="h-5 w-5 text-violet-400 animate-float" />
                  {t('aiCoachTitle')}
                </h3>
                <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">{aiFeedback.highlight}</span>
                    <p>{aiFeedback.highlightDesc}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">{aiFeedback.improve}</span>
                    <p>{aiFeedback.improveDesc}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block">{aiFeedback.suggest}</span>
                    <p>{aiFeedback.suggestDesc}</p>
                  </div>
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
                {language === 'zh' ? `步驟 ${tourStep} / 5` : `Step ${tourStep} / 5`}
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
                  if (tourStep === 5) {
                    setShowTour(false);
                    localStorage.setItem('questgrow_parent_tour_seen', 'true');
                  } else {
                    setTourStep(prev => prev + 1);
                  }
                }}
                className="px-4 py-1.5 rounded-[4px] text-xs font-black bg-[#3661FF] hover:bg-[#254edb] text-white transition-colors shadow-md"
              >
                {tourStep === 5 ? t('tourFinish') : t('tourNext')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ParentPortal;
