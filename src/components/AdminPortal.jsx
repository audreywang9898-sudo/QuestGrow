import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useLanguage } from './LanguageContext';
import Avatar from './Avatar';
import { 
  Users, UserCheck, RefreshCw, Search, Award, 
  ShieldAlert, Info, MessageSquare, Trash2, Mail
} from 'lucide-react';

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

  const handleRefreshAll = async () => {
    setError('');
    setRefreshSpin(true);
    await Promise.all([fetchStats(), fetchFeedbacks()]);
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
  
  // Count unique families
  const uniqueFamilies = new Set(stats?.members?.map(m => m.familyId).filter(Boolean));
  const totalFamilies = uniqueFamilies.size;

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Online Users */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              上線人數 (ONLINE NOW)
            </div>
            <div className="text-3xl font-black text-slate-900">{onlineCount}</div>
            <div className="text-[10px] text-slate-500 font-semibold">15分鐘內有活動之使用者數</div>
          </div>
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-650 border border-emerald-100 shadow-inner">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Registered Members */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">
              註冊會員總數 (TOTAL MEMBERS)
            </div>
            <div className="text-3xl font-black text-slate-900">{totalUsers}</div>
            <div className="text-[10px] text-slate-500 font-semibold">包含家長與兒童帳號</div>
          </div>
          <div className="p-4 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Families Count */}
        <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-amber-700 font-black uppercase tracking-wider">
              家庭方案數 (TOTAL FAMILIES)
            </div>
            <div className="text-3xl font-black text-slate-900">{totalFamilies}</div>
            <div className="text-[10px] text-slate-500 font-semibold">已啟用的家庭專案方案</div>
          </div>
          <div className="p-4 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-inner">
            <Award className="h-6 w-6" />
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
      ) : (
        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-6 animate-success text-left">
          {/* 意見回饋管理面版 (User Feedbacks Panel) */}
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mr-auto">
              <MessageSquare className="h-4.5 w-4.5 text-violet-650" />
              用戶意見回饋管理 (User Feedbacks Panel)
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

          {/* Feedbacks List */}
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
                            className="px-3 py-1.5 bg-sky-650 hover:bg-sky-700 text-white rounded-lg text-[10px] font-black shadow-sm transition-all active:scale-95 w-full sm:w-28 text-center"
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
      )}
    </div>
  );
}

export default AdminPortal;
