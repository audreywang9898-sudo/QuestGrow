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
  Camera, Upload, Volume2, VolumeX, ChevronDown, HelpCircle
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
    if (text === null || text === undefined) return '';
    if (typeof text !== 'string' && typeof text !== 'number') {
      return text;
    }
    const textStr = String(text);
    if (!textStr) return '';
    const zhuyinEnabled = familySettings && familySettings.zhuyinUnder8 !== false;
    if (language !== 'zh' || !stats || !stats.age || stats.age >= 8 || !zhuyinEnabled) {
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
      const pinyins = pinyin(textStr, { type: 'array', toneType: 'num' });
      return (
        <span className="inline-flex flex-wrap items-end leading-relaxed">
          {[...textStr].map((char, index) => {
            const py = pinyins[index];
            const isChinese = /[\u4e00-\u9fa5]/.test(char);
            if (isChinese && py && py !== char) {
              const zyRaw = pinyinToZhuyin(py);
              const zy = getTaiwaneseZhuyin(char, zyRaw, index, textStr);
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
  const [activeSubTab, setActiveSubTab] = useState('character');
  const [backpackSortBy, setBackpackSortBy] = useState('default');
  const [backpackFilterType, setBackpackFilterType] = useState('all');

  // Onboarding Tour state
  const tourKey = currentUser ? `questgrow_kid_tour_seen_${currentUser.id}` : 'questgrow_kid_tour_seen';
  const [showTour, setShowTour] = useState(() => {
    return localStorage.getItem(tourKey) !== 'true';
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
 
  React.useEffect(() => {
    const forceKidTour = sessionStorage.getItem('questgrow_just_switched_to_kid_first_time');
    if (forceKidTour === 'true') {
      sessionStorage.removeItem('questgrow_just_switched_to_kid_first_time');
      setTourStep(1);
      setShowTour(true);
      localStorage.removeItem(tourKey);
    }
  }, [tourKey]);

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
  const [hideParentTip, setHideParentTip] = useState(() => {
    return localStorage.getItem('questgrow_hide_readonly_parent_tip') === 'true';
  });

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
    
    const safeAttributes = stats.attributes || { Wisdom: 0, Responsibility: 0, Courage: 0, Empathy: 0, Creativity: 0 };
    const attributes = [
      { val: safeAttributes.Wisdom || 0, name: "Wisdom" },
      { val: safeAttributes.Responsibility || 0, name: "Responsibility" },
      { val: safeAttributes.Empathy || 0, name: "Empathy" },
      { val: safeAttributes.Creativity || 0, name: "Creativity" },
      { val: safeAttributes.Courage || 0, name: "Courage" }
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
    <div className="kid-portal-wrapper space-y-5 relative">
      
      {/* Read-only mode banner */}
      {isReadOnly && (
        <div className="kid-readonly-banner p-4 flex items-center justify-between animate-success">
          <span className="flex items-center gap-2.5 text-amber-800 font-bold text-sm">
            <span className="text-2xl">👁️</span>
            <span>{t('readOnlyBanner', { name: stats.name })}</span>
          </span>
          <span className="kid-readonly-banner-tag">
            {t('readOnlyTag')}
          </span>
        </div>
      )}

      {/* Parent modifying children data helper tip */}
      {isReadOnly && currentUser?.role === 'parent' && !hideParentTip && (
        <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm animate-success">
          <div className="flex items-start gap-2.5">
            <span className="text-base shrink-0">💡</span>
            <div>
              <p className="font-black text-indigo-900 dark:text-indigo-200">
                {language === 'zh' ? '如何修改兒童資料？' : 'How to Edit Child Data?'}
              </p>
              <p className="mt-0.5 text-indigo-700 dark:text-indigo-400 leading-relaxed font-semibold">
                {language === 'zh' 
                  ? `目前為「唯讀模式」，您無法直接修改資料。該兒童的登入帳號為：${stats.email || '(無)'}。如需代表兒童提交任務、抽卡或兌換獎品，請登出並改用此兒童帳號登入；若要編輯該兒童的任務設定與獎勵點數，請點擊右上角「👨‍👩‍👧 切換家長模式」返回修改。`
                  : `Currently in "Read-Only Mode". The child's login email is: ${stats.email || '(None)'}. To submit tasks, draw cards, or redeem awards on their behalf, please log out and sign in using this child's email; to edit task configurations or points, click "👨‍👩‍👧 Switch to Parent Mode" at the top right.`
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem('questgrow_hide_readonly_parent_tip', 'true');
              setHideParentTip(true);
            }}
            className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[4px] text-[10px] font-black transition-all shadow-sm focus:outline-none"
          >
            {language === 'zh' ? '知道了，不再顯示' : 'Got it, don\'t show again'}
          </button>
        </div>
      )}

      {/* V2 Simulated FCM push notifications bell */}
      <div className="kid-notification-bar flex justify-between items-center">
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

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:block">{t('simulatedDateLabel')} {simulatedDate}</span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setTourStep(1);
                setShowTour(true);
                localStorage.removeItem(tourKey);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95 hover:scale-105"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}
              title={t('reopenTourBtn')}
            >
              <HelpCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{t('reopenTourBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Merged: Daily Encouragement + Family Goal Banner ── */}
      {(dailyProverb || maxPointsWish) && (
        <div className="kid-daily-banner overflow-hidden flex flex-col sm:flex-row">

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
                  {renderTextWithZhuyin(dailyProverb.contentZh)}
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
                    {renderTextWithZhuyin(maxPointsWish.title)}
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
              {familyScore >= maxPointsWish.pointsNeeded && !isReadOnly && (
                <button
                  onClick={() => onClaimWishlistItem(maxPointsWish.id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all active:scale-95 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                >
                  {t('claimWishlistBtn')}
                </button>
              )}
            </div>
          )}
        </div>
      )}




      {/* FCM Notifications Panel */}
      {showNotifications && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-4 space-y-3 max-w-md animate-success shadow-lg" style={{ boxShadow: '0 8px 32px rgba(99,102,241,0.1)' }}>
          <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="h-4 w-4" />
              {t('pushNotificationLogsTitle')}
            </h4>
            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">{t('close')}</button>
          </div>
          {fcmNotifications.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">{t('noNotifications')}</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {fcmNotifications.map(n => (
                <div key={n.id} className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-0.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-200">{n.title}</span>
                    <span className="text-slate-500">{n.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="kid-tab-bar flex overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveSubTab('character')}
          className={`kid-tab-btn ${activeSubTab === 'character' ? 'kid-tab-btn-char' : ''} ${showTour && tourStep === 1 ? 'kid-tour-ring' : ''}`}
        >
          <User className="h-4 w-4 flex-shrink-0" />
          {t('tabChar')}
        </button>
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`kid-tab-btn ${activeSubTab === 'tasks' ? 'kid-tab-btn-quests' : ''} ${showTour && tourStep === 2 ? 'kid-tour-ring' : ''}`}
        >
          <Award className="h-4 w-4 flex-shrink-0" />
          {t('tabQuests')}
          {activeTasksList.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shadow-sm ${activeSubTab === 'tasks' ? 'bg-white/30 text-white' : 'bg-rose-500 text-white'}`}>
              {activeTasksList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('gacha')}
          className={`kid-tab-btn ${activeSubTab === 'gacha' ? 'kid-tab-btn-gacha' : ''} ${showTour && tourStep === 3 ? 'kid-tour-ring' : ''}`}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          {t('tabSummon')}
          {stats.tickets > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black animate-pulse shadow-sm ${activeSubTab === 'gacha' ? 'bg-white/30 text-white' : 'bg-amber-400 text-amber-900'}`}>
              {stats.tickets}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('backpack')}
          className={`kid-tab-btn ${activeSubTab === 'backpack' ? 'kid-tab-btn-backpack' : ''} ${showTour && tourStep === 4 ? 'kid-tour-ring' : ''}`}
        >
          <Package className="h-4 w-4 flex-shrink-0" />
          {t('tabBackpack')}
          {inventory.filter(i => i.status === '未使用').length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${activeSubTab === 'backpack' ? 'bg-white/30 text-white' : 'bg-slate-200 text-slate-600'}`}>
              {inventory.filter(i => i.status === '未使用').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('wishlist')}
          className={`kid-tab-btn ${activeSubTab === 'wishlist' ? 'kid-tab-btn-wishlist' : ''} ${showTour && tourStep === 5 ? 'kid-tour-ring' : ''}`}
        >
          <Trophy className="h-4 w-4 flex-shrink-0" />
          {t('tabKidWishlist')}
        </button>
        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`kid-tab-btn ${activeSubTab === 'leaderboard' ? 'kid-tab-btn-leaderboard' : ''} ${showTour && tourStep === 6 ? 'kid-tour-ring' : ''}`}
        >
          <Trophy className="h-4 w-4 flex-shrink-0" />
          {t('tabLeaderboard')}
        </button>
      </div>

      {/* --- Tab 1: Character Sheet --- */}
      {activeSubTab === 'character' && (
        <div className="animate-success space-y-5">

          {/* ── TOP HERO BANNER ── */}
          <div className="relative rounded-3xl overflow-hidden" style={{
            background: stats.avatar === 'girl'
              ? 'linear-gradient(135deg, #f5576c 0%, #f093fb 30%, #764ba2 60%, #667eea 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #f093fb 70%, #f5576c 100%)',
            boxShadow: stats.avatar === 'girl'
              ? '0 20px 60px rgba(245,87,108,0.35), 0 8px 24px rgba(118,75,162,0.25)'
              : '0 20px 60px rgba(102,126,234,0.35), 0 8px 24px rgba(118,75,162,0.25)'
          }}>
            {/* Decorative shimmer */}
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)' }} />
            {/* Floating star decorations */}
            <span className="kid-hero-star text-2xl" style={{ top: '14%', right: '12%', '--duration': '2.8s', '--delay': '0s' }}>✨</span>
            <span className="kid-hero-star text-base" style={{ top: '60%', right: '7%', '--duration': '3.4s', '--delay': '0.6s' }}>⭐</span>
            <span className="kid-hero-star text-xl" style={{ top: '8%', left: '55%', '--duration': '2.2s', '--delay': '1.1s' }}>🌟</span>
            <span className="kid-hero-star text-sm" style={{ bottom: '20%', right: '22%', '--duration': '4s', '--delay': '0.3s' }}>💫</span>
            
            <div className="relative z-10 p-6 flex items-center gap-6">
              {/* Avatar with glow ring */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.3)', transform: 'scale(1.15)', filter: 'blur(8px)' }} />
                <div className="relative w-24 h-24 rounded-full border-4 border-white/60 shadow-2xl overflow-hidden bg-white/10">
                  <Avatar
                    avatar={stats.avatar}
                    role="kid"
                    badge={activeBadge}
                    badgePosition="bottom-left"
                    className="w-full h-full"
                  />
                </div>
                {!isReadOnly && (
                  <button
                    onClick={() => { setSelectedAvatar(stats.avatar || 'boy'); setShowAvatarModal(true); }}
                    className="absolute -bottom-1 -right-1 p-1.5 bg-white text-indigo-600 rounded-full shadow-lg border-2 border-indigo-100 hover:scale-110 transition-all"
                    title={t('editAvatar')}
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Name + Class + Info */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{stats.name}</h2>
                  <span className="bg-white/25 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/30 uppercase tracking-widest">
                    Lv.{stats.level}
                  </span>
                </div>
                <div className="text-white/90 font-bold text-sm mt-0.5 flex items-center gap-1.5">
                  <span>⚔️</span>
                  <span>{stats.jobClass}</span>
                </div>
                <div className="flex gap-3 text-white/70 text-xs font-semibold mt-1">
                  <span>🎂 {t('ageLabel', { age: stats.age || '--' })}</span>
                  <span>•</span>
                  <span>📅 {t('birthdayLabel', { birthday: stats.birthday || '--' })}</span>
                </div>
              </div>

              {/* Currency chips */}
              <div className="shrink-0 flex flex-col gap-2">
                <div className="kid-currency-chip">
                  <span className="text-xl">🪙</span>
                  <span>{stats.gold}</span>
                </div>
                <div className="kid-currency-chip">
                  <span className="text-xl">🎫</span>
                  <span>{stats.tickets}</span>
                </div>
              </div>
            </div>

            {/* HP & EXP bars inside banner */}
            <div className="relative z-10 px-6 pb-5 space-y-3">
              {/* HP Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-black text-white/95 uppercase tracking-wider mb-1.5">
                  <span>❤️ HP / Stamina</span>
                  <span>100 / 100 HP</span>
                </div>
                <div className="kid-bar-track">
                  <div className="kid-bar-hp" style={{ width: '100%' }} />
                </div>
              </div>
              {/* EXP Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-black text-white/95 uppercase tracking-wider mb-1.5">
                  <span>⚡ EXP</span>
                  <span>Lv.{stats.level} &nbsp;{stats.exp} / {stats.expNeeded}</span>
                </div>
                <div className="kid-bar-track">
                  <div className="kid-bar-exp" style={{ width: `${Math.min(100, (stats.exp / stats.expNeeded) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT: Radar + Attributes ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

            {/* Radar Chart Panel */}
            <div className="lg:col-span-2 rounded-3xl p-5 flex flex-col items-center gap-3" style={{
              background: stats.avatar === 'girl'
                ? 'linear-gradient(135deg, #ffffff 0%, #fff1f2 50%, #fce7f3 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #eef2ff 50%, #ede9fe 100%)',
              border: stats.avatar === 'girl'
                ? '2px solid rgba(244,63,94,0.2)'
                : '2px solid rgba(99,102,241,0.2)',
              boxShadow: stats.avatar === 'girl'
                ? '0 12px 40px rgba(244,63,94,0.12), 0 4px 12px rgba(244,63,94,0.06)'
                : '0 12px 40px rgba(99,102,241,0.12), 0 4px 12px rgba(99,102,241,0.06)'
            }}>
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: stats.avatar === 'girl' ? '#db2777' : '#6366f1' }}>⬡ 五大能力雷達圖</div>
              <svg width="240" height="240" viewBox="-20 -20 240 240" className="w-full max-w-[240px]">
                {/* Background polygons */}
                {getGridPentagons().map((pts, i) => (
                  <polygon key={i} points={pts} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="1.5" />
                ))}
                {/* Axis lines */}
                {[0, 1, 2, 3, 4].map(i => {
                  const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                  const x = 100 + 65 * Math.cos(angle);
                  const y = 100 + 65 * Math.sin(angle);
                  return <line key={i} x1="100" y1="100" x2={x} y2={y} stroke="rgba(99,102,241,0.12)" strokeWidth="1.5" />;
                })}
                {/* Data polygon */}
                <polygon
                  points={getRadarPoints()}
                  fill={stats.avatar === 'girl' ? 'rgba(236,72,153,0.15)' : 'rgba(99,102,241,0.15)'}
                  stroke={stats.avatar === 'girl' ? '#ec4899' : '#6366f1'}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  style={{
                    filter: stats.avatar === 'girl'
                      ? 'drop-shadow(0 0 6px rgba(236,72,153,0.4))'
                      : 'drop-shadow(0 0 6px rgba(99,102,241,0.4))'
                  }}
                />
                {/* Labels */}
                {(() => {
                  const safeAttr = stats.attributes || {};
                  const scores = [
                    safeAttr.Wisdom || 0,
                    safeAttr.Responsibility || 0,
                    safeAttr.Empathy || 0,
                    safeAttr.Creativity || 0,
                    safeAttr.Courage || 0
                  ];
                  const colors = ["#0284c7", "#16a34a", "#db2777", "#7c3aed", "#ea580c"];
                  const bgColors = ["#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe", "#ffedd5"];
                  return ['智', '德', '群', '美', '體'].map((label, i) => {
                    const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                    const x = 100 + 88 * Math.cos(angle);
                    const y = 100 + 88 * Math.sin(angle);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="16" fill={bgColors[i]} stroke={colors[i]} strokeWidth="1.5" opacity="0.9" />
                        <text x={x} y={y - 4} fill={colors[i]} fontSize="11" fontWeight="900" textAnchor="middle">{translateType(label)}</text>
                        <text x={x} y={y + 8} fill={colors[i]} fontSize="10" fontWeight="700" textAnchor="middle">{scores[i]}</text>
                      </g>
                    );
                  });
                })()}
              </svg>
            </div>

            {/* Attributes Panel */}
            <div className="lg:col-span-3 space-y-3">
              <div className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                🏆 {t('rpgAttributes')}
              </div>
              {[
                { name: "Wisdom",         nameFull: t('attrWisdomFull'),         val: stats.attributes?.Wisdom || 0,         desc: t('attrWisdomDesc'),         color: '#0284c7', bg: 'from-sky-50 to-blue-50',     border: 'border-sky-200',   icon: '🔮', barColor: '#0284c7' },
                { name: "Responsibility", nameFull: t('attrResponsibilityFull'), val: stats.attributes?.Responsibility || 0, desc: t('attrResponsibilityDesc'), color: '#16a34a', bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', icon: '🛡️', barColor: '#16a34a' },
                { name: "Courage",        nameFull: t('attrCourageFull'),        val: stats.attributes?.Courage || 0,        desc: t('attrCourageDesc'),        color: '#ea580c', bg: 'from-orange-50 to-amber-50',  border: 'border-orange-200', icon: '⚡', barColor: '#ea580c' },
                { name: "Empathy",        nameFull: t('attrEmpathyFull'),        val: stats.attributes?.Empathy || 0,        desc: t('attrEmpathyDesc'),        color: '#db2777', bg: 'from-pink-50 to-rose-50',    border: 'border-pink-200',   icon: '💖', barColor: '#db2777' },
                { name: "Creativity",     nameFull: t('attrCreativityFull'),     val: stats.attributes?.Creativity || 0,     desc: t('attrCreativityDesc'),     color: '#7c3aed', bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', icon: '🎨', barColor: '#7c3aed' }
              ].map((attr) => {
                const maxVal = 50;
                const pct = Math.min(100, (attr.val / maxVal) * 100);
                return (
                  <div key={attr.name} className={`kid-attr-card flex items-center gap-3 p-4 bg-gradient-to-r ${attr.bg} border-2 ${attr.border}`}>
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-md" style={{ background: `${attr.color}15`, border: `2px solid ${attr.color}30` }}>
                      {attr.icon}
                    </div>
                    {/* Label + Bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-black" style={{ color: attr.color }}>{attr.nameFull}</span>
                        <span className="text-2xl font-black tabular-nums" style={{ color: attr.color }}>{attr.val}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">{attr.desc}</div>
                      {/* Upgraded progress bar */}
                      <div className="h-3 rounded-full bg-white border-2 overflow-hidden" style={{ borderColor: `${attr.color}30` }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${attr.barColor}dd, ${attr.barColor})`, boxShadow: `0 0 8px ${attr.barColor}60` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Account Security ── */}
          <div className="rounded-2xl p-4 border" style={{
            background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
            borderColor: 'rgba(99,102,241,0.15)',
            boxShadow: '0 4px 16px rgba(99,102,241,0.06)'
          }}>
            <h4 className="text-xs font-black text-indigo-600 flex items-center gap-1.5 uppercase tracking-wider mb-2">
              🛡️ {t('accountSecurityAndGoogle')}
            </h4>
            <div className="text-[10px] text-slate-500 leading-relaxed">
              {t('currentLogin')}：<span className="text-slate-700 font-bold">{currentUser?.email}</span> ({currentUser?.googleId ? t('googleLinkedType') : t('passwordAccountType')})
            </div>
            {currentUser?.googleId ? (
              <div className="text-[10px] text-emerald-600 font-bold mt-1.5">✓ {t('googleLinkedSuccessText')}</div>
            ) : isReadOnly ? (
              <div className="text-[10px] text-slate-400 italic mt-1">{t('readOnlyGoogleBlock')}</div>
            ) : (
              <div className="space-y-2 mt-2">
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
                    className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 text-[10px] font-black rounded-xl border border-indigo-200 border-dashed transition-all text-center"
                  >
                    🤖 {t('enterGoogleSandbox')} (Sandbox Fallback)
                  </button>
                )}
              </div>
            )}
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
              color: 'border-emerald-500/50 bg-emerald-50 shadow-[0_0_12px_rgba(16,185,129,0.15)]', 
              headerTextColor: '#047857',
              bgStyle: 'quest-category-section quest-category-virtue',
              icon: '🛡️' 
            },
            { 
              type: '智', 
              key: 'dungeonWisdom', 
              color: 'border-cyan-500/50 bg-cyan-50 shadow-[0_0_12px_rgba(6,182,212,0.15)]', 
              headerTextColor: '#0369a1',
              bgStyle: 'quest-category-section quest-category-wisdom',
              icon: '🔮' 
            },
            { 
              type: '體', 
              key: 'dungeonCourage', 
              color: 'border-orange-500/50 bg-orange-50 shadow-[0_0_12px_rgba(249,115,22,0.15)]', 
              headerTextColor: '#c2410c',
              bgStyle: 'quest-category-section quest-category-courage',
              icon: '⚡' 
            },
            { 
              type: '群', 
              key: 'dungeonEmpathy', 
              color: 'border-pink-500/50 bg-pink-50 shadow-[0_0_12px_rgba(236,72,153,0.15)]', 
              headerTextColor: '#be185d',
              bgStyle: 'quest-category-section quest-category-empathy',
              icon: '🤝' 
            },
            { 
              type: '美', 
              key: 'dungeonCreativity', 
              color: 'border-purple-500/50 bg-purple-50 shadow-[0_0_12px_rgba(168,85,247,0.15)]', 
              headerTextColor: '#7e22ce',
              bgStyle: 'quest-category-section quest-category-creativity',
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
                        <span className="text-sm font-black flex items-center gap-1.5" style={{ color: cat.headerTextColor }}>
                          {cat.icon} {renderTextWithZhuyin(t(cat.key))}
                        </span>
                        <span 
                          className="text-xs font-bold px-2 py-0.5 rounded-full border shadow-sm"
                          style={{ 
                            color: '#ffffff', 
                            backgroundColor: cat.headerTextColor, 
                            borderColor: 'rgba(0,0,0,0.1)' 
                          }}
                        >
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
                                      <span className="text-md font-extrabold" style={{ color: '#1e293b' }}>{renderTextWithZhuyin(task.name)}</span>
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
                                    <p className="text-xs mt-1" style={{ color: '#475569' }}>{renderTextWithZhuyin(task.description)}</p>
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
                                          ? 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-100 border border-slate-200' 
                                          : 'text-slate-500 hover:text-violet-600 bg-slate-100 hover:bg-violet-50 border border-slate-200 hover:border-violet-300'
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
                                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-300/50 text-rose-700 text-xs mt-1">
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
                                <div className="mt-2 pt-2 border-t border-slate-200/80">
                                  {isReadOnly ? (
                                    <div className="text-center text-slate-500 font-bold text-xs py-2 bg-slate-100 rounded border border-slate-200">
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
                                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400/30"
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
                                          className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                                        />
                                        {photoError && (
                                          <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
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
              <div className="gacha-neon-header py-5 text-center border-b-2 border-indigo-300/30 relative z-10">
                <h3 className="text-2xl font-black text-white tracking-widest uppercase flex items-center justify-center gap-3" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  <span>🎰</span>
                  <span>QUEST SUMMONER</span>
                  <span className="text-xs bg-white/20 text-white border border-white/30 px-2.5 py-0.5 rounded-full font-mono backdrop-blur-sm">V.3</span>
                  <span>冒險扭蛋機</span>
                </h3>
                <div className="text-[11px] text-white/90 mt-1.5 font-bold tracking-wider">
                  {language === 'zh' ? '✨ 用幸運與累積的努力 召喚稀有寶藏卡牌 ✨' : '✨ Summon rare treasure cards with your hard-earned points ✨'}
                </div>
              </div>

              {/* Glass Tube window showing mystery capsules */}
              <div className="gacha-glass-area h-40 flex items-center justify-around px-10 relative overflow-hidden">
                {/* Floating mystery capsules - 3D styled colored orbs */}
                {[
                  { color: 'from-red-400 to-rose-600', glow: 'rgba(239,68,68,0.5)', delay: '0s', emoji: '🔴' },
                  { color: 'from-blue-400 to-indigo-600', glow: 'rgba(59,130,246,0.5)', delay: '0.4s', emoji: '🔵' },
                  { color: 'from-amber-400 to-orange-500', glow: 'rgba(245,158,11,0.5)', delay: '0.2s', emoji: '🟡' },
                  { color: 'from-emerald-400 to-teal-500', glow: 'rgba(52,211,153,0.5)', delay: '0.5s', emoji: '🟢' },
                  { color: 'from-purple-400 to-violet-600', glow: 'rgba(167,139,250,0.5)', delay: '0.3s', emoji: '🟣' },
                ].map((orb, i) => (
                  <div
                    key={i}
                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${orb.color} animate-bounce flex items-center justify-center`}
                    style={{
                      animationDelay: orb.delay,
                      animationDuration: '1.8s',
                      boxShadow: `0 8px 24px ${orb.glow}, 0 4px 8px rgba(0,0,0,0.15), inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.4)`,
                    }}
                  >
                    <span className="text-white text-lg font-black opacity-60">?</span>
                  </div>
                ))}
                {/* Decorative glow lines */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.4), transparent)' }}></div>
                <div className="absolute right-5 top-0 bottom-0 w-0.5 rounded-full" style={{ background: 'linear-gradient(to bottom, transparent, rgba(167,139,250,0.4), transparent)' }}></div>
              </div>

              {/* Control Panel Area */}
              <div className="gacha-control-panel p-6 grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
                
                {/* Left: Summon with Tickets 🎫 */}
                <div className="flex flex-col items-center justify-between p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl gap-3 shadow-sm">
                  <div>
                    <div className="text-sm font-black text-indigo-700 uppercase tracking-wider mb-1 flex items-center justify-center gap-1.5">
                      <span>🎫</span>
                      <span>{t('summonTitle') || '召喚殿堂'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-relaxed max-w-[180px] text-center">
                      {language === 'zh' ? '轉動旋鈕即可隨機召喚一張獎勵卡片！' : 'Twist the dial to summon a random reward card!'}
                    </div>
                  </div>
                  
                  {/* Premium Rotary Dial Button */}
                  <button
                    disabled={stats.tickets < 1 || isDrawingGacha || isReadOnly}
                    onClick={startDrawCard}
                    className={`gacha-rotary-knob w-24 h-24 rounded-full flex items-center justify-center relative ${
                      stats.tickets < 1 || isDrawingGacha || isReadOnly ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{ transform: isDrawingGacha ? 'rotate(360deg)' : 'rotate(0deg)' }}
                  >
                    {/* Inner cross indicator */}
                    <div className="w-14 h-3 bg-white/40 rounded-full absolute shadow-sm"></div>
                    <div className="w-3 h-14 bg-white/40 rounded-full absolute shadow-sm"></div>
                    <div className="w-10 h-10 bg-white/20 border-2 border-white/50 rounded-full z-10 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-4 h-4 bg-white rounded-full shadow-lg animate-pulse"></div>
                    </div>
                  </button>

                  <div className="text-[12px] text-indigo-600 font-extrabold animate-pulse">
                    {isDrawingGacha ? (language === 'zh' ? '✨ 正在轉動中...' : '✨ Drawing...') : (language === 'zh' ? '⭐ 旋轉扭蛋鈕 ⭐' : '⭐ Twist Dial ⭐')}
                  </div>

                  <div className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-xs text-center text-slate-600 shadow-sm">
                    {isReadOnly ? t('readOnlyGachaBlock') : (
                      <span>{t('availableTickets')}：<span className="text-indigo-600 text-sm font-extrabold ml-1">🎫 {stats.tickets}</span></span>
                    )}
                  </div>
                </div>

                {/* Right: Gold → Ticket exchange */}
                <div className="flex flex-col justify-between p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl gap-3 shadow-sm">
                  <div className="text-sm font-black text-amber-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <span>🏪</span>
                    <span>{t('vendingMachineTitle')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-relaxed max-w-[160px] mx-auto text-center">
                    {t('vendingMachineDesc')}
                  </div>
                  <div className="p-3 bg-white border border-amber-200 rounded-xl font-bold text-xs flex justify-between items-center shadow-sm">
                    <span className="text-amber-600 font-extrabold text-sm">🪙 {stats.gold}</span>
                    <span className="text-[9px] text-slate-500 font-bold uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">300 🪙 = 1 🎫</span>
                  </div>
                  <button
                    onClick={handleBuyTicket}
                    disabled={stats.gold < 300 || isBuyingTicket || isReadOnly}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      stats.gold >= 300 && !isBuyingTicket && !isReadOnly
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400 shadow-[0_4px_16px_rgba(245,158,11,0.35)] hover:scale-[1.02] active:scale-95' 
                        : 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isBuyingTicket && <span className="spinner-inline"></span>}
                    {isReadOnly ? t('readOnlyGachaBlock') : isBuyingTicket ? '...' : stats.gold >= 300 ? t('buyTicketBtn') : t('insufficientGold')}
                  </button>
                </div>

              </div>
              
              {/* Footer coin slot */}
              <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border-t border-indigo-100 text-center flex items-center justify-center gap-4 text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest rounded-b-[26px]">
                <span>INSERT COIN</span>
                <span className="w-2 h-4 bg-gradient-to-b from-rose-400 to-pink-600 rounded-sm animate-pulse shadow-[0_0_6px_rgba(244,63,94,0.5)]"></span>
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
              <div className={`glass-panel p-6 border-2 rounded-2xl mx-auto space-y-4 max-w-[300px] text-center bg-gradient-to-b from-white to-slate-50 ${getRarityClass(drawnCard.rarity)}`}>
                <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase tracking-widest ${getRarityBadge(drawnCard.rarity)}`}>
                  {drawnCard.rarity}
                </span>
                
                <div className="text-5xl mt-2">
                  {drawnCard.type === '資源卡' ? '💎' : drawnCard.type === '特權卡' ? '📜' : drawnCard.type === '體驗卡' ? '🗺️' : '🎖️'}
                </div>

                <div className="space-y-1">
                  <h4 className="text-md font-black text-slate-800 flex items-center justify-center gap-1.5">
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
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{drawnCard.type}</div>
                </div>

                <p className="text-xs text-slate-600 border-t border-slate-200 pt-3 leading-relaxed">
                  {renderTextWithZhuyin(drawnCard.desc)}
                </p>
              </div>

              <div className="text-xs text-slate-600">
                {drawnCard.type === '資源卡' 
                  ? t('resourceAdded') 
                  : t('cardAddedToBackpack')}
              </div>

              <button
                onClick={() => {
                  setGachaState('idle');
                  setDrawnCard(null);
                }}
                className="px-8 py-2.5 rounded-xl text-sm font-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-400 hover:to-purple-400 transition-all shadow-[0_4px_16px_rgba(99,102,241,0.4)] hover:scale-[1.02] active:scale-95"
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
          <div className="space-y-5 animate-success">
            {/* Compact Backpack Hero Banner */}
            <div className="backpack-hero-banner flex items-center gap-4 px-5 py-4 rounded-2xl relative overflow-hidden">
              {/* Decorative background orbs */}
              <div className="absolute right-0 top-0 w-32 h-32 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #a78bfa, transparent)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute right-10 bottom-0 w-20 h-20 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #60a5fa, transparent)', transform: 'translateY(40%)' }} />
              {/* Backpack icon - compact */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                  <span className="text-2xl select-none" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>🎒</span>
                </div>
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] bg-gradient-to-br from-rose-400 to-pink-500 text-white text-[11px] font-black px-1.5 rounded-full border-2 border-white shadow-md flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(244,63,94,0.4)' }}>
                  {inventory.filter(i => i.status === '未使用').length}
                </span>
              </div>
              {/* Title block */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black tracking-wide" style={{ color: '#1e293b', lineHeight: 1.2 }}>
                  {t('myBackpack')}
                </h2>
                <p className="text-sm font-semibold mt-0.5" style={{ color: '#6366f1' }}>
                  {language === 'zh' ? `共 ${activeInventory.length} 件道具卡` : `${activeInventory.length} items in bag`}
                </p>
              </div>
              {/* Stats chips */}
              <div className="hidden sm:flex flex-col gap-1.5 flex-shrink-0 text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-bold text-slate-600">{activeInventory.filter(i=>i.status==='未使用').length} {language==='zh'?'可用':'Available'}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-600">{activeInventory.filter(i=>i.status==='待核銷').length} {language==='zh'?'待審核':'Pending'}</span>
                </div>
              </div>
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
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
                    {/* Left: RPG Inventory Grid - takes 3/5 on large */}
                    <div className="lg:col-span-3 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="text-base">🗃️</span>
                          {language === 'zh' ? `道具欄 (${sortedInventory.length}/24)` : `Bag (${sortedInventory.length}/24)`}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm" style={{ background: 'rgba(148,163,184,0.5)', border: '1px solid rgba(148,163,184,0.8)' }}></span><span className="text-[10px] text-slate-400">Common</span>
                          <span className="w-2 h-2 rounded-sm ml-1" style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.7)' }}></span><span className="text-[10px] text-slate-400">Rare</span>
                          <span className="w-2 h-2 rounded-sm ml-1" style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.8)' }}></span><span className="text-[10px] text-slate-400">Epic+</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                        {Array.from({ length: 24 }).map((_, slotIdx) => {
                          const item = sortedInventory[slotIdx];
                          if (!item) {
                            // Empty slot
                            return (
                              <div 
                                key={`empty-${slotIdx}`}
                                className="rpg-grid-slot aspect-square flex items-center justify-center opacity-40"
                                style={{ borderStyle: 'dashed' }}
                              >
                                <span className="text-xl opacity-20">·</span>
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
                              className={`rpg-grid-slot aspect-square flex flex-col items-center justify-center p-1.5 cursor-pointer transition-all ${
                                getRaritySlotBorderClass(item.rarity)
                              } ${
                                isSelected 
                                  ? 'ring-2 ring-indigo-500 scale-105 shadow-[0_0_16px_rgba(99,102,241,0.5)]' 
                                  : 'hover:scale-105'
                              } ${
                                isExpired ? 'opacity-40 grayscale' : ''
                              }`}
                            >
                              {/* Status indicator dot */}
                              {isPending && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" style={{ animationDuration: '1.2s' }}></span>
                              )}
                              {item.status === '已使用' && item.type === '收藏卡' && (
                                <span className="absolute top-0.5 right-0.5 text-[10px]">✨</span>
                              )}
                              {/* Selected glow ring overlay */}
                              {isSelected && (
                                <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' }} />
                              )}
                              
                              <span className="text-[1.6rem] drop-shadow-sm leading-none">
                                {getItemIcon(item.type)}
                              </span>
                              
                              <span className="text-[10px] font-black mt-1.5 leading-tight text-center truncate w-full px-0.5" style={{ color: isExpired ? '#94a3b8' : '#334155' }}>
                                {item.name.length > 6 ? item.name.slice(0, 6) + '…' : item.name}
                              </span>
                              {/* Rarity color dot at bottom */}
                              <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                                item.rarity === 'Mythic' ? 'bg-rose-500' :
                                item.rarity === 'Legendary' ? 'bg-amber-400' :
                                item.rarity === 'Epic' ? 'bg-purple-500' :
                                item.rarity === 'Rare' ? 'bg-blue-500' : 'bg-slate-400'
                              }`}></span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Detailed Inspector Panel - takes 2/5 on large */}
                    <div className="lg:col-span-2">
                      {activeSelection ? (
                        <div className={`rpg-card-inspector border-2 ${getRarityClass(activeSelection.rarity)} flex flex-col gap-0 shadow-xl relative animate-backpack-item overflow-hidden`}>
                          {/* Rarity color bar at top */}
                          <div className={`h-2 w-full ${
                            activeSelection.rarity === 'Mythic' ? 'bg-gradient-to-r from-rose-500 to-red-400' :
                            activeSelection.rarity === 'Legendary' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                            activeSelection.rarity === 'Epic' ? 'bg-gradient-to-r from-purple-500 to-violet-400' :
                            activeSelection.rarity === 'Rare' ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                            'bg-gradient-to-r from-slate-300 to-slate-400'
                          }`} />

                          <div className="p-5 flex flex-col gap-4">
                            {/* Card header: rarity badge + date + icon */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {/* Big item icon */}
                                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{
                                  background: activeSelection.status === '已過期'
                                    ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                                    : activeSelection.rarity === 'Mythic' ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                                    : activeSelection.rarity === 'Legendary' ? 'linear-gradient(135deg, #fffbeb, #fef3c7)'
                                    : activeSelection.rarity === 'Epic' ? 'linear-gradient(135deg, #faf5ff, #f3e8ff)'
                                    : activeSelection.rarity === 'Rare' ? 'linear-gradient(135deg, #eff6ff, #dbeafe)'
                                    : 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                  border: '2px solid',
                                  borderColor: activeSelection.rarity === 'Mythic' ? 'rgba(239,68,68,0.4)'
                                    : activeSelection.rarity === 'Legendary' ? 'rgba(245,158,11,0.4)'
                                    : activeSelection.rarity === 'Epic' ? 'rgba(168,85,247,0.4)'
                                    : activeSelection.rarity === 'Rare' ? 'rgba(59,130,246,0.4)'
                                    : 'rgba(148,163,184,0.3)'
                                }}>
                                  <span className="text-3xl" style={{ filter: activeSelection.status === '已過期' ? 'grayscale(80%)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                                    {getItemIcon(activeSelection.type)}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-black rounded-full uppercase tracking-wider ${
                                    activeSelection.status === '已過期' 
                                      ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                                      : getRarityBadge(activeSelection.rarity)
                                  }`}>
                                    {activeSelection.rarity}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">{activeSelection.dateAcquired}</span>
                                </div>
                              </div>
                              {/* Speak button */}
                              <button
                                type="button"
                                onClick={() => handleSpeak(activeSelection, 'backpack')}
                                className={`kid-speak-btn p-2 flex-shrink-0 ${
                                  speakingTaskId === activeSelection.inventoryId ? 'is-speaking' : ''
                                }`}
                                title={language === 'zh' ? '語音讀道具卡' : 'Read Card Out Loud'}
                              >
                                {speakingTaskId === activeSelection.inventoryId ? (
                                  <VolumeX className="h-5 w-5" />
                                ) : (
                                  <Volume2 className="h-5 w-5" />
                                )}
                              </button>
                            </div>

                            {/* Card Title */}
                            <div>
                              <h3 className={`text-xl font-black leading-tight ${
                                activeSelection.status === '已過期' ? 'text-slate-400 line-through' : 'text-slate-800'
                              }`}>
                                {renderTextWithZhuyin(activeSelection.name)}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-bold" style={{ color: '#6366f1' }}>{activeSelection.type}</span>
                                {activeSelection.expireAt && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    activeSelection.status === '已過期' 
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    📅 {activeSelection.expireAt}
                                    {activeSelection.status === '已過期' && ` (${t('cardExpired')})`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card description */}
                            <div className="text-sm text-slate-700 leading-relaxed p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #f8faff, #f0f4ff)', border: '1px solid rgba(99,102,241,0.12)' }}>
                              {renderTextWithZhuyin(activeSelection.desc)}
                            </div>

                            {/* Status + Action area */}
                            <div className="flex flex-col gap-3 border-t pt-3" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                              {/* Status badge */}
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-black ${
                                  activeSelection.status === '未使用' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                  activeSelection.status === '待核銷' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  activeSelection.status === '已使用' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  'bg-rose-50 text-rose-600 border border-rose-200'
                                }`}>
                                  {activeSelection.status === '未使用' && <Clock className="h-4 w-4" />}
                                  {activeSelection.status === '待核銷' && <Clock className="h-4 w-4 animate-pulse" />}
                                  {activeSelection.status === '已使用' && <CheckCircle2 className="h-4 w-4" />}
                                  {activeSelection.status === '已過期' && <Ban className="h-4 w-4" />}
                                  <span>
                                    {activeSelection.status === '未使用' ? t('voucherStatusUnused') :
                                     activeSelection.status === '待核銷' ? t('voucherStatusPending') :
                                     activeSelection.status === '已使用' ? t('voucherStatusUsed') :
                                     t('voucherStatusExpired')}
                                  </span>
                                </div>
                              </div>

                              {/* Action buttons */}
                              {activeSelection.status === '未使用' && (
                                isReadOnly ? (
                                  <div className="py-3 text-sm text-slate-500 italic text-center bg-slate-50 rounded-xl border border-slate-200">
                                    ⚠️ {t('readOnlyTag')}
                                  </div>
                                ) : activeSelection.type === '收藏卡' ? (
                                  <button
                                    onClick={() => onToggleEquip(activeSelection.inventoryId)}
                                    className="w-full py-3 rounded-xl font-black text-base transition-all hover:scale-[1.02] active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #00E676, #00c867)', color: '#042f1e', boxShadow: '0 4px 16px rgba(0,230,118,0.35)' }}
                                  >
                                    ✨ {language === 'zh' ? '佩戴展示徽章' : 'Equip Badge'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleRedeemClick(activeSelection.inventoryId, false)}
                                    className="w-full py-3 rounded-xl font-black text-base transition-all hover:scale-[1.02] active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #3661FF, #6366f1)', color: 'white', boxShadow: '0 4px 16px rgba(54,97,255,0.4)' }}
                                  >
                                    🎫 {language === 'zh' ? '出示核銷卡片' : 'Use Card'}
                                  </button>
                                )
                              )}

                              {activeSelection.status === '已使用' && activeSelection.type === '收藏卡' && (
                                isReadOnly ? null : (
                                  <button
                                    onClick={() => onToggleEquip(activeSelection.inventoryId)}
                                    className="w-full py-3 rounded-xl font-black text-base transition-all hover:scale-[1.02] active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #FF4747, #e11d48)', color: 'white', boxShadow: '0 4px 12px rgba(255,71,71,0.3)' }}
                                  >
                                    🏅 {language === 'zh' ? '取下佩戴徽章' : 'Unequip Badge'}
                                  </button>
                                )
                              )}

                              {activeSelection.status === '待核銷' && (
                                <div className="flex flex-col gap-2">
                                  <div className="text-sm text-amber-700 font-bold py-3 rounded-xl border text-center" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', borderColor: 'rgba(245,158,11,0.3)' }}>
                                    ⏳ {language === 'zh' ? '等待家長審核中...' : 'Pending parent approval...'}
                                  </div>
                                  {!isReadOnly && (
                                    <button
                                      onClick={() => onCancelRedeem(activeSelection.inventoryId)}
                                      className="w-full py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95"
                                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626' }}
                                    >
                                      {language === 'zh' ? '取消核銷要求' : 'Revert Use Request'}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="rpg-card-inspector-empty p-8 text-center flex flex-col items-center justify-center gap-3" style={{ minHeight: '300px' }}>
                          <span className="text-5xl opacity-40" style={{ filter: 'grayscale(30%)' }}>🎒</span>
                          <p className="text-sm font-bold text-slate-500">
                            {language === 'zh' ? '點擊道具格查看詳情' : 'Click a card slot to inspect'}
                          </p>
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
        <div className="space-y-5 animate-success">

          {/* ── Page Header ── */}
          <div className="relative rounded-3xl overflow-hidden p-6" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            boxShadow: '0 16px 48px rgba(102,126,234,0.35)'
          }}>
            <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
            <div className="relative z-10 flex items-center gap-4">
              <div className="text-5xl animate-bounce" style={{ animationDuration: '2s' }}>🌟</div>
              <div>
                <h2 className="text-2xl font-black text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {t('familyWishlistTitle')}
                </h2>
                <p className="text-white/80 text-sm font-semibold mt-0.5">
                  {language === 'zh' ? '✨ 累積積分兌換夢想願望！' : '✨ Earn points to redeem your dream wishes!'}
                </p>
              </div>
              <div className="ml-auto text-right">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider">{language === 'zh' ? '家庭積分' : 'Family Score'}</div>
                <div className="text-3xl font-black text-white" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                  {(familyScore || 0).toLocaleString()}
                  <span className="text-lg text-white/70 ml-1">Pts</span>
                </div>
              </div>
            </div>
          </div>

          {wishlist.length === 0 ? (
            /* ── Empty State ── */
            <div className="rounded-3xl p-14 text-center space-y-4" style={{
              background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
              border: '1.5px solid rgba(99,102,241,0.15)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.08)'
            }}>
              <div className="text-7xl animate-bounce" style={{ animationDuration: '2s' }}>🏆</div>
              <h4 className="text-lg font-black text-slate-700">{t('familyWishlistTitle')}</h4>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {t('noKidWishlistItems')}
              </p>
            </div>
          ) : (
            <>
              {/* ── Ultimate Prize Card ── */}
              {wishlist.filter(w => w.isUltimate).map(wish => {
                const pct = Math.min(100, Math.round((familyScore / wish.pointsNeeded) * 100));
                const remaining = Math.max(0, wish.pointsNeeded - familyScore);
                const unlocked = familyScore >= wish.pointsNeeded;
                return (
                  <div key={wish.id} className="relative rounded-3xl overflow-hidden" style={{
                    background: unlocked
                      ? 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 50%, #fef9c3 100%)'
                      : 'linear-gradient(135deg, #f8faff 0%, #eef2ff 100%)',
                    border: unlocked ? '2px solid rgba(245,158,11,0.5)' : '1.5px solid rgba(99,102,241,0.2)',
                    boxShadow: unlocked
                      ? '0 16px 48px rgba(245,158,11,0.2), 0 0 0 4px rgba(245,158,11,0.05)'
                      : '0 8px 32px rgba(99,102,241,0.1)'
                  }}>
                    {/* Shimmer overlay */}
                    {unlocked && <div className="absolute inset-0 opacity-40" style={{ background: 'radial-gradient(ellipse at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 50%)' }} />}

                    <div className="relative z-10 p-6 space-y-5">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1.5">
                          <div className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${unlocked ? 'text-amber-600' : 'text-indigo-500'}`}>
                            <Trophy className="h-4 w-4 animate-bounce" style={{ animationDuration: '1.5s' }} />
                            {t('ultimatePrize')}
                            {unlocked && <span className="ml-1 bg-amber-500 text-white text-[9px] px-2 py-0.5 rounded-full">🔓 UNLOCKED!</span>}
                          </div>
                          <h3 className="text-2xl font-black" style={{ color: unlocked ? '#92400e' : '#1e293b' }}>{wish.title}</h3>
                        </div>
                        <div className={`text-right px-4 py-2 rounded-2xl ${unlocked ? 'bg-amber-100 border border-amber-200' : 'bg-indigo-50 border border-indigo-200'}`}>
                          <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: unlocked ? '#d97706' : '#6366f1' }}>
                            {language === 'zh' ? '目標積分' : 'Target'}
                          </div>
                          <div className="text-xl font-black" style={{ color: unlocked ? '#92400e' : '#4f46e5' }}>
                            {(wish.pointsNeeded || 0).toLocaleString()} Pts
                          </div>
                        </div>
                      </div>

                      {/* Big Progress Bar */}
                      <div className="space-y-2">
                        <div className="h-6 rounded-full overflow-hidden" style={{
                          background: unlocked ? 'rgba(251,191,36,0.15)' : 'rgba(99,102,241,0.1)',
                          border: unlocked ? '1.5px solid rgba(245,158,11,0.3)' : '1.5px solid rgba(99,102,241,0.2)',
                        }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                            style={{
                              width: `${pct}%`,
                              background: unlocked
                                ? 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)'
                                : 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                              backgroundSize: '200% 100%',
                              animation: 'shine-flow 2s infinite linear',
                              boxShadow: unlocked ? '0 0 12px rgba(245,158,11,0.5)' : '0 0 12px rgba(99,102,241,0.4)'
                            }}
                          >
                            {pct > 15 && (
                              <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-black">
                                {pct}%
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between text-xs font-bold">
                          <span style={{ color: unlocked ? '#d97706' : '#6366f1' }}>
                            {t('progress')}: {(familyScore || 0).toLocaleString()} / {(wish.pointsNeeded || 0).toLocaleString()} Pts
                          </span>
                          {remaining > 0 ? (
                            <span className="text-slate-500">
                              {t('pointsShortOfUnlock', { count: (remaining || 0).toLocaleString() })}
                            </span>
                          ) : (
                            <span className="text-amber-600 font-black">🎉 {language === 'zh' ? '達成！' : 'Achieved!'}</span>
                          )}
                        </div>
                      </div>

                      {/* Star progress indicators */}
                      <div className="flex gap-1.5 flex-wrap">
                        {[10, 25, 50, 75, 100].map(milestone => (
                          <div key={milestone} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                            pct >= milestone
                              ? unlocked ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {pct >= milestone ? '⭐' : '○'}
                            <span>{milestone}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── Regular Wish Cards ── */}
              {wishlist.filter(w => !w.isUltimate).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-sm font-black text-slate-600">🎁 {t('familyWishlistTitle')}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.filter(w => !w.isUltimate).map((wish, idx) => {
                      const canRedeem = familyScore >= wish.pointsNeeded && !wish.isRedeemed;
                      const pct = Math.min(100, Math.round((familyScore / wish.pointsNeeded) * 100));
                      const wishEmojis = ['🌴', '🎡', '🎮', '🎪', '🎭', '🏖️', '⛷️', '🎨', '🚀', '🎯'];
                      const emoji = wishEmojis[idx % wishEmojis.length];
                      const colors = [
                        { bg: 'from-sky-50 to-blue-50', border: 'border-sky-200', accent: '#0284c7', bar: 'linear-gradient(90deg, #0284c7, #38bdf8)' },
                        { bg: 'from-violet-50 to-purple-50', border: 'border-violet-200', accent: '#7c3aed', bar: 'linear-gradient(90deg, #7c3aed, #a78bfa)' },
                        { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200', accent: '#16a34a', bar: 'linear-gradient(90deg, #16a34a, #4ade80)' },
                        { bg: 'from-rose-50 to-pink-50', border: 'border-rose-200', accent: '#e11d48', bar: 'linear-gradient(90deg, #e11d48, #fb7185)' },
                        { bg: 'from-amber-50 to-orange-50', border: 'border-amber-200', accent: '#d97706', bar: 'linear-gradient(90deg, #d97706, #fbbf24)' },
                      ];
                      const c = colors[idx % colors.length];

                      return (
                        <div
                          key={wish.id}
                          className={`rounded-2xl p-5 border-2 bg-gradient-to-br ${c.bg} ${c.border} flex flex-col gap-4 transition-all hover:shadow-lg hover:scale-[1.01] ${wish.isRedeemed ? 'opacity-70' : ''}`}
                          style={{ boxShadow: `0 4px 20px ${c.accent}12` }}
                        >
                          {/* Top: Emoji + Title */}
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm" style={{ background: `${c.accent}15`, border: `1.5px solid ${c.accent}30` }}>
                              {emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base font-black text-slate-800">{wish.title}</h4>
                                {wish.isRedeemed && (
                                  <span className="bg-emerald-100 text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-black">
                                    ✅ {t('wishlistRedeemed')}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-bold mt-0.5" style={{ color: c.accent }}>
                                {t('pointsRequired')}：{(wish.pointsNeeded || 0).toLocaleString()} Pts
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1.5">
                            <div className="h-3 bg-white rounded-full overflow-hidden border" style={{ borderColor: `${c.accent}25` }}>
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: c.bar, boxShadow: `0 0 8px ${c.accent}50` }}
                              />
                            </div>
                            <div className="flex justify-between text-[10px] font-bold" style={{ color: c.accent }}>
                              <span>{(familyScore || 0).toLocaleString()} / {(wish.pointsNeeded || 0).toLocaleString()} Pts</span>
                              <span>{pct}%</span>
                            </div>
                          </div>

                          {/* Bottom: Status + Button */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 font-semibold">
                              {wish.isRedeemed ? (
                                <span className="text-emerald-600 font-black">🎊 {t('familyWishRealized')}</span>
                              ) : canRedeem ? (
                                <span className="font-black" style={{ color: c.accent }}>✨ {language === 'zh' ? '可以兌換了！' : 'Ready to redeem!'}</span>
                              ) : (
                                t('currentStatus') + `: ${(familyScore || 0).toLocaleString()}/${(wish.pointsNeeded || 0).toLocaleString()} Pts`
                              )}
                            </span>

                            {!wish.isRedeemed && !isReadOnly && (
                              <button
                                disabled={!canRedeem}
                                onClick={() => onClaimWishlistItem(wish.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                                  canRedeem
                                    ? 'text-white shadow-md hover:scale-105 active:scale-95'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                }`}
                                style={canRedeem ? {
                                  background: c.bar,
                                  boxShadow: `0 4px 16px ${c.accent}40`
                                } : {}}
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
              )}
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
                  localStorage.setItem(tourKey, 'true');
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
                  if (tourStep === 6) {
                    setShowTour(false);
                    localStorage.setItem(tourKey, 'true');
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
