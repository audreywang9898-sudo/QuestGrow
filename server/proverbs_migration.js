import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { Pool } = pg;
const isProductionDb = process.env.DATABASE_URL && (
  process.env.DATABASE_URL.includes('render.com') || 
  process.env.DATABASE_URL.includes('neon.tech') ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProductionDb ? { rejectUnauthorized: false } : false
});

// 365 Positive Chinese-English proverbs and encouraging words for kids
const proverbs = [
  // 1-30: Courage & Exploration (勇氣與探索)
  { zh: "千里之行，始於足下。", en: "A journey of a thousand miles begins with a single step." },
  { zh: "相信自己，你比你想像的更勇敢。", en: "Believe in yourself; you are braver than you think." },
  { zh: "不要害怕犯錯，因為錯誤是學習的最好機會。", en: "Don't be afraid of making mistakes; they are the best opportunities to learn." },
  { zh: "好奇心是打開知識寶庫的鑰匙。", en: "Curiosity is the key that opens the treasure chest of knowledge." },
  { zh: "每一次嘗試，都是你成長的起點。", en: "Every attempt is the starting point of your growth." },
  { zh: "冒險是學習新事物的最佳方式。", en: "Adventure is the best way to learn new things." },
  { zh: "勇氣並非不害怕，而是即使害怕也依然前進。", en: "Courage is not the absence of fear, but going forward even if you are afraid." },
  { zh: "去探索、去夢想、去發現吧！", en: "Explore, dream, discover!" },
  { zh: "你的潛力就像宇宙一樣無限寬廣。", en: "Your potential is as infinite as the universe." },
  { zh: "勇敢地跨出第一步，世界會為你開路。", en: "Take the first step bravely, and the world will make way for you." },
  { zh: "每一次的挑戰，都是讓你變強大的機會。", en: "Every challenge is an opportunity to make you stronger." },
  { zh: "像探險家一樣，保持對世界的好奇與熱情。", en: "Like an explorer, maintain curiosity and passion for the world." },
  { zh: "大膽思考，小心嘗試，你一定能行！", en: "Think big, try carefully, you can definitely do it!" },
  { zh: "失敗只是暫時的逗號，不是最後的句點。", en: "Failure is just a temporary comma, not the final period." },
  { zh: "勇敢做自己，因為你是獨一無二的奇蹟。", en: "Dare to be yourself, for you are a unique miracle." },
  { zh: "學習新東西就像展開一場刺激的尋寶之旅。", en: "Learning something new is like embarking on an exciting treasure hunt." },
  { zh: "不怕慢，只怕站，每天前進一點點。", en: "Be not afraid of going slowly, be afraid only of standing still." },
  { zh: "向著夢想前進，你就是自己的英雄。", en: "Go towards your dreams; you are your own hero." },
  { zh: "不要因為困難而放棄，勇氣會帶你飛越它。", en: "Do not give up because of difficulty; courage will carry you over it." },
  { zh: "用好奇的雙眼，去發掘生活中隱藏的美好。", en: "Use curious eyes to discover the hidden beauty in life." },
  { zh: "敢於發問，是智慧的第一步。", en: "Daring to ask questions is the first step to wisdom." },
  { zh: "每一次克服困難，都是你升級的勳章。", en: "Every time you overcome a difficulty, it is a medal of your upgrade." },
  { zh: "踏出舒適區，你會發現更棒的自己。", en: "Step out of your comfort zone, and you will find a better self." },
  { zh: "即使是一顆小種子，也能長成參天大樹。", en: "Even a tiny seed can grow into a towering tree." },
  { zh: "冒險的心靈永遠年輕，探索的腳步永不停歇。", en: "An adventurous mind is always young; the steps of exploration never stop." },
  { zh: "用勇氣點亮前行的路，你就是光芒。", en: "Light the way forward with courage; you are the light." },
  { zh: "挑戰自己，你將發現意想不到的超能力。", en: "Challenge yourself, and you will discover unexpected superpowers." },
  { zh: "不要限制你的想像力，天空才是你的極限。", en: "Do not limit your imagination; the sky is your limit." },
  { zh: "每一次的跌倒，都讓我們學會如何站得更穩。", en: "Every fall teaches us how to stand firmer." },
  { zh: "開啟冒險模式，迎接今天的全新挑戰！", en: "Turn on adventure mode and welcome today's brand new challenges!" },

  // 31-60: Perseverance & Diligence (堅持與努力)
  { zh: "一分耕耘，一分收穫。", en: "No pain, no gain." },
  { zh: "滴水穿石，非一日之功。", en: "Dripping water wears away stone, not by force but persistence." },
  { zh: "有志者事竟成。", en: "Where there is a will, there is a way." },
  { zh: "熟能生巧。", en: "Practice makes perfect." },
  { zh: "不積跬步，無以至千里。", en: "A long journey is made up of tiny steps." },
  { zh: "持之以恆，是通往成功的唯一道路。", en: "Perseverance is the only road that leads to success." },
  { zh: "今天的努力，是明天成功的種子。", en: "Today's effort is the seed of tomorrow's success." },
  { zh: "永不放棄，奇蹟總在最堅持的時刻發生。", en: "Never give up; miracles always happen at the moment of persistence." },
  { zh: "只要你不停止腳步，走得多慢都沒關係。", en: "It does not matter how slowly you go so long as you do not stop." },
  { zh: "成功就是一次又一次的堅持。", en: "Success is persisting time and time again." },
  { zh: "用汗水澆灌的夢想，花朵最芬芳。", en: "Dreams watered by sweat bloom the sweetest flowers." },
  { zh: "繩鋸木斷，水滴石穿。", en: "Patience and persistence can overcome any obstacle." },
  { zh: "專注於你的目標，並一步一腳印前進。", en: "Focus on your goal and move step by step." },
  { zh: "沒有什麼是做不到的，只要你願意付出努力。", en: "Nothing is impossible if you are willing to put in the effort." },
  { zh: "即使風雨再大，彩虹也終會出現。", en: "No matter how big the rain is, the rainbow will eventually appear." },
  { zh: "堅持就是勝利的起點。", en: "Persistence is the starting point of victory." },
  { zh: "努力不一定會立刻成功，但放棄一定會失敗。", en: "Effort may not succeed immediately, but giving up guarantees failure." },
  { zh: "每天做一點，難事也能變簡單。", en: "Do a little every day, and difficult things become simple." },
  { zh: "你的每一份付出，時間都會給你答案。", en: "For every bit of your effort, time will give you the answer." },
  { zh: "鐵杵磨成針，只要功夫深。", en: "An iron grindstone can be ground into a needle with deep effort." },
  { zh: "給自己一點時間，偉大的事情需要耐心累積。", en: "Give yourself some time; great things require patient accumulation." },
  { zh: "堅持做對的事，你會看見美好的改變。", en: "Persist in doing the right thing, and you will see beautiful changes." },
  { zh: "努力過後得到的成果，才是最甜美的滋味。", en: "The fruits obtained after hard work taste the sweetest." },
  { zh: "像小溪流向大海，堅持不懈地前進吧！", en: "Like a stream flowing to the ocean, move forward persistently!" },
  { zh: "在困難面前，你的堅持是最堅固的盾牌。", en: "In the face of difficulty, your persistence is the strongest shield." },
  { zh: "精誠所至，金石為開。", en: "Sincerity can affect even metal and stone." },
  { zh: "把大任務拆成小步驟，你會發現堅持並不難。", en: "Break big tasks into small steps, and you'll find persisting is easy." },
  { zh: "今天比昨天進步一點點，就是最棒的成就。", en: "Being slightly better today than yesterday is the greatest achievement." },
  { zh: "堅持是通往夢想的橋樑，走過去就是你的天空。", en: "Persistence is the bridge to dreams; walk across, and the sky is yours." },
  { zh: "每一天，都給自己一個「再試一次」的勇氣。", en: "Every day, give yourself the courage to 'try one more time'." },

  // 61-90: Kindness & Empathy (善良與同理)
  { zh: "贈人玫瑰，手有餘香。", en: "Roses given to others leave a lingering fragrance in your hands." },
  { zh: "善良是世界上最美麗的語言。", en: "Kindness is the most beautiful language in the world." },
  { zh: "用溫暖的眼神看世界，用同理心對待每個人。", en: "Look at the world with warm eyes, and treat everyone with empathy." },
  { zh: "小小的善意，能照亮別人的整個一天。", en: "A small act of kindness can brighten someone's entire day." },
  { zh: "己所不欲，勿施於人。", en: "Do not do to others what you would not have them do to you." },
  { zh: "幫助他人，是給自己最棒的禮物。", en: "Helping others is the best gift you can give to yourself." },
  { zh: "用微笑去溫暖身邊的每一個人吧！", en: "Use a smile to warm everyone around you!" },
  { zh: "傾聽是理解的開始，也是善良的表現。", en: "Listening is the beginning of understanding and an expression of kindness." },
  { zh: "當你可以選擇的時候，請選擇善良。", en: "When you have a choice, please choose kindness." },
  { zh: "一句溫暖的話，可以讓人不再感到寒冷。", en: "A warm word can keep someone from feeling cold." },
  { zh: "分享讓我們的快樂加倍，憂愁減半。", en: "Sharing doubles our joy and halves our sorrow." },
  { zh: "同理心是穿上別人的鞋子，體會他的感受。", en: "Empathy is stepping into someone else's shoes to feel what they feel." },
  { zh: "善良不需要理由，它是一種溫暖的選擇。", en: "Kindness needs no reason; it is a warm choice." },
  { zh: "原諒別人，也是放過自己，讓心變得更寬廣。", en: "Forgiving others is also releasing yourself, making your heart wider." },
  { zh: "用愛和包容去對待與我們不同的人。", en: "Treat people who are different from us with love and tolerance." },
  { zh: "小小的關心，能搭起友誼的橋樑。", en: "A little care can build a bridge of friendship." },
  { zh: "當你給予愛時，你會收穫更多的愛。", en: "When you give love, you will harvest more love." },
  { zh: "對小動物溫柔，也是一種高貴的善良。", en: "Being gentle to small animals is also a noble kindness." },
  { zh: "一個擁抱的溫度，能融化所有的不開心。", en: "The warmth of a hug can melt away all unhappiness." },
  { zh: "善良就像回聲，你送出去什麼，就會收回什麼。", en: "Kindness is like an echo; what you send out comes back to you." },
  { zh: "學會欣賞別人的優點，讚美是神奇的魔法。", en: "Learn to appreciate others' strengths; praise is a magical spell." },
  { zh: "在他人需要時伸出援手，你就是人間天使。", en: "Lending a hand when others need it makes you an angel on earth." },
  { zh: "同理心讓我們心連心，世界因此更美好。", en: "Empathy connects our hearts, making the world a better place." },
  { zh: "用善良播種，你的生命將會開滿幸福的花朵。", en: "Sow seeds of kindness, and your life will bloom with happiness." },
  { zh: "對人有禮貌，是展現善良最簡單的方法。", en: "Being polite is the simplest way to show kindness." },
  { zh: "感謝身邊的人事物，感恩的心最美麗。", en: "Appreciate the people and things around you; a grateful heart is most beautiful." },
  { zh: "一句「謝謝你」，能讓辛苦的人感到無比溫馨。", en: "A simple 'thank you' can make hardworking people feel incredibly warm." },
  { zh: "善良是一種習慣，每天做一件好事吧！", en: "Kindness is a habit; do a good deed every day!" },
  { zh: "溫柔地對待自己，也溫柔地對待世界。", en: "Treat yourself gently, and treat the world gently too." },
  { zh: "善意的種子一旦種下，終會長成大大的遮蔭樹。", en: "Once the seed of kindness is planted, it will grow into a great shade tree." },

  // 91-120: Wisdom & Learning (智慧與學習)
  { zh: "活到老，學到老。", en: "Never too old to learn." },
  { zh: "學而不思則罔，思而不學則殆。", en: "Learning without thought is labor lost; thought without learning is perilous." },
  { zh: "溫故而知新，可以為師矣。", en: "Reviewing what you have learned helps you acquire new knowledge." },
  { zh: "書山有路勤為徑，學海無涯苦作舟。", en: "Diligence is the path to the mountain of books; hard work is the boat to the sea of learning." },
  { zh: "讀萬卷書，行萬里路。", en: "Read ten thousand books, travel ten thousand miles." },
  { zh: "知識就是力量，智慧指引方向。", en: "Knowledge is power; wisdom guides the way." },
  { zh: "發問是智慧的開始，思考是進步的鑰匙。", en: "Asking questions is the start of wisdom; thinking is the key to progress." },
  { zh: "每一次的閱讀，都是在和智者對話。", en: "Every time you read, you are conversing with a wise person." },
  { zh: "學問學問，既要學，也要問。", en: "Learning requires both studying and asking questions." },
  { zh: "不經一事，不長一智。", en: "Wisdom comes from experience." },
  { zh: "滿招損，謙受益。", en: "Pride leads to loss, humility brings benefit." },
  { zh: "用智慧解決問題，比用暴力更強大。", en: "Solving problems with wisdom is more powerful than using violence." },
  { zh: "保持謙虛的心，你才能裝進更多知識。", en: "Keep a humble heart so you can hold more knowledge." },
  { zh: "學習不是為了超越別人，而是為了超越昨天的自己。", en: "Learning is not to surpass others, but to surpass yesterday's self." },
  { zh: "大自然是最好的老師，去向它學習吧！", en: "Nature is the best teacher; go and learn from it!" },
  { zh: "智慧藏在日常的細節中，用心觀察就能發現。", en: "Wisdom is hidden in daily details; observe carefully to find it." },
  { zh: "學習的過程比考試的分數更重要。", en: "The process of learning is more important than exam scores." },
  { zh: "多看、多聽、多想，你會變得越來越聰明。", en: "Look more, listen more, and think more; you will become smarter." },
  { zh: "知識是隨身攜帶、永遠奪不走的寶藏。", en: "Knowledge is a treasure you can carry with you and never be stolen." },
  { zh: "失敗的經驗，也是智慧的一種累積。", en: "The experience of failure is also an accumulation of wisdom." },
  { zh: "學會獨立思考，不盲目跟從，你就是智者。", en: "Learn to think independently and not follow blindly; you are wise." },
  { zh: "每一本書都是一扇窗，帶你看向不同的世界。", en: "Every book is a window that shows you a different world." },
  { zh: "用智慧管理情緒，你就是自己心靈的主人。", en: "Manage emotions with wisdom; you are the master of your mind." },
  { zh: "學會時間管理，你就能擁有更多快樂的時光。", en: "Learn time management, and you will have more happy hours." },
  { zh: "智慧的源泉在於對未知事物的不斷探索。", en: "The source of wisdom lies in the continuous exploration of the unknown." },
  { zh: "勤奮是聰明的雙翼，帶你飛向智慧的高空。", en: "Diligence is the wings of cleverness, flying you to the heights of wisdom." },
  { zh: "學習是一場終身馬拉松，保持輕鬆愉快的心情前進。", en: "Learning is a lifelong marathon; move forward with a relaxed and happy heart." },
  { zh: "智慧不僅僅是知道答案，更是懂得如何去尋找答案。", en: "Wisdom is not just knowing answers, but knowing how to look for them." },
  { zh: "用求知若渴的態度迎接每一天。", en: "Welcome each day with a hunger for knowledge." },
  { zh: "分享你的知識，能讓智慧的光芒照得更遠。", en: "Sharing your knowledge makes the light of wisdom shine further." },

  // 121-150: Creativity & Imagination (創造與想像)
  { zh: "想像力比知識更重要。", en: "Imagination is more important than knowledge." },
  { zh: "你的大腦是一個神奇的點子工廠。", en: "Your brain is a magical idea factory." },
  { zh: "創造力是給想法插上翅膀，讓它飛翔。", en: "Creativity is giving wings to your ideas and letting them fly." },
  { zh: "沒有標準答案，就是最好的答案。", en: "No standard answer is the best answer." },
  { zh: "勇敢嘗試新想法，你就是小小發明家。", en: "Try new ideas bravely; you are a little inventor." },
  { zh: "世界是一張白紙，用你的創意塗上繽紛色彩吧！", en: "The world is a blank canvas; paint it with your colorful creativity!" },
  { zh: "想像力是你的超能力，沒有人能限制它。", en: "Imagination is your superpower, and no one can limit it." },
  { zh: "把不同的想法組合起來，就會誕生奇妙的新事物。", en: "Combine different ideas, and wonderful new things will be born." },
  { zh: "動手去做，讓腦海中的畫面變成現實。", en: "Do it with your hands to make the picture in your mind a reality." },
  { zh: "用不一樣的角度看世界，你會發現更多樂趣。", en: "Look at the world from a different angle, and you'll find more fun." },
  { zh: "好奇心是創造力的火花，請好好保護它。", en: "Curiosity is the spark of creativity; please protect it well." },
  { zh: "不要害怕你的點子太奇怪，偉大的發明一開始都很奇特。", en: "Don't fear strange ideas; great inventions start out looking peculiar." },
  { zh: "畫畫、寫作、唱歌，都是展現你獨特心靈的方式。", en: "Drawing, writing, and singing are all ways to show your unique soul." },
  { zh: "生活處處是驚喜，創意就在你身邊。", en: "Life is full of surprises; creativity is all around you." },
  { zh: "給自己一點發呆的時間，那是靈感在敲門。", en: "Give yourself some daydreaming time; that's inspiration knocking." },
  { zh: "用你的雙手，把垃圾變成有趣的藝術品吧！", en: "Use your hands to turn trash into interesting art!" },
  { zh: "說一個屬於你自己的故事，你就是生命的主角。", en: "Tell a story of your own; you are the protagonist of life." },
  { zh: "大膽假設，小心創造，世界因你而生動。", en: "Hypothesize boldly, create carefully; the world is lively because of you." },
  { zh: "音符可以隨意跳躍，你的創意也可以自由飛舞。", en: "Notes can leap freely; your creativity can also fly freely." },
  { zh: "創造力讓我們在平凡的日子裡找到探險的感覺。", en: "Creativity lets us find the feeling of adventure in ordinary days." },
  { zh: "你的每一幅畫、每一個手工，都是世界上獨一無二的寶藏。", en: "Your every drawing and handicraft is a unique treasure in the world." },
  { zh: "打破常規，試著用新的方法做同一件事。", en: "Break rules and try to do the same thing in a new way." },
  { zh: "想像自己是一隻小鳥，飛向無限寬廣的幻想王國。", en: "Imagine yourself as a bird, flying to an infinite kingdom of fantasy." },
  { zh: "問問自己「如果...會怎麼樣？」，這會開啟新的大門。", en: "Ask yourself 'What if...?', which will open new doors." },
  { zh: "創造就是把熱情注入你所做的每一件事中。", en: "Creating is putting passion into everything you do." },
  { zh: "不要盲從別人的腳步，畫出屬於你自己的路線圖。", en: "Don't blindly follow others; draw your own roadmap." },
  { zh: "創意的世界裡沒有錯誤，只有不一樣的發現。", en: "There are no mistakes in the world of creativity, only different discoveries." },
  { zh: "發揮你的幽默感，創意也可以是一場好玩的遊戲。", en: "Use your sense of humor; creativity can also be a fun game." },
  { zh: "用創意思維解決生活中的小難題，你就是生活大師。", en: "Solve small life problems with creative thinking; you are a life master." },
  { zh: "保持一顆童心，你的世界將永遠充滿新奇的色彩。", en: "Keep a childlike heart, and your world will always be full of novel colors." },

  // 151-180: Friendship & Teamwork (友誼與合作)
  { zh: "同舟共濟，海浪再大也不怕。", en: "Pull together in the same boat, and we won't fear the biggest waves." },
  { zh: "單絲不成線，獨木不成林。", en: "A single thread cannot make a cord; a single tree cannot make a forest." },
  { zh: "合作能讓困難的事情變簡單。", en: "Working together makes difficult things easy." },
  { zh: "友誼是一盞燈，照亮彼此前行的路。", en: "Friendship is a lamp that lights the way for each other." },
  { zh: "學會分享，你會得到雙倍的快樂。", en: "Learn to share, and you will get double the happiness." },
  { zh: "包容朋友的缺點，欣賞他的優點，友誼才能長久。", en: "Tolerate friends' flaws and appreciate their strengths for lasting friendship." },
  { zh: "傾聽朋友的想法，是尊重也是愛的表現。", en: "Listening to a friend's ideas shows both respect and love." },
  { zh: "三個臭皮匠，頂個諸葛亮。", en: "Three heads are better than one." },
  { zh: "在團隊中，每個人的角色都至關重要。", en: "In a team, everyone's role is critically important." },
  { zh: "用真心對待朋友，你會收穫最溫暖的陪伴。", en: "Treat friends with sincerity, and you will harvest the warmest companionship." },
  { zh: "團結就是力量，齊心協力能移山。", en: "Unity is strength; working together can move mountains." },
  { zh: "一個微笑，就能化解朋友之間的誤會。", en: "A single smile can dissolve misunderstandings between friends." },
  { zh: "當朋友傷心時，靜靜地陪著他也是力量。", en: "When a friend is sad, quietly staying with them is also strength." },
  { zh: "說好話，做好事，存好心，吸引好朋友。", en: "Speak good words, do good deeds, keep a good heart, and attract good friends." },
  { zh: "尊重不同的意見，團隊合作會更精彩。", en: "Respect different opinions, and teamwork will be more brilliant." },
  { zh: "友誼像一棵小樹，需要用關心和陪伴來澆灌。", en: "Friendship is like a tree; it needs watering with care and companionship." },
  { zh: "在團隊中學會欣賞同伴的閃光點。", en: "Learn to appreciate teammates' shining points in a team." },
  { zh: "互相鼓勵，我們能一起爬上更高的山頂。", en: "Encouraging each other, we can climb to higher mountaintops together." },
  { zh: "遵守遊戲規則，公平競爭，才能玩得開心。", en: "Abide by game rules and compete fairly to have the most fun." },
  { zh: "一個好的傾聽者，往往也是最受歡迎的朋友。", en: "A good listener is often the most popular friend." },
  { zh: "用包容的心，接納每個人獨特的光芒。", en: "With a tolerant heart, accept the unique light of everyone." },
  { zh: "幫助隊友克服困難，是團隊最美麗的時刻。", en: "Helping teammates overcome difficulties is the team's most beautiful moment." },
  { zh: "真誠的道歉和原諒，能讓友誼的橋樑更堅固。", en: "Sincere apologies and forgiveness make the bridge of friendship stronger." },
  { zh: "不論輸贏，互相擊掌致謝是最棒的運動精神。", en: "Win or lose, high-fives and thanks show the best sportsmanship." },
  { zh: "多一個朋友，就多了一扇看世界的窗戶。", en: "One more friend means one more window to see the world." },
  { zh: "合作不是妥協，而是把大家的優勢加在一起。", en: "Cooperation is not compromise, but adding everyone's strengths together." },
  { zh: "在朋友需要時，一個小小的幫忙就是大大的溫暖。", en: "When a friend is in need, a little help brings great warmth." },
  { zh: "真誠的讚美朋友，能讓他的眼睛亮起來。", en: "Sincere praise can make a friend's eyes light up." },
  { zh: "牽起手，我們就是最棒的冒險小隊！", en: "Hold hands, and we are the best adventure team!" },
  { zh: "友誼不分國界，善良的心是共同的語言。", en: "Friendship knows no borders; a kind heart is a common language." },

  // 181-210: Honesty & Integrity (誠實與信用)
  { zh: "誠實是最好的策略。", en: "Honesty is the best policy." },
  { zh: "言必信，行必果。", en: "Promises must be kept, and actions must be resolute." },
  { zh: "做人要像松柏一樣，正直挺拔。", en: "Be upright and steadfast like a pine tree." },
  { zh: "承認錯誤需要勇氣，也是誠實的第一步。", en: "Admitting a mistake requires courage and is the first step of honesty." },
  { zh: "信用就像鏡子，一旦破了就很難還原。", en: "Trust is like a mirror; once broken, it is hard to restore." },
  { zh: "說實話，你的心裡會感到無比輕鬆。", en: "Speak the truth, and your heart will feel incredibly light." },
  { zh: "承諾過的事情，就要努力去做好。", en: "Try your best to do what you have promised." },
  { zh: "誠實地面對自己，你才能真正進步。", en: "Face yourself honestly so you can truly progress." },
  { zh: "即使沒人看見，也要堅持做對的事。", en: "Persist in doing the right thing, even when no one is watching." },
  { zh: "誠信是我們人格中最美麗的寶石。", en: "Integrity is the most beautiful gem in our character." },
  { zh: "用誠實贏得的信任，是世界上最穩固的關係。", en: "Trust earned through honesty is the most stable relationship in the world." },
  { zh: "不做虧心事，半夜敲門心不驚。", en: "A quiet conscience sleeps in thunder." },
  { zh: "誠實可能無法讓你得到一切，但能讓你問心無愧。", en: "Honesty may not get you everything, but it leaves you with a clear conscience." },
  { zh: "答應別人的小事，也要認真對待。", en: "Treat even small promises made to others seriously." },
  { zh: "正直的心靈，不會因為誘惑而搖擺。", en: "An upright mind does not waver because of temptation." },
  { zh: "誠實待人，別人也會用真心對待你。", en: "Treat people honestly, and they will treat you with sincerity." },
  { zh: "隱瞞錯誤只會讓問題變大，說實話才能解決它。", en: "Hiding errors only grows the problem; speaking the truth solves it." },
  { zh: "做一個說到做到的人，大家都會尊重你。", en: "Be a person who does what they say, and everyone will respect you." },
  { zh: "誠實是心靈的陽光，驅散所有的陰影。", en: "Honesty is the sunshine of the soul, dispersing all shadows." },
  { zh: "信用是無形的財富，請好好珍惜它。", en: "Trust is invisible wealth; please cherish it well." },
  { zh: "正直地贏，比作弊得到的勝利更有價值。", en: "Winning uprightly is more valuable than victory obtained by cheating." },
  { zh: "學會對自己的行為負責，你就是個小大人了。", en: "Learn to be responsible for your actions; you are growing up." },
  { zh: "誠信是一張通往世界的通行證。", en: "Integrity is a passport to the world." },
  { zh: "守時也是一種誠實的表現，代表尊重時間與他人。", en: "Punctuality is also an expression of honesty, representing respect for time and others." },
  { zh: "當你說真話時，你不需要記住你說過什麼。", en: "When you tell the truth, you don't have to remember what you said." },
  { zh: "誠實的心靈最坦蕩，夜晚的夢境最香甜。", en: "An honest mind is the most open, and the night dreams are the sweetest." },
  { zh: "勇於面對自己的不完美，也是正直的表現。", en: "Daring to face your own imperfections is also an expression of integrity." },
  { zh: "用誠信做基石，築起你高大的人生夢想。", en: "Build your grand life dreams with integrity as the foundation." },
  { zh: "做人堂堂正正，做事光明磊落。", en: "Be upright in character and open in action." },
  { zh: "誠實是人際關係的橋樑，讓心與心靠得更近。", en: "Honesty is the bridge in relationships, bringing hearts closer." },

  // 211-240: Self-Belief & Optimism (自信與樂觀)
  { zh: "相信自己，你就已經成功了一半。", en: "Believe in yourself, and you are halfway there." },
  { zh: "每天早晨對鏡子裡的自己微笑，說聲『加油』！", en: "Smile at yourself in the mirror every morning and say 'Go for it!'" },
  { zh: "你的價值不在於比別人好，而在於你正在變得更好。", en: "Your value lies not in being better than others, but in becoming better." },
  { zh: "用樂觀的眼睛看世界，處處都是美麗的風景。", en: "Look at the world with optimistic eyes, and beautiful scenery is everywhere." },
  { zh: "你是世界上獨一無二的星星，散發著專屬的光芒。", en: "You are a unique star in the world, shining with your own light." },
  { zh: "不要拿自己的缺點去比別人的優點，每個人都有花期。", en: "Don't compare your flaws with others' strengths; everyone has a blooming season." },
  { zh: "把『我不會』變成『我正在學』，信心就會翻倍。", en: "Change 'I can't' to 'I am learning,' and your confidence will double." },
  { zh: "你的微笑是治癒不開心最強大的魔法。", en: "Your smile is the most powerful magic to cure unhappiness." },
  { zh: "樂觀的人在每個危機中看到機會。", en: "Optimists see opportunities in every crisis." },
  { zh: "你今天很棒，明天的你會比今天更出色！", en: "You are great today, and tomorrow you will be even better!" },
  { zh: "勇敢地表達你的想法，你的聲音很重要。", en: "Express your thoughts bravely; your voice matters." },
  { zh: "每個人都有不擅長的事，這很正常，接納它吧！", en: "Everyone has things they aren't good at; it's normal, accept it!" },
  { zh: "用樂觀的心情迎接挑戰，困難也會縮小一半。", en: "Welcome challenges with an optimistic mind, and difficulties will shrink by half." },
  { zh: "相信你的翅膀，勇敢地飛向高空吧！", en: "Trust your wings and fly bravely to the high sky!" },
  { zh: "你是個充滿智慧與勇氣的孩子，相信自己的判斷。", en: "You are a child full of wisdom and courage; trust your judgment." },
  { zh: "挫折就像彈簧，你越堅強，它就彈得越高。", en: "Setbacks are like springs; the stronger you are, the higher you bounce." },
  { zh: "用自信的腳步，走出你獨一無二的人生大道。", en: "With confident steps, walk your unique path in life." },
  { zh: "每天寫下一件自己做得棒的事，累積自信存摺。", en: "Write down one thing you did great every day to build a confidence bank." },
  { zh: "太陽每天都會升起，新的一天充滿希望。", en: "The sun rises every day; a new day is full of hope." },
  { zh: "不要讓別人的否定，熄滅了你心中的火花。", en: "Do not let others' negativity extinguish the spark in your heart." },
  { zh: "做一個溫暖自己、也照亮他人的小太陽。", en: "Be a little sun that warms yourself and lights up others." },
  { zh: "相信努力的價值，你的付出一定會開花結果。", en: "Believe in the value of effort; your hard work will bear fruit." },
  { zh: "樂觀是心靈的維他命，讓我們的精神永遠富足。", en: "Optimism is vitamins for the soul, keeping our spirits always rich." },
  { zh: "昂首挺胸，大步向前，自信的你最美麗。", en: "Hold your head high and stride forward; confident you is most beautiful." },
  { zh: "即使路途遙遠，只要心中有光，就不怕迷路。", en: "Even if the road is long, as long as there is light in your heart, you won't fear getting lost." },
  { zh: "你所擁有的天賦，正等待著你用勇氣去喚醒它。", en: "The talents you possess are waiting for you to awaken them with courage." },
  { zh: "樂觀地笑一笑，沒什麼大不了！", en: "Smile optimistically; it's no big deal!" },
  { zh: "你就是自己命運的船長，掌好你的舵，出發吧！", en: "You are the captain of your own destiny; take the helm and set sail!" },
  { zh: "給自己多一點鼓勵，你比想像中做得還要好。", en: "Give yourself more encouragement; you are doing better than you think." },
  { zh: "用希望織網，捕捉天空中最亮的那顆星。", en: "Weave a net with hope to catch the brightest star in the sky." },

  // 241-270: Gratitude & Joy (感恩與喜悅)
  { zh: "感恩是心靈的健康花朵。", en: "Gratitude is the healthy flower of the soul." },
  { zh: "珍惜你所擁有的，你會感到無比快樂。", en: "Cherish what you have, and you will feel incredibly happy." },
  { zh: "快樂不是因為擁有的多，而是因為計較的少。", en: "Happiness is not about having much, but about caring less." },
  { zh: "感謝爸爸媽媽的付出，愛要大聲說出來。", en: "Appreciate your parents' efforts; say your love out loud." },
  { zh: "在平凡的每一天中，尋找值得感謝的三件事。", en: "Find three things to be grateful for in every ordinary day." },
  { zh: "用感恩的心吃每一頓飯，體會農夫與家人的辛苦。", en: "Eat every meal with gratitude, feeling the hard work of farmers and family." },
  { zh: "快樂就像香水，灑在別人身上，自己也會沾上幾滴。", en: "Happiness is like perfume; spray it on others, and you'll catch a few drops." },
  { zh: "感謝大自然給我們陽光、空氣和美麗的花草。", en: "Thank nature for giving us sunshine, air, and beautiful plants." },
  { zh: "感恩的心，能把冰冷的冬天變成溫暖的春天。", en: "A grateful heart can turn cold winter into warm spring." },
  { zh: "珍惜和家人朋友相處的每一刻，這就是最珍貴的財富。", en: "Cherish every moment with family and friends; this is the most precious wealth." },
  { zh: "用快樂的心情做功課，學習也會變得很有趣。", en: "Do homework with a happy mood, and learning will become fun too." },
  { zh: "感謝那些指出你錯誤的人，他們在幫助你成長。", en: "Thank those who point out your mistakes; they are helping you grow." },
  { zh: "感恩讓我們的生活充滿陽光，趕走所有的抱怨。", en: "Gratitude fills our life with sunshine, driving away all complaints." },
  { zh: "快樂藏在分享中，把快樂分給別人，你會更快樂。", en: "Happiness is hidden in sharing; share it, and you will be happier." },
  { zh: "感謝自己的身體，每天健康地帶我們奔跑和玩耍。", en: "Thank your body for carrying us to run and play healthily every day." },
  { zh: "知足常樂，心寬路更廣。", en: "Contentment brings constant happiness; a broad mind makes the road wider." },
  { zh: "寫一封感謝信給你的老師或朋友，傳遞溫暖的力量。", en: "Write a thank-you note to your teacher or friend to pass on warm power." },
  { zh: "感恩是一面鏡子，反射出生活中所有的美好。", en: "Gratitude is a mirror reflecting all the beauty in life." },
  { zh: "用喜悅的歌聲，唱出你對生命的熱愛吧！", en: "Sing out your love for life with a joyful voice!" },
  { zh: "感謝每一次的挫折，它讓我們學會了堅強。", en: "Thank every setback; it teaches us to be strong." },
  { zh: "保持感恩，你的好運氣會像滾雪球一樣越來越多。", en: "Keep grateful, and your good luck will grow like a rolling snowball." },
  { zh: "快樂是一件簡單的事，只要用心去感受生活的小細節。", en: "Happiness is a simple thing, just feel the small details of life with heart." },
  { zh: "感謝陽光叫醒我們，感謝月亮陪伴我們入睡。", en: "Thank the sun for waking us, and thank the moon for keeping us sleep company." },
  { zh: "感恩的心靈永遠不會感到孤單。", en: "A grateful soul will never feel lonely." },
  { zh: "用感恩的畫筆，畫出你身邊的幸福畫面。", en: "With a paint brush of gratitude, draw the happy scenes around you." },
  { zh: "善待身邊的一切，感恩的心會帶來溫暖的奇蹟。", en: "Treat everything around you well; a grateful heart brings warm miracles." },
  { zh: "快樂不是目的，而是一種看世界的態度。", en: "Happiness is not the destination, but an attitude toward the world." },
  { zh: "感謝時間，讓我們每一天都有機會學習和進步。", en: "Thank time for giving us the opportunity to learn and progress every day." },
  { zh: "感恩是心靈的陽光，照亮身邊每一個角落。", en: "Gratitude is the sunshine of the soul, lighting up every corner around us." },
  { zh: "珍惜每一滴水、每一粒米，愛護我們的地球家園。", en: "Cherish every drop of water and grain of rice; love our earth home." },

  // 271-300: Health & Self-Care (健康與照顧)
  { zh: "健康是最大的財富，愛護身體從今天做起。", en: "Health is the greatest wealth; cherish your body starting today." },
  { zh: "早睡早起身體好，精神飽滿迎接新一天。", en: "Early to bed and early to rise makes a man healthy, wealthy, and wise." },
  { zh: "多吃蔬菜水果，給你的身體裝滿健康的能量。", en: "Eat more vegetables and fruits to fill your body with healthy energy." },
  { zh: "適度運動，流汗能讓你的大腦和身體都更聰明。", en: "Exercise moderately; sweating makes both your brain and body smarter." },
  { zh: "學會深呼吸，當你感到緊張或難過時，它會安慰你。", en: "Learn to deep breathe; it comforts you when you feel nervous or sad." },
  { zh: "保護你的眼睛，定時遠眺，看看美麗的綠色大自然。", en: "Protect your eyes; look into the distance regularly at beautiful green nature." },
  { zh: "多喝水，它是你身體的生命之泉。", en: "Drink more water; it is the spring of life for your body." },
  { zh: "飯前洗手、飯後漱口，養成良好的衛生好習慣。", en: "Wash hands before meals, rinse mouth after meals; form good hygiene habits." },
  { zh: "睡前放鬆心情，讓好夢帶你進入甜美的冒險王國。", en: "Relax your mind before sleep; let good dreams take you into a sweet adventure kingdom." },
  { zh: "生病時要好好休息，給身體自我修復的時間。", en: "Rest well when sick; give your body time to repair itself." },
  { zh: "適當的休息，是為了走更遠的路。", en: "Proper rest is to prepare for a longer journey." },
  { zh: "保護牙齒，少吃甜食，每天認真刷牙兩次。", en: "Protect teeth, eat fewer sweets, and brush your teeth carefully twice a day." },
  { zh: "聽聽輕柔的音樂，讓心靈放個假，健康又快樂。", en: "Listen to soft music, let your mind take a vacation, healthy and happy." },
  { zh: "多去戶外曬曬溫暖的太陽，吸收大自然的維他命。", en: "Go outdoors to enjoy warm sunshine, absorbing nature's vitamins." },
  { zh: "學會表達自己的情緒，哭泣也是一種健康的宣洩方式。", en: "Learn to express your emotions; crying is also a healthy release." },
  { zh: "愛護你的身體，它是你探索世界唯一的飛船。", en: "Cherish your body; it is your only spaceship to explore the world." },
  { zh: "按時吃飯，不挑食，營養均衡身體棒。", en: "Eat meals on time, don't be picky, balanced nutrition makes a strong body." },
  { zh: "站如松，坐如鐘，保持良好的坐姿保護脊椎。", en: "Stand straight as a pine, sit firm as a bell; maintain good posture to protect your spine." },
  { zh: "運動過後記得補充水分，讓身體保持水潤活力。", en: "Remember to hydrate after exercise to keep your body hydrated and energetic." },
  { zh: "學會拒絕不安全的事情，保護自己是第一要務。", en: "Learn to refuse unsafe things; protecting yourself is the top priority." },
  { zh: "保持心情愉快，就是給免疫系統最好的防護罩。", en: "Keeping a happy mood is the best shield for your immune system." },
  { zh: "多和家人散步聊天，健康又溫馨的家庭時光。", en: "Walk and chat with family more; healthy and warm family time." },
  { zh: "睡覺前把所有煩惱放一邊，明天又是全新的一天。", en: "Set all worries aside before sleeping; tomorrow is a brand new day." },
  { zh: "愛護自己，就像愛護最珍貴的寶物一樣。", en: "Cherish yourself just like you cherish the most precious treasure." },
  { zh: "健康的生活方式，是送給未來自己最好的禮物。", en: "A healthy lifestyle is the best gift you can give to your future self." },
  { zh: "伸個大懶腰，舒展筋骨，元氣加滿！", en: "Take a big stretch, loosen your muscles, full energy added!" },
  { zh: "大笑是免費的健康良藥，每天都開心地笑一笑吧！", en: "Laughter is free healthy medicine; smile happily every day!" },
  { zh: "用心呵護你的心靈，給自己一個安靜的角落思考。", en: "Care for your soul with heart; give yourself a quiet corner to think." },
  { zh: "健康的身體，能帶你飛向更遠的夢想彼岸。", en: "A healthy body can fly you to the further shore of your dreams." },
  { zh: "今天，也要好好愛護自己喔！", en: "Today, take good care of yourself too!" },

  // 301-330: Focus & Patience (專注與耐心)
  { zh: "欲速則不達，耐心是成功的基石。", en: "Haste makes waste; patience is the foundation of success." },
  { zh: "專注做一件事，效果會超出你的想像。", en: "Focusing on one thing brings results beyond your imagination." },
  { zh: "羅馬不是一天造成的，偉大的事需要時間。", en: "Rome was not built in a day; great things take time." },
  { zh: "專心致志，金石為開。", en: "Concentration and dedication can carve metal and stone." },
  { zh: "耐心等待花開，每一種努力都有它的季節。", en: "Wait patiently for flowers to bloom; every effort has its season." },
  { zh: "讀書要三到：心到、眼到、口到。", en: "Three things are needed in reading: mind, eyes, and mouth." },
  { zh: "把分心的事物放一邊，現在是專注的黃金時間。", en: "Put distractions aside; now is the golden hour of focus." },
  { zh: "深吸一口氣，讓浮躁的心平靜下來。", en: "Take a deep breath to calm your restless heart." },
  { zh: "做事有始有終，才是最棒的負責表現。", en: "Finishing what you start is the best demonstration of responsibility." },
  { zh: "耐心是解開所有難題的魔法鑰匙。", en: "Patience is the magic key to unlocking all difficult problems." },
  { zh: "一次只做一件事，把每一步都走得踏實。", en: "Do one thing at a time, taking every step solidly." },
  { zh: "靜下心來，你會聽到智慧在說話。", en: "Calm your mind down, and you will hear wisdom speaking." },
  { zh: "耐心對待自己的不完美，你正在一步步變好。", en: "Be patient with your imperfections; you are improving step by step." },
  { zh: "專注就像放大鏡，能把微小的努力凝聚成火焰。", en: "Focus is like a magnifying glass, focusing tiny efforts into fire." },
  { zh: "不急不躁，穩步前進，終點就在不遠處。", en: "Not anxious and not impatient, move forward steadily; the finish line is nearby." },
  { zh: "把喧鬧關在門外，享受專注看書的安靜時光。", en: "Keep the noise outside the door; enjoy the quiet time of focused reading." },
  { zh: "耐心是智慧的伴侶，帶你做出最明智的選擇。", en: "Patience is the companion of wisdom, leading you to the wisest choices." },
  { zh: "專注於眼前的每一步，山頂自然會到達。", en: "Focus on every step in front of you, and you'll reach the mountaintop naturally." },
  { zh: "做手工需要耐心，生活也是一樣的道理。", en: "Handicrafts require patience; the same is true for life." },
  { zh: "把你的專注力當作寶貴的超能力，好好保護它。", en: "Treat your focus as a valuable superpower, protect it well." },
  { zh: "耐得住寂寞，才能守得住繁華。", en: "Only those who endure loneliness can appreciate prosperity." },
  { zh: "學習靜坐幾分鐘，聽聽心跳，整理你的思緒。", en: "Learn to sit quietly for a few minutes, listen to your heartbeat, organize thoughts." },
  { zh: "耐心的播種者，終會迎來豐收的喜悅。", en: "The patient sower will eventually welcome the joy of harvest." },
  { zh: "專注於解決方法，而不是抱怨問題。", en: "Focus on solutions instead of complaining about problems." },
  { zh: "給自己多一點耐心，學習新技能需要時間累積。", en: "Give yourself more patience; learning new skills takes time." },
  { zh: "專注的人最美麗，你的認真散發著耀眼的光芒。", en: "Focused people are most beautiful; your earnestness shines brightly." },
  { zh: "靜如處子，動如脫兔，專注與活力並重。", en: "Quiet as a virgin, active as a rabbit; value both focus and vitality." },
  { zh: "耐心是苦澀的樹，但它的果實是甜美的。", en: "Patience is a bitter tree, but its fruit is sweet." },
  { zh: "用專注的態度對待每一堂課，你會收穫滿滿的智慧。", en: "Treat every class with a focused attitude, and you'll harvest full wisdom." },
  { zh: "平心靜氣，專注當下，你就是最棒的！", en: "Keep calm, focus on the present, you are the best!" },

  // 331-365: Dreams & Growth Mindset (夢想與成長思維)
  { zh: "夢想無論多大，都有實現的可能。", en: "No matter how big the dream is, it has the possibility of coming true." },
  { zh: "把你的夢想寫在紙上，它就變成了前進的目標。", en: "Write your dream on paper, and it becomes a goal to move toward." },
  { zh: "成長不是一朝一夕，而是每天堅持的累積。", en: "Growth is not overnight, but the accumulation of daily persistence." },
  { zh: "不要說『我不行』，試著說『我再努力看看』！", en: "Don't say 'I can't'; try saying 'I will try harder'!" },
  { zh: "你的夢想是前行的燈塔，照亮你未來的路。", en: "Your dream is the lighthouse guiding your future path." },
  { zh: "每一次的挑戰，都是你的大腦正在變聰明的證據。", en: "Every challenge is proof that your brain is getting smarter." },
  { zh: "勇敢地張開夢想的翅膀，飛向你的未來吧！", en: "Bravely spread the wings of your dreams and fly to your future!" },
  { zh: "失敗是成功的墊腳石，踩著它你能爬得更高。", en: "Failure is the stepping stone to success; stepping on it, you can climb higher." },
  { zh: "用雙手播下夢想的種子，用汗水期待它的發芽。", en: "Sow the seeds of dreams with hands; look forward to its sprouting with sweat." },
  { zh: "成長是一場奇妙的旅行，沿途的風景都值得珍惜。", en: "Growth is a wonderful journey; the scenery along the way is worth cherishing." },
  { zh: "不要害怕與眾不同，那正是你最閃耀的地方。", en: "Don't be afraid to be different; that is exactly where you shine brightest." },
  { zh: "你的努力會像星星一樣，在夜空中閃閃發光。", en: "Your effort will shine like stars in the night sky." },
  { zh: "成長思維就是相信只要努力，自己就能學會任何事。", en: "Growth mindset is believing you can learn anything with effort." },
  { zh: "夢想是免費的，但實現夢想需要付出汗水與時間。", en: "Dreams are free, but achieving them takes sweat and time." },
  { zh: "今天做一個小計劃，朝著你的大夢想邁進一步。", en: "Make a small plan today to step closer to your big dream." },
  { zh: "每一天，都是為你的夢想大廈添磚加瓦的機會。", en: "Every day is an opportunity to add bricks and tiles to your dream tower." },
  { zh: "成長的過程中有晴天也有雨天，這都是生命的養分。", en: "There are sunny and rainy days in growth; both are nutrients of life." },
  { zh: "相信自己的潛力，你就是自己命運的創造者。", en: "Believe in your potential; you are the creator of your own destiny." },
  { zh: "把困難當作是升級打怪的關卡，勇敢破關吧！", en: "Treat difficulties as boss levels to upgrade; clear them bravely!" },
  { zh: "只要心中有夢，腳下就有力量。", en: "As long as there is a dream in your heart, there is strength under your feet." },
  { zh: "每一次進步，都值得為自己大聲鼓掌！", en: "Every bit of progress deserves loud applause for yourself!" },
  { zh: "夢想不會逃跑，逃跑的往往是自己，堅持下去！", en: "Dreams do not run away; people run away, persist!" },
  { zh: "成長思維讓我們看見未來的無限可能。", en: "Growth mindset lets us see infinite possibilities of the future." },
  { zh: "用熱情點燃夢想的火花，用毅力讓它熊熊燃燒。", en: "Ignite the spark of dreams with passion; keep it burning with willpower." },
  { zh: "你是個有夢想的孩子，全宇宙都會為你的努力加油。", en: "You are a child with dreams; the whole universe cheers for your effort." },
  { zh: "不要因為一時的挫折，就忘記了當初的理想。", en: "Do not forget your original ideal because of temporary setbacks." },
  { zh: "每天給自己一個微小的挑戰，你會發現自己不斷在進化。", en: "Give yourself a tiny challenge daily, and you'll find yourself evolving." },
  { zh: "夢想是生命的調色盤，讓你的世界變得無比斑斕。", en: "Dreams are the palette of life, making your world incredibly colorful." },
  { zh: "相信時間的魔力，慢慢來，比較快。", en: "Believe in the magic of time; slowly is faster." },
  { zh: "用你的智慧與努力，去創造一個精彩的明天！", en: "Create a brilliant tomorrow with your wisdom and effort!" },
  { zh: "不管走得多遠，都不要忘記保持一顆赤子之心。", en: "No matter how far you go, never forget to keep a pure childlike heart." },
  { zh: "有夢想的人，靈魂都會閃閃發光。", en: "People with dreams have souls that shine brightly." },
  { zh: "成長就是不斷打碎舊的限制，重塑新的自己。", en: "Growth is continuously shattering old limits to reshape a new self." },
  { zh: "今天，是實現夢想最好的一天，出發吧！", en: "Today is the best day to make dreams come true; let's go!" },
  { zh: "願你的心中永遠裝滿陽光，夢想終會展翅高飛！", en: "May your heart always be filled with sunshine; dreams will fly high!" }
];

