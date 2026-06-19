import React from 'react';
import { Trophy, Users, Award, ShieldAlert } from 'lucide-react';

export function FamilyLeaderboardView({ leaderboardData = [], familyNickname, t, language }) {
  // Sort the leaderboard data descending by growthScore just in case
  const sortedData = [...leaderboardData].sort((a, b) => b.growthScore - a.growthScore);

  // Split into Top 3 and the rest
  const top3 = sortedData.slice(0, 3);
  const remaining = sortedData.slice(3);

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  };

  const getPodiumStyles = (index) => {
    if (index === 0) {
      return {
        cardClass: 'border-amber-400 bg-amber-500/5 shadow-[0_0_20px_rgba(251,191,36,0.15)] order-1 md:order-2 md:scale-105 z-10',
        badgeClass: 'bg-amber-400 text-slate-950 font-black',
        textClass: 'text-amber-400',
        podiumHeight: 'h-32 bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-amber-500/30'
      };
    }
    if (index === 1) {
      return {
        cardClass: 'border-slate-350 bg-slate-400/5 shadow-[0_0_15px_rgba(203,213,225,0.1)] order-2 md:order-1',
        badgeClass: 'bg-slate-300 text-slate-950 font-black',
        textClass: 'text-slate-300',
        podiumHeight: 'h-24 bg-gradient-to-t from-slate-400/25 to-slate-400/5 border-slate-400/30'
      };
    }
    return {
      cardClass: 'border-amber-600 bg-amber-700/5 shadow-[0_0_15px_rgba(180,83,9,0.1)] order-3',
      badgeClass: 'bg-amber-600 text-white font-black',
      textClass: 'text-amber-600',
      podiumHeight: 'h-20 bg-gradient-to-t from-amber-700/25 to-amber-700/5 border-amber-700/30'
    };
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-slate-900 to-indigo-950/20 border-white/10">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-100 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-400 animate-bounce-gentle" />
            {t('leaderboardTitle')}
          </h2>
          <p className="text-xs text-slate-400">
            {t('leaderboardDesc')}
          </p>
        </div>
        {familyNickname && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 px-4 py-2 rounded-xl flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-400 animate-pulse" />
            <div className="text-xs">
              <span className="text-slate-400 block text-[9px] font-bold uppercase tracking-wider">{t('familyNicknameLabel')}</span>
              <span className="text-slate-200 font-extrabold text-sm">{familyNickname}</span>
            </div>
          </div>
        )}
      </div>

      {sortedData.length === 0 ? (
        <div className="glass-panel p-12 text-center text-slate-500 text-sm">
          <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          {t('leaderboardNoData')}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
              {/* If on desktop, we render 2nd, 1st, 3rd. Otherwise 1st, 2nd, 3rd */}
              {top3.map((family, idx) => {
                const styles = getPodiumStyles(idx);
                const isCurrent = family.familyNickname === familyNickname;
                const displayName = family.familyNickname || family.name;

                return (
                  <div 
                    key={family.id} 
                    className={`glass-panel p-5 border flex flex-col items-center justify-between text-center gap-4 transition-all duration-300 transform hover:scale-[1.03] ${styles.cardClass} ${
                      isCurrent ? 'ring-2 ring-[#00E676] bg-[#00E676]/5 border-[#00E676]' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="relative">
                        <span className="text-5xl block select-none">🏰</span>
                        <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-md border border-slate-900 ${styles.badgeClass}`}>
                          {getRankEmoji(idx)}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-100 truncate max-w-[160px]">
                          {displayName}
                        </h4>
                        {isCurrent && (
                          <span className="inline-block bg-[#00E676] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                            {language === 'zh' ? '我們的家庭' : 'My Family'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="w-full">
                      <div className={`text-xl font-black ${styles.textClass}`}>
                        🪙 {family.growthScore.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {t('leaderboardScore')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Remaining families list */}
          {remaining.length > 0 && (
            <div className="glass-panel overflow-hidden border-white/5 bg-slate-950/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold bg-white/5">
                      <th className="py-3.5 px-6 w-20 text-center">{t('leaderboardRank')}</th>
                      <th className="py-3.5 px-6">{t('leaderboardFamily')}</th>
                      <th className="py-3.5 px-6 text-right pr-8">{t('leaderboardScore')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {remaining.map((family, idx) => {
                      const rank = idx + 4;
                      const isCurrent = family.familyNickname === familyNickname;
                      const displayName = family.familyNickname || family.name;

                      return (
                        <tr 
                          key={family.id} 
                          className={`hover:bg-white/5 transition-colors ${
                            isCurrent ? 'bg-[#00E676]/5 text-white font-bold border-l-4 border-l-[#00E676]' : 'text-slate-300'
                          }`}
                        >
                          <td className="py-3.5 px-6 text-center font-black text-slate-400 text-sm">
                            {rank}
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🏰</span>
                              <span className="font-extrabold text-sm">{displayName}</span>
                              {isCurrent && (
                                <span className="bg-[#00E676] text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider ml-1.5 shrink-0">
                                  {language === 'zh' ? '我們' : 'Us'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-6 text-right pr-8 text-sm font-black text-slate-100">
                            🪙 {family.growthScore.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FamilyLeaderboardView;
