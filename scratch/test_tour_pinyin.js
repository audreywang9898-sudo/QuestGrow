import { pinyin } from 'pinyin-pro';
import { pinyinToZhuyin } from 'pinyin-zhuyin';

const kidTourSteps = {
  step1: {
    title: "歡迎，小小冒險者！",
    desc: "這是你的角色狀態面板。你可以查看自己的等級、經驗值、金幣與抽卡券。你的職業（如探索者、智者、守護者）會根據你最高的能力屬性自動轉換喔！"
  },
  step2: {
    title: "冒險任務庫 (Quest Board)",
    desc: "在這裡查看你所有進行中的任務。點擊「提交」按鈕，可以留下給爸媽的心得留言，甚至拍下完成的照片，上傳給爸媽進行覆核審批！"
  },
  step3: {
    title: "召喚殿堂 (Summon Hall)",
    desc: "在這裡花費你在任務中賺到的「抽卡券」，召喚神秘寶箱！你可以抽到特權卡（如多玩 30 分鐘平板）、體驗卡（與爸媽單獨約會吃冰淇淋）、或是酷炫的角色稱號與徽章！"
  },
  step4: {
    title: "神秘背包 (Backpack)",
    desc: "這裡會存放你所抽到的所有道具卡與徽章。點擊卡片可以「申請使用」它（需要爸媽審核同意），或者「裝備」你的收藏稱號，讓你的狀態欄變得超級酷炫！"
  },
  step5: {
    title: "家庭願望清單 (Wishlist)",
    desc: "這是全家人的共同大願望！每次你完成任務，都會增加全家的「家庭總積分」。當積分集滿時，就可以兌換全家人的大願望囉！快去接任務，和小隊員們一起努力吧！"
  }
};

const getZhuyinText = (text) => {
  const pinyins = pinyin(text, { type: 'array', toneType: 'num' });
  let result = [];
  [...text].forEach((char, index) => {
    const py = pinyins[index];
    const isChinese = /[\u4e00-\u9fa5]/.test(char);
    if (isChinese && py && py !== char) {
      result.push(`${char}(${pinyinToZhuyin(py)})`);
    } else {
      result.push(char);
    }
  });
  return result.join(' ');
};

for (const [step, content] of Object.entries(kidTourSteps)) {
  console.log(`=== ${step} ===`);
  console.log("Title Zhuyin:", getZhuyinText(content.title));
  console.log("Desc Zhuyin:", getZhuyinText(content.desc));
}
