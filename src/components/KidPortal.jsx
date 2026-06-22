import React, { useState } from 'react';
import { GACHA_POOL, TASK_TEMPLATES } from '../utils/mockData';
import { playCoinSound, playGachaShakeSound, playGachaRevealSound, triggerConfetti, playBossBattleSound } from '../utils/sfx';
import { useLanguage } from './LanguageContext';
import Avatar from './Avatar';
import FamilyLeaderboardView from './FamilyLeaderboardView';
import { pinyin } from 'pinyin-pro';
import { pinyinToZhuyin } from 'pinyin-zhuyin';
import { 
  Sparkles, Award, Compass, Shield, BookOpen, Heart, 
  Wallet, Trophy, Send, User, ChevronRight, Package, 
  CheckCircle2, Clock, Ban, Eye, AlertTriangle, Bell, Trash2,
  Camera, Upload, Volume2, VolumeX, ChevronDown
} from 'lucide-react';

const compressImage = (base64Str, maxWidth = 400, maxHeight = 400) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

function KidPortal({ 
  stats, 
  tasks, 
  inventory, 
  wishlist, 
  familyScore,
  familyNickname,
  leaderboardData,
  onSubmitTask, 
  onDrawCard, 
  onRequestRedeem, 
  onConfirmRedeem, 
  balancedIndex,
  onClaimWishlistItem,
  simulatedDate,
  drawnTaskIds = [],
  onUpdateDrawnTasks,
  onUpdateChildProfile,
  currentUser,
  onLinkGoogleAccount,
  onAddTask,
  onEditTask,
  isReadOnly = false,
  googleClientId,
  onToggleEquip,
  onCancelRedeem,
  gachaPool,
  familySettings = { zhuyinUnder8: true },
  onBuyTicketWithGold,
  dailyProverb = {
    contentZh: "千里之行，始於足下。",
    contentEn: "A journey of a thousand miles begins with a single step."
  }
}) {
  const { t, language } = useLanguage();
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

  const renderTextWithZhuyin = (text) => {
    if (!text) return '';
    const zhuyinEnabled = familySettings && familySettings.zhuyinUnder8 !== false;
    if (language !== 'zh' || !stats.age || stats.age >= 8 || !zhuyinEnabled) {
      return text;
    }

    const getTaiwaneseZhuyin = (char, defaultZhuyin, idx, fullText) => {
      if (char === '和') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (
          context.includes('和平') || context.includes('溫和') || 
          context.includes('和諧') || context.includes('和氣') || 
          context.includes('緩和') || context.includes('總和') || 
          context.includes('和睦')
        ) {
          return 'ㄏㄜˊ';
        }
        return 'ㄏㄢˋ';
      }
      if (char === '擊') return 'ㄐㄧˊ';
      if (char === '企') return 'ㄑㄧˋ';
      if (char === '液') return 'ㄧˋ';
      if (char === '微') return 'ㄨㄟˊ';
      if (char === '垃') return 'ㄌㄜˋ';
      if (char === '圾') return 'ㄙㄜˋ';
      if (char === '殼') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('貝殼') || context.includes('腦殼') || context.includes('外殼') || context.includes('蛋殼')) {
          return 'ㄎㄜˊ';
        }
      }
      if (char === '識') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('知識') || context.includes('認識') || context.includes('常識') || context.includes('意識') || context.includes('識別')) {
          return 'ㄕˋ';
        }
      }
      if (char === '期') return 'ㄑㄧˊ';
      if (char === '夾') return 'ㄐㄧㄚˊ';
      if (char === '署') return 'ㄕㄨˋ';
      // Additional common corrections for Taiwanese Mandarin
      if (char === '行') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('銀行') || context.includes('行業') || context.includes('行號') || context.includes('同行')) return 'ㄏㄤˊ';
        return 'ㄒㄧㄥˊ';
      }
      if (char === '的') return 'ㄉㄜ˙';
      if (char === '地') {
        const next = fullText[idx + 1] || '';
        if (/[上下面方]/.test(next) || fullText.slice(Math.max(0, idx-3), idx).includes('目')) return 'ㄉㄧˋ';
        return 'ㄉㄜ˙';
      }
      if (char === '得') return 'ㄉㄜ˙';
      if (char === '了') {
        const next = fullText[idx + 1] || '';
        if (!next || /[！？。，、）]/.test(next)) return 'ㄌㄜ˙';
        return 'ㄌㄧㄠˇ';
      }
      if (char === '著') return 'ㄓㄜ˙';
      if (char === '為') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('因為') || context.includes('認為') || context.includes('以為') || context.includes('行為') || context.includes('成為') || context.includes('為什麼')) return 'ㄨㄟˊ';
        return 'ㄨㄟˋ';
      }
      if (char === '中') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('重中') || context.includes('中獎') || context.includes('中毒') || context.includes('中計')) return 'ㄓㄨㄥˋ';
        return 'ㄓㄨㄥ';
      }
      if (char === '樂') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('音樂') || context.includes('樂器') || context.includes('樂團') || context.includes('樂曲')) return 'ㄩㄝˋ';
        return 'ㄌㄜˋ';
      }
      if (char === '長') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('長大') || context.includes('成長') || context.includes('長高') || context.includes('生長') || context.includes('班長') || context.includes('家長') || context.includes('長輩') || context.includes('組長') || context.includes('隊長')) return 'ㄓㄤˇ';
        return 'ㄔㄤˊ';
      }
      if (char === '好') {
        const next = fullText[idx + 1] || '';
        if (/[學問奇]/.test(next)) return 'ㄏㄠˋ';
        return 'ㄏㄠˇ';
      }
      if (char === '重') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('重新') || context.includes('重做') || context.includes('重複') || context.includes('重來')) return 'ㄔㄨㄥˊ';
        return 'ㄓㄨㄥˋ';
      }
      if (char === '假') {
        const context = fullText.slice(Math.max(0, idx - 2), idx + 3);
        if (context.includes('假期') || context.includes('放假') || context.includes('假日') || context.includes('暑假') || context.includes('寒假')) return 'ㄐㄧㄚˋ';
        return 'ㄐㄧㄚˇ';
      }
      if (char === '存') return 'ㄘㄨㄣˊ';
      if (char === '錢') return 'ㄑㄧㄢˊ';
      if (char === '幣') return 'ㄅㄧˋ';
      if (char === '金') return 'ㄐㄧㄣ';
      if (char === '銀') return 'ㄧㄣˊ';
      if (char === '買') return 'ㄇㄞˇ';
      if (char === '賣') return 'ㄇㄞˋ';
      if (char === '賺') return 'ㄓㄨㄢˋ';
      if (char === '花') return 'ㄏㄨㄚ';
      if (char === '投') return 'ㄊㄡ';
      if (char === '資') return 'ㄗ';
      if (char === '儲') return 'ㄔㄨˊ';
      if (char === '蓄') return 'ㄒㄩˋ';
      if (char === '預') return 'ㄩˋ';
      if (char === '算') return 'ㄙㄨㄢˋ';
      if (char === '消') return 'ㄒㄧㄠ';
      if (char === '費') return 'ㄈㄟˋ';
      if (char === '節') return 'ㄐㄧㄝˊ';
      if (char === '約') return 'ㄩㄝ';
      if (char === '利') return 'ㄌㄧˋ';
      if (char === '息') return 'ㄒㄧ';
      if (char === '本') return 'ㄅㄣˇ';
      return defaultZhuyin;
    };

    const splitZhuyin = (zy) => {
      if (!zy) return { base: '', toneChar: '', toneClass: '1' };
      const toneMap = { 'ˊ': '2', 'ˇ': '3', 'ˋ': '4', '˙': 'neutral' };
      let base = '';
      let toneChar = '';
      let toneClass = '1';
      for (let c of zy) {
        if (toneMap[c] !== undefined) {
          toneChar = c;
          toneClass = toneMap[c];
        } else {
          base += c;
        }
      }
      return { base, toneChar, toneClass };
    };

    try {
      const pinyins = pinyin(text, { type: 'array', toneType: 'num' });
      return (
        <span className="inline-flex flex-wrap items-end leading-relaxed">
          {[...text].map((char, index) => {
            const py = pinyins[index];
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            if (isChinese && py && py !== char) {
              const zyRaw = pinyinToZhuyin(py);
              const zy = getTaiwaneseZhuyin(char, zyRaw, index, text);
              const { base, toneChar, toneClass } = splitZhuyin(zy);
              return (
                <span key={index} className="zhuyin-char-wrap">
                  <span className="zhuyin-char">{char}</span>
                  <span className="zhuyin-annotation">
                    <span className="zhuyin-base">{base}</span>
                    {toneChar && toneClass !== '1' && (
                      <span className={`zhuyin-tone tone-${toneClass}`}>
                        {toneChar}
                      </span>
                    )}
                  </span>
                </span>
              );
            }
            return <span key={index}>{char}</span>;
          })}
        </span>
      );
    } catch (e) {
      console.error('Zhuyin generation error:', e);
      return text;
    }
  };

  const activeBadgeItem = inventory.find(i => i.type === '收藏卡' && i.status === '已使用');
  const activeBadge = activeBadgeItem ? activeBadgeItem.id : null;
  const [activeSubTab, setActiveSubTab] = useState('wishlist');
  const [backpackSortBy, setBackpackSortBy] = useState('default');
  const [backpackFilterType, setBackpackFilterType] = useState('all');

  // Onboarding Tour state
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem('questgrow_kid_tour_seen') !== 'true';
  });
  const [tourStep, setTourStep] = useState(1);

  React.useEffect(() => {
    stopAllSpeech();

    if (!showTour) return;
    if (tourStep === 1) {
      setActiveSubTab('character');
    } else if (tourStep === 2) {
      setActiveSubTab('tasks');
    } else if (tourStep === 3) {
      setActiveSubTab('gacha');
    } else if (tourStep === 4) {
      setActiveSubTab('backpack');
    } else if (tourStep === 5) {
      setActiveSubTab('wishlist');
    }
  }, [tourStep, showTour]);

  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionPhoto, setSubmissionPhoto] = useState('');
  const [photoError, setPhotoError] = useState('');
  
  // V2 Button disabled / loading states
  const [isSubmittingApi, setIsSubmittingApi] = useState(false);
  const [isDrawingGacha, setIsDrawingGacha] = useState(false);

  // Gacha animation states
  const [gachaState, setGachaState] = useState('idle'); // idle, shaking, revealing, shown
  const [drawnCard, setDrawnCard] = useState(null);

  // Gold Vending Machine state
  const [isBuyingTicket, setIsBuyingTicket] = useState(false);

  // Mock Notification Drawer
  const [showNotifications, setShowNotifications] = useState(false);

  // Avatar select states
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(stats.avatar || 'boy');
  const [avatarUploadError, setAvatarUploadError] = useState('');

  // TTS Voice Synthesis States and Functions
  const [speakingTaskId, setSpeakingTaskId] = useState(null);
  const [tourSpeaking, setTourSpeaking] = useState(false);
  const [proverbSpeaking, setProverbSpeaking] = useState(false);
  const isProverbSpeakingRef = React.useRef(false);

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
    setSpeakingTaskId(null);
    setTourSpeaking(false);
    setProverbSpeaking(false);
    isProverbSpeakingRef.current = false;
  };
  const [showCompletedHistory, setShowCompletedHistory] = useState(false);
  const [showBackpackHistory, setShowBackpackHistory] = useState(false);
  const [swappingTaskId, setSwappingTaskId] = useState(null);
  const [selectedGridItem, setSelectedGridItem] = useState(null);

  const handleSpeakTourStep = (stepNum) => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'zh' ? '您的瀏覽器不支援語音播放功能。' : 'Your browser does not support voice playback.');
      return;
    }

    if (tourSpeaking) {
      stopAllSpeech();
      return;
    }

    stopAllSpeech();
    setTourSpeaking(true);

    setTimeout(() => {
      const title = t(`kidTourStep${stepNum}Title`);
      const desc = t(`kidTourStep${stepNum}Desc`);
      
      let textToSpeak = '';
      if (language === 'zh') {
        textToSpeak = `引導教學，第 ${stepNum} 步：${title}。說明：${desc}`;
      } else {
        textToSpeak = `Tutorial guide, step ${stepNum}: ${title}. Description: ${desc}`;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'zh' ? 'zh-TW' : 'en-US';
      utterance.rate = 0.92; // Slightly slower, gentler and sweeter
      utterance.pitch = 1.25; // Higher pitch for a sweeter child/female voice

      // Attempt to select a sweet female/child voice from system voices
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (language === 'zh') {
          const preferredZhNames = ['hanhan', 'yating', 'ting-ting', 'tingting', 'google 國語', 'google 臺灣', 'xiaoxiao', 'hsiaoyu', 'yaoyao', 'mei-jia', 'sin-ji'];
          for (const name of preferredZhNames) {
            const found = voices.find(v => v.name.toLowerCase().includes(name) && (v.lang.includes('zh') || v.lang.includes('zho')));
            if (found) {
              selectedVoice = found;
              break;
            }
          }
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('zh'));
          }
        } else {
          const preferredEnNames = ['zira', 'samantha', 'aria', 'jenny', 'google us english'];
          for (const name of preferredEnNames) {
            const found = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.includes('en'));
            if (found) {
              selectedVoice = found;
              break;
            }
          }
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('en'));
          }
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => {
        setTourSpeaking(false);
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        }
      };

      utterance.onerror = () => {
        setTourSpeaking(false);
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        }
      };

      keepUtteranceAlive(utterance);
      window.speechSynthesis.speak(utterance);
    }, 100);
  };

  const handleSpeak = (item, type = 'task') => {
    if (!('speechSynthesis' in window)) {
      alert(language === 'zh' ? '您的瀏覽器不支援語音播放功能。' : 'Your browser does not support voice playback.');
      return;
    }

    const itemId = item.id || item.inventoryId || 'custom-drawn';

    if (speakingTaskId === itemId) {
      stopAllSpeech();
      return;
    }

    stopAllSpeech();
    setSpeakingTaskId(itemId);

    // 100ms delay to clear call stack and allow speechSynthesis.cancel() to finalize
    setTimeout(() => {
      let textToSpeak = '';
      if (type === 'task') {
        textToSpeak = language === 'zh'
          ? `冒險任務：${item.name}。 任務內容：${item.description}`
          : `Adventure Quest: ${item.name}. Quest details: ${item.description}`;
      } else if (type === 'card') {
        textToSpeak = language === 'zh'
          ? `獲得道具卡：${item.name}。 道具效果：${item.desc || item.description}`
          : `Obtained item card: ${item.name}. Effect: ${item.desc || item.description}`;
      } else if (type === 'backpack') {
        textToSpeak = language === 'zh'
          ? `背包道具：${item.name}。 效果說明：${item.desc || item.description}`
          : `Backpack item: ${item.name}. Description: ${item.desc || item.description}`;
      }

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = language === 'zh' ? 'zh-TW' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for younger children
      utterance.pitch = 1.1; // Slightly higher pitch for kids

      // Select system voices for task speech
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        let selectedVoice = null;
        if (language === 'zh') {
          const preferredZhNames = ['hanhan', 'yating', 'ting-ting', 'tingting', 'google 國語', 'google 臺灣', 'xiaoxiao', 'hsiaoyu', 'yaoyao', 'mei-jia', 'sin-ji'];
          for (const name of preferredZhNames) {
            const found = voices.find(v => v.name.toLowerCase().includes(name) && (v.lang.includes('zh') || v.lang.includes('zho')));
            if (found) {
              selectedVoice = found;
              break;
            }
          }
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('zh'));
          }
        } else {
          const preferredEnNames = ['zira', 'samantha', 'aria', 'jenny', 'google us english'];
          for (const name of preferredEnNames) {
            const found = voices.find(v => v.name.toLowerCase().includes(name) && v.lang.includes('en'));
            if (found) {
              selectedVoice = found;
              break;
            }
          }
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.toLowerCase().includes('en'));
          }
        }
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      utterance.onend = () => {
        setSpeakingTaskId(null);
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        }
      };

      utterance.onerror = () => {
        setSpeakingTaskId(null);
        if (activeUtterancesRef.current) {
          activeUtterancesRef.current = activeUtterancesRef.current.filter(u => u !== utterance);
        }
        if (typeof window !== 'undefined' && window._activeUtterances) {
          window._activeUtterances = window._activeUtterances.filter(u => u !== utterance);
        }
      };

      keepUtteranceAlive(utterance);
      window.speechSynthesis.speak(utterance);
    }, 100);
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
      utterZh.pitch = 1.1;

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
      utterEn.pitch = 1.1;

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
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      stopAllSpeech();
    };
  }, []);

  // Google GSI linking button initializer
  React.useEffect(() => {
    /* global google */
    if (window.google && google.accounts && google.accounts.id && googleClientId && !currentUser?.googleId && !isReadOnly) {
      try {
        console.log("Initializing Google GSI linking button...");
        google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => {
            if (response && response.credential) {
              onLinkGoogleAccount(response.credential);
            }
          },
          auto_select: false,
        });

        const container = document.getElementById("google-link-btn-container");
        if (container) {
          container.innerHTML = ""; // Clear existing contents
          google.accounts.id.renderButton(
            container,
            { 
              theme: "filled_blue", 
              size: "medium", 
              text: "continue_with", 
              shape: "rectangular", 
              logo_alignment: "left",
              width: 200
            }
          );
        }
      } catch (err) {
        console.warn("Google GSI linking rendering failed:", err);
      }
    }
  }, [googleClientId, currentUser, isReadOnly]);

  // Backpack item taking out animation state & click handler
  const [redeemingId, setRedeemingId] = useState(null);
  const handleRedeemClick = (inventoryId, isClaim = false) => {
    setRedeemingId(inventoryId);
    setTimeout(() => {
      if (isClaim) {
        onConfirmRedeem(inventoryId);
      } else {
        onRequestRedeem(inventoryId);
      }
      setRedeemingId(null);
    }, 600);
  };

  const renderAvatar = (avatarValue) => {
    if (avatarValue === 'girl') {
      return <span className="text-4xl">👧</span>;
    }
    if (avatarValue && (avatarValue.startsWith('http') || avatarValue.startsWith('data:'))) {
      return <img src={avatarValue} alt="Avatar" className="w-full h-full object-cover rounded-full" />;
    }
    return <span className="text-4xl">👦</span>; // default
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarUploadError('');
    if (!file) return;

    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      setAvatarUploadError(language === 'zh' ? '❌ 僅支援 PNG 或 JPEG 圖片格式！' : '❌ Only PNG or JPEG image formats are supported!');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB limit
    if (file.size > maxSize) {
      setAvatarUploadError(language === 'zh' ? '❌ 圖片大小不能超過 2MB！' : '❌ Image size cannot exceed 2MB!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, 200, 200).then(compressedBase64 => {
        setSelectedAvatar(compressedBase64); // Set compressed avatar
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (onUpdateChildProfile) {
      onUpdateChildProfile({ avatar: selectedAvatar });
    }
    setShowAvatarModal(false);
  };

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

  // Random Draw & Re-roll Logic
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[j], arr[j]] = [arr[j], arr[i]]; // wait, let's write simple swap
    }
    return arr;
  };

  const handleDrawOrRefresh = () => {
    // Filter tasks assigned to this child (or unassigned)
    const childTasks = tasks.filter(t => !t.assignedTo || t.assignedTo === stats.id);

    // Pool of available tasks to fill the slots (only tasks with status '進行中' and not already drawn)
    const candidatePool = childTasks.filter(t => t.status === '進行中' && !drawnTaskIds.includes(t.id));
    
    // Shuffle candidate pool
    const shuffledCandidates = [...candidatePool].sort(() => Math.random() - 0.5);
    let candidateIndex = 0;

    // Map each drawn task ID: if locked (pending review or needs correction), keep it.
    // Otherwise, replace it with a new task from the candidate pool if available.
    const newDrawnTaskIds = drawnTaskIds.map(id => {
      const t = tasks.find(task => task.id === id);
      const isLocked = t && (t.status === '待覆核' || t.status === '需修正') && (!t.assignedTo || t.assignedTo === stats.id);
      
      if (isLocked) {
        return id; // Keep locked task in place
      }

      // Replace with a candidate from pool
      if (candidateIndex < shuffledCandidates.length) {
        const nextTask = shuffledCandidates[candidateIndex];
        candidateIndex++;
        return nextTask.id;
      }

      return null; // Remove if no candidates available
    }).filter(id => id !== null);

    // If total slots drawn < 5, and we still have candidates, fill up to 5 slots
    while (newDrawnTaskIds.length < 5 && candidateIndex < shuffledCandidates.length) {
      newDrawnTaskIds.push(shuffledCandidates[candidateIndex].id);
      candidateIndex++;
    }

    onUpdateDrawnTasks(newDrawnTaskIds);
  };


  // Self draw 5 quests, one from each category (德, 智, 體, 群, 美)
  const handleSelfDrawQuests = () => {
    if (isReadOnly) return;
    const categories = ['德', '智', '體', '群', '美'];
    const newTasks = [];
    const newDrawnIds = [...drawnTaskIds];

    categories.forEach((cat, index) => {
      const catTemplates = TASK_TEMPLATES.filter(t => t.type === cat);
      if (catTemplates.length > 0) {
        const randomTpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
        const newId = `task-tpl-self-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}-${stats.id}`;
        newTasks.push({
          id: newId,
          name: randomTpl.name,
          description: randomTpl.description,
          type: randomTpl.type,
          difficulty: randomTpl.difficulty,
          expReward: randomTpl.expReward,
          goldReward: randomTpl.goldReward,
          ticketReward: randomTpl.ticketReward,
          attributeReward: randomTpl.attributeReward,
          period: randomTpl.period,
          status: '進行中',
          assignedTo: stats.id,
          dateCreated: simulatedDate || new Date().toISOString().split('T')[0]
        });
        newDrawnIds.push(newId);
      }
    });

    if (newTasks.length > 0) {
      if (onAddTask) {
        onAddTask(newTasks);
      }
    }
  };
 
  // Supplement tasks up to 5 slots
  const handleDrawMoreQuests = async () => {
    if (isReadOnly || swappingTaskId !== null) return;
 
    // Filter out completed tasks from drawnTaskIds
    const validDrawnTaskIds = drawnTaskIds.filter(id => {
      const t = tasks.find(task => task.id === id);
      return t && t.status !== '已完成';
    });
 
    const currentActiveCount = validDrawnTaskIds.length;
    const missingCount = 5 - currentActiveCount;
    if (missingCount <= 0) return;
 
    const childTasks = tasks.filter(t => !t.assignedTo || t.assignedTo === stats.id);
    const candidatePool = childTasks.filter(t => t.status === '進行中' && !validDrawnTaskIds.includes(t.id));
 
    // Shuffle candidate pool
    const shuffledCandidates = [...candidatePool].sort(() => Math.random() - 0.5);
    const tasksFromPool = shuffledCandidates.slice(0, Math.min(missingCount, shuffledCandidates.length));
    const poolIds = tasksFromPool.map(t => t.id);
 
    const remainingNeeded = missingCount - tasksFromPool.length;
    
    // Update local drawn IDs with filtered list + pool tasks first
    const nextDrawnIds = [...validDrawnTaskIds, ...poolIds];
    onUpdateDrawnTasks(nextDrawnIds);
 
    if (remainingNeeded > 0) {
      const currentTypes = [
        ...validDrawnTaskIds.map(id => {
          const t = tasks.find(task => task.id === id);
          return t ? t.type : '';
        }),
        ...tasksFromPool.map(t => t.type)
      ].filter(Boolean);
 
      const allTypes = ['德', '智', '體', '群', '美'];
      let missingTypes = allTypes.filter(cat => !currentTypes.includes(cat));
 
      // Fetch names of completed tasks in the last 30 days to exclude them
      const completedTaskNames = tasks
        .filter(t => 
          t.assignedTo === stats.id && 
          t.status === '已完成' && 
          t.completedAt && 
          new Date(t.completedAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        )
        .map(t => (t.name || '').toLowerCase().trim());
 
      const newTasksToCreate = [];
      for (let i = 0; i < remainingNeeded; i++) {
        let targetType = missingTypes[i];
        if (!targetType) {
          targetType = allTypes[Math.floor(Math.random() * allTypes.length)];
        }
 
        let catTemplates = TASK_TEMPLATES.filter(t => t.type === targetType && !completedTaskNames.includes(t.name.toLowerCase().trim()));
        if (catTemplates.length === 0) {
          catTemplates = TASK_TEMPLATES.filter(t => t.type === targetType);
        }
        if (catTemplates.length === 0) {
          catTemplates = TASK_TEMPLATES;
        }
 
        const randomTpl = catTemplates[Math.floor(Math.random() * catTemplates.length)];
        const newId = `task-tpl-self-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}-${stats.id}`;
        
        newTasksToCreate.push({
          id: newId,
          name: randomTpl.name,
          description: randomTpl.description,
          type: randomTpl.type,
          difficulty: randomTpl.difficulty,
          expReward: randomTpl.expReward,
          goldReward: randomTpl.goldReward,
          ticketReward: randomTpl.ticketReward,
          attributeReward: randomTpl.attributeReward,
          period: randomTpl.period,
          status: '進行中',
          assignedTo: stats.id,
          dateCreated: simulatedDate || new Date().toISOString().split('T')[0]
        });
      }
 
      if (newTasksToCreate.length > 0) {
        setSwappingTaskId('draw-more');
        try {
          if (onAddTask) {
            await onAddTask(newTasksToCreate);
          }
        } catch (error) {
          console.error("Failed to draw more tasks:", error);
        } finally {
          setSwappingTaskId(null);
        }
      }
    }
  };
 
  // Reroll a single task - swap it for a random different available task of the same category
  const handleRerollTask = async (taskIdToSwap) => {
    if (swappingTaskId !== null) return;

    const targetTask = tasks.find(t => t.id === taskIdToSwap);
    if (!targetTask) return;
    const targetType = targetTask.type;

    const childTasks = tasks.filter(t => !t.assignedTo || t.assignedTo === stats.id);
    
    // Pool: available tasks of the same category not currently in the drawn list
    const candidatePool = childTasks.filter(t =>
      t.status === '進行中' &&
      t.type === targetType &&
      !drawnTaskIds.includes(t.id)
    );

    // Fetch names of completed tasks in the last 30 days
    const completedTaskNames = tasks
      .filter(t => 
        t.assignedTo === stats.id && 
        t.status === '已完成' && 
        t.completedAt && 
        new Date(t.completedAt) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      )
      .map(t => (t.name || '').toLowerCase().trim());

    if (candidatePool.length > 0) {
      // Exclude recently completed tasks from candidate pool
      const filteredPool = candidatePool.filter(t => !completedTaskNames.includes((t.name || '').toLowerCase().trim()));
      const finalPool = filteredPool.length > 0 ? filteredPool : candidatePool;

      const shuffled = [...finalPool].sort(() => Math.random() - 0.5);
      const newTask = shuffled[0];
      const newDrawnTaskIds = drawnTaskIds.map(id => id === taskIdToSwap ? newTask.id : id);
      
      // Update swap count of target task if matched from pool (since we don't delete, but we should make sure it inherits swap_count of 1)
      if (onEditTask) {
        await onEditTask(newTask.id, { swapCount: (targetTask.swapCount || 0) + 1 });
      }

      onUpdateDrawnTasks(newDrawnTaskIds);
    } else {
      // Fallback: draw a new random template from TASK_TEMPLATES matching the swapped task's type and excluding 30-day completed tasks
      const catTemplates = TASK_TEMPLATES.filter(t => {
        const isSameType = t.type === targetType;
        const isNotCurrent = t.name !== targetTask.name;
        const isNotCompletedRecently = !completedTaskNames.includes(t.name.toLowerCase().trim());
        return isSameType && isNotCurrent && isNotCompletedRecently;
      });

      const templatesToUse = catTemplates.length > 0 
        ? catTemplates 
        : TASK_TEMPLATES.filter(t => t.type === targetType && t.name !== targetTask.name);
      
      const fallbackTemplates = templatesToUse.length > 0 ? templatesToUse : TASK_TEMPLATES.filter(t => t.type === targetType);
      const randomTpl = fallbackTemplates[Math.floor(Math.random() * fallbackTemplates.length)];
      
      const newTaskObj = {
        name: randomTpl.name,
        description: randomTpl.description,
        type: randomTpl.type,
        difficulty: randomTpl.difficulty,
        expReward: randomTpl.expReward,
        goldReward: randomTpl.goldReward,
        ticketReward: randomTpl.ticketReward,
        attributeReward: randomTpl.attributeReward,
        period: randomTpl.period,
        status: '進行中',
        assignedTo: stats.id,
        dateCreated: simulatedDate || new Date().toISOString().split('T')[0],
        swapCount: (targetTask.swapCount || 0) + 1
      };

      setSwappingTaskId(taskIdToSwap);
      try {
        if (onAddTask) {
          await onAddTask(newTaskObj, taskIdToSwap);
        }
      } catch (error) {
        console.error("Failed to swap task:", error);
      } finally {
        setSwappingTaskId(null);
      }
    }
  };
  
  // SVG Radar calculations
  const getRadarPoints = () => {
    const center = 100;
    const maxVal = 40;
    const radius = 65;
    
    const attributes = [
      { val: stats.attributes.Wisdom, name: "Wisdom" },
      { val: stats.attributes.Responsibility, name: "Responsibility" },
      { val: stats.attributes.Empathy, name: "Empathy" },
      { val: stats.attributes.Creativity, name: "Creativity" },
      { val: stats.attributes.Courage, name: "Courage" }
    ];

    const points = attributes.map((attr, i) => {
      const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
      const valRatio = Math.min(maxVal, Math.max(5, attr.val)) / maxVal;
      const x = center + radius * valRatio * Math.cos(angle);
      const y = center + radius * valRatio * Math.sin(angle);
      return `${x},${y}`;
    });

    return points.join(' ');
  };

  const getGridPentagons = () => {
    const center = 100;
    const radius = 65;
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    
    return levels.map(level => {
      const r = radius * level;
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
        pts.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
      }
      return pts.join(' ');
    });
  };

  // Client-side photo upload constraints
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    setPhotoError('');
    if (!file) return;

    // Validate format (PNG/JPEG)
    if (file.type !== 'image/png' && file.type !== 'image/jpeg') {
      setPhotoError(language === 'zh' ? '❌ 檔案格式不支援！請上傳 PNG 或 JPEG 圖片格式。' : '❌ File format not supported! Please upload a PNG or JPEG image.');
      e.target.value = '';
      setSubmissionPhoto('');
      return;
    }

    // Validate size (< 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setPhotoError(language === 'zh' ? '❌ 檔案容量過大！照片容量必須限制在 5MB 以內。' : '❌ File size too large! The photo size must be limited to 5MB.');
      e.target.value = '';
      setSubmissionPhoto('');
      return;
    }

    // Convert to mock base64 for local storage viewing
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, 400, 400).then(compressedBase64 => {
        setSubmissionPhoto(compressedBase64); // Compress to prevent localStorage quota crash
      });
    };
    reader.readAsDataURL(file);
  };

  const getAttributeIcon = (name) => {
    switch (name) {
      case 'Wisdom': return <BookOpen className="h-4 w-4 text-[#0284c7]" />;
      case 'Responsibility': return <Shield className="h-4 w-4 text-[#16a34a]" />;
      case 'Courage': return <Compass className="h-4 w-4 text-[#ea580c]" />;
      case 'Empathy': return <Heart className="h-4 w-4 text-[#db2777]" />;
      case 'Creativity': return <Sparkles className="h-4 w-4 text-[#7c3aed]" />;
      default: return null;
    }
  };

  const getAttributeColor = (name) => {
    switch (name) {
      case 'Wisdom': return 'text-[#0284c7]';
      case 'Responsibility': return 'text-[#16a34a]';
      case 'Courage': return 'text-[#ea580c]';
      case 'Empathy': return 'text-[#db2777]';
      case 'Creativity': return 'text-[#7c3aed]';
      default: return 'text-slate-500';
    }
  };

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case '智': return 'text-[#0284c7] border-[#0284c7]/20 bg-[#0284c7]/5';
      case '德': return 'text-[#16a34a] border-[#16a34a]/20 bg-[#16a34a]/5';
      case '體': return 'text-[#ea580c] border-[#ea580c]/20 bg-[#ea580c]/5';
      case '群': return 'text-[#db2777] border-[#db2777]/20 bg-[#db2777]/5';
      case '美': return 'text-[#7c3aed] border-[#7c3aed]/20 bg-[#7c3aed]/5';
      default: return 'text-slate-500 border-slate-300/10 bg-slate-300/5';
    }
  };

  const getRarityClass = (rarity) => {
    switch (rarity) {
      case 'Common': return 'card-common text-slate-400';
      case 'Rare': return 'card-rare text-blue-400';
      case 'Epic': return 'card-epic text-purple-400';
      case 'Legendary': return 'card-legendary text-amber-400';
      case 'Mythic': return 'card-mythic text-rose-500';
      default: return 'border-white/10';
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

  // Run card drawing sequence with debounce and locked states
  const startDrawCard = () => {
    if (stats.tickets < 1) return;
    if (isDrawingGacha) return;

    setIsDrawingGacha(true);
    setGachaState('shaking');
    playGachaShakeSound();
    
    // Random select rarity based on PRD v2 weights
    const rand = Math.random();
    let raritySelected = 'Common';
    if (rand < 0.01) raritySelected = 'Mythic';
    else if (rand < 0.05) raritySelected = 'Legendary';
    else if (rand < 0.15) raritySelected = 'Epic';
    else if (rand < 0.40) raritySelected = 'Rare';
    
    const pool = (gachaPool || GACHA_POOL)[raritySelected].cards;

    // Filter out cards drawn by the kid within the last 7 days.
    // dateAcquired is in YYYY-MM-DD format.
    const currentDateStr = simulatedDate || new Date().toISOString().split('T')[0];
    const dateLimit = new Date(currentDateStr);
    dateLimit.setDate(dateLimit.getDate() - 7);
    const limitStr = dateLimit.toISOString().split('T')[0];

    // Find template IDs that were acquired in the last 7 days
    const recentDrawnIds = new Set(
      (inventory || [])
        .filter(item => item.dateAcquired && item.dateAcquired >= limitStr)
        .map(item => item.id)
    );

    // Filter the pool
    let filteredPool = pool.filter(card => !recentDrawnIds.has(card.id));

    // Fallback: if all cards of this rarity are on cooldown, fall back to the original pool
    if (filteredPool.length === 0) {
      filteredPool = pool;
    }

    const cardSelected = filteredPool[Math.floor(Math.random() * filteredPool.length)];

    setTimeout(() => {
      setGachaState('revealing');
      setDrawnCard(cardSelected);
      playGachaRevealSound(cardSelected.rarity);
      if (cardSelected.rarity === 'Legendary' || cardSelected.rarity === 'Mythic') {
        triggerConfetti();
      }
      
      setTimeout(() => {
        setGachaState('shown');
        onDrawCard(cardSelected, 1);
        setIsDrawingGacha(false); // unlock drawing state
        if (cardSelected.type === '資源卡') {
          setTimeout(() => {
            playCoinSound();
          }, 300);
        }
      }, 800);
    }, 1200);
  };

  // Buy 1 Summon Ticket for 300 Gold
  const handleBuyTicket = async () => {
    if (isBuyingTicket || isReadOnly) return;
    if (stats.gold < 300) return;
    setIsBuyingTicket(true);
    try {
      await onBuyTicketWithGold();
      playCoinSound();
    } finally {
      setIsBuyingTicket(false);
    }
  };

  // Submit task with simulated network latency to test disabled spinner states
  const handleTaskSubmit = (taskId) => {
    if (isSubmittingApi) return;
    
    // Check if the submitted task is a boss quest
    const task = tasks.find(t => t.id === taskId);
    if (task && (task.difficulty === '較難' || task.difficulty === '終極')) {
      playBossBattleSound();
    }
    
    setIsSubmittingApi(true);

    // Simulate API delay
    setTimeout(() => {
      onSubmitTask(taskId, {
        notes: submissionNotes || "我已經完成此任務了！請爸媽核准！",
        photo: submissionPhoto || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80"
      });
      setIsSubmittingApi(false);
      setSubmittingTaskId(null);
      setSubmissionNotes('');
      setSubmissionPhoto('');
      setPhotoError('');
    }, 850);
  };

  // Filter out completed tasks and only show drawn tasks for child list, preserving the order of drawnTaskIds
  const activeTasksList = drawnTaskIds
    .map(id => tasks.find(t => t.id === id))
    .filter(t => t && t.status !== '已完成' && (!t.assignedTo || t.assignedTo === stats.id));

  // Push notifications generator (mocking FCM messages)
  const getFCMNotifications = () => {
    const list = [];
    tasks.forEach(t => {
      if ((!t.assignedTo || t.assignedTo === stats.id) && t.rejectionReason) {
        list.push({
          id: `fcm-reject-${t.id}`,
          title: language === 'zh' ? "❌ 任務被退回修正" : "❌ Quest Returned",
          body: language === 'zh' ? `「${t.name}」已被退回。家長理由：${t.rejectionReason}` : `"${t.name}" has been returned. Reason: ${t.rejectionReason}`,
          time: language === 'zh' ? "剛剛" : "Just now"
        });
      }
    });
    inventory.forEach(i => {
      if (i.status === '已過期') {
        list.push({
          id: `fcm-expire-${i.inventoryId}`,
          title: language === 'zh' ? "⏳ 道具卡已失效" : "⏳ Item Expired",
          body: language === 'zh' ? `「${i.name}〝已超過使用期限。` : `"${i.name}" has expired.`,
          time: language === 'zh' ? "剛剛" : "Just now"
        });
      }
    });
    return list;
  };

  const fcmNotifications = getFCMNotifications();

  const maxPointsWish = (() => {
    if (!wishlist || wishlist.length === 0) return null;
    const activeWishes = wishlist.filter(w => !w.isRedeemed);
    if (activeWishes.length === 0) return null;
    return activeWishes.reduce((max, w) => w.pointsNeeded > max.pointsNeeded ? w : max, activeWishes[0]);
  })();

  return (
    <div className="space-y-6 relative">
      
      {/* Read-only mode banner */}
      {isReadOnly && (
        <div className="bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-xl flex items-center justify-between text-xs text-amber-700 font-bold shadow-sm animate-success">
          <span className="flex items-center gap-2">
            <Eye className="h-4.5 w-4.5 text-amber-600 shrink-0" />
            <span>{t('readOnlyBanner', { name: stats.name })}</span>
          </span>
          <span className="bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
            {t('readOnlyTag')}
          </span>
        </div>
      )}

      {/* V2 Simulated FCM push notifications bell */}
      <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(prev => !prev)}
              className="p-2 bg-indigo-650/20 text-indigo-400 hover:bg-indigo-650/30 rounded-lg border border-indigo-500/20 transition-all flex items-center justify-center"
            >
              <Bell className="h-5 w-5 animate-pulse" />
            </button>
            {fcmNotifications.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-slate-100 px-1.5 py-0.5 rounded-full text-[9px] font-black border border-slate-900">
                {fcmNotifications.length}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            <span>{t('pwaNotificationCenter')}</span>
            <span className="text-slate-300 font-semibold">
              {fcmNotifications.length > 0 ? t('newActivities', { count: fcmNotifications.length }) : t('noNewActivities')}
            </span>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">{t('simulatedDateLabel')} {simulatedDate}</span>
      </div>

      {/* Daily Proverb Card */}
      {dailyProverb && (
        <div className="glass-panel p-5 bg-gradient-to-r from-[#1b1c2b] via-[#21173a]/80 to-[#1b1c2b] border border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.15)] rounded-2xl flex flex-col sm:flex-row items-center gap-4 hover:border-violet-500/35 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all duration-300">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="text-[10px] text-violet-400 font-black uppercase tracking-widest">
              {t('dailyProverbLabel')}
            </div>
            <div className="text-sm font-extrabold text-slate-200 leading-relaxed">
              {renderTextWithZhuyin(dailyProverb.contentZh)}
            </div>
            <div className="text-xs font-semibold text-slate-300 italic font-mono">
              {dailyProverb.contentEn}
            </div>
          </div>
          <button
            onClick={speakProverb}
            className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center active:scale-95 ${
              proverbSpeaking
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)] animate-pulse'
                : 'bg-violet-600/10 border-violet-500/20 text-violet-400 hover:bg-violet-600/20 hover:border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.05)]'
            }`}
            title={proverbSpeaking ? t('stopSpeaking') : t('startSpeaking')}
          >
            {proverbSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      )}

      {/* Highest Points Active Family Wish Card */}
      {maxPointsWish && (
        <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 to-amber-500/5 border border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.1)] rounded-2xl flex flex-col md:flex-row items-center gap-4 hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
            <Trophy className="h-6 w-6 animate-bounce" />
          </div>
          
          <div className="space-y-2 text-center md:text-left flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                  <span>{t('tabKidWishlist')}</span>
                  {maxPointsWish.isUltimate && (
                    <span className="bg-amber-500/20 text-amber-300 text-[9px] px-1 py-0.5 rounded border border-amber-500/30">
                      {t('ultimatePrize')}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-extrabold text-slate-200 leading-relaxed">
                  {renderTextWithZhuyin(maxPointsWish.title)}
                </h4>
              </div>
              
              <div className="text-xs text-slate-300 font-bold sm:text-right">
                {t('familyTotalPoints')}：<span className="text-amber-400 font-black">{familyScore}</span> / {maxPointsWish.pointsNeeded} Pts
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-3 w-full bg-slate-950 border border-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (familyScore / maxPointsWish.pointsNeeded) * 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                <span>{t('progress')}: {Math.min(100, Math.round((familyScore / maxPointsWish.pointsNeeded) * 100))}%</span>
                <span>{t('pointsShortOfUnlock', { count: Math.max(0, maxPointsWish.pointsNeeded - familyScore) })}</span>
              </div>
            </div>
          </div>
          
          {/* Claim Wishlist button right on the card */}
          {familyScore >= maxPointsWish.pointsNeeded && !isReadOnly && (
            <button
              onClick={() => onClaimWishlistItem(maxPointsWish.id)}
              className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-900 rounded-xl text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:from-emerald-400 hover:to-teal-300 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              {t('claimWishlistBtn')}
            </button>
          )}
        </div>
      )}


      {/* Restart Tour button */}
      {!isReadOnly && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => {
              setTourStep(1);
              setShowTour(true);
              localStorage.removeItem('questgrow_kid_tour_seen');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 whitespace-nowrap"
          >
            {t('reopenTourBtn')}
          </button>
        </div>
      )}

      {/* FCM Notifications Panel */}
      {showNotifications && (
        <div className="glass-panel p-4 border-indigo-500/30 bg-slate-950/90 space-y-3 max-w-md animate-success">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              {t('pushNotificationLogsTitle')}
            </h4>
            <button onClick={() => setShowNotifications(false)} className="text-slate-300 hover:text-slate-100 text-xs font-bold">{t('close')}</button>
          </div>
          {fcmNotifications.length === 0 ? (
            <p className="text-xs text-slate-300 text-center py-4">{t('noNotifications')}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fcmNotifications.map(n => (
                <div key={n.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-200">{n.title}</span>
                    <span className="text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-950/60 border border-white/5 rounded-2xl overflow-x-auto mb-6 shadow-inner">
        <button
          onClick={() => setActiveSubTab('character')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'character' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 1 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <User className={`h-4 w-4 ${activeSubTab === 'character' ? 'text-white' : 'text-[#3661FF]'}`} />
          {t('tabChar')}
        </button>
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'tasks' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 2 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Award className={`h-4 w-4 ${activeSubTab === 'tasks' ? 'text-white' : 'text-[#3661FF]'}`} />
          {t('tabQuests')}
          {activeTasksList.length > 0 && (
            <span className="bg-[#FF4747] text-white px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm">
              {activeTasksList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('gacha')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'gacha' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(124,58,237,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 3 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Sparkles className={`h-4 w-4 ${activeSubTab === 'gacha' ? 'text-white' : 'text-[#FF9F1C]'}`} />
          {t('tabSummon')}
          {stats.tickets > 0 && (
            <span className="bg-[#FF9F1C] text-[#111216] px-1.5 py-0.5 rounded-full text-[10px] font-black animate-pulse shadow-sm">
              {stats.tickets}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('backpack')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'backpack' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_12px_rgba(54,97,255,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 4 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Package className={`h-4 w-4 ${activeSubTab === 'backpack' ? 'text-white' : 'text-[#3661FF]'}`} />
          {t('tabBackpack')}
          {inventory.filter(i => i.status === '未使用').length > 0 && (
            <span className="bg-[#35363A] text-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm">
              {inventory.filter(i => i.status === '未使用').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('wishlist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'wishlist' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-[#111216] shadow-[0_0_12px_rgba(245,158,11,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white hover:bg-white/5'
          } ${showTour && tourStep === 5 ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-[#111216] animate-pulse' : ''}`}
        >
          <Trophy className={`h-4 w-4 ${activeSubTab === 'wishlist' ? 'text-[#111216]' : 'text-[#FF9F1C]'}`} />
          {t('tabKidWishlist')}
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black transition-all uppercase tracking-wider whitespace-nowrap rounded-xl ${
            activeSubTab === 'leaderboard' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)] hover:scale-105' : 'text-[#b5b7bc] hover:text-white'
          }`}
        >
          <Trophy className={`h-4 w-4 ${activeSubTab === 'leaderboard' ? 'text-white' : 'text-violet-400'}`} />
          {t('tabLeaderboard')}
        </button>
      </div>

      {/* --- Tab 1: Character Sheet --- */}
      {activeSubTab === 'character' && (
        <div className="dashboard-grid animate-success">
          <div className="glass-panel p-6 flex flex-col items-center justify-between text-center gap-6">
            <div className="space-y-2 w-full">
              <div className="relative w-20 h-20 mx-auto group">
                <Avatar 
                  avatar={stats.avatar} 
                  role="kid" 
                  badge={activeBadge}
                  badgePosition="bottom-left"
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center shadow-xl shadow-violet-500/20 border border-white/20 overflow-hidden" 
                />
                {!isReadOnly && (
                  <button 
                    onClick={() => {
                      setSelectedAvatar(stats.avatar || 'boy');
                      setShowAvatarModal(true);
                    }}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-[#3661FF] hover:bg-[#4e75ff] text-white rounded-full shadow-md transition-all border border-white/10"
                    title={t('editAvatar')}
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-black">{stats.name}</h3>
              <div className="text-sm font-bold text-violet-400">{stats.jobClass}</div>
              <div className="flex justify-center gap-2 text-xs font-semibold text-slate-400 mt-1">
                <span>{t('ageLabel', { age: stats.age || '--' })}</span>
                <span>•</span>
                <span>{t('birthdayLabel', { birthday: stats.birthday || '--' })}</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {/* HP Bar */}
              <div className="w-full space-y-1">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider px-1">
                  <span className="text-slate-400">❤️ HP / Stamina</span>
                  <span className="text-rose-400">100 / 100 HP</span>
                </div>
                <div className="hp-metallic-bar w-full">
                  <div 
                    className="hp-metallic-fill"
                    style={{ width: `100%` }}
                  ></div>
                </div>
              </div>

              {/* EXP Bar */}
              <div className="w-full space-y-1">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider px-1">
                  <span className="text-slate-400">⚡ EXP / Progress</span>
                  <span className="text-amber-300">Level {stats.level} ({stats.exp} / {stats.expNeeded} EXP)</span>
                </div>
                <div className="exp-metallic-bar w-full">
                  <div 
                    className="exp-metallic-fill transition-all duration-500"
                    style={{ width: `${Math.min(100, (stats.exp / stats.expNeeded) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="glass-panel p-4 border border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-500/5 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all duration-300 rounded-2xl">
                <div className="text-[10px] text-amber-400 font-black uppercase tracking-widest">{t('goldLabel')}</div>
                <div className="text-lg font-black text-amber-400 mt-1 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]">🪙 {stats.gold}</div>
              </div>
              <div className="glass-panel p-4 border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-500/5 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-300 rounded-2xl">
                <div className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">{t('ticketsLabel')}</div>
                <div className="text-lg font-black text-cyan-400 mt-1 drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]">🎫 {stats.tickets}</div>
              </div>
            </div>

            {/* Account Security & Google Linking */}
            <div className="w-full p-4 border border-indigo-500/20 bg-white/5 rounded-2xl space-y-3 text-left">
              <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider">
                🛡️ {t('accountSecurityAndGoogle')}
              </h4>
              <div className="text-[10px] text-slate-500 leading-relaxed">
                {t('currentLogin')}：<span className="text-slate-200 font-bold">{currentUser?.email}</span> ({currentUser?.googleId ? t('googleLinkedType') : t('passwordAccountType')})
              </div>
              {currentUser?.googleId ? (
                <div className="text-[10px] text-emerald-400 font-bold">
                  ✓ {t('googleLinkedSuccessText')}
                </div>
              ) : isReadOnly ? (
                <div className="text-[10px] text-slate-500 italic">
                  {t('readOnlyGoogleBlock')}
                </div>
              ) : (
                <div className="space-y-2">
                  <div id="google-link-btn-container" className="flex justify-center w-full min-h-[36px] my-1"></div>
                  {(!window.google || !window.google.accounts) && (
                    <button
                      onClick={() => {
                        const email = prompt(t('enterGoogleEmailPrompt'), "kid@gmail.com");
                        if (email) {
                          const mockToken = "google-mock-" + email.replace(/[^a-zA-Z0-9]/g, "");
                          onLinkGoogleAccount(mockToken);
                        }
                      }}
                      type="button"
                      className="w-full py-1.5 bg-indigo-600/10 hover:bg-indigo-650/20 text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-500/20 border-dashed transition-all text-center"
                    >
                      🤖 {t('enterGoogleSandbox')} (Sandbox Fallback)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex justify-center">
              <svg width="300" height="300" viewBox="-20 -20 240 240" className="w-[288px] h-[288px] md:w-[336px] md:h-[336px]">
                {getGridPentagons().map((pts, i) => (
                  <polygon key={i} points={pts} className="radar-grid" />
                ))}
                {[0, 1, 2, 3, 4].map(i => {
                  const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                  const x = 100 + 65 * Math.cos(angle);
                  const y = 100 + 65 * Math.sin(angle);
                  return (
                    <line key={i} x1="100" y1="100" x2={x} y2={y} className="radar-grid" />
                  );
                })}
                <polygon points={getRadarPoints()} className="radar-polygon" />
                {(() => {
                  const scores = [
                    stats.attributes.Wisdom,
                    stats.attributes.Responsibility,
                    stats.attributes.Empathy,
                    stats.attributes.Creativity,
                    stats.attributes.Courage
                  ];
                  const colors = [
                    "#0284c7", // 智 (Wisdom - Cyan)
                    "#16a34a", // 德 (Responsibility - Green)
                    "#db2777", // 群 (Empathy - Pink)
                    "#7c3aed", // 美 (Creativity - Purple)
                    "#ea580c"  // 體 (Courage - Orange)
                  ];
                  return ['智', '德', '群', '美', '體'].map((label, i) => {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const x = 100 + 85 * Math.cos(angle);
                    const y = 100 + 85 * Math.sin(angle);
                    return (
                      <text 
                        key={i} 
                        x={x} 
                        y={y} 
                        fill={colors[i]} 
                        fontSize="16" 
                        fontWeight="900" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                      >
                        {translateType(label)}({scores[i]})
                      </text>
                    );
                  });
                })()}
              </svg>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">
                {t('rpgAttributes')}
              </h4>
              <div className="space-y-3">
                {[
                  { name: "Wisdom", nameFull: t('attrWisdomFull'), val: stats.attributes.Wisdom, desc: t('attrWisdomDesc') },
                  { name: "Responsibility", nameFull: t('attrResponsibilityFull'), val: stats.attributes.Responsibility, desc: t('attrResponsibilityDesc') },
                  { name: "Courage", nameFull: t('attrCourageFull'), val: stats.attributes.Courage, desc: t('attrCourageDesc') },
                  { name: "Empathy", nameFull: t('attrEmpathyFull'), val: stats.attributes.Empathy, desc: t('attrEmpathyDesc') },
                  { name: "Creativity", nameFull: t('attrCreativityFull'), val: stats.attributes.Creativity, desc: t('attrCreativityDesc') }
                ].map((attr) => (
                  <div key={attr.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAttributeIcon(attr.name)}
                      <div>
                        <div className="text-sm font-bold text-slate-200">{attr.nameFull}</div>
                        <div className="text-[10px] text-slate-500">{attr.desc}</div>
                      </div>
                    </div>
                    <div className={`text-md font-black ${getAttributeColor(attr.name)}`}>
                      {attr.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Tab 2: Adventure Tasks Board (Empty states & validation added) --- */}
      {activeSubTab === 'tasks' && (() => {
        const totalAvailableTasks = tasks.filter(t => t.status !== '已完成' && (!t.assignedTo || t.assignedTo === stats.id)).length;
        const completedTasks = tasks.filter(t => t.status === '已完成' && (!t.assignedTo || t.assignedTo === stats.id));

        let activeContent = null;

        if (totalAvailableTasks === 0) {
          activeContent = (
            <div className="empty-state-card glass-panel text-center p-12 space-y-4">
              <div className="text-6xl animate-float">🗺️</div>
              <h4 className="text-lg font-black text-slate-200">{t('selfDrawQuestsTitle')}</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-normal">
                {t('selfDrawQuestsDesc')}
              </p>
              <div className="flex justify-center gap-3 my-4 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-xs font-black border border-[#16a34a]/30 bg-[#16a34a]/10 text-[#16a34a] shadow-[0_0_10px_rgba(22,163,74,0.1)]">德 (Responsibility)</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black border border-[#0284c7]/30 bg-[#0284c7]/10 text-[#0284c7] shadow-[0_0_10px_rgba(2,132,199,0.1)]">智 (Wisdom)</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black border border-[#ea580c]/30 bg-[#ea580c]/10 text-[#ea580c] shadow-[0_0_10px_rgba(234,88,12,0.1)]">體 (Courage)</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black border border-[#db2777]/30 bg-[#db2777]/10 text-[#db2777] shadow-[0_0_10px_rgba(219,39,119,0.1)]">群 (Empathy)</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-black border border-[#7c3aed]/30 bg-[#7c3aed]/10 text-[#7c3aed] shadow-[0_0_10px_rgba(124,58,237,0.1)]">美 (Creativity)</span>
              </div>
              {!isReadOnly ? (
                <button
                  onClick={handleSelfDrawQuests}
                  className="px-6 py-2.5 rounded-[4px] text-xs font-black bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95"
                >
                  {t('selfDrawQuestsBtn')}
                </button>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {t('readOnlyGoogleBlock')}
                </p>
              )}
            </div>
          );
        } else if (drawnTaskIds.length === 0) {
          activeContent = (
            <div className="empty-state-card glass-panel text-center p-12 space-y-4">
              <div className="text-6xl animate-float">🎲</div>
              <h4 className="text-lg font-black text-slate-200">{t('noQuestsTitle')}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                {t('drawQuestsDesc')}
              </p>
              {!isReadOnly && (
                <button
                  onClick={handleDrawOrRefresh}
                  className="px-6 py-2.5 rounded-[4px] text-xs font-black bg-[#00E676] hover:bg-[#00c867] text-[#111216] transition-colors shadow-lg"
                >
                  {t('drawDailyQuestsBtn')}
                </button>
              )}
            </div>
          );
        } else if (activeTasksList.length === 0) {
          activeContent = (
            <div className="empty-state-card glass-panel text-center p-12 space-y-4">
              <div className="text-6xl flex justify-center">🎉</div>
              <h4 className="text-lg font-black text-[#00E676]">{t('questsCompletedTitle')}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                {t('questsCompletedDesc')}
              </p>
              {!isReadOnly && (
                <button
                  onClick={handleDrawOrRefresh}
                  className="px-6 py-2.5 rounded-[4px] text-xs font-black bg-[#3661FF] hover:bg-[#4e75ff] text-white transition-colors shadow-lg"
                >
                  {t('drawMoreQuestsBtn')}
                </button>
              )}
            </div>
          );
        } else {
          // Define themed dungeon categories configuration
          const categoriesConfig = [
            { 
              type: '德', 
              key: 'dungeonVirtue', 
              color: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]', 
              bgStyle: 'bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/10 shadow-lg',
              icon: '🛡️' 
            },
            { 
              type: '智', 
              key: 'dungeonWisdom', 
              color: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]', 
              bgStyle: 'bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/10 shadow-lg',
              icon: '🔮' 
            },
            { 
              type: '體', 
              key: 'dungeonCourage', 
              color: 'border-orange-500/35 bg-orange-500/10 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.15)]', 
              bgStyle: 'bg-gradient-to-r from-slate-900 via-orange-950/20 to-slate-900 border border-orange-500/10 shadow-lg',
              icon: '⚡' 
            },
            { 
              type: '群', 
              key: 'dungeonEmpathy', 
              color: 'border-pink-500/35 bg-pink-500/10 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.15)]', 
              bgStyle: 'bg-gradient-to-r from-slate-900 via-pink-950/20 to-slate-900 border border-pink-500/10 shadow-lg',
              icon: '🤝' 
            },
            { 
              type: '美', 
              key: 'dungeonCreativity', 
              color: 'border-purple-500/35 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.15)]', 
              bgStyle: 'bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/10 shadow-lg',
              icon: '🎨' 
            },
          ];

          activeContent = (
            <>
              <div className="text-[10px] text-slate-500 font-bold mb-3">
                {t('refreshQuestsTip')}
              </div>

              <div className="space-y-6">
                {categoriesConfig.map(cat => {
                  const catTasks = activeTasksList.filter(t => t.type === cat.type);
                  if (catTasks.length === 0) return null;

                  return (
                    <div key={cat.type} className={`space-y-3 p-5 rounded-2xl ${cat.bgStyle}`}>
                      <div className={`flex items-center justify-between px-4 py-2 rounded-xl border ${cat.color}`}>
                        <span className="text-sm font-black flex items-center gap-1.5">
                          {cat.icon} {renderTextWithZhuyin(t(cat.key))}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 border border-white/5 text-slate-300">
                          {catTasks.length} {language === 'zh' ? '個任務' : 'Quests'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {catTasks.map((task) => {
                          const isSubmitting = submittingTaskId === task.id;
                          const hasCorrection = task.status === '進行中' && task.rejectionReason;
                          const isBoss = task.difficulty === '較難' || task.difficulty === '終極';
                          
                          const getBossLabel = (diff) => {
                            if (diff === '較難') return t('eliteBossLabel');
                            if (diff === '終極') return t('ultimateBossLabel');
                            return null;
                          };

                          const cardClass = `p-5 flex flex-col justify-between gap-4 relative transition-all ${
                            isBoss
                              ? `boss-quest-card ${task.status === '待覆核' ? 'opacity-80' : ''} ${hasCorrection ? 'ring-2 ring-rose-500/50' : ''}`
                              : `glass-panel border ${
                                  hasCorrection 
                                    ? 'border-rose-500/30 bg-rose-500/5' 
                                    : task.status === '待覆核' 
                                      ? 'border-amber-500/20 bg-amber-500/5 opacity-80' 
                                      : 'border-white/5 hover:border-violet-500/20'
                                }`
                          }`;

                          return (
                            <div 
                              key={task.id} 
                              className={cardClass}
                            >
                              {/* V2 Loading Block overlay during API simulation */}
                              {isSubmitting && isSubmittingApi && (
                                <div className="loading-blocker">
                                  <div className="spinner-overlay"></div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isBoss && (
                                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm mr-1">
                                          {getBossLabel(task.difficulty)}
                                        </span>
                                      )}
                                      <span className="text-md font-extrabold text-slate-200">{renderTextWithZhuyin(task.name)}</span>
                                      {task.isRepeated && (
                                        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                          {language === 'zh' ? '⚠️ 30天內重複完成任務' : '⚠️ 30-Day Repeated Quest'}
                                        </span>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleSpeak(task)}
                                        className={`kid-speak-btn p-1.5 ml-1 ${
                                          speakingTaskId === task.id ? 'is-speaking' : ''
                                        }`}
                                        title={language === 'zh' ? '語音讀任務' : 'Read Quest Out Loud'}
                                      >
                                        {speakingTaskId === task.id ? (
                                          <VolumeX className="h-4 w-4" />
                                        ) : (
                                          <Volume2 className="h-4 w-4" />
                                        )}
                                      </button>
                                      {hasCorrection && (
                                        <span className="bg-rose-500 text-slate-900 px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
                                          {t('taskStatusRejected')}
                                        </span>
                                      )}
                                      {task.status === '待覆核' && (
                                        <span className="bg-amber-500/25 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                          {t('taskStatusPending')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{renderTextWithZhuyin(task.description)}</p>
                                  </div>
                                  <span className={`text-xs font-bold border px-2 py-0.5 rounded-full whitespace-nowrap ${getTypeBadgeColor(task.type)}`}>
                                    {translateType(task.type)} | {t('taskDifficultyLabel')} {translateDifficulty(task.difficulty)}
                                  </span>
                                  {!isReadOnly && task.status === '進行中' && !task.rejectionReason && (!task.swapCount || task.swapCount < 1) && (
                                    <button
                                      onClick={() => handleRerollTask(task.id)}
                                      disabled={swappingTaskId !== null}
                                      title={language === 'zh' ? '換一個任務' : 'Swap this quest'}
                                      className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 ${
                                        swappingTaskId !== null 
                                          ? 'opacity-50 cursor-not-allowed text-slate-500 bg-white/5 border border-white/5' 
                                          : 'text-slate-400 hover:text-violet-300 bg-white/5 hover:bg-violet-500/15 border border-white/10 hover:border-violet-500/30'
                                      }`}
                                    >
                                      {swappingTaskId === task.id ? (
                                        <>
                                          <span className="animate-spin mr-1">⏳</span>
                                          {language === 'zh' ? '更換中...' : 'Swapping...'}
                                        </>
                                      ) : (
                                        <>
                                          <span>🔄</span>
                                          {language === 'zh' ? '換一個' : 'Swap'}
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {hasCorrection && (
                                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs mt-1">
                                    <span className="font-bold">❌ {t('parentRejectionReason')}：</span> {task.rejectionReason}
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-100/80 p-2 rounded-lg border border-slate-200/60">
                                  <span>{t('expLabel')}：<span className="text-violet-600 font-bold">+{task.expReward} EXP</span></span>
                                  <span>{t('goldLabel')}：<span className="text-amber-700 font-bold">🪙 {task.goldReward || 50}</span></span>
                                  <span>{t('taskTypeLabel')}：<span className={getAttributeColor(task.attributeReward)}>{translateType(task.attributeReward)}</span></span>
                                  <span>{t('ticketsLabel')}：<span className="text-cyan-600 font-bold">+{task.ticketReward || 1} 🎫</span></span>
                                </div>
                              </div>

                              {task.status !== '待覆核' && (
                                <div className="mt-2 pt-2 border-t border-white/5">
                                  {isReadOnly ? (
                                    <div className="text-center text-slate-500 font-bold text-xs py-2 bg-slate-900/40 rounded border border-white/5">
                                      👀 {t('readOnlyTaskBlock')}
                                    </div>
                                  ) : !isSubmitting ? (
                                    <button
                                      onClick={() => setSubmittingTaskId(task.id)}
                                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[4px] text-xs font-black bg-[#3661FF] hover:bg-[#4e75ff] text-white transition-colors uppercase tracking-wider"
                                    >
                                      <Send className="h-3.5 w-3.5" />
                                      {t('submitReviewBtn')}
                                    </button>
                                  ) : (
                                    <div className="space-y-3">
                                      <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                          {t('messageToParents')}
                                        </label>
                                        <input 
                                          type="text"
                                          value={submissionNotes}
                                          onChange={(e) => setSubmissionNotes(e.target.value)}
                                          placeholder={language === 'zh' ? "e.g. 我已經整理好了喔，乾乾淨淨！" : "e.g. I have cleaned it up!"}
                                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                                        />
                                      </div>

                                      {/* V2 Real HTML5 File Validation Input */}
                                      <div>
                                        <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                                          {t('uploadProofPhoto')}
                                        </label>
                                        <input 
                                          type="file"
                                          accept="image/png, image/jpeg"
                                          onChange={handlePhotoUpload}
                                          className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-white/10 file:text-slate-200 hover:file:bg-white/15 file:cursor-pointer"
                                        />
                                        {photoError && (
                                          <p className="text-[10px] text-rose-400 font-bold mt-1.5 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 shrink-0" />
                                            {photoError}
                                          </p>
                                        )}
                                        {submissionPhoto && (
                                          <p className="text-[10px] text-emerald-450 font-bold mt-1">
                                            {t('photoLoaded')}
                                          </p>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleTaskSubmit(task.id)}
                                          disabled={isSubmittingApi}
                                          className="flex-1 py-1.5 rounded-[4px] text-xs font-black bg-[#00E676] hover:bg-[#00c867] text-[#111216] transition-colors flex items-center justify-center gap-1.5"
                                        >
                                          {isSubmittingApi && <span className="spinner-inline"></span>}
                                          {isSubmittingApi ? t('submitting') : t('submitReviewBtn')}
                                        </button>
                                        <button
                                          onClick={() => {
                                            setSubmittingTaskId(null);
                                            setSubmissionNotes('');
                                            setSubmissionPhoto('');
                                            setPhotoError('');
                                          }}
                                          className="px-3 py-1.5 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
                                        >
                                          {t('cancel')}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          );
        }

        const activeSlotsCount = activeTasksList.filter(t => t.status === '進行中' || t.status === '需修正').length;

        return (
          <div className="space-y-4 animate-success">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#35363A] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-[#3661FF]" />
                <h3 className="text-md font-black text-slate-850">
                  {t('questBoard')} ({t('activeSlots')}: {activeSlotsCount}/5)
                </h3>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {!isReadOnly && activeTasksList.length > 0 && activeTasksList.length < 5 && (
                  <button
                    onClick={handleDrawMoreQuests}
                    disabled={swappingTaskId !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-black bg-[#00E676] hover:bg-[#00c867] text-[#111216] transition-all hover:scale-105 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>🎲</span>
                    {language === 'zh' ? `補充 ${5 - activeTasksList.length} 個任務` : `Supplement ${5 - activeTasksList.length} Quests`}
                  </button>
                )}
                <span className="text-xs text-slate-400 font-semibold">
                  {t('weeklyBalanceIndex')}：<span className="text-[#00E676] font-bold">{balancedIndex} 分</span>
                </span>
              </div>
            </div>

            {activeContent}

            {/* Collapsible Completed Quests History Section */}
            <div className="border-t border-white/10 pt-6 space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  ✅ {language === 'zh' ? '已完成冒險任務歷史' : 'Completed Quests History'}
                  {completedTasks.length > 0 && (
                    <span className="bg-[#00E676]/15 text-[#00E676] px-1.5 py-0.5 rounded text-[10px] font-black border border-[#00E676]/20">
                      {completedTasks.length}
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCompletedHistory(prev => !prev)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 hover:border-white/20 text-slate-200 text-xs font-bold rounded-full shadow-sm transition-all duration-200 active:scale-95"
                >
                  <span>{showCompletedHistory ? (language === 'zh' ? '收起記錄' : 'Hide History') : (language === 'zh' ? '展開記錄' : 'Show History')}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${showCompletedHistory ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showCompletedHistory && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 animate-success">
                  {completedTasks.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-6">{language === 'zh' ? '無已完成的任務紀錄。' : 'No completed quest records.'}</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {completedTasks.map(task => (
                        <div key={task.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-200">{renderTextWithZhuyin(task.name)}</span>
                            <span className="text-[10px] text-slate-550">{task.dateCreated}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">{renderTextWithZhuyin(task.description)}</p>
                          <div className="flex items-center justify-between text-[9px] text-[#00E676] font-bold mt-1.5">
                            <span className={`px-1.5 py-0.5 rounded border ${getTypeBadgeColor(task.type)} text-[8px]`}>
                              {translateType(task.type)} | {translateDifficulty(task.difficulty)}
                            </span>
                            <span>+{task.expReward} EXP | 🪙 {task.goldReward}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}


      {/* --- Tab 3: Gacha (Drawing Cards with locked loading button states) --- */}
      {activeSubTab === 'gacha' && (
        <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden animate-success">
          
          {gachaState === 'idle' && (
            <div className="gacha-cabinet w-full max-w-2xl flex flex-col items-stretch overflow-hidden">
              
              {/* Header neon board */}
              <div className="gacha-neon-header py-4 text-center border-b-2 border-indigo-500/30">
                <h3 className="text-xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-2">
                  <span>🎰 QUEST SUMMONER</span>
                  <span className="text-xs bg-slate-950/60 text-[#f43f5e] border border-[#f43f5e]/30 px-2 py-0.5 rounded font-mono">V.3</span>
                  <span>冒險扭蛋機</span>
                </h3>
                <p className="text-[10px] text-slate-200 mt-1 font-bold uppercase tracking-wider">
                  {language === 'zh' ? '用幸運與累積的努力 召喚稀有寶藏卡牌' : 'Summon rare treasure cards with your hard-earned points'}
                </p>
              </div>

              {/* Glass Tube window showing mystery cards/eggs */}
              <div className="gacha-glass-area h-36 flex items-center justify-around relative overflow-hidden px-6">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
                
                {/* Visual mystery capsules floating */}
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🔴</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.4s' }}>🔵</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.2s' }}>🟡</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🟢</div>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.3s' }}>🟣</div>
                
                {/* Neon tubes */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#f43f5e] opacity-40 shadow-[0_0_8px_#f43f5e]"></div>
                <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-[#a855f7] opacity-40 shadow-[0_0_8px_#a855f7]"></div>
              </div>

              {/* Control Panel Area */}
              <div className="gacha-control-panel p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Left: Mystery Chest Summon (Tickets 🎫) with Rotary Dial */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/50 border border-white/5 rounded-2xl">
                  <div className="text-sm font-black text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1.5">
                    <span>🎫 {t('summonTitle') || '召喚獎勵'}</span>
                  </div>
                  <p className="text-[10px] text-slate-200 leading-relaxed max-w-[200px] text-center mb-3">
                    {language === 'zh' ? '轉動旋鈕即可隨機召喚一張獎勵卡片' : 'Twist the dial to summon a random reward card'}
                  </p>
                  
                  <button
                    disabled={stats.tickets < 1 || isDrawingGacha || isReadOnly}
                    onClick={startDrawCard}
                    className={`gacha-rotary-knob w-20 h-20 rounded-full flex items-center justify-center relative active:scale-95 transition-all ${
                      stats.tickets < 1 || isDrawingGacha || isReadOnly ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{ transform: isDrawingGacha ? 'rotate(360deg)' : 'rotate(0deg)' }}
                  >
                    {/* Metallic core indicator */}
                    <div className="w-12 h-3 bg-slate-400 rounded-full absolute"></div>
                    <div className="w-3 h-12 bg-slate-400 rounded-full absolute"></div>
                    <div className="w-8 h-8 bg-slate-700 border-2 border-slate-500 rounded-full z-10 flex items-center justify-center">
                      <div className="w-3 h-3 bg-amber-450 rounded-full animate-pulse"></div>
                    </div>
                  </button>
                  
                  <div className="text-[11px] text-amber-400 font-bold mt-3 animate-pulse">
                    {isDrawingGacha ? (language === 'zh' ? '正在轉動中...' : 'Drawing...') : (language === 'zh' ? '⭐ 旋轉扭蛋鈕 ⭐' : '⭐ Twist Dial ⭐')}
                  </div>

                  <div className="w-full mt-3 p-2 bg-slate-950/80 border border-white/5 rounded-xl font-bold text-xs text-center text-slate-200">
                    {isReadOnly ? t('readOnlyGachaBlock') : `${t('availableTickets')}：`}<span className="text-cyan-400 text-sm font-extrabold">🎫 {stats.tickets}</span>
                  </div>
                </div>

                {/* Right: Gold ticket vending machine (Gold 🪙) */}
                <div className="space-y-3 text-center p-4 bg-gradient-to-b from-amber-950/20 to-slate-950/50 border border-amber-500/10 rounded-2xl h-full flex flex-col justify-between">
                  <div className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <span>🏪 {t('vendingMachineTitle')}</span>
                  </div>
                  <p className="text-[10px] text-slate-200 leading-relaxed max-w-[160px] mx-auto">
                    {t('vendingMachineDesc')}
                  </p>
                  <div className="p-2 bg-slate-950/80 border border-white/5 rounded-xl font-bold text-xs flex justify-between items-center text-slate-200">
                    <span className="text-amber-400 font-extrabold">🪙 {stats.gold}</span>
                    <span className="text-[9px] text-slate-300 uppercase">300 🪙 = 1 🎫</span>
                  </div>
                  <button
                    onClick={handleBuyTicket}
                    disabled={stats.gold < 300 || isBuyingTicket || isReadOnly}
                    className={`w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      stats.gold >= 300 && !isBuyingTicket && !isReadOnly
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-[#111216] hover:from-amber-400 hover:to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:scale-[1.02] active:scale-95' 
                        : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isBuyingTicket && <span className="spinner-inline"></span>}
                    {isReadOnly ? t('readOnlyGachaBlock') : isBuyingTicket ? '...' : stats.gold >= 300 ? t('buyTicketBtn') : t('insufficientGold')}
                  </button>
                </div>

              </div>
              
              {/* Outbox coin slot / capsule roll container */}
              <div className="p-2 bg-slate-950 border-t-2 border-slate-900 text-center flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
                <span>INSERT COIN</span>
                <span className="w-1.5 h-3 bg-rose-500 rounded-sm animate-pulse"></span>
                <span>TICKET DISPENSER</span>
              </div>

            </div>
          )}

          {gachaState === 'shaking' && (
            <div className="space-y-6">
              <div className="text-8xl animate-chest-shake">🎁</div>
              <h4 className="text-lg font-black text-amber-400 animate-pulse">{t('openingChest')}</h4>
            </div>
          )}

          {gachaState === 'revealing' && (
            <div className="space-y-6">
              <div className="text-8xl animate-chest-open">🎁</div>
              <div className="w-32 h-32 rounded-full bg-amber-400/20 animate-ping absolute"></div>
            </div>
          )}

          {gachaState === 'shown' && drawnCard && (
            <div className="space-y-6 max-w-sm w-full animate-card-draw">
              <div className={`glass-panel p-6 border-2 rounded-2xl mx-auto space-y-4 max-w-[280px] text-center bg-gradient-to-b from-slate-950 to-slate-900 ${getRarityClass(drawnCard.rarity)}`}>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-widest ${getRarityBadge(drawnCard.rarity)}`}>
                  {drawnCard.rarity}
                </span>
                
                <div className="text-5xl mt-2">
                  {drawnCard.type === '資源卡' ? '💎' : drawnCard.type === '特權卡' ? '📜' : drawnCard.type === '體驗卡' ? '🗺️' : '🎖️'}
                </div>

                <div className="space-y-1">
                  <h4 className="text-md font-black text-slate-100 flex items-center justify-center gap-1.5">
                    {renderTextWithZhuyin(drawnCard.name)}
                    <button
                      type="button"
                      onClick={() => handleSpeak(drawnCard, 'card')}
                      className={`kid-speak-btn p-1.5 ml-1 ${
                        speakingTaskId === (drawnCard.id || 'custom-drawn') ? 'is-speaking' : ''
                      }`}
                      title={language === 'zh' ? '語音讀卡片' : 'Read Card Out Loud'}
                    >
                      {speakingTaskId === (drawnCard.id || 'custom-drawn') ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </button>
                  </h4>
                  <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">{drawnCard.type}</div>
                </div>

                <p className="text-xs text-slate-300 border-t border-white/5 pt-3 leading-relaxed">
                  {renderTextWithZhuyin(drawnCard.desc)}
                </p>
              </div>

              <div className="text-xs text-slate-200">
                {drawnCard.type === '資源卡' 
                  ? t('resourceAdded') 
                  : t('cardAddedToBackpack')}
              </div>

              <button
                onClick={() => {
                  setGachaState('idle');
                  setDrawnCard(null);
                }}
                className="px-6 py-2 rounded-[4px] text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
              >
                {t('claimTreasure')}
              </button>
            </div>
          )}
        </div>
      )}

            {activeSubTab === 'backpack' && (() => {
        const activeInventory = inventory.filter(i => i.status === '未使用' || i.status === '待核銷' || (i.status === '已使用' && i.type === '收藏卡'));
        const historyInventory = inventory.filter(i => (i.status === '已使用' && i.type !== '收藏卡') || i.status === '已過期');

        // Apply filtering
        const filteredInventory = activeInventory.filter(item => {
          if (backpackFilterType === 'all') return true;
          return item.type === backpackFilterType;
        });

        // Apply sorting (default: expiry date ascending - nulls last, then type ascending)
        const sortedInventory = [...filteredInventory].sort((a, b) => {
          if (backpackSortBy === 'default') {
            // 1. Expiry date (nulls last)
            if (a.expireAt && !b.expireAt) return -1;
            if (!a.expireAt && b.expireAt) return 1;
            if (a.expireAt && b.expireAt) {
              if (a.expireAt !== b.expireAt) {
                return a.expireAt.localeCompare(b.expireAt);
              }
            }
            // 2. Type secondary sort
            if (a.type !== b.type) {
              return a.type.localeCompare(b.type, 'zh-Hant');
            }
            return 0;
          }
          if (backpackSortBy === 'dateAcquired') {
            const dateA = a.dateAcquired || '';
            const dateB = b.dateAcquired || '';
            return dateB.localeCompare(dateA); // newest first
          }
          if (backpackSortBy === 'rarity') {
            const weights = { 'Mythic': 5, 'Legendary': 4, 'Epic': 3, 'Rare': 2, 'Common': 1 };
            const weightA = weights[a.rarity] || 0;
            const weightB = weights[b.rarity] || 0;
            return weightB - weightA; // highest weight first
          }
          return 0;
        });

        return (
          <div className="space-y-6 animate-success">
            {/* Animated 3D Interactive Backpack Header Console */}
            <div className="backpack-container">
              <div className="backpack-icon-wrapper">
                <span className="backpack-icon">🎒</span>
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-slate-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-900 shadow-md">
                  {inventory.filter(i => i.status === '未使用').length}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-100 uppercase tracking-widest relative z-10 flex items-center gap-2">
                {t('myBackpack')}
              </h3>
            </div>

            {/* Sorting and Filtering Controls */}
            {activeInventory.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{language === 'zh' ? '篩選類型' : 'Filter'}</span>
                  <select
                    value={backpackFilterType}
                    onChange={(e) => setBackpackFilterType(e.target.value)}
                    className="bg-slate-950 text-slate-200 text-xs font-bold border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full sm:w-40"
                  >
                    <option value="all">{language === 'zh' ? '全部卡片' : 'All Cards'}</option>
                    <option value="特權卡">{language === 'zh' ? '特權卡 (Privilege)' : 'Privilege'}</option>
                    <option value="體驗卡">{language === 'zh' ? '體驗卡 (Experience)' : 'Experience'}</option>
                    <option value="收藏卡">{language === 'zh' ? '收藏卡 (Collection)' : 'Collection'}</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{language === 'zh' ? '排序方式' : 'Sort By'}</span>
                  <select
                    value={backpackSortBy}
                    onChange={(e) => setBackpackSortBy(e.target.value)}
                    className="bg-slate-950 text-slate-200 text-xs font-bold border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
                  >
                    <option value="default">{language === 'zh' ? '預設 (使用期限 & 類型)' : 'Default (Expiry & Type)'}</option>
                    <option value="dateAcquired">{language === 'zh' ? '取得日期 (由新到舊)' : 'Date Acquired (Newest)'}</option>
                    <option value="rarity">{language === 'zh' ? '稀有度 (由高到低)' : 'Rarity (High to Low)'}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Items Area */}
            {sortedInventory.length === 0 ? (
              <div className="empty-state-card glass-panel p-8 text-center">
                <div className="empty-state-icon">🎒</div>
                <h4 className="text-md font-bold text-slate-300">{activeInventory.length === 0 ? t('backpackEmpty') : (language === 'zh' ? '沒有符合篩選條件的道具卡。' : 'No cards match the filter.')}</h4>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-normal">
                  {activeInventory.length === 0 ? t('backpackEmptyDesc') : (language === 'zh' ? '請嘗試更換其他篩選類別。' : 'Try selecting another category.')}
                </p>
              </div>
            ) : (
              (() => {
                // Keep selected item within the current list
                const activeSelection = selectedGridItem && sortedInventory.some(i => i.inventoryId === selectedGridItem.inventoryId)
                  ? selectedGridItem 
                  : sortedInventory[0];

                // Function to get grid slot emoji thumbnail based on item type
                const getItemIcon = (type) => {
                  if (type === '資源卡') return '💎';
                  if (type === '特權卡') return '🔑';
                  if (type === '體驗卡') return '👟';
                  if (type === '收藏卡') return '🏆';
                  return '📦';
                };

                const getRaritySlotBorderClass = (rarity) => {
                  if (rarity === 'Mythic') return 'rpg-slot-mythic';
                  if (rarity === 'Legendary') return 'rpg-slot-legendary';
                  if (rarity === 'Epic') return 'rpg-slot-epic';
                  if (rarity === 'Rare') return 'rpg-slot-rare';
                  return 'rpg-slot-common';
                };

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Left: 6x4 RPG Inventory Grid */}
                    <div className="lg:col-span-2 space-y-2">
                      <div className="text-[10px] text-slate-300 font-bold uppercase tracking-wider px-1">
                        {language === 'zh' ? '冒險背包欄位 (6 x 4 Grid)' : 'Backpack Slots (6 x 4 Grid)'}
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {Array.from({ length: 24 }).map((_, slotIdx) => {
                          const item = sortedInventory[slotIdx];
                          if (!item) {
                            // Empty slot
                            return (
                              <div 
                                key={`empty-${slotIdx}`}
                                className="rpg-grid-slot aspect-square flex items-center justify-center border border-white/5 bg-slate-950/40 text-slate-800"
                              >
                                <span className="text-lg opacity-20">⚙️</span>
                              </div>
                            );
                          }

                          // Occupied slot
                          const isSelected = activeSelection && activeSelection.inventoryId === item.inventoryId;
                          const isExpired = item.status === '已過期';
                          const isPending = item.status === '待核銷';

                          return (
                            <button
                              key={item.inventoryId}
                              type="button"
                              onClick={() => setSelectedGridItem(item)}
                              className={`rpg-grid-slot aspect-square flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                                getRaritySlotBorderClass(item.rarity)
                              } ${
                                isSelected 
                                  ? 'ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-400' 
                                  : ''
                              } ${
                                isExpired ? 'opacity-55' : ''
                              }`}
                            >
                              {/* Rarity/Status Indicators */}
                              <div className="absolute top-1 right-1 flex gap-0.5">
                                {isPending && (
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                                )}
                                {item.status === '已使用' && item.type === '收藏卡' && (
                                  <span className="text-[8px] leading-none">✨</span>
                                )}
                              </div>
                              
                              <span className="text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                {getItemIcon(item.type)}
                              </span>
                              
                              <span className="text-[8px] font-black text-slate-400 mt-1 truncate max-w-full px-0.5">
                                {item.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Detailed Inspector Panel */}
                    <div className="lg:col-span-1">
                      {activeSelection ? (
                        <div className={`rpg-tooltip-card p-5 border-2 ${getRarityClass(activeSelection.rarity)} flex flex-col gap-4 shadow-2xl relative animate-backpack-item`}>
                          {/* Card Rarity Badge & Date */}
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase tracking-wider ${
                              activeSelection.status === '已過期' 
                                ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                                : getRarityBadge(activeSelection.rarity)
                            }`}>
                              {activeSelection.rarity}
                            </span>
                            <span className="text-[10px] text-slate-300 font-mono">{activeSelection.dateAcquired}</span>
                          </div>

                          {/* Card Title & Speech Chaining */}
                          <div className="space-y-1">
                            <h4 className={`text-lg font-black ${activeSelection.status === '已過期' ? 'text-slate-500 line-through' : 'text-slate-100'} flex items-center gap-1`}>
                              {getItemIcon(activeSelection.type)} {renderTextWithZhuyin(activeSelection.name)}
                              <button
                                type="button"
                                onClick={() => handleSpeak(activeSelection, 'backpack')}
                                className={`kid-speak-btn p-1.5 ml-1 ${
                                  speakingTaskId === activeSelection.inventoryId ? 'is-speaking' : ''
                                }`}
                                title={language === 'zh' ? '語音讀道具卡' : 'Read Card Out Loud'}
                              >
                                {speakingTaskId === activeSelection.inventoryId ? (
                                  <VolumeX className="h-4.5 w-4.5" />
                                ) : (
                                  <Volume2 className="h-4.5 w-4.5" />
                                )}
                              </button>
                            </h4>
                            <div className="text-[10px] text-slate-300 font-bold">
                              {language === 'zh' ? '卡片類型：' : 'Card Type: '}{activeSelection.type}
                            </div>
                          </div>

                          {/* Card Lore / Desc */}
                          <p className="text-xs text-slate-200 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                            {renderTextWithZhuyin(activeSelection.desc)}
                          </p>

                          {activeSelection.expireAt && (
                            <p className={`text-[10px] font-bold ${activeSelection.status === '已過期' ? 'text-rose-500' : 'text-slate-400'}`}>
                              📅 {t('expiryDate')}: {activeSelection.expireAt} {activeSelection.status === '已過期' && `(${t('cardExpired')})`}
                            </p>
                          )}

                          {/* Status and Action Buttons */}
                          <div className="flex flex-col gap-3 border-t border-white/5 pt-3 mt-1">
                            <div className="flex items-center gap-1.5">
                              {activeSelection.status === '未使用' && <Clock className="h-4 w-4 text-cyan-400" />}
                              {activeSelection.status === '待核銷' && <Clock className="h-4 w-4 text-amber-400 animate-pulse" />}
                              {activeSelection.status === '已使用' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                              {activeSelection.status === '已過期' && <Ban className="h-4 w-4 text-rose-500" />}
                              <span className={`text-xs font-black uppercase tracking-wider ${
                                activeSelection.status === '未使用' ? 'text-cyan-400' :
                                activeSelection.status === '待核銷' ? 'text-amber-400' :
                                activeSelection.status === '已使用' ? 'text-emerald-400' : 'text-rose-500'
                              }`}>
                                {activeSelection.status === '未使用' ? t('voucherStatusUnused') :
                                 activeSelection.status === '待核銷' ? t('voucherStatusPending') :
                                 activeSelection.status === '已使用' ? t('voucherStatusUsed') :
                                 t('voucherStatusExpired')}
                              </span>
                            </div>

                            {activeSelection.status === '未使用' && (
                              isReadOnly ? (
                                <span className="text-xs text-slate-300 italic text-center py-2 bg-white/5 rounded-lg border border-white/5">
                                  ⚠️ {t('readOnlyTag')}
                                </span>
                              ) : activeSelection.type === '收藏卡' ? (
                                <button
                                  onClick={() => onToggleEquip(activeSelection.inventoryId)}
                                  className="w-full py-2 bg-[#00E676] text-[#111216] hover:bg-[#00c867] text-xs font-black rounded-xl transition-all shadow-[0_0_12px_rgba(0,230,118,0.25)] hover:scale-[1.02] active:scale-95"
                                >
                                  {language === 'zh' ? '佩戴展示徽章' : 'Equip Badge'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRedeemClick(activeSelection.inventoryId, false)}
                                  className="w-full py-2 bg-[#3661FF] text-white hover:bg-[#4e75ff] text-xs font-black rounded-xl transition-all shadow-[0_0_12px_rgba(54,97,255,0.25)] hover:scale-[1.02] active:scale-95"
                                >
                                  {language === 'zh' ? '出示核銷卡片' : 'Use Card'}
                                </button>
                              )
                            )}

                            {activeSelection.status === '已使用' && activeSelection.type === '收藏卡' && (
                              isReadOnly ? null : (
                                <button
                                  onClick={() => onToggleEquip(activeSelection.inventoryId)}
                                  className="w-full py-2 bg-[#FF4747] text-white hover:bg-rose-700 text-xs font-black rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                                >
                                  {language === 'zh' ? '取下佩戴徽章' : 'Unequip Badge'}
                                </button>
                              )
                            )}

                            {activeSelection.status === '待核銷' && (
                              <div className="flex flex-col gap-2">
                                <span className="text-xs text-amber-500 font-bold bg-amber-500/10 py-2 rounded-xl border border-amber-500/20 text-center">
                                  ⏳ {language === 'zh' ? '等待家長審核中...' : 'Pending parent approval...'}
                                </span>
                                {!isReadOnly && (
                                  <button
                                    onClick={() => onCancelRedeem(activeSelection.inventoryId)}
                                    className="w-full py-2 bg-rose-600/25 border border-rose-500/35 hover:bg-rose-600/40 text-rose-350 text-xs font-bold rounded-xl transition-all active:scale-95 shadow-sm"
                                  >
                                    {language === 'zh' ? '取消核銷要求' : 'Revert Use Request'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="glass-panel p-6 border-white/5 text-center text-slate-300 text-xs italic">
                          🎒 {language === 'zh' ? '點擊或懸停背包中的道具來查看詳情' : 'Click a card slot to inspect details'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}

            {/* Collapsible History Section for Used & Expired Items */}
            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                  🎫 {language === 'zh' ? '已核銷與失效道具歷史' : 'Redeemed & Expired Items History'}
                  {historyInventory.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black border" style={{ backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' }}>
                      {historyInventory.length}
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBackpackHistory(prev => !prev)}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 hover:border-white/20 text-slate-200 text-xs font-bold rounded-full shadow-sm transition-all duration-200 active:scale-95"
                >
                  <span>{showBackpackHistory ? (language === 'zh' ? '收起記錄' : 'Hide History') : (language === 'zh' ? '展開記錄' : 'Show History')}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${showBackpackHistory ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showBackpackHistory && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 animate-success">
                  {historyInventory.length === 0 ? (
                    <p className="text-xs text-slate-300 text-center py-6">
                      {language === 'zh' ? '無歷史紀錄。' : 'No history records.'}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {historyInventory.map(item => {
                        const isExpired = item.status === '已過期';
                        return (
                          <div key={item.inventoryId} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`font-bold ${isExpired ? 'text-slate-500 line-through' : 'text-slate-300'} flex items-center gap-1.5`}>
                                {renderTextWithZhuyin(item.name)}
                                <button
                                  type="button"
                                  onClick={() => handleSpeak(item, 'backpack')}
                                  className={`kid-speak-btn p-1.5 ml-1 ${
                                    speakingTaskId === item.inventoryId ? 'is-speaking' : ''
                                  }`}
                                  title={language === 'zh' ? '語音讀道具卡' : 'Read Card Out Loud'}
                                >
                                  {speakingTaskId === item.inventoryId ? (
                                    <VolumeX className="h-4 w-4" />
                                  ) : (
                                    <Volume2 className="h-4 w-4" />
                                  )}
                                </button>
                              </span>
                              <span className="text-[10px] text-slate-400">{item.dateAcquired}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">{renderTextWithZhuyin(item.desc)}</p>
                            <div className="flex items-center justify-between text-[9px] font-bold mt-1.5 pt-1 border-t border-white/5">
                              <span className={`px-1.5 py-0.5 rounded-md uppercase tracking-wider text-[8px] ${getRarityBadge(item.rarity)}`}>
                                {item.rarity}
                              </span>
                              <span className={`text-[10px] ${isExpired ? 'text-rose-500' : 'text-emerald-450'}`}>
                                {isExpired ? (language === 'zh' ? '已過期' : 'Expired') : (language === 'zh' ? '已核銷使用' : 'Redeemed')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}


      {/* --- Tab 5: Wishlist --- */}
      {activeSubTab === 'wishlist' && (
        <div className="space-y-6 animate-success">
          {wishlist.length === 0 ? (
            <div className="empty-state-card glass-panel p-12 text-center space-y-4">
              <div className="text-6xl animate-float">🏆</div>
              <h4 className="text-lg font-black text-slate-200">{t('familyWishlistTitle')}</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal">
                {t('noKidWishlistItems')}
              </p>
            </div>
          ) : (
            <>
              {wishlist.filter(w => w.isUltimate).map(wish => (
                <div key={wish.id} className="glass-panel p-6 border border-amber-500/30 bg-gradient-to-r from-slate-900 to-amber-500/5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="space-y-1">
                      <div className="text-xs text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                        <Trophy className="h-4 w-4 animate-bounce" />
                        {t('ultimatePrize')}
                      </div>
                      <h3 className="text-xl font-black text-slate-100">{wish.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-300">
                        {t('familyTotalPoints')}：<span className="text-amber-400 font-black">{familyScore}</span> / {wish.pointsNeeded} Pts
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-4 w-full bg-slate-950 border border-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (familyScore / wish.pointsNeeded) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold">
                      <span>{t('progress')}: {Math.min(100, Math.round((familyScore / wish.pointsNeeded) * 100))}%</span>
                      <span>{t('pointsShortOfUnlock', { count: Math.max(0, wish.pointsNeeded - familyScore) })}</span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-4">
                <h3 className="text-md font-bold text-slate-200">{t('familyWishlistTitle')}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlist.filter(w => !w.isUltimate).map(wish => {
                    const canRedeem = familyScore >= wish.pointsNeeded && !wish.isRedeemed;

                    return (
                      <div 
                        key={wish.id}
                        className={`glass-panel p-5 border flex flex-col justify-between gap-4 ${
                          wish.isRedeemed ? 'border-emerald-500/20 bg-emerald-500/5 opacity-70' : 'border-white/5'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-md font-bold text-slate-200">{wish.title}</h4>
                            {wish.isRedeemed && (
                              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                                {t('wishlistRedeemed')}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {t('pointsRequired')}：<span className="text-slate-200 font-bold">{wish.pointsNeeded} Pts</span>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-3 mt-1 flex items-center justify-between">
                          <span className="text-xs text-slate-300 font-bold">
                            {!wish.isRedeemed ? `${t('currentStatus')}: ${familyScore}/${wish.pointsNeeded} Pts` : t('familyWishRealized')}
                          </span>

                          {!wish.isRedeemed && !isReadOnly && (
                            <button
                              disabled={!canRedeem}
                              onClick={() => onClaimWishlistItem(wish.id)}
                              className={`px-3 py-1.5 rounded-[4px] text-xs font-black transition-all ${
                                canRedeem 
                                  ? 'bg-[#00E676] hover:bg-[#00c867] text-[#111216] shadow-md border-t border-white/20' 
                                  : 'bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors'
                              }`}
                            >
                              {t('claimWishlistBtn')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* --- Tab 6: Leaderboard --- */}
      {activeSubTab === 'leaderboard' && (
        <FamilyLeaderboardView 
          leaderboardData={leaderboardData}
          familyNickname={familyNickname}
          t={t}
          language={language}
        />
      )}

      {/* Avatar Selector Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 border border-violet-500/30 bg-[#17181c] max-w-md w-full rounded-2xl space-y-6 relative shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-md font-black text-slate-100 flex items-center gap-2">
                <Camera className="h-5 w-5 text-violet-400" />
                {t('selectAvatar')}
              </h3>
              <button 
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedAvatar(stats.avatar || 'boy');
                  setAvatarUploadError('');
                }} 
                className="text-slate-400 hover:text-slate-200 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                {t('selectDefaultAvatar')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAvatar('boy')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedAvatar === 'boy'
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-4xl">👦</span>
                  <span className="text-xs font-bold text-slate-300">{t('boyLabel')}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedAvatar('girl')}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                    selectedAvatar === 'girl'
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-4xl">👧</span>
                  <span className="text-xs font-bold text-slate-300">{t('girlLabel')}</span>
                </button>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {t('orUploadCustomImage')}
                </label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl p-4 hover:border-violet-500/50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleAvatarFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 pointer-events-none">
                    <Upload className="h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-400 font-semibold">{t('clickToUpload')}</span>
                    <span className="text-[10px] text-slate-500">{t('limit2MB')}</span>
                  </div>
                </div>

                {avatarUploadError && (
                  <p className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    {avatarUploadError}
                  </p>
                )}

                {/* Preview custom upload */}
                {selectedAvatar && selectedAvatar.startsWith('data:') && (
                  <div className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-xl">
                    <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden shrink-0">
                      <img src={selectedAvatar} alt="Custom Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs">
                      <p className="text-slate-200 font-bold">{t('customUploadPreview')}</p>
                      <p className="text-slate-500 text-[10px]">{t('customImageSelected')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={handleSaveAvatar}
                className="px-4 py-2 rounded-lg text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-colors"
              >
                {t('saveChanges')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAvatarModal(false);
                  setSelectedAvatar(stats.avatar || 'boy');
                  setAvatarUploadError('');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Tour Overlay for Kids */}
      {showTour && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm px-4 sm:px-0">
          <div className="bg-white border-2 border-[#3661FF] rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.18)] p-6 text-slate-800 flex flex-col gap-4 animate-success">
            
            {/* Step Header */}
            <div className="flex justify-between items-center">
              <span className="text-xs bg-[#3661FF] text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                {language === 'zh' ? `步驟 ${tourStep} / 6` : `Step ${tourStep} / 6`}
              </span>
              <button 
                onClick={() => {
                  setShowTour(false);
                  localStorage.setItem('questgrow_kid_tour_seen', 'true');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors text-xs font-black"
              >
                {t('tourSkip')}
              </button>
            </div>

            {/* Step Body */}
            <div className="flex gap-4 items-start">
              <div className="flex-1">
                <h4 className="text-base font-extrabold text-slate-950 mb-2 flex items-center gap-1.5">
                  {renderTextWithZhuyin(t(`kidTourStep${tourStep}Title`))}
                </h4>
                <p className="text-sm text-slate-650 font-medium leading-relaxed font-sans">
                  {renderTextWithZhuyin(t(`kidTourStep${tourStep}Desc`))}
                </p>
              </div>

              {/* Enhanced Voice Playback Button */}
              <button
                type="button"
                onClick={() => handleSpeakTourStep(tourStep)}
                className={`relative shrink-0 p-3 rounded-full shadow-lg transition-all duration-300 transform active:scale-90 flex items-center justify-center border-2 border-white ${
                  tourSpeaking
                    ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-105'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300 hover:to-amber-400 shadow-amber-500/40 hover:scale-105 animate-bounce-gentle'
                }`}
                style={{ minWidth: '46px', minHeight: '46px' }}
                title={language === 'zh' ? '語音導讀' : 'Read Out Loud'}
              >
                {/* Pulsing ring around the button */}
                {!tourSpeaking && (
                  <span className="absolute -inset-1 rounded-full border-2 border-amber-400/60 animate-ping pointer-events-none"></span>
                )}
                {tourSpeaking ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
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
                    localStorage.setItem('questgrow_kid_tour_seen', 'true');
                  } else {
                    setTourStep(prev => prev + 1);
                  }
                }}
                className="px-4 py-1.5 rounded-[4px] text-xs font-black bg-[#3661FF] hover:bg-[#254edb] text-white transition-colors shadow-md"
              >
                {tourStep === 6 ? t('tourFinish') : t('tourNext')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default KidPortal;
