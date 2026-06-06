import React from 'react';

export const renderAvatarContent = (avatar, role) => {
  if (avatar === 'mother' || (role === 'parent' && avatar === 'girl')) {
    return (
      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#E0F2FE"/>
        <path d="M25,50 C25,20 95,20 95,50 C95,65 90,80 85,85 C80,90 40,90 35,85 C30,80 25,65 25,50 Z" fill="#475569"/>
        <circle cx="60" cy="58" r="28" fill="#FDE047"/>
        <path d="M32,45 C40,25 80,25 88,45 C82,32 38,32 32,45 Z" fill="#334155"/>
        <path d="M32,45 C28,52 30,62 30,62 C34,50 42,48 42,48" fill="none" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <path d="M88,45 C92,52 90,62 90,62 C86,50 78,48 78,48" fill="none" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
        <circle cx="50" cy="56" r="3" fill="#1E293B"/>
        <circle cx="70" cy="56" r="3" fill="#1E293B"/>
        <path d="M54,66 Q60,71 66,66" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="44" cy="62" r="3" fill="#F43F5E" opacity="0.4"/>
        <circle cx="76" cy="62" r="3" fill="#F43F5E" opacity="0.4"/>
        <path d="M52,82 L68,82 L68,90 L52,90 Z" fill="#FDE047"/>
        <path d="M35,90 C35,90 40,120 60,120 C80,120 85,90 85,90 Z" fill="#0284C7"/>
      </svg>
    );
  }
  if (avatar === 'father' || (role === 'parent' && avatar === 'boy')) {
    return (
      <svg className="w-full h-full" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="#F0FDF4"/>
        <circle cx="60" cy="58" r="28" fill="#FDE047"/>
        <path d="M32,46 C35,28 85,28 88,46 C80,30 40,30 32,46 Z" fill="#1E293B"/>
        <path d="M32,46 C30,40 38,34 50,34 C60,34 88,38 88,46 Z" fill="#1E293B"/>
        <circle cx="48" cy="56" r="3.5" fill="#1E293B"/>
        <circle cx="72" cy="56" r="3.5" fill="#1E293B"/>
        <path d="M54,68 Q60,72 66,68" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M52,82 L68,82 L68,90 L52,90 Z" fill="#FDE047"/>
        <path d="M35,90 C35,90 40,120 60,120 C80,120 85,90 85,90 Z" fill="#16A34A"/>
      </svg>
    );
  }
  if (avatar === 'girl') {
    return <span className="text-2xl">👧</span>;
  }
  if (avatar === 'boy') {
    return <span className="text-2xl">👦</span>;
  }
  if (avatar && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
    return <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />;
  }
  return <span className="text-2xl">👤</span>;
};

export default function Avatar({ avatar, role, badge, className = "w-12 h-12 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-2xl shadow-md overflow-hidden shrink-0" }) {
  const avatarEl = (
    <div className={className}>
      {renderAvatarContent(avatar, role)}
    </div>
  );

  if (badge) {
    let emoji = '🏅';
    if (badge.includes('persistence') || badge.includes('不屈')) emoji = '✊';
    else if (badge.includes('dragon') || badge.includes('屠龍')) emoji = '🐉';
    else if (badge.includes('companion') || badge.includes('格林')) emoji = '🌟';

    return (
      <div className="relative inline-block shrink-0">
        {avatarEl}
        <div 
          className="absolute -bottom-0.5 -right-0.5 w-[35%] h-[35%] min-w-[14px] min-h-[14px] max-w-[24px] max-h-[24px] bg-[#1B1B1D] border border-amber-400 rounded-full flex items-center justify-center text-[60%] shadow-lg z-10 animate-bounce"
          title={badge}
        >
          {emoji}
        </div>
      </div>
    );
  }

  return avatarEl;
}
