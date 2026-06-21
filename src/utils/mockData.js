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

export const EMPTY_CHILD_STATS = {
  id: "",
  name: "",
  age: 0,
  birthday: "",
  avatar: "boy",
  level: 1,
  exp: 0,
  expNeeded: 100,
  gold: 0,
  tickets: 0,
  jobClass: "",
  attributes: {
    Wisdom: 0,
    Responsibility: 0,
    Courage: 0,
    Empathy: 0,
    Creativity: 0
  }
};

const BASE_TASK_TEMPLATES = [
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
  },
  {
    id: "t45",
    name: "🪙 每日收支記帳與小反思",
    description: "記錄今天的花費與收入，並寫下其中一項是『需要』還是『想要』，與家人討論。",
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
    id: "t46",
    name: "🪙 購物前的『想要與需要』分析",
    description: "列出最近想買的 3 樣東西，分析它們是『想要』還是『需要』，並向爸媽說明原因。",
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
    id: "t47",
    name: "🪙 我的存錢罐與儲蓄目標計畫",
    description: "制定一個儲蓄目標（如買一本書），計算每週要存多少錢，並將本週零用錢存入存錢罐。",
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
    id: "t48",
    name: "🪙 超市比價與預算大作戰",
    description: "陪同家人去超市，協助尋找相同品項中性價比最高的商品，並在家庭晚餐預算內完成採購。",
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
    id: "t49",
    name: "🪙 零錢捐贈或愛心分享體驗",
    description: "將自己存下的一小部分零錢捐給需要幫助的機構，或整理閒置玩具分享給他人，學習關懷與分享。",
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
    id: "t50",
    name: "🪙 動手設計彩繪我的夢想儲蓄罐",
    description: "利用廢棄瓶罐或紙盒，動手彩繪並改造成分類儲蓄罐（分為：儲蓄、消費、分享），發揮創意。",
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
    id: "t51",
    name: "🪙 財商繪本閱讀或理財短片學習",
    description: "閱讀一本財商主題繪本（如《小狗錢錢》）或觀看理財科普短片，向家人分享學到的 3 個觀念。",
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
    id: "t52",
    name: "🪙 家庭「省電節能」小管家",
    description: "主動關掉家中未使用的電燈、冷氣或電器，並記錄這一週的節能行為，體會「節流即是開源」的道理。",
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
    id: "t53",
    name: "🪙 認識利息與複利的神奇力量",
    description: "向爸媽請教什麼是「利息」與「複利」，模擬若把 100 金幣存入家庭銀行（年利率 10%），三年後會變成多少？寫下計算過程與小發現。",
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
    id: "t54",
    name: "🪙 規劃家庭「跳蚤市場」或「二手拍賣」",
    description: "整理自己不再需要的舊玩具、書籍或衣物，為它們設定合理的二手售價，並寫下拍賣所得的分配計畫（儲蓄/消費/捐贈）。",
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
    id: "t55",
    name: "🪙 區分家庭的「固定支出」與「變動支出」",
    description: "訪談爸媽並列出家裡 3 個每個月必須支付的「固定支出」（如房租、網路費）與 3 個「變動支出」（如餐費、娛樂費），了解家庭財務結構。",
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
    id: "t56",
    name: "🪙 模擬「風險與保險」的財務觀念",
    description: "觀看或閱讀關於保險的介紹，並與家人討論：如果腳踏車壞了或身體受傷，會面臨什麼財務損失？「保險」是如何幫助大家分擔風險的？",
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
    id: "t57",
    name: "🪙 記帳一週總結與預算分析會議",
    description: "回顧自己這一週的記帳記錄，計算總收入與總支出，並向爸媽報告下週預計如何調整消費，以更有效率地達成你的儲蓄目標。",
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
    id: "t58",
    name: "🪙 認識各國貨幣與匯率換算挑戰",
    description: "查詢除了台幣/美金之外，另外 3 個不同國家的貨幣名稱與符號，並記錄今天 100 台幣可以兌換多少該國貨幣（如日圓、歐元）。",
    type: "智",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "BookOpen"
  },
  {
    id: "t59",
    name: "🪙 擬定一個「家庭迷你創業」服務點子",
    description: "想出一個可以為家人提供勞務或服務來「賺取額外獎金」的迷你創業點子（如：洗全家人的鞋子、整理小花園），寫出服務內容與定價。",
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
    id: "t60",
    name: "🪙 認識「勞動所得」與「資產所得」",
    description: "與爸媽討論「用時間與體力賺取薪水（勞動所得）」與「用資產或投資賺取收益（資產所得）」的差別，並舉出生活中各兩個例子。",
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
    id: "t61",
    name: "🪙 知名企業與商業品牌小調查",
    description: "選擇一個你最常接觸的知名品牌或企業（如樂高、任天堂、迪士尼），調查它是如何獲利的，並向家人介紹它的主要產品和賺錢秘密。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每週",
    icon: "BookOpen"
  },
  // 德 (Responsibility) - 10 items
  {
    id: "t62",
    name: "垃圾分類環保小尖兵",
    description: "完成家裡的垃圾、資源回收、廚餘精確分類，並協助打包丟棄。",
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
    id: "t63",
    name: "遵守約定：控制螢幕時間",
    description: "在約定的螢幕使用時間結束時，主動、不拖延地關閉電視或平板電腦。",
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
    id: "t64",
    name: "愛護家庭盆栽與寵物",
    description: "主動幫寵物餵食或梳毛，或幫家裡的陽台盆栽澆水與修剪枯葉。",
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
    id: "t65",
    name: "自主早起整理儀容與棉被",
    description: "起床後自主折好棉被，整理好床鋪，並刷牙洗臉收拾乾淨。",
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
    id: "t66",
    name: "餐後整理與擦拭餐桌",
    description: "吃完飯後，主動把全家人的碗盤收到水槽，並用抹布把餐桌擦拭乾淨。",
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
    id: "t67",
    name: "個人衣物分類整理與折疊",
    description: "協助將曬乾的衣服收回，並自主將自己的衣服折疊整齊、分類放回衣櫃。",
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
    id: "t68",
    name: "遵守安全規則：安全過馬路與乘車",
    description: "出門時遵守交通規則，過馬路走斑馬線，搭車時自主繫好安全帶。",
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
    id: "t69",
    name: "備忘錄管家：確認備忘事項",
    description: "與父母一起寫下本週的 3 項待辦事項，並每天檢查、確實執行完畢。",
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
    id: "t70",
    name: "保管好自己的個人物品與書包",
    description: "每天放學或外出的鞋子、外套與書包，主動放回定位，不亂丟。",
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
    id: "t71",
    name: "誠實省思日誌",
    description: "在日記本中寫下一件今天誠實面對的事情，或坦承自己做錯並改善的過程。",
    type: "德",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每週",
    icon: "Shield"
  },

  // 智 (Wisdom) - 10 items
  {
    id: "t72",
    name: "每日詞彙大挑戰：新成語學習",
    description: "自主學習 3 個新的成語、名言或英文單字，並試著造句給爸媽聽。",
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
    id: "t73",
    name: "地圖探索家：規劃家庭出遊路線",
    description: "尋找旅遊景點，利用地圖軟體規劃假日家庭出遊的路線與預估交通時間。",
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
    id: "t74",
    name: "科學大哉問：尋找科普答案",
    description: "提出一個科學問題（如：為何天空是藍的？），查閱科普書籍並寫下答案。",
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
    id: "t75",
    name: "益智拼圖與思維積木挑戰",
    description: "獨立完成 150 片以上的拼圖，或是進行魔術方塊、七巧板等智力拼圖訓練。",
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
    id: "t76",
    name: "植物觀察日記：觀察記錄三天變化",
    description: "選擇家裡的一株小植物，連續三天觀察記錄高度、葉子形狀與生長變化。",
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
    id: "t77",
    name: "歷史名人小檔案蒐集",
    description: "選擇一位知名歷史人物，寫下 his / her 生平事蹟與三項重大科學或社會貢獻。",
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
    id: "t78",
    name: "氣象觀測家：記錄一週天氣",
    description: "連續 7 天記錄當地的溫度、降雨機率與雲量，做成簡單的天氣統計表。",
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
    id: "t79",
    name: "生活小科普：肥皂去污的原理",
    description: "上網或查書研究為什麼肥皂能去油污與洗淨髒污，並用白話解釋給家人聽。",
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
    id: "t80",
    name: "認識地球：世界五大洲小問答",
    description: "在地球儀或地圖上指出五大洲位置，並寫出每個洲的兩個國家與首都名稱。",
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
    id: "t81",
    name: "程式思維啟源：20分鐘 Scratch 邏輯遊戲",
    description: "進行 20 分鐘的 Scratch 視覺化程式設計練習，或挑戰積木邏輯編程遊戲。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    icon: "BookOpen"
  },

  // 體 (Courage) - 10 items
  {
    id: "t82",
    name: "清晨慢跑或公園健走 20 分鐘",
    description: "起床後到公園慢跑或快步健走 20 分鐘，呼吸新鮮空氣並喚醒活力。",
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
    id: "t83",
    name: "原地波比跳 10 次耐力挑戰",
    description: "自主在防震軟墊上完成 10 次標準波比跳（Burpee），鍛鍊全身心肺功能。",
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
    id: "t84",
    name: "學習一項新的運動基本動作",
    description: "練習一項運動的基礎動作（如：羽球發球、籃球運球），直到姿勢標準。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t85",
    name: "每日深蹲 30 次體能鍛鍊",
    description: "自主進行正確姿勢的深蹲（Squats）訓練，累計完成 30 次以鍛鍊腿部力量。",
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
    id: "t86",
    name: "公園徒手體操：單槓與爬梯挑戰",
    description: "在安全陪同下，在公園吊單槓懸掛維持 15 秒，或成功爬過一整排單槓攀爬架。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t87",
    name: "平衡感練習：單腳站立與平衡木走",
    description: "挑戰單腳站立（雙眼微閉）維持 30 秒，或在平衡木上平穩慢步走完。",
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
    id: "t88",
    name: "自主柔軟度伸展拉筋 15 分鐘",
    description: "進行 15 分鐘全身伸展（坐姿體前彎、拉開跨），放鬆全身關節肌肉並舒緩眼睛。",
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
    id: "t89",
    name: "家庭飛盤或拋接球運動 30 分鐘",
    description: "與家人或朋友到草地上進行飛盤拋接、傳接球、打羽球，活動身體肌肉。",
    type: "體",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },
  {
    id: "t90",
    name: "克服恐懼：挑戰一件新事物",
    description: "嘗試一件平時不太敢做的事情（例如：主動向新同學問好、吃一口平時不敢吃的菜）。",
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
    id: "t91",
    name: "游泳或水中踢水鍛鍊 40 分鐘",
    description: "在游泳池進行 40 分鐘的游泳、踢水練習或水中韻律挑戰，鍛鍊心肺能力。",
    type: "體",
    difficulty: "較難",
    expReward: 400,
    goldReward: 200,
    ticketReward: 2,
    attributeReward: "Courage",
    period: "每週",
    icon: "Compass"
  },

  // 群 (Empathy) - 10 items
  {
    id: "t92",
    name: "主動關心同學或朋友的心情",
    description: "注意身邊朋友的心情，如果發現有人心情沮喪，主動上前說一句關心的話。",
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
    id: "t93",
    name: "與家人準備感謝下午茶",
    description: "擺盤水果或點心，並主動泡杯茶或裝杯水送給辛苦工作下班的爸媽。",
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
    id: "t94",
    name: "認識社會職業並表達敬意",
    description: "觀察社區生活，主動對大樓警衛叔叔、清潔阿姨或郵差說一聲：謝謝您，您辛苦了！",
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
    id: "t95",
    name: "分享玩具或借閱好書給朋友",
    description: "在學校或公園大方與朋友分享自己喜愛的繪本或玩具，共同遊玩並保持禮貌。",
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
    id: "t96",
    name: "遵守規則：保持良好的遊戲風度",
    description: "在玩桌遊或團隊運動時，保持禮貌，勝不驕敗不餒，並主動向對方說：謝謝指教。",
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
    id: "t97",
    name: "擔任一日家庭溫暖溝通天使",
    description: "主動發掘家人的情緒，給予擁抱並說溫柔、幽默的話，增進全家人開心的氛圍。",
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
    id: "t98",
    name: "合作任務：與手足分工拼大型玩具",
    description: "與手足或父母共同分工合作，一起拼好一個大樂高，或一同打掃整飾家庭植物。",
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
    id: "t99",
    name: "寄明信片或寫感恩信給遠方親友",
    description: "親筆寫信、畫插圖，寄一張卡片或明信片給遠方的爺爺奶奶、外公外婆表示思念與感恩。",
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
    id: "t100",
    name: "禮貌出行：主動讓座與排隊不推擠",
    description: "在學校、車站排隊不推擠；在公車、捷運上主動讓座給有需要的人或長輩。",
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
    id: "t101",
    name: "聆聽溫馨歌曲並分享愛與和平感受",
    description: "聆聽一首關於愛、關懷或和平的歌曲，並向爸媽口頭分享歌詞中令你感動的段落。",
    type: "群",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Empathy",
    period: "每週",
    icon: "Heart"
  },

  // 美 (Creativity) - 10 items
  {
    id: "t102",
    name: "大自然色彩收集挑戰",
    description: "在公園收集 5 種不同顏色的花瓣、落葉，帶回家在紙上排好並註明色彩靈感。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t103",
    name: "臨摹景物：手繪一幅景色畫",
    description: "到戶外臨摹，或看著窗外的景物，用蠟筆或彩色筆劃下一棵樹、天空或陽光光影。",
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
    id: "t104",
    name: "創意小點心排盤設計",
    description: "利用水果切片、餅乾或麵包，在盤子裡排列出一幅美麗或好玩的圖案（如大笑臉、動物）。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t105",
    name: "廢棄紙盒立體舞台模型設計",
    description: "利用空的乾淨紙盒、瓶蓋、色紙與黏土，發揮創意做出一個袖珍小舞台或小臥室模型。",
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
    id: "t106",
    name: "聲音採集：錄製 3 種環境音軌",
    description: "在安靜環境中錄下鳥鳴聲、風吹樹梢聲、雨滴聲，並跟家人討論不同聲音的美感。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t107",
    name: "原創故事結局改寫",
    description: "挑選一個你喜歡的故事（如糖果屋），發揮創意，重新編寫一個截然不同的趣味結局。",
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
    id: "t108",
    name: "原創短詩與手繪邊框設計",
    description: "自己寫下三句簡單的日記或生活小詩，並在紙張邊緣畫上精美的插圖與花紋裝飾。",
    type: "美",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Creativity",
    period: "每週",
    icon: "Sparkles"
  },
  {
    id: "t109",
    name: "色彩漸層著色挑戰",
    description: "手繪或下載一幅未著色線稿，挑戰完全使用同色系的漸層色（如藍到紫）著色填滿。",
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
    id: "t110",
    name: "一日時尚服飾穿搭提案",
    description: "自主為自己挑選並搭配今天出門的衣服、褲子與配件，講究顏色呼應與風格。",
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
    id: "t111",
    name: "聽古典樂繪製音樂抽象畫",
    description: "播放 10 分鐘的鋼琴曲或交響樂，閉上眼傾聽旋律，一邊在畫紙上繪製對應的抽象色塊與線條。",
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

const generateExtraTemplates = () => {
  const categories = [
    {
      type: '智',
      attr: 'Wisdom',
      icon: 'BookOpen',
      verbs: ['深入閱讀', '探討學習', '邏輯解題', '複習溫習', '觀察記錄', '自主研究', '分析思考', '實作練習', '精讀賞析', '理財學習'],
      nouns: ['科普新知與原理', '數理邏輯挑戰題', '英語常用生活對話', '歷史偉人傳記故事', '基礎程式邏輯關卡', '大自然昆蟲與生態', '理財記帳與儲蓄觀念', '語文寫作與成語典故', '星空與天文奧秘', '居家科學實驗步驟'],
      desc: '深入理解並記錄心得，向家人展示學習成果。'
    },
    {
      type: '德',
      attr: 'Responsibility',
      icon: 'Shield',
      verbs: ['整理收納', '擦拭清潔', '分類整理', '主動分擔', '清洗刷洗', '物歸原位', '清掃整理', '妥善整理', '協助收拾', '自主維護'],
      nouns: ['個人的書桌與抽屜', '自己的睡房與床鋪', '客廳公共區域地板', '玄關與全家鞋櫃', '餐後的餐具與廚房', '家中盆栽與陽台植物', '明天的上課書包與課本', '家庭的資源回收與垃圾', '浴室的鏡面與洗手台', '個人常穿鞋子與襪子'],
      desc: '培養負責任的良好生活習慣，為家庭生活環境盡一份心力。'
    },
    {
      type: '體',
      attr: 'Courage',
      icon: 'Compass',
      verbs: ['趣味跳繩', '核心肌群', '超慢跑', '伸展瑜珈', '自主拉筋', '戶外騎車', '徒步健行', '球類基本功', '開合跳', '體能極限'],
      nouns: ['挑戰 200 下', '鍛鍊 15 分鐘', '跑步 1.5 公里', '放鬆 10 分鐘', '鍛鍊柔軟度', '探險 20 分鐘', '健走 2 公里', '接球練習 50 次', '挑戰 100 下', '體能大躍進'],
      desc: '持之以體魄鍛鍊，提升心肺耐力與身體協調度。'
    },
    {
      type: '群',
      attr: 'Empathy',
      icon: 'Heart',
      verbs: ['主動幫助', '貼心關懷', '搥背按摩', '寫感謝卡', '主動讚美', '傾聽分享', '陪伴聊天', '分擔家務', '製作點心', '分享收穫'],
      nouns: ['辛苦工作的爸媽', '同住的手足與家人', '許久未見的長輩爺奶', '生病或有需要的同學', '學校的班級與夥伴', '社區的鄰里與環境', '一同合作的小夥伴', '家庭日常的生活瑣事', '彼此的心情與趣事', '每日的感恩小故事'],
      desc: '展現同理心與社交合作能力，增進家庭與社會的和諧凝聚力。'
    },
    {
      type: '美',
      attr: 'Creativity',
      icon: 'Palette',
      verbs: ['創意繪製', '自主彈奏', '手作改造', '精心設計', '黏土捏塑', '剪紙拼貼', '歌唱練唱', '色彩塗鴉', '相片拍攝', '空間佈置'],
      nouns: ['一幅想像力畫作', '一首動聽的樂器曲目', '廢棄寶特瓶創意擺飾', '一張感恩卡片封面', '一個可愛的角色模型', '一張立體剪紙作品', '一首英文勵志歌曲', '大自然的光影與風景', '日常生活的溫馨瞬間', '自己房間的角落擺設'],
      desc: '發揮無限想像力與創造力，用美感點綴日常生活。'
    }
  ];

  const list = [];
  let idCounter = 1000;

  categories.forEach(cat => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const name = `${cat.verbs[i]}${cat.nouns[j]}`;
        const difficultyList = ['簡單', '中等', '較難', '終極'];
        const difficulty = difficultyList[(i + j) % 4];
        
        let expReward = 100;
        let goldReward = 50;
        let ticketReward = 1;
        if (difficulty === '中等') {
          expReward = 200;
          goldReward = 100;
        } else if (difficulty === '較難') {
          expReward = 400;
          goldReward = 200;
          ticketReward = 2;
        } else if (difficulty === '終極') {
          expReward = 800;
          goldReward = 400;
          ticketReward = 3;
        }

        list.push({
          id: `t-gen-${idCounter++}`,
          name: name,
          description: `${name}。${cat.desc}`,
          type: cat.type,
          difficulty: difficulty,
          expReward: expReward,
          goldReward: goldReward,
          ticketReward: ticketReward,
          attributeReward: cat.attr,
          period: (i % 2 === 0) ? '每日' : '每週',
          icon: cat.icon
        });
      }
    }
  });

  return list;
};

