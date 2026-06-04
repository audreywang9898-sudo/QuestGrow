import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Key, Mail, User, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from './LanguageContext';

function LoginPortal({ onLogin, googleClientId }) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('login'); // login, register, google_setup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [regRole, setRegRole] = useState('parent'); // parent or kid
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Google Sandbox Simulator States
  const [showGoogleSandbox, setShowGoogleSandbox] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState('leo.explorer@gmail.com');
  const [sandboxName, setSandboxName] = useState('小格林 (Leo)');
  const [sandboxPicture, setSandboxPicture] = useState('boy');
  const [sandboxRole, setSandboxRole] = useState('parent');
  const [isSandboxFirstTime, setIsSandboxFirstTime] = useState(false);

  // Diagnostics States
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState(null); // null, 'success', 'fail'
  const [diagDetails, setDiagDetails] = useState('');

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setDiagResult(null);
    setDiagDetails('');
    const targetUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
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

  // Preset quick login selector for instant testing
  const presets = [
    { email: 'parent@questgrow.com', password: 'password123', label: `👩 ${t('presetParentLabel', { names: 'Audrey & Richard' })}`, desc: t('presetParentDesc') },
    { email: 'kid@questgrow.com', password: 'password123', label: `👦 ${t('presetKidLabel', { name: 'Leo' })}`, desc: t('presetKidDesc') },
    { email: 'michelle@questgrow.com', password: 'password123', label: `👧 Michelle (${t('presetKid')})`, desc: t('presetKidReadOnly') },
    { email: 'daniel@questgrow.com', password: 'password123', label: `👦 Daniel (${t('presetKid')})`, desc: t('presetKidReadOnly') }
  ];

  // Try to load standard Google Identity Services button
  useEffect(() => {
    /* global google */
    if (window.google && google.accounts && google.accounts.id) {
      try {
        google.accounts.id.initialize({
          client_id: googleClientId || "853920950328-mockclientid.apps.googleusercontent.com",
          callback: (response) => {
            handleGoogleCredential(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });

        google.accounts.id.renderButton(
          document.getElementById("google-gsi-btn-container"),
          { 
            theme: "filled_blue", 
            size: "large", 
            text: "signin_with", 
            shape: "rectangular", 
            logo_alignment: "left",
            width: 320
          }
        );
      } catch (err) {
        console.warn("Google GSI initialization failed, sandbox is available:", err);
      }
    }
  }, [googleClientId, activeTab]);

  // Decode standard Google JWT credential
  const handleGoogleCredential = (credential) => {
    try {
      // Decode JWT payload (standard Google GSI return)
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
         atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      // Successfully decoded!
      onLogin({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture || 'boy',
        isGoogle: true,
        googleId: payload.sub
      });
    } catch (err) {
      setErrorMsg(t('googleDecodeError'));
    }
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
      email: sandboxEmail,
      name: sandboxName,
      avatar: sandboxPicture,
      role: sandboxRole,
      isGoogle: true,
      googleId: 'google-mock-' + sandboxEmail.replace(/[^a-zA-Z0-9]/g, '')
    });
    setShowGoogleSandbox(false);
  };

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

          {/* Fallback Sandbox Google Simulator Toggle */}
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
        </div>

        {/* Quick presets (Testing sandbox console) */}
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

        {/* Connection Diagnostics */}
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
                API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
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

      </div>

      {/* Google Sandbox Simulator Modal Console */}
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

    </div>
  );
}

export default LoginPortal;
