import { pinyin } from 'pinyin-pro';
import { pinyinToZhuyin } from 'pinyin-zhuyin';

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

const renderTextWithZhuyin = (text) => {
  if (!text) return '';
  try {
    const pinyins = pinyin(text, { type: 'array', toneType: 'num' });
    const result = [...text].map((char, index) => {
      const py = pinyins[index];
      const isChinese = /[\u4e00-\u9fa5]/.test(char);
      if (isChinese && py && py !== char) {
        const zyRaw = pinyinToZhuyin(py);
        const zy = getTaiwaneseZhuyin(char, zyRaw, index, text);
        const { base, toneChar, toneClass } = splitZhuyin(zy);
        return { char, base, toneChar, toneClass };
      }
      return { char };
    });
    return result;
  } catch (e) {
    console.error('Zhuyin generation error:', e);
    throw e;
  }
};

const testCases = [
  "千里之行，始於足下。",
  "🛡️ 德行修煉副本",
  "🔮 智慧神殿副本",
  "⚡ 風暴峽谷副本",
  "🤝 共感森林副本",
  "🎨 飛空浮島副本",
  "閱讀好書 20 分鐘",
  "🪙 每日收支記帳與小反思",
  "🪙 意「省電節能」小管家",
  "今天閱讀《哈利波特》並分享精彩片段給媽媽聽。",
  "⚔️ 歡迎，小小冒險者！",
  "哈利波特"
];

console.log("Starting tests...");
testCases.forEach((tc, idx) => {
  console.log(`\nTest #${idx + 1}: "${tc}"`);
  try {
    const res = renderTextWithZhuyin(tc);
    console.log(`SUCCESS. Output length: ${res.length}`);
  } catch (err) {
    console.error(`FAILED on "${tc}":`, err);
  }
});
