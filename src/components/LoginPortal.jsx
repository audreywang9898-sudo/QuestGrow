import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Key, Mail, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from './LanguageContext';

function LoginPortal({ onLogin, googleClientId, lineChannelId, onOpenFeedback }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('login'); // login, register, google_setup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState('parent'); // parent or kid
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Google Sandbox Simulator States
  const [showGoogleSandbox, setShowGoogleSandbox] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState('michelle.explorer@gmail.com');
  const [sandboxName, setSandboxName] = useState('Michelle');
  const [sandboxPicture, setSandboxPicture] = useState('girl');
  const [sandboxRole, setSandboxRole] = useState('parent');
  const [isSandboxFirstTime, setIsSandboxFirstTime] = useState(false);

  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [lineError, setLineError] = useState('');

  // Listen to LINE OAuth callback code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error === 'line_canceled' || error === 'access_denied') {
      setLineError(language === 'zh' ? '❌ 已取消 LINE 登入。' : '❌ LINE login canceled.');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    if (code) {
      setIsLineLoading(true);
      setLineError('');
      
      const getFallbackApiUrl = () => {
        if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
          return '/api';
        }
        return 'http://localhost:5000/api';
      };
      const apiBaseUrl = import.meta.env.VITE_API_URL || getFallbackApiUrl();

      const currentRedirectUri = window.location.origin + '/';

      fetch(`${apiBaseUrl}/auth/line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri: currentRedirectUri })
      })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.token) {
          onLogin({ token: data.token, user: data.user, isLine: true });
        } else {
          setLineError(data.message || (language === 'zh' ? 'LINE 驗證失敗' : 'LINE verification failed'));
          setIsLineLoading(false);
        }
      })
      .catch((err) => {
        console.error('LINE auth error:', err);
        setLineError(language === 'zh' ? '❌ 網路錯誤，無法與伺服器連線。' : '❌ Network error connecting to server.');
        setIsLineLoading(false);
      })
      .finally(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [onLogin, language]);

  // Poll for window.google availability in case script loads asynchronously
  useEffect(() => {
    if (window.google && google.accounts && google.accounts.id) {
      setGoogleScriptLoaded(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.google && google.accounts && google.accounts.id) {
        setGoogleScriptLoaded(true);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Diagnostics States
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState(null); // null, 'success', 'fail'
  const [diagDetails, setDiagDetails] = useState('');

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setDiagResult(null);
    setDiagDetails('');
    const getFallbackApiUrl = () => {
      if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
        return '/api';
      }
      return 'http://localhost:5000/api';
    };
    const targetUrl = import.meta.env.VITE_API_URL || getFallbackApiUrl();

    
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000); // 6s timeout
      
      const res = await fetch(`${targetUrl}/health`, { 
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(id);
      
      if (res.ok) {
        const data = await res.json();
        setDiagResult('success');
        setDiagDetails(data.message || '連線測試成功！後端 API 伺服器運作正常。');
      } else {
        setDiagResult('fail');
        setDiagDetails(`伺服器回應錯誤碼: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      setDiagResult('fail');
      setDiagDetails(err.message || err.toString() || '連線逾時或被拒絕 (Network Error)');
    } finally {
      setDiagnosing(false);
    }
  };

  const triggerLineLogin = () => {
    const channelId = lineChannelId || import.meta.env.VITE_LINE_CHANNEL_ID || '2006240212';
    const getCallbackUrl = () => {
      if (typeof window !== 'undefined') {
        return window.location.origin + '/';
      }
      return 'http://localhost:5173/';
    };
    const redirectUri = encodeURIComponent(getCallbackUrl());
    const state = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('questgrow_line_state', state);

    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${channelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
  };

  // Preset quick login selector for instant testing
  const presets = [
    { email: 'parent@questgrow.com', password: 'password123', label: `👩 ${t('presetParentLabel', { names: 'Audrey & Richard' })}`, desc: t('presetParentDesc') },
    { email: 'michelle@questgrow.com', password: 'password123', label: `👧 ${t('presetKidLabel', { name: 'Michelle' })}`, desc: t('presetKidDesc') },
    { email: 'daniel@questgrow.com', password: 'password123', label: `👦 ${t('presetKidLabel', { name: 'Daniel' })}`, desc: t('presetKidDesc') }
  ];

  // Try to load standard Google Identity Services button
  useEffect(() => {
    /* global google */
    if (window.google && google.accounts && google.accounts.id) {
      try {
        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID || googleClientId;
        if (!client_id) {
          return;
        }
        
        google.accounts.id.initialize({
          client_id,
          callback: (response) => {
            handleGoogleCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const container = document.getElementById("google-gsi-btn-container");
        if (container) {
          container.innerHTML = ""; // Clear previous button to prevent duplicate rendering
          google.accounts.id.renderButton(
            container,
            { 
              theme: "filled_blue", 
              size: "large", 
              text: "signin_with", 
              shape: "rectangular", 
              logo_alignment: "left",
              width: 320
            }
          );
        }
      } catch (err) {
        console.warn("Google GSI initialization failed, sandbox is available:", err);
      }
    }
  }, [googleClientId, activeTab, googleScriptLoaded]);

  // Pass raw standard Google JWT credential to backend
  const handleGoogleCredential = (credential) => {
    onLogin({
      credential,
      isGoogle: true
    });
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg(t('fillAllFieldsError'));
      return;
    }

    if (activeTab === 'login') {
      // Pass credentials to App.jsx handler
      const success = await onLogin({ email, password, isRegister: false });
      if (!success) {
        setErrorMsg(t('loginErrorPrompt'));
      }
    } else {
      if (!name) {
        setErrorMsg(t('fillNameError'));
        return;
      }
      if (!agreeTerms) {
        setErrorMsg(language === 'zh' ? '您必須同意服務條款與個資法告知事項才能進行註冊。' : 'You must agree to the Terms of Service and Privacy Policy to register.');
        return;
      }
      const success = await onLogin({ email, password, name, role: regRole, isRegister: true });
      if (!success) {
        setErrorMsg(t('emailAlreadyRegistered'));
      } else {
        // Switch to login tab and notify
        setActiveTab('login');
        setErrorMsg('');
        setEmail('');
        setPassword('');
        setName('');
        alert(t('registerSuccessAlert'));
      }
    }
  };

  const handleQuickLogin = async (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setErrorMsg('');
    const success = await onLogin({ email: preset.email, password: preset.password, isRegister: false });
    if (!success) {
      setErrorMsg(t('loginErrorPrompt'));
    }
  };

  const triggerGoogleSandboxAuth = () => {
    // Simulate retrieving Google account and passing credentials
    onLogin({
      credential: 'google-mock-' + sandboxEmail.replace(/[^a-zA-Z0-9]/g, ''),
      role: sandboxRole,
      isGoogle: true
    });
    setShowGoogleSandbox(false);
  };

  if (isLineLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900/90 backdrop-blur-sm z-[9999] fixed inset-0">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-[#06C755]/20 border-t-[#06C755] rounded-full animate-spin"></div>
            <span className="absolute inset-0 m-auto flex items-center justify-center text-lg animate-pulse">💬</span>
          </div>
          <p className="text-sm font-bold text-slate-300 tracking-wide animate-pulse">
            {language === 'zh' ? '正在與 LINE 進行安全連線驗證中，請稍候...' : 'Connecting securely with LINE, please wait...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#EBF4FC] select-none">
      
      {/* Background glowing effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-400/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-md w-full glass-panel p-8 border border-white/50 bg-white/70 shadow-2xl space-y-6">
        
        {/* Title Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-full flex items-center justify-center shadow-lg border border-white/20">
            <Shield className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-wider">QuestGrow</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            {t('tagline')}
          </p>
        </div>

        {/* Tab Headers */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-white/40">
          <button
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === 'login' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('loginTab')}
          </button>
          <button
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
              activeTab === 'register' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t('registerTab')}
          </button>
        </div>

        {/* Main form */}
        <form onSubmit={handleStandardSubmit} className="space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {lineError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{lineError}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('nicknameLabel')}</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input 
                  type="text" required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder={t('nicknamePlaceholder')}
                  className="w-full bg-white/60 border border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('emailLabel')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input 
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full bg-white/60 border border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('passwordLabel')}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Key className="h-4 w-4" />
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t('passwordPlaceholderInput')}
                className="w-full bg-white/60 border border-slate-200 focus:border-indigo-500 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-800 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('initialRoleLabel')}</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setRegRole('parent')}
                  className={`py-2 rounded-xl border font-bold text-xs transition-all ${
                    regRole === 'parent' 
                      ? 'bg-indigo-650/15 border-indigo-500 text-indigo-700' 
                      : 'bg-white/40 border-slate-250 text-slate-500 hover:bg-white/60'
                  }`}
                >
                  👩 {t('parentGuardianRole')}
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('kid')}
                  className={`py-2 rounded-xl border font-bold text-xs transition-all ${
                    regRole === 'kid' 
                      ? 'bg-indigo-650/15 border-indigo-500 text-indigo-700' 
                      : 'bg-white/40 border-slate-250 text-slate-500 hover:bg-white/60'
                  }`}
                >
                  👦 {t('kidExplorerRole')}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="space-y-3 pt-1 text-left">
              {regRole === 'kid' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] leading-relaxed font-bold rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>⚠️ 台灣兒少個資保護提醒</span>
                  </div>
                  <p className="font-medium">
                    依兒少法及個資法規範，兒童獨立註冊需由家長全程陪同確認。建議先由家長註冊帳號，再至「家長主控台」直接建立子角色，以確保最安全完整的個資隱私防護。
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 shrink-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="agree-terms" className="text-[11px] font-medium text-slate-500 leading-normal select-none">
                  我已閱讀並同意 QuestGrow 的{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold underline inline-block"
                  >
                    《服務條款、隱私權政策與個資保護告知事項》
                  </button>
                  。
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-black text-xs text-white bg-[#3661FF] hover:bg-[#4e75ff] transition-all uppercase tracking-wider shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
          >
            <span>{activeTab === 'login' ? t('loginBtn') : t('registerBtn')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-widest py-1">
          <div className="h-px bg-slate-200 flex-1"></div>
          <span className="px-3">{t('orUseThirdParty')}</span>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>

        {/* Social Authentication Area */}
        <div className="flex flex-col items-center gap-3">
          
          {/* Google Official GSI Button Container */}
          <div id="google-gsi-btn-container" className="min-h-[40px] flex justify-center w-full"></div>

          {/* LINE Official Login Button */}
          <button
            onClick={triggerLineLogin}
            type="button"
            className="relative flex items-center justify-center font-medium text-white transition-all hover:brightness-105 active:scale-[0.99] cursor-pointer"
            style={{
              backgroundColor: '#06C755',
              width: '320px',
              height: '40px',
              borderRadius: '4px',
              fontSize: '14px',
              border: 'none',
              boxShadow: '0 1px 1px 0 rgba(65,69,73,0.3), 0 1px 3px 1px rgba(65,69,73,0.15)',
              fontFamily: 'Roboto, arial, sans-serif'
            }}
          >
            {/* LINE logo SVG bubble positioned identically to Google logo */}
            <svg className="absolute left-[12px]" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M22 10.5C22 6.36 17.52 3 12 3S2 6.36 2 10.5C2 14.23 5.61 17.34 10.5 17.93C10.83 17.97 10.43 18.73 10.33 19.16C10.22 19.64 9.9 20.9 10.85 20.35C11.8 19.8 15.35 17.7 17.2 16.27C19.98 14.99 22 12.89 22 10.5ZM19 12.35H17.85V10.15H19V12.35ZM16.35 12.35H15.2V11.2L14 12.35H12.85V10.15H14V11.3L15.2 10.15H16.35V12.35ZM11.35 12.35H10.2V10.15H11.35V12.35ZM8.85 12.35H7.7V10.15H8.85V12.35Z"/>
            </svg>
            <span className="font-semibold">{language === 'zh' ? '使用 LINE 帳號登入' : 'Sign in with LINE'}</span>
          </button>

          {/* iOS / Mobile Browser Helper Tip */}
          <div className="mt-1 text-left bg-indigo-50/50 border border-indigo-100/60 p-3.5 rounded-xl text-[10px] text-slate-500 leading-relaxed space-y-1.5 max-w-[320px]">
            <p className="font-bold text-indigo-650 flex items-center gap-1">
              💡 {language === 'zh' ? '行動裝置 / iOS 用戶登入提示：' : 'Mobile / iOS Users Sign-in Tip:'}
            </p>
            <ul className="list-disc pl-3.5 space-y-1 font-medium">
              <li>
                {language === 'zh' 
                  ? '請避免在 LINE、FB、Instagram 等 App 內建瀏覽器開啟本網頁。請點選畫面右上角「...」，選擇「以瀏覽器開啟」或「在 Safari 開啟」後再登入。' 
                  : 'Avoid signing in inside in-app browsers (LINE, FB, IG). Tap the top-right "..." and select "Open in Browser" or "Open in Safari" first.'}
              </li>
              <li>
                {language === 'zh'
                  ? '若使用 Safari 出現白畫面，請前往手機的「設定 > Safari」，暫時將「阻擋彈出式視窗」與「防止跨網站追蹤」關閉後重試。'
                  : 'If Safari shows a blank page, go to "Settings > Safari" on your phone and temporarily turn OFF "Block Pop-ups" and "Prevent Cross-Site Tracking".'}
              </li>
            </ul>
          </div>
          {/*
          <div className="text-[9px] text-slate-400 font-mono text-center select-all -mt-1 mb-1">
            Active Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID || googleClientId || "None"}
          </div>
          */}

          {/* Fallback Sandbox Google Simulator Toggle (Commented out)
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setShowGoogleSandbox(true);
            }}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-400/40 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            🤖 {t('enterGoogleSandbox')}
          </button>
          */}
        </div>

        {/* 意見回饋與支援 */}
        <div className="pt-4 border-t border-slate-150 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <Mail className="h-3.5 w-3.5 text-indigo-500" />
          <span>需要協助或意見回饋？請點此：</span>
          <button 
            type="button"
            onClick={onOpenFeedback}
            className="font-bold text-indigo-600 hover:text-indigo-800 underline transition-colors focus:outline-none"
          >
            填寫線上意見回饋表單
          </button>
        </div>

        {/* Quick presets (Testing sandbox console - Commented out)
        {activeTab === 'login' && (
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('presetsTitle')}</div>
            <div className="grid grid-cols-1 gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickLogin(preset)}
                  type="button"
                  className="w-full text-left p-3 rounded-xl bg-white/40 border border-slate-200 hover:border-slate-350 hover:bg-white/60 transition-all flex flex-col justify-between"
                >
                  <span className="text-xs font-black text-slate-700">{preset.label}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">{preset.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        */}

        {/* Connection Diagnostics (Commented out)
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={runDiagnostics}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              diagnosing 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30'
            }`}
            disabled={diagnosing}
          >
            🔍 {diagnosing ? '正在測試後端連線...' : '連線診斷與部署助手 (Diagnostics)'}
          </button>

          {diagResult && (
            <div className={`p-4 rounded-xl border text-xs font-semibold space-y-2 text-left ${
              diagResult === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800'
            }`}>
              <div className="flex items-center gap-2 font-black">
                {diagResult === 'success' ? '✓ 連線成功' : '✗ 連線失敗'}
              </div>
              <p className="opacity-90 font-mono text-[10px] break-all">
                API URL: {import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com') ? '/api' : 'http://localhost:5000/api')}
              </p>
              <p className="opacity-90">
                詳細資訊: {diagDetails}
              </p>
              {diagResult === 'fail' && (
                <div className="mt-2 pt-2 border-t border-rose-500/20 text-[11px] text-rose-700 space-y-1">
                  <p className="font-bold">💡 部署排障建議 Checklist：</p>
                  <ul className="list-disc pl-4 space-y-1 text-[10px] font-medium leading-normal">
                    <li>請確認您的後端 Web Service 已在 Render 成功啟動並顯示為 Live。</li>
                    <li>
                      前端 React App 需要設定環境變數 <code className="bg-rose-500/20 px-1 rounded font-mono">VITE_API_URL</code> 指向後端網址（例如：<code className="bg-rose-500/20 px-1 rounded font-mono">https://your-backend.onrender.com/api</code>）。
                    </li>
                    <li className="text-amber-700 font-bold">
                      ⚠️ 重要：在 Render 後台修改 `VITE_API_URL` 後，前端 Static Site 必須點選 **Manual Deploy {"->"} Clear Cache and Deploy** 重新編譯，環境變數才會寫入 Vite 靜態檔案！
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        */}

      </div>

      {/* Google Sandbox Simulator Modal Console (Commented out)
      {showGoogleSandbox && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 border-2 border-indigo-500/30 bg-[#f7faff] max-w-md w-full rounded-2xl space-y-6 relative shadow-2xl animate-success">
            
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-md font-black text-indigo-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500 animate-float" />
                {t('googleSandboxTitle')}
              </h3>
              <button 
                type="button"
                onClick={() => setShowGoogleSandbox(false)} 
                className="text-slate-400 hover:text-slate-600 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-500 leading-normal">
                {t('googleSandboxDesc')}
              </p>

              <div className="space-y-3 bg-white/80 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('mockGoogleEmail')}</label>
                  <input 
                    type="email" value={sandboxEmail} onChange={(e) => setSandboxEmail(e.target.value)}
                    placeholder="google.name@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('mockName')}</label>
                  <input 
                    type="text" value={sandboxName} onChange={(e) => setSandboxName(e.target.value)}
                    placeholder="如: Leo (Gmail)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('mockAvatar')}</label>
                  <div className="flex gap-4 mt-1">
                    <button
                      type="button"
                      onClick={() => setSandboxPicture('boy')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border transition-all ${
                        sandboxPicture === 'boy' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      👦
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxPicture('girl')}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-xl border transition-all ${
                        sandboxPicture === 'girl' ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      👧
                    </button>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{t('sandboxFirstTimeRolePrompt')}</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSandboxRole('parent')}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        sandboxRole === 'parent' 
                          ? 'bg-indigo-650/10 border-indigo-500 text-indigo-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      👩 {t('presetParent')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSandboxRole('kid')}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        sandboxRole === 'kid' 
                          ? 'bg-indigo-650/10 border-indigo-500 text-indigo-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      👦 {t('presetKid')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={triggerGoogleSandboxAuth}
                className="px-4 py-2 rounded-lg text-xs font-black bg-[#00E676] text-[#111216] hover:bg-[#00c867] transition-all shadow-md"
              >
                🚀 {t('mockLoginBtn')}
              </button>
              <button
                type="button"
                onClick={() => setShowGoogleSandbox(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#252529] border border-[#35363A] text-[#b5b7bc] hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
            </div>

          </div>
        </div>
      )}
      */}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-6 border border-white/50 bg-white/95 max-w-2xl w-full rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600 animate-pulse" />
                QuestGrow 隱私權政策與個資法告知事項
              </h3>
              <button 
                type="button"
                onClick={() => setShowPrivacyModal(false)} 
                className="text-slate-400 hover:text-slate-650 font-black transition-colors text-base"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto my-4 pr-1 text-xs text-slate-600 space-y-4 text-left leading-relaxed font-medium">
              <p className="font-bold text-slate-700">
                歡迎使用 QuestGrow 系統（以下簡稱「本平台」）。本平台專為家庭與兒少成長追蹤設計。為了維護您的個人隱私並符合中華民國《個人資料保護法》（個資法）及《兒童及少年福利與權益保障法》（兒少法）之規範，特此向您告知並說明本平台之個資收集與隱私權保護政策：
              </p>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">一、個資蒐集之主體與目的</h4>
                <p>
                  蒐集主體為 QuestGrow 開發營運團隊。蒐集目的為協助家長與兒童進行數位化、遊戲化之每日成長任務追蹤、特權卡片獎勵兌換及 AI 成長分析報告。
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">二、蒐集之個人資料類別</h4>
                <ul className="list-decimal pl-4 space-y-1">
                  <li>家長帳號：註冊電子郵件信箱（Email）、密碼、姓名/暱稱、設定頭像。</li>
                  <li>兒童帳號：家長建立或陪同註冊之兒童姓名/暱稱、年齡、生日（僅用以在系統內為8歲以下兒童啟用注音引導模式與難度自適應）、角色頭像。</li>
                  <li>系統活動數據：任務內容、心得文字、照片佐證（由兒童上傳提供家長覆核）、成長積分、金幣、抽卡券與背包卡片紀錄。</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">三、個人資料利用之期間、地區、對象及方式</h4>
                <ul className="list-decimal pl-4 space-y-1">
                  <li>期間：自您註冊帳戶之日起，至您申請註銷帳戶、刪除所有家庭成員數據或本平台終止營運之日止。</li>
                  <li>地區：本平台伺服器所在地及提供雲端服務託管之區域。</li>
                  <li>對象：本系統之個資及活動數據，其閱覽權限僅嚴格限於您同一個家庭群組（Family ID）之成員（您的家長或您的小孩），任何人均無法跨家庭查閱他人 log 紀錄。本平台絕不將個資向任何外部無關第三方提供、出售或共用。</li>
                  <li>利用方式：系統將個資用於登入驗證、任務審核、背包道具裝備、徽章展示及 AI 成長報表摘要之運算生成。</li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">四、兒少隱私特別保護條款（家長同意）</h4>
                <p>
                  為落實兒少保護，本平台限制 12 歲以下之兒童不得單獨建立獨立帳戶，應由家長（法定代理人）於「家長主控台」直接為其新增子角色。若兒童直接於登入頁面進行註冊，必須在獲得法定代理人現場指導及明示同意下進行，且家長隨時可依個資法對其子女個資行使查閱或刪除權利。
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">五、當事人權利之行使（個資法第 3 條）</h4>
                <p>
                  您與您的子女就其個資依法享有以下權利：
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>查詢或請求閱覽、請求製給複製本。</li>
                  <li>請求補充或更正。</li>
                  <li>請求停止蒐集、處理或利用。</li>
                  <li>
                    <strong>請求刪除（個資銷毀權/Right to be Forgotten）</strong>：家長帳號隨時有權至「系統設定」分頁中使用「完全銷毀家庭所有資料」功能，一鍵自伺服器資料庫中將您家庭、孩子帳號、任務、日誌等所有資料做物理性徹底刪除，絕不留存任何備份。
                  </li>
                </ul>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-black text-slate-800 text-xs">六、不提供個人資料所致之影響</h4>
                <p>
                  本平台為完全實名註冊與家庭綁定之系統，若您選擇不提供上述必要個資（如註冊 Email、成員暱稱），系統將無法為您建立帳戶並提供成長任務追蹤及 AI 成長日誌分析服務。
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 justify-end border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => {
                  setAgreeTerms(true);
                  setShowPrivacyModal(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-black bg-[#3661FF] text-white hover:bg-[#4e75ff] transition-all shadow-md hover:shadow-lg"
              >
                我已閱讀並同意
              </button>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                關閉
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default LoginPortal;
