import React from 'react';
import { Trophy, Users, Crown, Star, Flame } from 'lucide-react';

export function FamilyLeaderboardView({ leaderboardData = [], familyNickname, t, language }) {
  const sortedData = [...leaderboardData].sort((a, b) => b.growthScore - a.growthScore);
  const top3 = sortedData.slice(0, 3);
  const remaining = sortedData.slice(3);

  // Podium order: 2nd (left), 1st (center), 3rd (right) on desktop
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  const getPodiumConfig = (originalIdx) => {
    if (originalIdx === 0) return {
      rank: 1,
      emoji: '🥇',
      gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
      border: 'rgba(245,158,11,0.35)',
      topBar: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)',
      glow: 'rgba(245,158,11,0.2)',
      badgeBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      badgeText: '#451a03',
      scoreColor: '#d97706',
      iconBg: 'linear-gradient(135deg, #fef3c7, #fde68a)',
      podiumH: 'h-20',
      scale: 'md:scale-110 z-10',
      crownColor: '#f59e0b',
    };
    if (originalIdx === 1) return {
      rank: 2,
      emoji: '🥈',
      gradient: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      border: 'rgba(148,163,184,0.35)',
      topBar: 'linear-gradient(90deg, #94a3b8, #cbd5e1, #94a3b8)',
      glow: 'rgba(148,163,184,0.15)',
      badgeBg: 'linear-gradient(135deg, #94a3b8, #cbd5e1)',
      badgeText: '#1e293b',
      scoreColor: '#475569',
      iconBg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
      podiumH: 'h-14',
      scale: '',
      crownColor: '#94a3b8',
    };
    return {
      rank: 3,
      emoji: '🥉',
      gradient: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
      border: 'rgba(249,115,22,0.3)',
      topBar: 'linear-gradient(90deg, #f97316, #fb923c, #f97316)',
      glow: 'rgba(249,115,22,0.12)',
      badgeBg: 'linear-gradient(135deg, #f97316, #fb923c)',
      badgeText: '#fff',
      scoreColor: '#ea580c',
      iconBg: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
      podiumH: 'h-10',
      scale: '',
      crownColor: '#f97316',
    };
  };

  return (
    <div className="space-y-5 animate-success">

      {/* ── Hero Banner ── */}
      <div className="leaderboard-hero-banner flex items-center gap-4 px-5 py-4 rounded-2xl relative overflow-hidden">
        {/* bg orbs */}
        <div className="absolute right-0 top-0 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #fbbf24, transparent)', transform: 'translate(35%, -35%)' }} />
        <div className="absolute right-12 bottom-0 w-24 h-24 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', transform: 'translateY(40%)' }} />

        {/* Trophy icon */}
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', boxShadow: '0 4px 16px rgba(245,158,11,0.45)' }}>
            <Trophy className="h-7 w-7 text-white drop-shadow" />
          </div>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black tracking-wide" style={{ color: '#1e293b', lineHeight: 1.2 }}>
            {t('leaderboardTitle')}
          </h2>
          <p className="text-sm font-semibold mt-0.5" style={{ color: '#f59e0b' }}>
            {language === 'zh' ? `共 ${sortedData.length} 個冒險家庭參賽` : `${sortedData.length} families competing`}
          </p>
        </div>

        {/* My family chip */}
        {familyNickname && (
          <div className="hidden sm:flex flex-shrink-0 items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1.5px solid rgba(99,102,241,0.2)' }}>
            <Users className="h-4 w-4 flex-shrink-0" style={{ color: '#6366f1' }} />
            <div className="text-xs">
              <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#6366f1' }}>{t('familyNicknameLabel')}</div>
              <div className="font-black text-sm" style={{ color: '#1e293b' }}>{familyNickname}</div>
            </div>
          </div>
        )}
      </div>

      {sortedData.length === 0 ? (
        <div className="leaderboard-empty p-14 text-center flex flex-col items-center gap-3 rounded-2xl">
          <span className="text-6xl opacity-40">🏆</span>
          <p className="text-sm font-bold text-slate-500">{t('leaderboardNoData')}</p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* ── Top 3 Podium ── */}
          {top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-2">
              {podiumOrder.map((family) => {
                if (!family) return null;
                const originalIdx = top3.indexOf(family);
                const cfg = getPodiumConfig(originalIdx);
                const isCurrent = family.familyNickname === familyNickname;
                const displayName = family.familyNickname || family.name;

                return (
                  <div
                    key={family.id}
                    className={`relative rounded-2xl overflow-hidden flex flex-col items-center transition-all duration-300 hover:scale-[1.03] cursor-default ${cfg.scale} ${
                      originalIdx === 0 ? 'order-1 md:order-2' : originalIdx === 1 ? 'order-2 md:order-1' : 'order-3'
                    }`}
                    style={{
                      background: isCurrent ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : cfg.gradient,
                      border: `2px solid ${isCurrent ? 'rgba(16,185,129,0.5)' : cfg.border}`,
                      boxShadow: isCurrent
                        ? '0 8px 32px rgba(16,185,129,0.2), 0 2px 8px rgba(0,0,0,0.04)'
                        : `0 8px 32px ${cfg.glow}, 0 2px 8px rgba(0,0,0,0.04)`,
                    }}
                  >
                    {/* Top color bar */}
                    <div className="h-2 w-full" style={{ background: isCurrent ? 'linear-gradient(90deg, #10b981, #34d399, #10b981)' : cfg.topBar }} />

                    <div className="p-5 flex flex-col items-center gap-3 w-full">
                      {/* Castle + rank badge */}
                      <div className="relative mt-1">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: isCurrent ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : cfg.iconBg, border: `2px solid ${isCurrent ? 'rgba(16,185,129,0.3)' : cfg.border}` }}>
                          <span className="text-3xl select-none">🏰</span>
                        </div>
                        <div
                          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg"
                          style={{ background: isCurrent ? 'linear-gradient(135deg, #10b981, #059669)' : cfg.badgeBg, color: isCurrent ? '#fff' : cfg.badgeText }}
                        >
                          {cfg.rank === 1 ? <Crown className="h-4 w-4" /> : cfg.rank}
                        </div>
                      </div>

                      {/* Name */}
                      <div className="text-center space-y-1">
                        <h4 className="text-sm font-black truncate max-w-[140px]" style={{ color: '#1e293b' }}>
                          {displayName}
                        </h4>
                        {isCurrent && (
                          <span className="inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}>
                            {language === 'zh' ? '我的家庭 ✨' : 'My Family ✨'}
                          </span>
                        )}
                      </div>

                      {/* Score */}
                      <div className="text-center">
                        <div className="text-2xl font-black flex items-center justify-center gap-1.5" style={{ color: isCurrent ? '#059669' : cfg.scoreColor }}>
                          🪙 <span>{family.growthScore.toLocaleString()}</span>
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#94a3b8' }}>
                          {t('leaderboardScore')}
                        </div>
                      </div>
                    </div>

                    {/* Rank emoji watermark */}
                    <div className="absolute top-3 left-3 text-2xl opacity-20 select-none pointer-events-none">{cfg.emoji}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Remaining Families (Card List) ── */}
          {remaining.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1 pb-1">
                <Flame className="h-4 w-4" style={{ color: '#6366f1' }} />
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#6366f1' }}>
                  {language === 'zh' ? '其他冒險家庭' : 'Other Families'}
                </span>
              </div>
              {remaining.map((family, idx) => {
                const rank = idx + 4;
                const isCurrent = family.familyNickname === familyNickname;
                const displayName = family.familyNickname || family.name;

                return (
                  <div
                    key={family.id}
                    className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                    style={{
                      background: isCurrent
                        ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                        : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      border: `1.5px solid ${isCurrent ? 'rgba(16,185,129,0.35)' : 'rgba(226,232,240,0.8)'}`,
                      boxShadow: isCurrent
                        ? '0 2px 12px rgba(16,185,129,0.12)'
                        : '0 1px 4px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Rank number */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black" style={{
                      background: isCurrent ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                      color: isCurrent ? '#fff' : '#64748b',
                    }}>
                      {rank}
                    </div>

                    {/* Castle + name */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-xl select-none">🏰</span>
                      <span className="font-black text-sm truncate" style={{ color: '#1e293b' }}>{displayName}</span>
                      {isCurrent && (
                        <span className="flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full uppercase" style={{ background: 'rgba(16,185,129,0.15)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)' }}>
                          {language === 'zh' ? '我們' : 'Us'}
                        </span>
                      )}
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-sm font-black flex items-center gap-1" style={{ color: isCurrent ? '#059669' : '#334155' }}>
                      🪙 {family.growthScore.toLocaleString()}
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

export default FamilyLeaderboardView;
