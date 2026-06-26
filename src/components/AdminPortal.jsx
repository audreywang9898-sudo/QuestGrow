import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useLanguage } from './LanguageContext';
import Avatar from './Avatar';
import { 
  Users, UserCheck, RefreshCw, Search, Award, 
  ShieldAlert, Info, MessageSquare, Trash2, Mail,
  Clock, Activity, PieChart, FileText
} from 'lucide-react';

const parseInlineBold = (str) => {
  if (!str) return '';
  const parts = str.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="text-slate-900 font-extrabold">{part}</strong>;
    }
    const italicParts = part.split('*');
    return italicParts.map((ipart, iIndex) => {
      if (iIndex % 2 === 1) {
        return <em key={iIndex} className="text-indigo-600 font-bold italic">{ipart}</em>;
      }
      return ipart;
    });
  });
};

const renderMarkdown = (text) => {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-2"></div>;

    if (trimmed.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-sm font-black text-slate-800 mt-4 mb-2 pb-1 border-b border-slate-200 flex items-center gap-1.5">
          {trimmed.replace('### ', '')}
        </h4>
      );
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h5 key={idx} className="text-xs font-black text-indigo-750 mt-3 mb-1.5">
          {trimmed.replace('#### ', '')}
        </h5>
      );
    }
    
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const cleanLine = trimmed.substring(2);
      return (
        <ul key={idx} className="list-disc pl-5 text-xs text-slate-700 font-bold space-y-1 my-1">
          <li>{parseInlineBold(cleanLine)}</li>
        </ul>
      );
    }

    const numMatch = trimmed.match(/^(\d+)\.\s(.*)$/);
    if (numMatch) {
      return (
        <ol key={idx} className="list-decimal pl-5 text-xs text-slate-700 font-bold space-y-1 my-1">
          <li value={numMatch[1]}>{parseInlineBold(numMatch[2])}</li>
        </ol>
      );
    }

    return (
      <p key={idx} className="text-xs text-slate-600 leading-relaxed font-bold mb-1.5">
        {parseInlineBold(trimmed)}
      </p>
    );
  });
};

