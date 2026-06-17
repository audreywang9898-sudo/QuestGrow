const splitZhuyin = (zy) => {
  if (!zy) return { base: '', tone: '' };
  const tones = ['ˊ', 'ˇ', 'ˋ', '˙'];
  let base = '';
  let tone = '';
  for (let char of zy) {
    if (tones.includes(char)) {
      tone = char;
    } else {
      base += char;
    }
  }
  return { base, tone };
};

const testCases = ["ㄋㄧˇ", "ㄏㄠˇ", "ㄨㄛˇ", "ㄕˋ", "ㄉㄜ˙", "ㄅㄠ", "ㄇㄚˊ"];
testCases.forEach(tc => {
  const { base, tone } = splitZhuyin(tc);
  console.log(`Original: ${tc} -> Base: ${base}, Tone: ${tone}`);
});
