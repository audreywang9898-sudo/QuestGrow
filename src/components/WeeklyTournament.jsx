import React from 'react';
import { Trophy, Swords, Flame, Skull, Sparkles, BookOpen } from 'lucide-react';

function WeeklyTournament({ competitionData, balancedIndex }) {
  const getFadingGlow = (index) => {
    if (index >= 80) return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
    if (index >= 50) return 'border-amber-500/30 bg-amber-500/5 text-amber-400';
    return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
  };

  return (
    <div className="space-y-6 animate-success">
      {/* Header Banner */}
      <div className="glass-panel p-6 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-3 rounded-2xl border border-amber-500/40">
            <Trophy className="h-10 w-10 text-amber-400 animate-float" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-amber-300 tracking-wider">
              每週競賽大會 (Weekly Tournament)
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              競賽時間週期：<span className="text-slate-200 font-semibold">{competitionData.weekRange}</span>
            </p>
          </div>
        </div>

        {/* Current Title Card */}
        <div className="glass-panel px-6 py-3 border border-indigo-500/30 bg-indigo-500/5 flex flex-col items-center md:items-end">
          <span className="text-xs text-indigo-700 font-bold uppercase tracking-widest">本週解鎖家庭稱號</span>
          <span className="text-xl font-extrabold text-indigo-900 mt-1 flex items-center gap-1.5 glow-creativity">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            {competitionData.familyTitle}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Leaderboards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3">
              <Swords className="h-5 w-5 text-rose-400" />
              本週榮譽英雄榜
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Task Count Champion */}
              <div className="glass-panel p-4 border-white/5 bg-white/5 hover:border-amber-500/20 transition-colors flex items-center gap-3">
                <div className="bg-amber-500/10 p-2 rounded-xl text-amber-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">🏆 本週任務冠軍</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{competitionData.champions.taskCount}</div>
                </div>
              </div>

              {/* Growth Champion */}
              <div className="glass-panel p-4 border-white/5 bg-white/5 hover:border-cyan-500/20 transition-colors flex items-center gap-3">
                <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400">
                  <Flame className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">⚡ 本週成長冠軍</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{competitionData.champions.growthRate}</div>
                </div>
              </div>

              {/* Courage Star */}
              <div className="glass-panel p-4 border-white/5 bg-white/5 hover:border-orange-500/20 transition-colors flex items-center gap-3">
                <div className="bg-orange-500/10 p-2 rounded-xl text-orange-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">🏹 本週勇氣之星</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{competitionData.champions.courage}</div>
                </div>
              </div>

              {/* Creativity Star */}
              <div className="glass-panel p-4 border-white/5 bg-white/5 hover:border-purple-500/20 transition-colors flex items-center gap-3">
                <div className="bg-purple-500/10 p-2 rounded-xl text-purple-400">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">🎨 本週創意之星</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">{competitionData.champions.creativity}</div>
                </div>
              </div>

            </div>
          </div>

          {/* Balanced Development Panel */}
          <div className="glass-panel p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                全人均衡發展指數 (Balanced Index)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                德智體群美五大成長面向完成率。鼓勵孩子均衡發展，拒絕偏科！
              </p>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${getFadingGlow(balancedIndex)}`}>
              <div className="space-y-1">
                <div className="text-sm font-bold">目前本週均衡指數: {balancedIndex} 分</div>
                <div className="text-xs opacity-85 max-w-md">
                  {balancedIndex === 100 && "太棒了！全人教育五大面向（德、智、體、群、美）本週全部達標，獲得完美成長！"}
                  {balancedIndex >= 60 && balancedIndex < 100 && "很不錯，孩子在本週完成了多數領域的挑戰，繼續朝著全方位前進！"}
                  {balancedIndex < 60 && "提醒：目前完成的面向較為單一，建議多挑戰一些其他面向的任務，以達到均衡發展。"}
                </div>
              </div>
              <div className="flex gap-1">
                {['德', '智', '體', '群', '美'].map((item, idx) => {
                  const isActive = balancedIndex > (idx * 20);
                  const activeColorMap = {
                    '智': 'text-[#0284c7] border-[#0284c7]/40 bg-[#0284c7]/20',
                    '德': 'text-[#16a34a] border-[#16a34a]/40 bg-[#16a34a]/20',
                    '體': 'text-[#ea580c] border-[#ea580c]/40 bg-[#ea580c]/20',
                    '群': 'text-[#db2777] border-[#db2777]/40 bg-[#db2777]/20',
                    '美': 'text-[#7c3aed] border-[#7c3aed]/40 bg-[#7c3aed]/20'
                  };
                  return (
                    <span 
                      key={idx}
                      className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                        isActive 
                          ? activeColorMap[item] || 'bg-emerald-500/25 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: MVP & Devil Quests */}
        <div className="space-y-6">
          
          {/* MVP Task Card */}
          <div className="glass-panel p-6 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent space-y-4">
            <h3 className="text-md font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-5 w-5" />
              本週 MVP 任務 (完成率最高)
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-100">{competitionData.mvpTask}</p>
              <div className="text-xs text-slate-400 leading-relaxed">
                全家人積極度最高、完成速度最快的任務。代表這類生活常規或學習項目已經完美融入孩子的日常習慣中！
              </div>
              <span className="inline-block px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 rounded-md">
                🏆 常規養成楷模
              </span>
            </div>
          </div>

          {/* Devil Task Card */}
          <div className="glass-panel p-6 border border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent space-y-4">
            <h3 className="text-md font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Skull className="h-5 w-5 animate-pulse" />
              本週 魔王任務 (完成率最低)
            </h3>
            <div className="space-y-2">
              <p className="text-lg font-bold text-slate-100">{competitionData.devilTask}</p>
              <div className="text-xs text-slate-400 leading-relaxed">
                本週遇到阻力最大、或是最容易被拖延的任務。建議家長本週協同孩子一起進行，或調整任務細項降低難度。
              </div>
              <span className="inline-block px-2.5 py-1 text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-md">
                ⚔️ 期待破關突破
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default WeeklyTournament;