function AdminPortal({ currentUser, onLogout }) {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshSpin, setRefreshSpin] = useState(false);

  // --- Feedback Dashboard States ---
  const [adminTab, setAdminTab] = useState('members'); // 'members', 'feedbacks'
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [feedbackFilter, setFeedbackFilter] = useState('all'); // 'all', '待處理', '處理中', '已解決'
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState('all'); // 'all', '功能建議', '問題回報', '其他'
  const [summaries, setSummaries] = useState([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message || '無法取得系統管理數據，請重試。');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const data = await api.getAdminFeedbacks();
      setFeedbacks(data);
    } catch (err) {
      console.error(err);
      setError(err.message || '無法取得意見回饋數據。');
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchSummaries = async () => {
    setLoadingSummaries(true);
    try {
      const data = await api.getFeedbackSummaries();
      setSummaries(data);
    } catch (err) {
      console.error('fetchSummaries error:', err);
    } finally {
      setLoadingSummaries(false);
    }
  };

  const handleGenerateSummary = async () => {
    setGeneratingSummary(true);
    try {
      const data = await api.generateFeedbackSummary();
      setSummaries(prev => {
        const exists = prev.some(s => s.reportDate === data.report.reportDate);
        if (exists) {
          return prev.map(s => s.reportDate === data.report.reportDate ? data.report : s);
        } else {
          return [data.report, ...prev];
        }
      });
      alert('報告已成功生成/更新！');
    } catch (err) {
      console.error(err);
      alert(err.message || '生成報告失敗。');
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleRefreshAll = async () => {
    setError('');
    setRefreshSpin(true);
    await Promise.all([fetchStats(), fetchFeedbacks(), fetchSummaries()]);
    setTimeout(() => setRefreshSpin(false), 500);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateFeedbackStatus(id, status);
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    } catch (err) {
      console.error(err);
      alert(err.message || '更新狀態失敗。');
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm('確定要永久刪除此筆意見回饋嗎？此操作無法恢復。')) {
      try {
        await api.deleteFeedback(id);
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      } catch (err) {
        console.error(err);
        alert(err.message || '刪除失敗。');
      }
    }
  };

  useEffect(() => {
    fetchStats();
    fetchFeedbacks();
    fetchSummaries();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-500">正在載入系統管理數據...</p>
      </div>
    );
  }

  // Calculate high-level metrics
  const totalUsers = stats?.members?.length || 0;
  const onlineCount = stats?.onlineUsers || 0;
  const totalFamilies = stats?.families?.length || 0;

  // Calculate stay duration and active rate from families
  const avgStayDuration = stats?.families?.length
    ? (stats.families.reduce((acc, f) => acc + (f.stayDurationDays || 0), 0) / stats.families.length).toFixed(1)
    : '0.0';

  const activeFamilies = stats?.families?.filter(f => f.retentionStatus === '🟢 活躍中').length || 0;
  const activeRate = stats?.families?.length
    ? Math.round((activeFamilies / stats.families.length) * 100)
    : 100;

  // Feedback Chart Calculations
  const totalFb = feedbacks.length;
  const suggestionCount = feedbacks.filter(f => f.category === '功能建議').length;
  const bugCount = feedbacks.filter(f => f.category === '問題回報').length;
  const otherCount = feedbacks.filter(f => f.category === '其他').length;

  const pSuggestion = totalFb > 0 ? (suggestionCount / totalFb) : 0;
  const pBug = totalFb > 0 ? (bugCount / totalFb) : 0;
  const pOther = totalFb > 0 ? (otherCount / totalFb) : 0;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dSuggestion = pSuggestion * circumference;
  const dBug = pBug * circumference;
  const dOther = pOther * circumference;

  const offsetBug = dSuggestion;
  const offsetOther = dSuggestion + dBug;

  const pendingFb = feedbacks.filter(f => f.status === '待處理').length;
  const activeFb = feedbacks.filter(f => f.status === '處理中').length;
  const solvedFb = feedbacks.filter(f => f.status === '已解決').length;

  const pPending = totalFb > 0 ? (pendingFb / totalFb) * 100 : 0;
  const pActive = totalFb > 0 ? (activeFb / totalFb) * 100 : 0;
  const pSolved = totalFb > 0 ? (solvedFb / totalFb) * 105 : 0; // stack bar normalization

  // Filter members based on search and role filters
  const filteredMembers = stats?.members?.filter(m => {
    const matchesSearch = 
      m.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.familyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;

    return matchesSearch && matchesRole;
  }) || [];

  return (
    <div className="space-y-6 animate-success text-slate-800">
      
      {/* Admin Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              🛡️ SYSTEM ADMINISTRATOR
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1.5 flex items-center gap-2">
            管理員控制台 (Admin Console)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            歡迎回來，{currentUser.name}！此處可監控全平台家庭方案及上線人數。
          </p>
        </div>
        
        <button
          onClick={handleRefreshAll}
          disabled={loading || loadingFeedbacks}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg border border-indigo-500/30 shadow-md font-bold text-xs transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshSpin ? 'animate-spin' : ''}`} />
          刷新數據 (Refresh)
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-700 font-bold shadow-sm animate-success">
          <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 🔔 系統即時通知 (System Live Notifications) */}
      <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4 animate-success">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          系統即時通知 (System Live Notifications)
        </h3>
        
        {stats?.notifications && stats.notifications.length > 0 ? (
          <div className="max-h-60 overflow-y-auto space-y-2.5 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {stats.notifications.map((n) => (
              <div 
                key={n.id} 
                className="flex items-start justify-between gap-4 p-3 bg-rose-50/20 hover:bg-rose-50/40 border border-rose-100/50 rounded-xl transition-all"
              >
                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                    <span className="bg-rose-100 border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">
                      {new Date(n.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-bold leading-relaxed mt-0.5">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 text-xs font-bold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
            📭 目前尚無新使用者登入通知。
          </div>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Online Users */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1 min-w-0">
            <div className="text-[9px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              上線人數
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{onlineCount}</div>
            <div className="text-[8px] text-slate-450 font-bold truncate">15分鐘內活躍</div>
          </div>
          <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-100 shadow-inner">
            <UserCheck className="h-5 w-5" />
          </div>
        </div>

        {/* Card 2: Registered Members */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1 min-w-0">
            <div className="text-[9px] text-indigo-650 font-black uppercase tracking-wider">
              註冊會員總數
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{totalUsers}</div>
            <div className="text-[8px] text-slate-450 font-bold truncate">包含家長與兒童</div>
          </div>
          <div className="p-2.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Card 3: Families Count */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1 min-w-0">
            <div className="text-[9px] text-amber-700 font-black uppercase tracking-wider">
              家庭方案數
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{totalFamilies}</div>
            <div className="text-[8px] text-slate-450 font-bold truncate">已啟用家庭方案</div>
          </div>
          <div className="p-2.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-inner">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {/* Card 4: Avg Stay Duration */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1 min-w-0">
            <div className="text-[9px] text-violet-700 font-black uppercase tracking-wider">
              平均使用壽命
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{avgStayDuration} 天</div>
            <div className="text-[8px] text-slate-450 font-bold truncate">註冊至最後活躍</div>
          </div>
          <div className="p-2.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 shadow-inner">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Card 5: Active Rate */}
        <div className="bg-white p-4 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1 min-w-0">
            <div className="text-[9px] text-teal-700 font-black uppercase tracking-wider">
              家庭活躍率
            </div>
            <div className="text-2xl font-black text-slate-900 truncate">{activeRate}%</div>
            <div className="text-[8px] text-slate-450 font-bold truncate">24小時有活動比例</div>
          </div>
          <div className="p-2.5 rounded-full bg-teal-50 text-teal-600 border border-teal-100 shadow-inner">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 max-w-md">
        <button
          onClick={() => setAdminTab('members')}
          className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'members' 
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          會員與方案管理 ({totalUsers})
        </button>
        <button
          onClick={() => setAdminTab('feedbacks')}
          className={`relative flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            adminTab === 'feedbacks' 
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="h-4 w-4 text-violet-600" />
          意見回饋管理
          {feedbacks.filter(f => f.status === '待處理').length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
              {feedbacks.filter(f => f.status === '待處理').length}
            </span>
          )}
        </button>
      </div>

      {adminTab === 'members' ? (
        <>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
          {/* Main Stats Panel for Members */}
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mr-auto">
              <Users className="h-4.5 w-4.5 text-indigo-650" />
              會員與方案總覽 (Members & Plans Directory)
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜尋姓名、Email、家庭..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
              </div>

              {/* Role Filter Tabs */}
              <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100 w-full sm:w-auto justify-around">
                {['all', 'admin', 'parent', 'kid'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className={`px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider ${
                      roleFilter === role 
                        ? 'bg-white text-indigo-700 shadow-sm border border-slate-150' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {role === 'all' ? '全部' : role === 'admin' ? '管理員' : role === 'parent' ? '家長' : '兒童'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <th className="py-3 px-4">會員 (Member)</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">角色 (Role)</th>
                  <th className="py-3 px-4">家庭方案 (Family Plan)</th>
                  <th className="py-3 px-4">成長積分 (Growth Score)</th>
                  <th className="py-3 px-4">兒童RPG角色屬性</th>
                  <th className="py-3 px-4 text-right">註冊日期 (Date Joined)</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-455 text-xs font-bold">
                      沒有符合條件的會員資料。
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const isAdmin = member.role === 'admin';
                    const isParent = member.role === 'parent';
                    const isKid = member.role === 'kid';

                    return (
                      <tr 
                        key={member.userId} 
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-all text-xs"
                      >
                        {/* Avatar and Name */}
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <Avatar 
                            avatar={member.userAvatar} 
                            role={member.role}
                            className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden" 
                          />
                          <span className="font-extrabold text-slate-800">{member.userName}</span>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4 font-mono text-slate-600 select-all">
                          {member.email}
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${
                            isAdmin 
                              ? 'bg-rose-50 border-rose-200 text-rose-700' 
                              : isParent 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {isAdmin ? '系統管理員' : isParent ? '家長' : '兒童'}
                          </span>
                        </td>

                        {/* Family Plan */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-800">{member.familyName || '未知家庭'}</div>
                          <div className="text-[9px] text-slate-500 font-mono">Plan ID: {member.familyId || 'N/A'}</div>
                        </td>

                        {/* Family Growth Score */}
                        <td className="py-3.5 px-4 font-bold">
                          {member.familyName ? (
                            <span className="text-amber-600 font-black flex items-center gap-1">
                              🪙 {member.familyGrowthScore?.toLocaleString()}
                            </span>
                          ) : '--'}
                        </td>

                        {/* RPG Character Info (Kid only) */}
                        <td className="py-3.5 px-4 text-slate-700 font-bold">
                          {isKid && member.childProfileId ? (
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-extrabold text-violet-750">
                                LV.{member.childLevel} | {member.childJobClass}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Date joined */}
                        <td className="py-3.5 px-4 text-right text-slate-600 font-semibold font-mono">
                          {member.createdAt || '--'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Database statistics footer */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-4">
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="h-3.5 w-3.5 text-indigo-500" />
              系統管理提示：上線人數採用15分鐘滑動視窗(Sliding Window)統計活躍令牌活動。
            </span>
            <span className="font-extrabold text-slate-650">
              顯示 {filteredMembers.length} / {totalUsers} 位使用者
            </span>
          </div>
        </div>

        {/* 家庭留存分析區塊 */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mr-auto">
              <Award className="h-4.5 w-4.5 text-amber-650" />
              家庭方案使用留存統計 (Family Retention Analysis)
            </h3>
            
            <div className="flex gap-4 text-[10px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                活躍中 ({stats?.families?.filter(f => f.retentionStatus === '🟢 活躍中').length || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                閒置中 ({stats?.families?.filter(f => f.retentionStatus === '🟡 閒置中').length || 0})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                已流失 ({stats?.families?.filter(f => f.retentionStatus === '🔴 已流失').length || 0})
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <th className="py-3 px-4">家庭名稱 (Family Name)</th>
                  <th className="py-3 px-4">暱稱 (Nickname)</th>
                  <th className="py-3 px-4">成員數 (Members)</th>
                  <th className="py-3 px-4">成長積分 (Growth)</th>
                  <th className="py-3 px-4">註冊時間 (Created At)</th>
                  <th className="py-3 px-4">最後活躍 (Last Active)</th>
                  <th className="py-3 px-4">操作事件數 (Events)</th>
                  <th className="py-3 px-4">使用壽命 (Stay Duration)</th>
                  <th className="py-3 px-4 text-right">留存狀態 (Status)</th>
                </tr>
              </thead>
              <tbody>
                {(!stats?.families || stats.families.length === 0) ? (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-slate-400 text-xs font-bold">
                      尚無家庭專案方案。
                    </td>
                  </tr>
                ) : (
                  stats.families.map((fam) => {
                    const isToday = fam.retentionStatus === '🟢 活躍中';
                    const isIdle = fam.retentionStatus === '🟡 閒置中';

                    return (
                      <tr 
                        key={fam.familyId} 
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-all text-xs font-medium"
                      >
                        <td className="py-3.5 px-4 font-extrabold text-slate-800">
                          {fam.familyName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-650">
                          {fam.familyNickname || '--'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {fam.membersCount} 人
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-600">
                          🪙 {fam.familyGrowthScore?.toLocaleString() || 0}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {fam.createdAt ? new Date(fam.createdAt).toLocaleDateString('zh-TW') : '--'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {fam.lastActiveAt ? new Date(fam.lastActiveAt).toLocaleString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '--'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          {fam.totalEvents} 次
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                            {fam.stayDurationDays} 天
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${
                            isToday 
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                              : isIdle 
                                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}>
                            {fam.retentionStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      ) : (
        <div className="space-y-6 text-left">
          {/* 數據統計與 AI 彙總報告 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 圖表分析卡片 */}
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col gap-6">
              <div className="border-b border-slate-200 pb-2.5">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <PieChart className="h-4.5 w-4.5 text-indigo-650" />
                  意見回饋分佈統計 (Feedback Analytics)
                </h4>
              </div>

              {/* SVG Donut Chart */}
              <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                <div className="relative">
                  <svg width="100%" height="160" viewBox="0 0 200 200" className="mx-auto">
                    <circle cx="100" cy="100" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                    {pSuggestion > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="50"
                        fill="transparent"
                        stroke="#6366f1"
                        strokeWidth="16"
                        strokeDasharray={`${dSuggestion} ${circumference}`}
                        strokeDashoffset={0}
                        transform="rotate(-90 100 100)"
                      />
                    )}
                    {pBug > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="50"
                        fill="transparent"
                        stroke="#f43f5e"
                        strokeWidth="16"
                        strokeDasharray={`${dBug} ${circumference}`}
                        strokeDashoffset={-offsetBug}
                        transform="rotate(-90 100 100)"
                      />
                    )}
                    {pOther > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="50"
                        fill="transparent"
                        stroke="#64748b"
                        strokeWidth="16"
                        strokeDasharray={`${dOther} ${circumference}`}
                        strokeDashoffset={-offsetOther}
                        transform="rotate(-90 100 100)"
                      />
                    )}
                    <text x="100" y="95" textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold fill-slate-400">總回饋</text>
                    <text x="100" y="118" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-black fill-slate-800">{totalFb}</text>
                  </svg>
                </div>

                {/* Category Legend */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">問題類型</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                        💡 功能建議
                      </span>
                      <span className="text-slate-550 font-mono font-bold">{suggestionCount} 件 ({totalFb > 0 ? Math.round(pSuggestion * 100) : 0}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                        🐞 問題回報
                      </span>
                      <span className="text-slate-550 font-mono font-bold">{bugCount} 件 ({totalFb > 0 ? Math.round(pBug * 100) : 0}%)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="w-3 h-3 rounded-full bg-slate-500"></span>
                        ❓ 其他意見
                      </span>
                      <span className="text-slate-550 font-mono font-bold">{otherCount} 件 ({totalFb > 0 ? Math.round(pOther * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Horizontal Status Bar Chart */}
              <div className="space-y-3.5 border-t border-slate-200/60 pt-5">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">處理進度狀態</h5>
                <div className="h-5 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner border border-slate-300">
                  {pendingFb > 0 && (
                    <div style={{ width: `${pPending}%` }} className="bg-amber-500 h-full transition-all duration-300 hover:opacity-90 relative group flex items-center justify-center text-[10px] font-black text-white" title={`待處理: ${pendingFb} 件`}>
                      {pPending > 12 && `${Math.round(pPending)}%`}
                    </div>
                  )}
                  {activeFb > 0 && (
                    <div style={{ width: `${pActive}%` }} className="bg-sky-500 h-full transition-all duration-300 hover:opacity-90 relative group flex items-center justify-center text-[10px] font-black text-white" title={`處理中: ${activeFb} 件`}>
                      {pActive > 12 && `${Math.round(pActive)}%`}
                    </div>
                  )}
                  {solvedFb > 0 && (
                    <div style={{ width: `${pSolved}%` }} className="bg-emerald-500 h-full transition-all duration-300 hover:opacity-90 relative group flex items-center justify-center text-[10px] font-black text-white" title={`已解決: ${solvedFb} 件`}>
                      {pSolved > 12 && `${Math.round(pSolved)}%`}
                    </div>
                  )}
                </div>
                
                {/* Status Legend */}
                <div className="flex gap-4 justify-around text-[10px] font-bold text-slate-500 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span>待處理 ({pendingFb})</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-500"></span>處理中 ({activeFb})</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span>已解決 ({solvedFb})</span>
                </div>
              </div>
            </div>

            {/* AI 彙總報告卡片 */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5 mb-4">
                  <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-violet-650" />
                    AI 彙總問題回饋報告 (Daily Summary Report)
                  </h4>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={generatingSummary}
                    className="flex items-center gap-1 px-3 py-1 bg-violet-650 hover:bg-violet-700 text-white rounded-lg border border-violet-500/20 text-[10px] font-black transition-all active:scale-95 disabled:opacity-50"
                  >
                    {generatingSummary ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    立即更新報告
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto pr-1 bg-slate-50/50 p-4 rounded-xl border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {loadingSummaries ? (
                    <div className="py-12 text-center text-slate-550 text-xs font-bold flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      正在加載歷史報告...
                    </div>
                  ) : summaries.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-bold flex flex-col items-center justify-center gap-2">
                      <span>📭 目前尚無自動彙總報告。</span>
                      <button
                        onClick={handleGenerateSummary}
                        className="text-xs text-indigo-600 hover:underline mt-1.5 font-bold"
                      >
                        點選「立即更新報告」手動建立首份彙整。
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-700">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-2 border-b border-dashed border-slate-200 pb-1.5">
                        <span>報告建立於: {new Date(summaries[0].createdAt).toLocaleString('zh-TW')}</span>
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 rounded font-black">報告日期: {summaries[0].reportDate}</span>
                      </div>
                      {renderMarkdown(summaries[0].content)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-[10px] text-slate-400 font-bold mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span>* 每天晚上 08:00 (20:00) 系統亦會自動執行例行統計彙總。</span>
                {summaries.length > 1 && (
                  <span className="text-slate-500">歷史報告累計: {summaries.length} 份</span>
                )}
              </div>
            </div>
          </div>

          {/* Feedbacks List Section */}
          <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mr-auto">
                <MessageSquare className="h-4.5 w-4.5 text-violet-655" />
                用戶意見回饋列表 (User Feedbacks List)
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {/* Category Filter */}
                <select
                  value={feedbackCategoryFilter}
                  onChange={(e) => setFeedbackCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-semibold"
                >
                  <option value="all">所有類別 (All Categories)</option>
                  <option value="功能建議">💡 功能建議 (Suggestions)</option>
                  <option value="問題回報">🐞 問題回報 (Bugs)</option>
                  <option value="其他">❓ 其他 (Others)</option>
                </select>

                {/* Status Filter */}
                <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-100 w-full sm:w-auto justify-around">
                  {['all', '待處理', '處理中', '已解決'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFeedbackFilter(status)}
                      className={`px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider ${
                        feedbackFilter === status 
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-150' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {status === 'all' ? '全部' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loadingFeedbacks ? (
              <div className="py-12 text-center text-slate-500 text-xs font-bold">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                正在載入回饋列表...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                📭 目前尚無任何用戶意見回饋。
              </div>
            ) : feedbacks.filter(f => (feedbackFilter === 'all' || f.status === feedbackFilter) && (feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter)).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-bold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                📭 沒有符合篩選條件的意見回饋。
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {feedbacks
                  .filter(f => (feedbackFilter === 'all' || f.status === feedbackFilter) && (feedbackCategoryFilter === 'all' || f.category === feedbackCategoryFilter))
                  .map((f) => {
                    const isPending = f.status === '待處理';
                    const isProcessing = f.status === '處理中';
                    const isSolved = f.status === '已解決';

                    return (
                      <div key={f.id} className="p-5 border border-slate-200/80 rounded-2xl bg-white hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between gap-4">
                        <div className="space-y-3 flex-1 min-w-0">
                          {/* Top Badges & Time */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider ${
                              f.category === '功能建議' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                              f.category === '問題回報' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                              'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              {f.category === '功能建議' ? '💡 功能建議' : f.category === '問題回報' ? '🐞 問題回報' : '❓ 其他'}
                            </span>
                            
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider ${
                              isPending ? 'bg-amber-50 border-amber-200 text-amber-700' :
                              isProcessing ? 'bg-sky-50 border-sky-200 text-sky-700' :
                              'bg-emerald-50 border-emerald-200 text-emerald-700'
                            }`}>
                              {f.status}
                            </span>

                            <span className="text-[10px] text-slate-400 font-mono font-medium">
                              {new Date(f.createdAt).toLocaleString(language === 'en' ? 'en-US' : 'zh-TW')}
                            </span>
                          </div>

                          {/* Content Description */}
                          <p className="text-xs text-slate-700 font-bold whitespace-pre-wrap leading-relaxed select-all">
                            {f.content}
                          </p>

                          {/* Sender / Family Metadata */}
                          <div className="flex items-center gap-4 text-[10px] text-slate-500 font-semibold flex-wrap bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div>
                              <span>送出者: </span>
                              <strong className="text-slate-700">{f.name}</strong>
                            </div>
                            <div>
                              <span>信箱: </span>
                              <a href={`mailto:${f.email}`} className="text-indigo-650 hover:underline font-bold select-all">{f.email}</a>
                            </div>
                            {f.familyName && (
                              <div>
                                <span>家庭方案: </span>
                                <strong className="text-slate-700">{f.familyName}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex sm:flex-col justify-start sm:justify-center items-center sm:items-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          {isPending && (
                            <button
                              onClick={() => handleUpdateStatus(f.id, '處理中')}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-95 w-full sm:w-28 text-center"
                            >
                              ⚙️ 標記為處理中
                            </button>
                          )}
                          {(isPending || isProcessing) && (
                            <button
                              onClick={() => handleUpdateStatus(f.id, '已解決')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-95 w-full sm:w-28 text-center"
                            >
                              ✓ 標記為已解決
                            </button>
                          )}
                          {isSolved && (
                            <button
                              onClick={() => handleUpdateStatus(f.id, '待處理')}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-95 w-full sm:w-28 text-center"
                            >
                              ↩ 退回為待處理
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteFeedback(f.id)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black border border-rose-200 transition-all active:scale-95 w-full sm:w-28 text-center flex items-center justify-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            刪除回饋
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