export const TASK_TEMPLATES = [...BASE_TASK_TEMPLATES, ...generateExtraTemplates()];

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
    status: "進行中",
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
      photo: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&q=80"
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
  },
  {
    id: "task-active-5",
    name: "🪙 每日收支記帳與小反思",
    description: "記錄今天的花費與收入，並寫下其中一項是『需要』還是『想要』，與家人討論。",
    type: "智",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Wisdom",
    period: "每日",
    status: "進行中",
    dateCreated: "2026-06-01"
  },
  {
    id: "task-active-6",
    name: "🪙 家庭「省電節能」小管家",
    description: "主動關掉家中未使用的電燈、冷氣或電器，並記錄這一週的節能行為，體會「節流即是開源」的道理。",
    type: "德",
    difficulty: "簡單",
    expReward: 100,
    goldReward: 50,
    ticketReward: 1,
    attributeReward: "Responsibility",
    period: "每日",
    status: "進行中",
    dateCreated: "2026-06-01"
  },
  {
    id: "task-active-7",
    name: "🪙 認識利息與複利的神奇力量",
    description: "向爸媽請教什麼是「利息」與「複利」，模擬若把 100 金幣存入家庭銀行（年利率 10%），三年後會變成多少？寫下計算過程與小發現。",
    type: "智",
    difficulty: "中等",
    expReward: 200,
    goldReward: 100,
    ticketReward: 1,
    attributeReward: "Wisdom",
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
      { id: "c_gold_2", name: "微光小金袋", type: "資源卡", rarity: "Common", desc: "立即獲得 150 金幣", value: { gold: 150 } },
      { id: "c_exp_1", name: "微光經驗瓶", type: "資源卡", rarity: "Common", desc: "立即獲得 150 經驗值", value: { exp: 150 } },
      { id: "c_exp_2", name: "清泉經驗水", type: "資源卡", rarity: "Common", desc: "立即獲得 250 經驗值", value: { exp: 250 } },
      { id: "c_ticket_1", name: "好運抽卡券", type: "資源卡", rarity: "Common", desc: "額外獲得 1 張抽卡券", value: { tickets: 1 } },
      { id: "c_gold_extra1", name: "小零錢包", type: "資源卡", rarity: "Common", desc: "立即獲得 80 金幣", value: { gold: 80 } },
      { id: "c_gold_extra2", name: "銅幣福袋", type: "資源卡", rarity: "Common", desc: "立即獲得 120 金幣", value: { gold: 120 } },
      { id: "c_exp_extra1", name: "微小經驗糖", type: "資源卡", rarity: "Common", desc: "立即獲得 100 經驗值", value: { exp: 100 } },
      { id: "c_exp_extra2", name: "智慧泉水", type: "資源卡", rarity: "Common", desc: "立即獲得 200 經驗值", value: { exp: 200 } },
      { id: "c_ticket_extra1", name: "冒險單抽券", type: "資源卡", rarity: "Common", desc: "額外獲得 1 張抽卡券", value: { tickets: 1 } },
      { id: "c_gold_extra3", name: "家務獎勵金", type: "資源卡", rarity: "Common", desc: "立即獲得 90 金幣", value: { gold: 90 } },
      { id: "c_exp_extra3", name: "成長小藥丸", type: "資源卡", rarity: "Common", desc: "立即獲得 120 經驗值", value: { exp: 120 } },
      { id: "c_score_extra1", name: "家庭小貢獻", type: "資源卡", rarity: "Common", desc: "家庭成長積分增加 20 分", value: { growthScore: 20 } },
      { id: "r_dessert", name: "課後甜點選擇權", type: "特權卡", rarity: "Common", desc: "放學後可以挑選自己最想吃的一份甜點！", duration: "3天內有效" },
      { id: "c_priv_1", name: "半小時免做家務", type: "特權卡", rarity: "Common", desc: "獲得半小時免做指定家事權", duration: "3天內有效" },
      { id: "c_priv_2", name: "指定晚餐配菜", type: "特權卡", rarity: "Common", desc: "今天晚餐可以加一道自己最喜歡的配菜！", duration: "3天內有效" },
      { id: "c_priv_3", name: "電視選台先手", type: "特權卡", rarity: "Common", desc: "今天看電視可以優先挑選第一個節目！", duration: "3天內有效" },
      { id: "c_priv_4", name: "水果點心加量", type: "特權卡", rarity: "Common", desc: "今天點心時間的水果或小點心份量加倍！", duration: "3天內有效" },
      { id: "c_priv_5", name: "洗澡順序優先", type: "特權卡", rarity: "Common", desc: "今天可以決定全家人洗澡的順序！", duration: "3天內有效" },
      { id: "c_priv_6", name: "故事時間加長 10 分鐘", type: "特權卡", rarity: "Common", desc: "今天睡前故事可以請爸媽多講 10 分鐘！", duration: "3天內有效" },
      { id: "c_priv_7", name: "指定餐具特權", type: "特權卡", rarity: "Common", desc: "今天吃飯可以使用自己最喜歡的限定餐具！", duration: "3天內有效" },
      { id: "c_priv_8", name: "挑選座位特權", type: "特權卡", rarity: "Common", desc: "今天出門坐車或吃飯時可以優先選擇座位！", duration: "3天內有效" },
      { id: "c_exp_c1", name: "公園散步放風箏", type: "體驗卡", rarity: "Common", desc: "傍晚與家人去公園散步 30 分鐘並放風箏！", duration: "7天內有效" },
      { id: "c_exp_c2", name: "親子睡前故事馬拉松", type: "體驗卡", rarity: "Common", desc: "睡前由爸爸或媽媽連續講三個好聽的故事！", duration: "7天內有效" },
      { id: "c_exp_c3", name: "一起動手洗車", type: "體驗卡", rarity: "Common", desc: "週末和爸爸媽媽一起用水槍洗車，順便玩水！", duration: "14天內有效" },
      { id: "c_exp_c4", name: "家庭桌遊之夜", type: "體驗卡", rarity: "Common", desc: "晚上全家一起玩一局大富翁或桌遊！", duration: "7天內有效" },
      { id: "c_exp_c5", name: "DIY 手工摺紙", type: "體驗卡", rarity: "Common", desc: "和爸媽一起用紙折出各種可愛的小動物！", duration: "7天內有效" },
      { id: "c_exp_c6", name: "親子搞笑模仿大賽", type: "體驗卡", rarity: "Common", desc: "晚餐後全家一起進行 15 分鐘的趣味搞笑模仿！", duration: "7天內有效" },
      { id: "c_coll_1", name: "徽章：早起鳥兒", type: "收藏卡", rarity: "Common", desc: "表彰能自己起床、不賴床的乖寶寶！", style: "neon-blue" },
      { id: "c_coll_2", name: "徽章：餐盤清潔者", type: "收藏卡", rarity: "Common", desc: "頒發給每一餐都能把飯菜吃乾淨的健康寶寶！", style: "neon-green" },
      { id: "c_coll_3", name: "徽章：玩具收納小達人", type: "收藏卡", rarity: "Common", desc: "表彰能主動把玩具收拾整齊的小幫手！", style: "neon-yellow" },
      { id: "c_coll_4", name: "徽章：問候小天使", type: "收藏卡", rarity: "Common", desc: "頒發給每天都主動跟家人說早安、晚安的禮貌孩子！", style: "neon-pink" }
    ]
  },
  Rare: {
    chance: 0.25,
    color: "#4299e1",
    cards: [
      { id: "c_gold_3", name: "黃金寶箱", type: "資源卡", rarity: "Rare", desc: "立即獲得 200 金幣", value: { gold: 200 } },
      { id: "c_exp_3", name: "聖光經驗藥水", type: "資源卡", rarity: "Rare", desc: "立即獲得 400 經驗值", value: { exp: 400 } },
      { id: "c_ticket_2", name: "雙重抽卡券", type: "資源卡", rarity: "Rare", desc: "額外獲得 2 張抽卡券", value: { tickets: 2 } },
      { id: "r_gold_extra1", name: "冒險者金袋", type: "資源卡", rarity: "Rare", desc: "立即獲得 180 金幣", value: { gold: 180 } },
      { id: "r_exp_extra1", name: "活力經驗藥水", type: "資源卡", rarity: "Rare", desc: "立即獲得 300 經驗值", value: { exp: 300 } },
      { id: "r_ticket_extra1", name: "幸運雙重券", type: "資源卡", rarity: "Rare", desc: "額外獲得 2 張抽卡券", value: { tickets: 2 } },
      { id: "r_score_extra1", name: "和諧家庭分", type: "資源卡", rarity: "Rare", desc: "家庭成長積分增加 50 分", value: { growthScore: 50 } },
      { id: "r_gold_extra2", name: "商人的餽贈", type: "資源卡", rarity: "Rare", desc: "立即獲得 160 金幣", value: { gold: 160 } },
      { id: "r_exp_extra2", name: "學術研究瓶", type: "資源卡", rarity: "Rare", desc: "立即獲得 350 經驗值", value: { exp: 350 } },
      { id: "r_dinner", name: "晚餐選擇權", type: "特權卡", rarity: "Rare", desc: "今晚吃什麼？由你來做主！", duration: "7天內有效" },
      { id: "r_movie", name: "週末電影選擇權", type: "特權卡", rarity: "Rare", desc: "全家週末看什麼電影由你挑選！", duration: "14天內有效" },
      { id: "r_game", name: "額外遊戲時間 30 分鐘", type: "特權卡", rarity: "Rare", desc: "可折抵一次 30 分鐘 the Switch/平板時間", duration: "7天內有效" },
      { id: "r_no_chore_1", name: "家事免除一次券", type: "特權卡", rarity: "Rare", desc: "今天可以免除一次洗碗或倒垃圾的家事！", duration: "7天內有效" },
      { id: "r_sleep_late", name: "週末賴床券", type: "特權卡", rarity: "Rare", desc: "週末早上可以睡到自然醒，爸媽不催床！", duration: "7天內有效" },
      { id: "r_stay_up", name: "晚睡 30 分鐘許可證", type: "特權卡", rarity: "Rare", desc: "今天晚上可以晚睡 30 分鐘，聽故事或看書！", duration: "7天內有效" },
      { id: "r_priv_1", name: "零食挑選特權", type: "特權卡", rarity: "Rare", desc: "去超市時可以挑選一包自己喜歡的零食！", duration: "7天內有效" },
      { id: "r_priv_2", name: "穿搭自主特權", type: "特權卡", rarity: "Rare", desc: "今天出門的衣服完全由自己搭配，爸媽不干涉！", duration: "7天內有效" },
      { id: "r_priv_3", name: "起床鬧鐘免除", type: "特權卡", rarity: "Rare", desc: "明天早上可以不設鬧鐘，睡到自然醒！", duration: "7天內有效" },
      { id: "r_priv_4", name: "音樂播放清單自主", type: "特權卡", rarity: "Rare", desc: "乘車時可以播放自己挑選的音樂清單 30 分鐘！", duration: "7天內有效" },
      { id: "r_priv_5", name: "免除洗碗一次", type: "特權卡", rarity: "Rare", desc: "免除今天洗碗或整理餐桌的家務一次！", duration: "7天內有效" },
      { id: "r_priv_6", name: "放學後自由活動加半小時", type: "特權卡", rarity: "Rare", desc: "今天放學後可以多玩半小時再寫作業！", duration: "7天內有效" },
      { id: "e_museum", name: "科學博物館探險", type: "體驗卡", rarity: "Rare", desc: "週末全家一起去科學博物館探險！", duration: "30天內有效" },
      { id: "e_cooking", name: "親子烘焙大師體驗", type: "體驗卡", rarity: "Rare", desc: "與爸爸或媽媽一起動手烤餅乾或做小披薩！", duration: "14天內有效" },
      { id: "e_picnic", name: "草地野餐派對", type: "體驗卡", rarity: "Rare", desc: "準備美味三明治，一起到公園草地野餐放風箏！", duration: "30天內有效" },
      { id: "r_exp_e1", name: "天文館觀星之旅", type: "體驗卡", rarity: "Rare", desc: "週末全家一起去天文科學館參觀！", duration: "30天內有效" },
      { id: "r_exp_e2", name: "DIY 黏土手工課", type: "體驗卡", rarity: "Rare", desc: "和爸爸媽媽一起用彩色黏土做出城堡或怪獸！", duration: "14天內有效" },
      { id: "r_exp_e3", name: "圖書館尋寶閱讀半日遊", type: "體驗卡", rarity: "Rare", desc: "週末一起去大圖書館，挑選並閱讀自己感興趣的繪本！", duration: "14天內有效" },
      { id: "r_exp_e4", name: "美味鬆餅 DIY 早餐", type: "體驗卡", rarity: "Rare", desc: "週日早上與媽媽一起動手烤香噴噴的鬆餅！", duration: "14天內有效" },
      { id: "r_exp_e5", name: "草地飛盤對決", type: "體驗卡", rarity: "Rare", desc: "到大草地上與家人進行一場飛盤投擲接力賽！", duration: "14天內有效" },
      { id: "r_exp_e6", name: "家庭小影院", type: "體驗卡", rarity: "Rare", desc: "關掉客廳大燈，準備好爆米花，全家一起看電影！", duration: "14天內有效" },
      { id: "r_coll_1", name: "徽章：閱讀小學士", type: "收藏卡", rarity: "Rare", desc: "表彰一週內讀完三本故事書的求知之星！", style: "neon-teal" },
      { id: "r_coll_2", name: "徽章：自律小衛士", type: "收藏卡", rarity: "Rare", desc: "頒發給能自覺遵守作息時間、不超時看螢幕的孩子！", style: "neon-purple" },
      { id: "r_coll_3", name: "徽章：家務小能手", type: "收藏卡", rarity: "Rare", desc: "表彰經常主動幫忙做家務的勤勞小模範！", style: "neon-cyan" },
      { id: "r_coll_4", name: "徽章：健康運動員", type: "收藏卡", rarity: "Rare", desc: "頒發給持續進行戶外運動或跳繩挑戰的小健將！", style: "neon-indigo" },
      { id: "r_coll_5", name: "稱號：光速寫完作業者", type: "收藏卡", rarity: "Rare", desc: "展示於個人面板，象徵寫作業速度飛快且專注！", style: "neon-lime" },
      { id: "r_coll_6", name: "稱號：微笑使者", type: "收藏卡", rarity: "Rare", desc: "展示於個人面板，代表天天保持好心情的開朗之星！", style: "neon-rose" }
    ]
  },
  Epic: {
    chance: 0.10,
    color: "#9f7aea",
    cards: [
      { id: "c_ticket_3", name: "皇家抽卡券袋", type: "資源卡", rarity: "Epic", desc: "額外獲得 5 張抽卡券", value: { tickets: 5 } },
      { id: "e_gold_extra1", name: "傳奇金幣箱", type: "資源卡", rarity: "Epic", desc: "立即獲得 200 金幣", value: { gold: 200 } },
      { id: "e_exp_extra1", name: "超能經驗結晶", type: "資源卡", rarity: "Epic", desc: "立即獲得 500 經驗值", value: { exp: 500 } },
      { id: "e_ticket_extra1", name: "史詩抽卡包", type: "資源卡", rarity: "Epic", desc: "額外獲得 4 張抽卡券", value: { tickets: 4 } },
      { id: "e_score_extra1", name: "光輝家庭獎", type: "資源卡", rarity: "Epic", desc: "家庭成長積分增加 100 分", value: { growthScore: 100 } },
      { id: "r_game_60", name: "額外遊戲時間 60 分鐘", type: "特權卡", rarity: "Epic", desc: "可折抵一次 60 分鐘 the Switch/平板時間", duration: "14天內有效" },
      { id: "r_no_chore_all", name: "家事豁免一日券", type: "特權卡", rarity: "Epic", desc: "今天所有指派的日常家事都可以休息一天！", duration: "14天內有效" },
      { id: "r_toy", name: "玩具心願達成卡", type: "特權卡", rarity: "Epic", desc: "可以向家長挑選一件 300 元以內的小玩具！", duration: "30天內有效" },
      { id: "e_priv_1", name: "指定家庭週末活動", type: "特權卡", rarity: "Epic", desc: "本週末的家庭活動主題完全由你決定！", duration: "14天內有效" },
      { id: "e_priv_2", name: "美味披薩大餐決定權", type: "特權卡", rarity: "Epic", desc: "點外送或去餐廳時，可以決定披薩的口味！", duration: "14天內有效" },
      { id: "e_priv_3", name: "睡衣派對許可證", type: "特權卡", rarity: "Epic", desc: "可以在房間內舉辦一次微型的睡衣派對！", duration: "14天內有效" },
      { id: "e_priv_4", name: "免除所有日常家務一天", type: "特權卡", rarity: "Epic", desc: "今天一整天不用做任何日常指派的家事！", duration: "14天內有效" },
      { id: "e_date", name: "爸爸媽媽單獨約會券", type: "體驗卡", rarity: "Epic", desc: "獲得與爸爸或媽媽單獨出門吃冰淇淋/逛街的下午！", duration: "30天內有效" },
      { id: "e_park", name: "室內攀岩館體驗", type: "體驗卡", rarity: "Epic", desc: "全家一起去攀岩館冒險體驗一次！", duration: "60天內有效" },
      { id: "e_camping", name: "星空露營之夜", type: "體驗卡", rarity: "Epic", desc: "約定一次週末帳篷露營或後陽台野營！", duration: "90天內有效" },
      { id: "e_zoo", name: "動物園一日遊", type: "體驗卡", rarity: "Epic", desc: "週末全家一起去動物園，看大貓熊與無尾熊！", duration: "45天內有效" },
      { id: "e_star", name: "夜間觀星賞螢火蟲", type: "體驗卡", rarity: "Epic", desc: "夏日夜晚全家出發山區，賞螢火蟲或用望遠鏡看星星！", duration: "60天內有效" },
      { id: "e_exp_e1", name: "兒童樂園狂歡一日遊", type: "體驗卡", rarity: "Epic", desc: "週末全家一起去遊樂園，暢玩一整天！", duration: "45天內有效" },
      { id: "e_exp_e2", name: "陶藝手作初體驗", type: "體驗卡", rarity: "Epic", desc: "去陶藝工坊親手拉胚製作一個屬於自己的小杯子！", duration: "30天內有效" },
      { id: "e_exp_e3", name: "親子自行車鐵馬行", type: "體驗卡", rarity: "Epic", desc: "週末沿著河濱自行車道，騎車吹風大冒險！", duration: "30天內有效" },
      { id: "e_exp_e4", name: "水上樂園清涼一日遊", type: "體驗卡", rarity: "Epic", desc: "炎炎夏日，全家一起去水上樂園滑水玩樂！", duration: "60天內有效" },
      { id: "l_title_ranger", name: "稱號：風暴行者", type: "收藏卡", rarity: "Epic", desc: "解鎖如風一般迅捷的稱號，提升個人主頁動態特效！", style: "neon-green" },
      { id: "l_badge_courage", name: "徽章：勇氣之盾", type: "收藏卡", rarity: "Epic", desc: "頒發給勇於嘗試新挑戰、克服挑戰的勇士！", style: "neon-red" },
      { id: "e_coll_1", name: "稱號：問題終結者", type: "收藏卡", rarity: "Epic", desc: "解鎖稱號，象徵擁有強大的思考與解決問題能力！", style: "neon-purple-glimmer" },
      { id: "e_coll_2", name: "徽章：金牌小廚神", type: "收藏卡", rarity: "Epic", desc: "表彰能協助家長完成一道美味料理的廚藝新星！", style: "neon-gold" },
      { id: "e_coll_3", name: "稱號：植物守護者", type: "收藏卡", rarity: "Epic", desc: "解鎖稱號，表彰細心照顧盆栽或寵物的愛心寶貝！", style: "neon-emerald" },
      { id: "e_coll_4", name: "徽章：分享之星", type: "收藏卡", rarity: "Epic", desc: "頒發給樂於分享玩具、零食，且富有同理心的孩子！", style: "neon-orange" },
      { id: "e_coll_5", name: "稱號：小小藝術家", type: "收藏卡", rarity: "Epic", desc: "展示於個人面板，代表在繪畫、手工或音樂上有亮眼表現！", style: "neon-pink-glitter" },
      { id: "e_coll_6", name: "徽章：創意小齒輪", type: "收藏卡", rarity: "Epic", desc: "頒發給經常想出奇妙新點子、動手拼樂高積木的創意大師！", style: "neon-blue-glow" }
    ]
  },
  Legendary: {
    chance: 0.04,
    color: "#ed8936",
    cards: [
      { id: "l_ticket_extra1", name: "皇家傳奇抽卡箱", type: "資源卡", rarity: "Legendary", desc: "額外獲得 8 張抽卡券", value: { tickets: 8 } },
      { id: "l_score_extra1", name: "傳奇家庭榮譽碑", type: "資源卡", rarity: "Legendary", desc: "家庭成長積分增加 200 分", value: { growthScore: 200 } },
      { id: "l_priv_1", name: "一日玩具店長體驗", type: "特權卡", rarity: "Legendary", desc: "去玩具店自己挑選一件 500 元以內的玩具！", duration: "30天內有效" },
      { id: "l_priv_2", name: "一日小家長權力卡", type: "特權卡", rarity: "Legendary", desc: "今天可以當一天的「副組長」，協助爸媽做一個家庭決定！", duration: "30天內有效" },
      { id: "e_hotel", name: "溫泉或親子飯店之旅", type: "體驗卡", rarity: "Legendary", desc: "規劃一次家庭溫泉或親子主題飯店度假之旅！", duration: "90天內有效" },
      { id: "e_aquarium", name: "夜宿海生館奇妙夜", type: "體驗卡", rarity: "Legendary", desc: "全家約定一次夜宿海洋生物博物館的奇妙體驗！", duration: "90天內有效" },
      { id: "l_exp_e1", name: "滑雪或室內滑雪體驗", type: "體驗卡", rarity: "Legendary", desc: "規劃一次室內滑雪場或冬季滑雪體驗旅行！", duration: "90天內有效" },
      { id: "l_exp_e2", name: "豪華露營 Glamping 體驗", type: "體驗卡", rarity: "Legendary", desc: "預訂一次免裝備的豪華豪華帳篷露營之旅！", duration: "90天內有效" },
      { id: "l_exp_e3", name: "兒童職業體驗城一日遊", type: "體驗卡", rarity: "Legendary", desc: "前往職業模擬體驗城，扮演警察、醫生或消防員！", duration: "60天內有效" },
      { id: "l_exp_e4", name: "搭乘熱氣球或直升機參觀", type: "體驗卡", rarity: "Legendary", desc: "全家共同規劃一次搭乘熱氣球或鳥瞰風景之旅！", duration: "120天內有效" },
      { id: "l_title_dragon", name: "稱號：屠龍勇士", type: "收藏卡", rarity: "Legendary", desc: "解鎖酷炫角色稱號，展示於個人面板！", style: "neon-orange" },
      { id: "l_badge_persistence", name: "徽章：不屈之意志", type: "收藏卡", rarity: "Legendary", desc: "頒發給極度自律的冒險者，家長共同見證！", style: "neon-gold" },
      { id: "l_title_sage", name: "稱號：奧秘賢者", type: "收藏卡", rarity: "Legendary", desc: "象徵智慧過人，解鎖智慧之光角色背景主題！", style: "neon-blue" },
      { id: "l_badge_wisdom", name: "徽章：智慧啟迪者", type: "收藏卡", rarity: "Legendary", desc: "表彰在學習任務上展現出非凡恆心與好奇心！", style: "neon-purple" },
      { id: "l_coll_1", name: "稱號：星際探索家", type: "收藏卡", rarity: "Legendary", desc: "象徵對科學與未知世界抱持極大探索精神！", style: "neon-violet-glitter" },
      { id: "l_coll_2", name: "徽章：守信之契約", type: "收藏卡", rarity: "Legendary", desc: "表彰極為看重承諾、百分之百履行約定的誠信之星！", style: "neon-bronze" },
      { id: "l_coll_3", name: "稱號：永恆守護者", type: "收藏卡", rarity: "Legendary", desc: "解鎖稱號，表彰能持續兩週以上完成自律挑戰的強者！", style: "neon-platinum" },
      { id: "l_coll_4", name: "徽章：奇蹟之光", type: "收藏卡", rarity: "Legendary", desc: "頒發給達成重大突破、讓爸爸媽媽讚嘆不已的奇蹟孩子！", style: "neon-rainbow" }
    ]
  },
  Mythic: {
    chance: 0.01,
    color: "#f56565",
    cards: [
      { id: "m_wish", name: "終極願望大獎助力卡", type: "資源卡", rarity: "Mythic", desc: "家庭成長積分大幅增加 500 分！", value: { growthScore: 500 } },
      { id: "m_companion", name: "神秘幻獸徽章：格林之星", type: "收藏卡", rarity: "Mythic", desc: "百萬中無一的至尊徽章，解鎖神秘背景主題！", style: "rainbow" },
      { id: "m_title_champion", name: "稱號：全域冒險大師", type: "收藏卡", rarity: "Mythic", desc: "至高無上的稱號，只有五育完全平衡的強者才能佩戴！", style: "rainbow-neon" },
      { id: "m_badge_angel", name: "徽章：守護天使的祝福", type: "收藏卡", rarity: "Mythic", desc: "代表極高的共情與同理心，主頁解鎖羽翼特效！", style: "rainbow-wings" },
      { id: "m_badge_creator", name: "徽章：創世之工匠", type: "收藏卡", rarity: "Mythic", desc: "代表極致的創造力，主頁解鎖炫彩流砂粒子特效！", style: "neon-gold-glitter" }
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
  { id: "wl-1", title: "全家日本自由行五天四夜", pointsNeeded: 10000, pointsCurrent: 0, isUltimate: true },
  { id: "wl-2", title: "週末森林野奢露營體驗", pointsNeeded: 2000, pointsCurrent: 2000, isUltimate: false, isRedeemed: true },
  { id: "wl-3", title: "購買家庭同樂 Switch 遊戲", pointsNeeded: 800, pointsCurrent: 800, isUltimate: false, isRedeemed: false }
];

export const INITIAL_REDEEM_LOGS = [
  { id: "rl-1", cardName: "額外遊戲時間 30 分鐘", kidName: "Michelle", dateRedeemed: "2026-05-29", status: "已核銷", reviewer: "Audrey (媽媽)" },
  { id: "rl-2", cardName: "晚餐選擇權", kidName: "Michelle", dateRedeemed: "2026-05-27", status: "已核銷", reviewer: "Richard (爸爸)" }
];

export const INITIAL_WEEKLY_COMPETITION = {
  weekRange: "05/25 ~ 05/31",
  champions: {
    taskCount: "Michelle [14 個任務]",
    growthRate: "Michelle [+150% EXP]",
    courage: "Michelle [超慢跑挑戰成功]",
    creativity: "Michelle [樂高飛船創作]"
  },
  mvpTask: "自主整理房間與書桌 (完成度 92%)",
  devilTask: "戶外超慢跑 1.5 公里 (完成度 40%)",
  familyTitle: "「超級探險小隊」✨"
};
