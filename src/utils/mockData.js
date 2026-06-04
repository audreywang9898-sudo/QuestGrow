// QuestGrow Initial Mock Data

export const INITIAL_CHILD_STATS = {
  id: "child-default",
  name: "小格林 (Leo)",
  age: 10,
  birthday: "10/24",
  avatar: "boy",
  level: 3,
  exp: 420,
  expNeeded: 1000,
  gold: 350,
  tickets: 5,
  jobClass: "Explorer (探索者) ⚔️", // Primary class based on highest attribute (initially Courage)
  attributes: {
    Wisdom: 18,       // 智
    Responsibility: 15, // 德
    Courage: 24,      // 體
    Empathy: 12,      // 群
    Creativity: 14     // 美
  }
};

export const TASK_TEMPLATES = [
  {
    id: "t1",
    name: "閱讀好書 20 分鐘",
    description: "閱讀一本故事書、科普書或課外書，並向爸媽簡單分享心得。",
    type: "智", // 智 -> Wisdom
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },
  {
    id: "t2",
    name: "自主整理房間與書桌",
    description: "書本歸位、垃圾丟棄、棉被折好、桌椅擦拭乾淨。",
    type: "德", // 德 -> Responsibility
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Sparkles"
  },
  {
    id: "t3",
    name: "戶外超慢跑 1.5 公里",
    description: "配合節奏超慢跑，鍛鍊體能與耐力。",
    type: "體", // 體 -> Courage
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t4",
    name: "主動幫助家人做家事",
    description: "例如洗碗、倒垃圾、摺衣服，展現貼心。",
    type: "德", // 德 -> Responsibility
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t5",
    name: "練習英文單字與對話",
    description: "在口說 App 或平台練習 5 個新單字及 3 句生活對話。",
    type: "智", // 智 -> Wisdom
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "GraduationCap"
  },
  {
    id: "t6",
    name: "畫一幅畫或手作一件創意作品",
    description: "用想像力創作出獨一無二的作品並分享創作理念。",
    type: "美", // 美 -> Creativity
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Palette"
  },
  {
    id: "t7",
    name: "與長輩或同學主動關懷問候",
    description: "撥打電話給爺爺奶奶，或是主動幫忙生病的同學。",
    type: "群", // 群 -> Empathy
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    icon: "Users"
  },
  {
    id: "t8",
    name: "個人探險大專案 (科學實驗/讀書簡報)",
    description: "獨立規劃並自主完成一個大專案，並向全家人進行簡報分享。",
    type: "智",
    difficulty: "終極",
    expReward: 800,
    goldReward: 400,
    ticketReward: 3,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "Award"
  },
  {
    id: "t9",
    name: "全家合作進行大掃除",
    description: "與爸爸媽媽或兄弟姊妹分工合作，一起完成客廳或廚房的大掃除。",
    type: "群",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    icon: "Users"
  },
  {
    id: "t10",
    name: "製作一張感謝卡片送給家人",
    description: "親手繪製或寫下一張感恩小卡，送給辛苦的家人表達謝意。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    icon: "Heart"
  },
  {
    id: "t11",
    name: "主動傾聽並關懷家人的一天",
    description: "詢問爸爸媽媽或手足今天最開心的事，並主動搥背或幫忙倒杯水。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t12",
    name: "自主按時溫習與整理書包",
    description: "放學後主動完成作業與聯絡簿溫習，且收拾好明天的上課書包。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t13",
    name: "廚餘與資源垃圾環保分類",
    description: "學習並落實垃圾分類，主動把紙箱、塑膠瓶或廚餘正確歸類。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t14",
    name: "每日數理邏輯思維挑戰",
    description: "主動完成 2 題數理邏輯奧林匹克題、數獨或拼圖邏輯遊戲。",
    type: "智",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },
  {
    id: "t15",
    name: "趣味科學小實驗與筆記",
    description: "在安全陪同下進行一項簡單居家實驗（如小蘇打氣球），並記錄小發現。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "BookOpen"
  },
  {
    id: "t16",
    name: "基礎核心體能自我挑戰",
    description: "自主進行仰臥起坐 30 次與伏地挺身 15 次，鍛鍊全身肌耐力。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每日",
    icon: "Compass"
  },
  {
    id: "t17",
    name: "郊外健行登山冒險 3 公里",
    description: "週末與家人前往附近登山步道或郊野公園，完成 3 公里的徒步健行。",
    type: "體",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t18",
    name: "音樂彈奏或歌曲練唱 15 分鐘",
    description: "自主練習一首樂器演奏（如直笛、鋼琴或吉他）或開口練唱一首新歌。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每日",
    icon: "Sparkles"
  },
  {
    id: "t19",
    name: "環保廢物回收創意手作",
    description: "利用家中的舊紙盒、空寶特瓶，發揮創意改造成實用筆筒或擺飾小玩具。",
    type: "美",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t20",
    name: "自主分類與丟棄廚餘垃圾",
    description: "每日在餐後協助垃圾正確分類並包妥丟棄，分擔家事。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t21",
    name: "整理收納個人鞋櫃與玄關",
    description: "將全家玄關鞋子擺放整齊，擦拭並收納個人常穿鞋子。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t22",
    name: "手洗個人精細衣物或襪子",
    description: "自主利用中性肥皂或洗劑手洗個人襪子與內衣，並掛妥晾乾。",
    type: "德",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t23",
    name: "全家盆栽與花草自主澆水",
    description: "早晨或黃昏時段檢查家中的陽台盆栽，給予適當水分與照料。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    icon: "Shield"
  },
  {
    id: "t24",
    name: "個人抽屜與小儲藏盒大整理",
    description: "分類、收納自己的文具與雜物，清除無用廢紙與廢舊物件。",
    type: "德",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每週",
    icon: "Shield"
  },
  {
    id: "t25",
    name: "閱讀並分享歷史或成語故事",
    description: "閱讀一節歷史或故事，並在晚餐時向爸媽口頭概述學到的啟發。",
    type: "智",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },
  {
    id: "t26",
    name: "英語口說自我練習 15 分鐘",
    description: "利用英文單字卡或口說 App 自主跟讀，熟記並念出 10 個新單字。",
    type: "智",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },
  {
    id: "t27",
    name: "自主挑戰數理邏輯桌遊或數獨",
    description: "完成一局高級數獨或孔明鎖等腦力邏輯解謎挑戰，激發思維力。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },
  {
    id: "t28",
    name: "觀看科普短片並做圖文筆記",
    description: "觀看科學、天文或地理科普影片，並用圖文記錄 3 個有趣新知識點。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "BookOpen"
  },
  {
    id: "t29",
    name: "本週作業錯題本整理與複習",
    description: "將本週各科作業、考卷的錯題重新抄寫、算一遍，確實找出盲點。",
    type: "智",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "BookOpen"
  },
  {
    id: "t30",
    name: "連續跳繩 200 下體能挑戰",
    description: "自主進行跳繩體能鍛鍊，達成連續不中斷跳繩 200 下的挑戰目標。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每日",
    icon: "Compass"
  },
  {
    id: "t31",
    name: "騎腳踏車或溜直排輪 2 公里",
    description: "在安全公園或自行車道進行腳踏車或直排輪滑行練習，累計滿 2 公里。",
    type: "體",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t32",
    name: "眼球保健體操與全身伸展拉筋",
    description: "自主完成全套眼球放鬆保健操，並進行 10 分鐘下肢與關節伸展舒緩操。",
    type: "體",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每日",
    icon: "Compass"
  },
  {
    id: "t33",
    name: "戶外拍球控球與投籃練習 15 分鐘",
    description: "在公園籃球場進行運球或自主投籃練習，提升手眼協調能力。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每日",
    icon: "Compass"
  },
  {
    id: "t34",
    name: "核心肌群平板支撐挑戰 1 分鐘",
    description: "雙肘支撐地面，維持身體平直的棒式撐地，堅持滿 1 分鐘鍛鍊腹核心。",
    type: "體",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每日",
    icon: "Compass"
  },
  {
    id: "t35",
    name: "為疲憊的爸媽捶背搥腿 5 分鐘",
    description: "主動發現爸媽的疲憊，為爸爸或媽媽倒杯溫水並搥背敲腿舒緩疲勞。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t36",
    name: "遇到鄰居或社區守衛主動問好",
    description: "進出電梯或大廳時，主動並禮貌地與警衛叔叔、鄰居阿姨點頭問早。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t37",
    name: "與手足或同學大方合作分享",
    description: "大方與兄弟姊妹或朋友共同分享美味零食或玩具，主動協商不爭執。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t38",
    name: "整理個人舊玩具書籍做愛心捐贈",
    description: "整理保存良好的二手玩具或童書，清潔整理後送交社福機構做愛心捐贈。",
    type: "群",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    icon: "Heart"
  },
  {
    id: "t39",
    name: "協助家長準備全家晚餐的食材備料",
    description: "在洗淨雙手後，協助洗菜、摘葉、剝蒜頭或擺放餐具，合作準備晚餐。",
    type: "群",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每日",
    icon: "Heart"
  },
  {
    id: "t40",
    name: "家庭週末探險大活動海報設計",
    description: "發揮創意，為家庭下一次野餐或戶外活動繪製宣傳海報，寫上有趣亮點。",
    type: "美",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t41",
    name: "黏土或積木拼砌神奇幻想生物",
    description: "利用五彩積木或黏土，發揮想像力捏出或堆出一個原創幻想怪獸並命名。",
    type: "美",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t42",
    name: "挑戰生活美角拍照並分享構圖",
    description: "尋找家中或公園的光影角，練習對焦與黃金分割，拍攝並分享 3 張生活美照。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每日",
    icon: "Sparkles"
  },
  {
    id: "t43",
    name: "自學挑戰一段活力手勢舞或小舞蹈",
    description: "自學一段歡樂兒歌手勢舞或小舞蹈，並在週會或全家人面前完成展示表演。",
    type: "美",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t44",
    name: "落葉與廢紙環保創意拼貼畫",
    description: "在公園搜集枯樹葉、花瓣或舊報紙，動手剪貼創作一幅環保藝術畫作。",
    type: "美",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  }
];

export const INITIAL_TASKS = [
  {
    id: "task-active-1",
    name: "閱讀好書 20 分鐘",
    description: "今天閱讀《哈利波特》並分享精彩片段給媽媽聽。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    status: "進行中", // 進行中, 待覆核, 已完成
    dateCreated: "2026-06-01"
  },
  {
    id: "task-active-2",
    name: "自主整理房間與書桌",
    description: "玩具放回箱子，書桌整理乾淨，並拖地。",
    type: "德",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Responsibility",
    period: "每日",
    status: "待覆核",
    dateCreated: "2026-06-01",
    submission: {
      notes: "我把書本排好了，地板也擦得很乾淨！",
      photo: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80" // Mock kids room image
    }
  },
  {
    id: "task-active-3",
    name: "戶外超慢跑 1.5 公里",
    description: "去公園慢跑 3 圈，流汗並紀錄時間。",
    type: "體",
    difficulty: "終極",
    expReward: 800,
    goldReward: 400,
    ticketReward: 3,
    attributeReward: "Courage",
    period: "每週",
    status: "需修正",
    dateCreated: "2026-05-30",
    rejectionReason: "請拍張跑步手錶的紀錄照片給爸爸看喔，加油！"
  },
  {
    id: "task-active-4",
    name: "製作一張感謝卡片送給家人",
    description: "親手繪製或寫下一張感恩小卡，送給辛苦的家人表達謝意。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    status: "進行中",
    dateCreated: "2026-06-01"
  }
];

export const GACHA_POOL = {
  Common: {
    chance: 0.60,
    color: "#a0aec0",
    cards: [
      { id: "c_gold_1", name: "金幣紅包", type: "資源卡", rarity: "Common", desc: "立即獲得 100 金幣", value: { gold: 100 } },
      { id: "c_exp_1", name: "微光經驗瓶", type: "資源卡", rarity: "Common", desc: "立即獲得 150 經驗值", value: { exp: 150 } },
      { id: "c_ticket_1", name: "好運抽卡券", type: "資源卡", rarity: "Common", desc: "額外獲得 1 張抽卡券", value: { tickets: 1 } }
    ]
  },
  Rare: {
    chance: 0.25,
    color: "#4299e1",
    cards: [
      { id: "r_dinner", name: "晚餐選擇權", type: "特權卡", rarity: "Rare", desc: "今晚吃什麼？由你來做主！", duration: "7天內有效" },
      { id: "r_movie", name: "週末電影選擇權", type: "特權卡", rarity: "Rare", desc: "全家週末看什麼電影由你挑選！", duration: "14天內有效" },
      { id: "r_game", name: "額外遊戲時間 30 分鐘", type: "特權卡", rarity: "Rare", desc: "可折抵一次 30 分鐘 the Switch/平板時間", duration: "7天內有效" }
    ]
  },
  Epic: {
    chance: 0.10,
    color: "#9f7aea",
    cards: [
      { id: "e_date", name: "爸爸媽媽單獨約會券", type: "體驗卡", rarity: "Epic", desc: "獲得與爸爸或媽媽單獨出門吃冰淇淋/逛街的下午！", duration: "30天內有效" },
      { id: "e_park", name: "室內攀岩館體驗", type: "體驗卡", rarity: "Epic", desc: "全家一起去攀岩館冒險體驗一次！", duration: "60天內有效" },
      { id: "e_camping", name: "星空露營之夜", type: "體驗卡", rarity: "Epic", desc: "約定一次週末帳篷露營或後陽台野營！", duration: "90天內有效" }
    ]
  },
  Legendary: {
    chance: 0.04,
    color: "#ed8936",
    cards: [
      { id: "l_title_dragon", name: "稱號：屠龍勇士", type: "收藏卡", rarity: "Legendary", desc: "解鎖酷炫角色稱號，展示於個人面板！", style: "neon-orange" },
      { id: "l_badge_persistence", name: "徽章：不屈之意志", type: "收藏卡", rarity: "Legendary", desc: "頒發給極度自律的冒險者，家長共同見證！", style: "neon-gold" }
    ]
  },
  Mythic: {
    chance: 0.01,
    color: "#f56565",
    cards: [
      { id: "m_wish", name: "終極願望大獎助力卡", type: "資源卡", rarity: "Mythic", desc: "家庭成長積分大幅增加 500 分！", value: { growthScore: 500 } },
      { id: "m_companion", name: "神秘幻獸徽章：格林之星", type: "收藏卡", rarity: "Mythic", desc: "百萬中無一的至尊徽章，解鎖神秘背景主題！", style: "rainbow" }
    ]
  }
};

export const INITIAL_INVENTORY = [
  {
    inventoryId: "inv-1",
    id: "r_dinner",
    name: "晚餐選擇權",
    type: "特權卡",
    rarity: "Rare",
    desc: "今晚吃什麼？由你來做主！",
    status: "未使用", // 未使用, 待核銷, 已使用, 已過期
    dateAcquired: "2026-05-28"
  },
  {
    inventoryId: "inv-2",
    id: "e_date",
    name: "爸爸媽媽單獨約會券",
    type: "體驗卡",
    rarity: "Epic",
    desc: "獲得與爸爸或媽媽單獨出門吃冰淇淋/逛街的下午！",
    status: "待核銷",
    dateAcquired: "2026-05-30"
  },
  {
    inventoryId: "inv-3",
    id: "l_title_dragon",
    name: "稱號：屠龍勇士",
    type: "收藏卡",
    rarity: "Legendary",
    desc: "解鎖酷炫角色稱號，展示於個人面板！",
    status: "已使用",
    dateAcquired: "2026-05-25"
  }
];

export const INITIAL_PARENT_GOALS = [
  { id: "pg-1", category: "健康體能", title: "每週慢跑 3 次（每次 3K）", progress: 66, status: "進行中" },
  { id: "pg-2", category: "財務安全", title: "每月固定儲蓄與投資 1 萬元", progress: 100, status: "已達成" },
  { id: "pg-3", category: "閱讀與學習", title: "本月閱讀《底層邏輯》等 2 本書", progress: 50, status: "進行中" }
];

export const INITIAL_WISHLIST = [
  { id: "wl-1", title: "全家日本自由行五天四夜", pointsNeeded: 10000, pointsCurrent: 6420, isUltimate: true },
  { id: "wl-2", title: "週末森林野奢露營體驗", pointsNeeded: 2000, pointsCurrent: 2000, isUltimate: false, isRedeemed: true },
  { id: "wl-3", title: "購買家庭同樂 Switch 遊戲", pointsNeeded: 800, pointsCurrent: 800, isUltimate: false, isRedeemed: false }
];

export const INITIAL_REDEEM_LOGS = [
  { id: "rl-1", cardName: "額外遊戲時間 30 分鐘", kidName: "小格林 (Leo)", dateRedeemed: "2026-05-29", status: "已核銷", reviewer: "Audrey (媽媽)" },
  { id: "rl-2", cardName: "晚餐選擇權", kidName: "小格林 (Leo)", dateRedeemed: "2026-05-27", status: "已核銷", reviewer: "Richard (爸爸)" }
];

export const INITIAL_WEEKLY_COMPETITION = {
  weekRange: "05/25 ~ 05/31",
  champions: {
    taskCount: "小格林 (Leo) [14 個任務]",
    growthRate: "小格林 (Leo) [+150% EXP]",
    courage: "小格林 (Leo) [超慢跑挑戰成功]",
    creativity: "小格林 (Leo) [樂高飛船創作]"
  },
  mvpTask: "自主整理房間與書桌 (完成度 92%)",
  devilTask: "戶外超慢跑 1.5 公里 (完成度 40%)",
  familyTitle: "「超級探險小隊」✨"
};
