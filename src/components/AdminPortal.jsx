import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useLanguage } from './LanguageContext';
import Avatar from './Avatar';
import { 
  Users, UserCheck, RefreshCw, Search, Award, 
  ShieldAlert, Sparkles, BookOpen, Compass, Shield, 
  Heart, ShieldAlert as AdminIcon, ArrowRightLeft, Info
} from 'lucide-react';

function AdminPortal({ currentUser, onLogout }) {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [refreshSpin, setRefreshSpin] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    setRefreshSpin(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message || '無法取得系統管理數據，請重試。');
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshSpin(false), 500);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-slate-400">正在載入系統管理數據...</p>
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
    <div className="space-y-6 animate-success text-[#D1D5DB]">
      
      {/* Admin Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900/40 to-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-rose-500/20 text-rose-450 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
              🛡️ SYSTEM ADMINISTRATOR
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            管理員控制台 (Admin Console)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            歡迎回來，{currentUser.name}！此處可監控全平台家庭方案及上線人數。
          </p>
        </div>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white rounded-lg border border-indigo-500/30 shadow-md font-bold text-xs transition-all active:scale-95 shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${refreshSpin ? 'animate-spin' : ''}`} />
          刷新數據 (Refresh)
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/25 p-4 rounded-xl flex items-center gap-3 text-xs text-rose-400 font-bold shadow-sm animate-success">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Online Users */}
        <div className="glass-panel p-6 border-white/5 bg-gradient-to-tr from-[#162a45]/30 to-[#0e1726]/50 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              上線人數 (ONLINE NOW)
            </div>
            <div className="text-3xl font-black text-white">{onlineCount}</div>
            <div className="text-[10px] text-slate-500">15分鐘內有活動之使用者數</div>
          </div>
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Registered Members */}
        <div className="glass-panel p-6 border-white/5 bg-gradient-to-tr from-[#2d1b4e]/30 to-[#0e1726]/50 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-indigo-400 font-black uppercase tracking-wider">
              註冊會員總數 (TOTAL MEMBERS)
            </div>
            <div className="text-3xl font-black text-white">{totalUsers}</div>
            <div className="text-[10px] text-slate-500">包含家長與兒童帳號</div>
          </div>
          <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Families Count */}
        <div className="glass-panel p-6 border-white/5 bg-gradient-to-tr from-[#4a2e1b]/30 to-[#0e1726]/50 flex items-center justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-1">
            <div className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
              家庭方案數 (TOTAL FAMILIES)
            </div>
            <div className="text-3xl font-black text-white">{totalFamilies}</div>
            <div className="text-[10px] text-slate-500">已啟用的家庭專案方案</div>
          </div>
          <div className="p-4 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Stats Panel */}
      <div className="glass-panel p-6 border-white/5 space-y-6">
        
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-white/5 pb-4">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest flex items-center gap-2 mr-auto">
            <Users className="h-4.5 w-4.5 text-indigo-400" />
            會員與方案總覽 (Members & Plans Directory)
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-500" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋姓名、Email、家庭..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex border border-white/10 rounded-lg p-0.5 bg-slate-950 w-full sm:w-auto justify-around">
              {['all', 'admin', 'parent', 'kid'].map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-3 py-1 text-[10px] font-black rounded-md transition-all uppercase tracking-wider ${
                    roleFilter === role 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200'
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
              <tr className="border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
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
                  <td colSpan="7" className="py-8 text-center text-slate-500 text-xs font-bold">
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
                      className="border-b border-white/5 hover:bg-white/5 transition-all text-xs"
                    >
                      {/* Avatar and Name */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <Avatar 
                          avatar={member.userAvatar} 
                          role={member.role}
                          className="w-7 h-7 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden" 
                        />
                        <span className="font-extrabold text-slate-250">{member.userName}</span>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 select-all">
                        {member.email}
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-wider ${
                          isAdmin 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : isParent 
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {isAdmin ? '系統管理員' : isParent ? '家長' : '兒童'}
                        </span>
                      </td>

                      {/* Family Plan */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-200">{member.familyName || '未知家庭'}</div>
                        <div className="text-[9px] text-slate-500 font-mono">Plan ID: {member.familyId || 'N/A'}</div>
                      </td>

                      {/* Family Growth Score */}
                      <td className="py-3.5 px-4">
                        {member.familyName ? (
                          <span className="text-amber-400 font-black flex items-center gap-1">
                            🪙 {member.familyGrowthScore?.toLocaleString()}
                          </span>
                        ) : '--'}
                      </td>

                      {/* RPG Character Info (Kid only) */}
                      <td className="py-3.5 px-4 text-slate-350">
                        {isKid && member.childProfileId ? (
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold text-violet-400">
                              LV.{member.childLevel} | {member.childJobClass}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      {/* Date joined */}
                      <td className="py-3.5 px-4 text-right text-slate-400 font-semibold font-mono">
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
        <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-4">
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" />
            系統管理提示：上線人數採用15分鐘滑動視窗(Sliding Window)統計活躍令牌活動。
          </span>
          <span>
            顯示 {filteredMembers.length} / {totalUsers} 位使用者
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminPortal;
