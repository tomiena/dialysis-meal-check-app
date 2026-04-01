export type Food = {
  id: string;
  name: string;
  water: number;      // ml per 100g
  sodium: number;     // mg per 100g
  potassium: number;  // mg per 100g
  phosphorus: number; // mg per 100g
};

// Values are approximate per 100g (cooked/as-served unless noted)
export const FOODS: Food[] = [
  // ── 主食・麺 ──────────────────────────────────────────
  { id: "rice",        name: "白米",        water: 60,  sodium:   1, potassium:  29, phosphorus:  34 },
  { id: "brown_rice",  name: "玄米",        water: 60,  sodium:   1, potassium:  95, phosphorus: 130 },
  { id: "fried_rice",  name: "チャーハン",  water: 55,  sodium: 350, potassium:  70, phosphorus:  60 },
  { id: "curry_rice",  name: "カレーライス",water: 65,  sodium: 400, potassium: 120, phosphorus:  50 },
  { id: "bread",       name: "食パン",      water: 38,  sodium: 500, potassium:  97, phosphorus:  85 },
  { id: "udon",        name: "うどん",      water: 75,  sodium: 200, potassium:  20, phosphorus:  18 },
  { id: "soba",        name: "そば",        water: 68,  sodium:  60, potassium: 100, phosphorus:  95 },
  { id: "ramen",       name: "ラーメン",    water: 88,  sodium: 800, potassium: 100, phosphorus:  50 },
  { id: "spaghetti",   name: "スパゲティ",  water: 65,  sodium:   1, potassium:  55, phosphorus:  90 },

  // ── 汁物 ──────────────────────────────────────────────
  { id: "miso_soup",    name: "みそ汁",        water: 93, sodium: 600, potassium:  80, phosphorus:  40 },
  { id: "consomme",     name: "コンソメスープ", water: 94, sodium: 500, potassium: 100, phosphorus:  20 },
  { id: "chinese_soup", name: "中華スープ",     water: 93, sodium: 550, potassium:  90, phosphorus:  20 },
  { id: "potage",       name: "ポタージュ",     water: 88, sodium: 400, potassium: 180, phosphorus:  60 },
  { id: "curry_liquid", name: "カレー（汁）",   water: 80, sodium: 500, potassium: 150, phosphorus:  50 },
  { id: "stew",         name: "シチュー",       water: 82, sodium: 450, potassium: 200, phosphorus:  60 },

  // ── 飲み物 ────────────────────────────────────────────
  { id: "water_drink", name: "水",        water: 100, sodium:  0, potassium:   0, phosphorus:  0 },
  { id: "green_tea",   name: "お茶",      water: 100, sodium:  0, potassium:  27, phosphorus:  2 },
  { id: "coffee",      name: "コーヒー",  water:  99, sodium:  1, potassium:  65, phosphorus:  7 },
  { id: "beer",        name: "アルコール",water:  93, sodium:  4, potassium:  34, phosphorus: 15 },

  // ── 肉類 ──────────────────────────────────────────────
  { id: "chicken_b",  name: "鶏むね肉", water: 74, sodium:  60, potassium: 330, phosphorus: 220 },
  { id: "chicken_t",  name: "鶏もも肉", water: 72, sodium:  70, potassium: 290, phosphorus: 200 },
  { id: "sasami",     name: "鶏ささみ", water: 75, sodium:  40, potassium: 320, phosphorus: 210 },
  { id: "pork_loin",  name: "豚ロース", water: 63, sodium:  60, potassium: 290, phosphorus: 200 },
  { id: "pork_belly", name: "豚バラ",   water: 49, sodium:  50, potassium: 230, phosphorus: 130 },
  { id: "beef",       name: "牛もも肉", water: 68, sodium:  60, potassium: 290, phosphorus: 175 },
  { id: "beef_belly", name: "牛バラ",   water: 54, sodium:  55, potassium: 230, phosphorus: 130 },
  { id: "minced",     name: "ひき肉",   water: 61, sodium:  70, potassium: 280, phosphorus: 160 },

  // ── 魚類 ──────────────────────────────────────────────
  { id: "salmon",      name: "さけ（生）",water: 72, sodium:  66, potassium: 350, phosphorus: 240 },
  { id: "salmon_salt", name: "塩さけ",    water: 65, sodium: 700, potassium: 320, phosphorus: 230 },
  { id: "mackerel",    name: "さば",      water: 62, sodium: 110, potassium: 330, phosphorus: 220 },
  { id: "aji",         name: "あじ",      water: 75, sodium: 120, potassium: 320, phosphorus: 200 },
  { id: "iwashi",      name: "いわし",    water: 67, sodium: 150, potassium: 290, phosphorus: 230 },
  { id: "tuna",        name: "まぐろ",    water: 70, sodium:  43, potassium: 380, phosphorus: 270 },
  { id: "buri",        name: "ぶり",      water: 59, sodium:  65, potassium: 380, phosphorus: 130 },
  { id: "tai",         name: "たい",      water: 75, sodium:  55, potassium: 340, phosphorus: 220 },
  { id: "shrimp",      name: "えび",      water: 79, sodium: 170, potassium: 230, phosphorus: 200 },

  // ── 卵・豆腐 ──────────────────────────────────────────
  { id: "egg",    name: "卵",     water: 76, sodium: 140, potassium: 130, phosphorus: 180 },
  { id: "tofu_m", name: "豆腐",   water: 87, sodium:   5, potassium: 110, phosphorus: 110 },
  { id: "tofu_k", name: "絹豆腐", water: 89, sodium:   5, potassium: 140, phosphorus:  88 },
  { id: "natto",  name: "納豆",   water: 60, sodium:   2, potassium: 660, phosphorus: 190 },

  // ── 野菜 ──────────────────────────────────────────────
  { id: "cabbage",      name: "キャベツ",    water: 93, sodium:  5, potassium: 200, phosphorus:  27 },
  { id: "cucumber",     name: "きゅうり",    water: 95, sodium:  1, potassium: 200, phosphorus:  36 },
  { id: "tomato",       name: "トマト",      water: 94, sodium:  7, potassium: 210, phosphorus:  26 },
  { id: "broccoli",     name: "ブロッコリー",water: 89, sodium: 14, potassium: 360, phosphorus:  89 },
  { id: "lettuce",      name: "レタス",      water: 96, sodium:  4, potassium: 200, phosphorus:  22 },
  { id: "moyashi",      name: "もやし",      water: 95, sodium:  2, potassium:  69, phosphorus:  51 },
  { id: "eggplant",     name: "なす",        water: 93, sodium:  0, potassium: 220, phosphorus:  30 },
  { id: "green_pepper", name: "ピーマン",    water: 93, sodium:  1, potassium: 190, phosphorus:  22 },
  { id: "daikon",       name: "大根",        water: 95, sodium: 16, potassium: 230, phosphorus:  18 },
  { id: "onion",        name: "玉ねぎ",      water: 90, sodium:  2, potassium: 150, phosphorus:  31 },
  { id: "shiitake",     name: "しいたけ",    water: 91, sodium:  2, potassium: 290, phosphorus:  57 },
  { id: "enoki",        name: "えのき",      water: 88, sodium:  2, potassium: 340, phosphorus:  96 },
  { id: "komatsuna",    name: "小松菜",      water: 95, sodium: 15, potassium: 500, phosphorus:  45 },
  { id: "corn",         name: "とうもろこし",water: 77, sodium:  1, potassium: 290, phosphorus: 100 },
  { id: "carrot",       name: "にんじん",    water: 89, sodium: 30, potassium: 270, phosphorus:  26 },
  { id: "pumpkin",      name: "かぼちゃ",    water: 87, sodium:  1, potassium: 450, phosphorus:  43 },
  { id: "potato",       name: "じゃがいも",  water: 81, sodium:  1, potassium: 410, phosphorus:  47 },
  { id: "spinach",      name: "ほうれん草",  water: 92, sodium: 16, potassium: 690, phosphorus:  47 },
  { id: "sweet_potato", name: "さつまいも",  water: 66, sodium:  1, potassium: 480, phosphorus:  47 },

  // ── 果物 ──────────────────────────────────────────────
  { id: "apple",      name: "りんご",  water: 84, sodium:  0, potassium: 120, phosphorus:  12 },
  { id: "mikan",      name: "みかん",  water: 87, sodium:  1, potassium: 150, phosphorus:  15 },
  { id: "pear",       name: "なし",    water: 88, sodium:  0, potassium: 140, phosphorus:  11 },
  { id: "peach",      name: "もも",    water: 88, sodium:  0, potassium: 180, phosphorus:  18 },
  { id: "watermelon", name: "すいか",  water: 90, sodium:  1, potassium: 120, phosphorus:   8 },
  { id: "strawberry", name: "いちご",  water: 90, sodium:  0, potassium: 170, phosphorus:  31 },
  { id: "grape",      name: "ぶどう",  water: 83, sodium:  1, potassium: 130, phosphorus:  15 },
  { id: "banana",     name: "バナナ",  water: 75, sodium:  0, potassium: 360, phosphorus:  27 },
  { id: "kiwi",       name: "キウイ",  water: 84, sodium:  2, potassium: 300, phosphorus:  32 },
  { id: "melon",      name: "メロン",  water: 87, sodium:  7, potassium: 350, phosphorus:  14 },

  // ── 調理済み ──────────────────────────────────────────
  { id: "karaage",    name: "から揚げ",  water: 54, sodium: 400, potassium: 290, phosphorus: 230 },
  { id: "yakizakana", name: "焼き魚",    water: 65, sodium: 200, potassium: 320, phosphorus: 220 },
  { id: "hamburger",  name: "ハンバーグ",water: 55, sodium: 500, potassium: 280, phosphorus: 160 },
  { id: "tonkatsu",   name: "とんかつ",  water: 45, sodium: 450, potassium: 280, phosphorus: 180 },
  { id: "croquette",  name: "コロッケ",  water: 52, sodium: 420, potassium: 320, phosphorus:  90 },

  // ── 加工食品 ──────────────────────────────────────────
  { id: "ham",    name: "ハム",      water: 71, sodium: 1100, potassium: 280, phosphorus: 230 },
  { id: "wiener", name: "ウインナー",water: 55, sodium:  800, potassium: 210, phosphorus: 160 },
  { id: "bacon",  name: "ベーコン",  water: 46, sodium:  700, potassium: 270, phosphorus: 180 },

  // ── 調味料・乳製品 ────────────────────────────────────
  { id: "soy_tbsp",  name: "醤油",      water: 67, sodium: 7000, potassium: 390, phosphorus: 170 },
  { id: "miso_tbsp", name: "みそ",      water: 43, sodium: 4200, potassium: 380, phosphorus: 170 },
  { id: "salt_tsp",  name: "塩",        water:  0, sodium:39000, potassium: 100, phosphorus:   0 },
  { id: "milk",      name: "牛乳",      water: 87, sodium:   40, potassium: 150, phosphorus:  90 },
  { id: "cheese",    name: "チーズ",    water: 45, sodium:  800, potassium:  90, phosphorus: 630 },
  { id: "yogurt",    name: "ヨーグルト",water: 87, sodium:   40, potassium: 170, phosphorus: 100 },
];

export function getFoodRisk(food: Food) {
  return {
    sodium:    food.sodium    > 300,
    potassium: food.potassium > 300,
  };
}
