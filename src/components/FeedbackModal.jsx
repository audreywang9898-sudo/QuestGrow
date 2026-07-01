import React, { useState } from 'react';
import { Mail, Send, X, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';

function FeedbackModal({ onClose, currentUser, showToast }) {
  const [category, setCategory] = useState('功能建議');
  const [content, setContent] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!category || !content) {
      setErrorMsg('請填寫所有必填欄位。');
      return;
    }

    // --- Frontend Sensitive Words & Meaningless Spam Filtering ---
    const SENSITIVE_WORDS = [
      '幹', '操你', '機掰', '屁股', '垃圾系統', '三小', '強姦', '智障', '白痴', '王八蛋',
      'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'crap'
    ];
    const processedContent = content
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\p{L}\p{N}]/gu, ''); // Keep only letters and numbers

    if (SENSITIVE_WORDS.some(word => processedContent.includes(word))) {
      setErrorMsg('您的意見回饋中包含不當字詞，請修正後再試。');
      return;
    }

    const cleanedContent = content
      .replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
      .replace(/[^\p{L}\p{N}]/gu, ''); // Remove spaces, punctuation and special signs
    if (cleanedContent.trim().length < 2) {
      setErrorMsg('請提供更具體的文字意見說明（不可僅包含 Emoji 或標點符號）。');
      return;
    }

    if (!currentUser && (!name || !email)) {
      setErrorMsg('未登入狀態下，姓名與信箱為必填項目。');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitFeedback({
        name,
        email,
        category,
        content
      });
      showToast('🎉 感謝您的寶貴意見！我們會盡快處理。', 'success');
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || '送出意見回饋失敗，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
      <div className="relative max-w-md w-full glass-panel p-6 border border-white/50 bg-white/95 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-up text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <h3 className="text-md font-black text-slate-900 flex items-center gap-2">
            <Mail className="h-5 w-5 text-indigo-650" />
            意見回饋與支援 (Feedback & Support)
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-650 font-black transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-left">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">回饋類別 (Category) *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border border-slate-250 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-semibold"
            >
              <option value="功能建議">💡 功能建議 (Feature Suggestion)</option>
              <option value="問題回報">🐞 問題回報 (Bug Report)</option>
              <option value="其他">❓ 其他意見 (Other)</option>
            </select>
          </div>

          {/* Name & Email (Shown only if guest, otherwise prefilled/hidden) */}
          {!currentUser ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">您的姓名 (Name) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：王小明"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">聯絡信箱 (Email) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-xl flex flex-col gap-1 text-[11px] text-slate-500 font-semibold">
              <div className="flex justify-between">
                <span>送出帳號: <strong className="text-slate-700">{currentUser.name}</strong></span>
                <span>信箱: <strong className="text-slate-700">{currentUser.email}</strong></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5">（系統將自動關聯您的家庭方案與使用者 ID，以便技術團隊進行問題排查）</span>
            </div>
          )}

          {/* Content Description */}
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">詳細說明描述 (Description) *</label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="請詳細描述您的建議、想法或遇到的問題，我們會有專人回信給您..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed"
            />
          </div>

          {/* Footer buttons inside form */}
          <div className="flex gap-3 justify-end border-t border-slate-200 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-650 transition-colors"
            >
              取消 (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-5 py-2 rounded-xl text-xs font-black text-white bg-[#3661FF] hover:bg-[#4e75ff] transition-all shadow-md flex items-center gap-1.5 ${
                submitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submitting ? '傳送中...' : '送出回饋 (Submit)'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default FeedbackModal;