async function run() {
  console.log("Starting proverbs table migration...");
  try {
    // 1. Create table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_proverbs (
        id SERIAL PRIMARY KEY,
        content_zh VARCHAR(500) NOT NULL,
        content_en VARCHAR(500) NOT NULL
      );
    `);
    console.log("Successfully created daily_proverbs table.");

    // 2. Check if we already have proverbs in the database to avoid duplicate inserts
    const countRes = await pool.query("SELECT COUNT(*) FROM daily_proverbs;");
    const count = parseInt(countRes.rows[0].count, 10);
    
    if (count === 365) {
      console.log("Table daily_proverbs already has 365 rows. Skipping seed insertion.");
    } else {
      console.log(`Table daily_proverbs currently has ${count} rows. Resetting and inserting 365 rows...`);
      await pool.query("TRUNCATE TABLE daily_proverbs RESTART IDENTITY;");
      
      // Perform batch inserts
      // Insert in chunks of 50 to avoid big query parameter limits if any
      const chunkSize = 50;
      for (let i = 0; i < proverbs.length; i += chunkSize) {
        const chunk = proverbs.slice(i, i + chunkSize);
        const valuePlaceholders = chunk.map((_, idx) => `($${idx * 2 + 1}, $${idx * 2 + 2})`).join(', ');
        const values = [];
        chunk.forEach(p => {
          values.push(p.zh, p.en);
        });
        
        await pool.query(
          `INSERT INTO daily_proverbs (content_zh, content_en) VALUES ${valuePlaceholders}`,
          values
        );
      }
      
      const checkCount = await pool.query("SELECT COUNT(*) FROM daily_proverbs;");
      console.log(`Successfully seeded ${checkCount.rows[0].count} proverbs into database.`);
    }
  } catch (error) {
    console.error("Migration error:", error);
  } finally {
    await pool.end();
    console.log("Migration complete.");
  }
}

run();
