export type FoodCategory =
  | "grain"          // 主食・麺
  | "vegetable"      // 野菜・果物
  | "meat"           // 肉
  | "fish"           // 魚介
  | "dairy_egg_soy"  // 卵・大豆・乳製品
  | "seasoning"      // 調味料
  | "drink"          // 飲み物
  | "soup"           // 汁物
  | "prepared_food"; // 調理済み・惣菜

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  image: string;
  water: number;      // ml per 100g
  sodium: number;     // mg per 100g
  potassium: number;  // mg per 100g
  phosphorus: number; // mg per 100g
};

// Values are approximate per 100g (cooked/as-served unless noted)
export const FOODS: Food[] = [

  // ── grain 主食・麺 ─────────────────────────────────────────
  { id: "rice",        name: "白米",       category: "grain",        image: "/images/foods/rice.png",        water: 60, sodium:   1, potassium:  29, phosphorus:  34 },
  { id: "brown_rice",  name: "玄米",       category: "grain",        image: "/images/foods/brown_rice.png",  water: 60, sodium:   1, potassium:  95, phosphorus: 130 },
  { id: "onigiri",     name: "おにぎり",   category: "grain",        image: "/images/foods/onigiri.png",     water: 56, sodium: 220, potassium:  29, phosphorus:  40 },
  { id: "bread",       name: "食パン",     category: "grain",        image: "/images/foods/bread.png",       water: 38, sodium: 500, potassium:  97, phosphorus:  85 },
  { id: "udon",        name: "うどん",     category: "grain",        image: "/images/foods/udon.png",        water: 75, sodium: 200, potassium:  20, phosphorus:  18 },
  { id: "soba",        name: "そば",       category: "grain",        image: "/images/foods/soba.png",        water: 68, sodium:  60, potassium: 100, phosphorus:  95 },
  { id: "spaghetti",   name: "スパゲティ", category: "grain",        image: "/images/foods/spaghetti.png",   water: 65, sodium:   1, potassium:  55, phosphorus:  90 },

  // ── soup 汁物 ──────────────────────────────────────────────
  { id: "miso_soup",   name: "みそ汁",     category: "soup",         image: "/images/foods/miso_soup.png",   water: 93, sodium: 600, potassium:  80, phosphorus:  40 },

  // ── drink 飲み物 ───────────────────────────────────────────
  { id: "green_tea",   name: "お茶（緑茶）",  category: "drink",     image: "/images/foods/green_tea.png",   water: 100, sodium:  0, potassium:  27, phosphorus:   2 },
  { id: "black_tea",   name: "紅茶",          category: "drink",     image: "/images/foods/black_tea.png",   water: 100, sodium:  1, potassium:   8, phosphorus:   2 },
  { id: "coffee",      name: "コーヒー",      category: "drink",     image: "/images/foods/coffee.png",      water:  99, sodium:  1, potassium:  65, phosphorus:   7 },
  { id: "orange_juice",name: "オレンジジュース（100%）", category: "drink", image: "/images/foods/orange_juice.png", water: 89, sodium: 1, potassium: 200, phosphorus: 13 },
  { id: "cola",        name: "コーラ",        category: "drink",     image: "/images/foods/cola.png",        water:  89, sodium:  4, potassium:   2, phosphorus:  12 },
  { id: "beer",        name: "ビール",        category: "drink",     image: "/images/foods/beer.png",        water:  93, sodium:  4, potassium:  34, phosphorus:  15 },

  // ── meat 肉 ────────────────────────────────────────────────
  { id: "beef",        name: "牛もも肉",   category: "meat",         image: "/images/foods/beef.png",        water: 68, sodium:  60, potassium: 290, phosphorus: 175 },

  // ── fish 魚介 ──────────────────────────────────────────────
  { id: "salmon",      name: "さけ（生）", category: "fish",         image: "/images/foods/salmon.png",      water: 72, sodium:  66, potassium: 350, phosphorus: 240 },
  { id: "tuna",        name: "まぐろ",     category: "fish",         image: "/images/foods/tuna.png",        water: 70, sodium:  43, potassium: 380, phosphorus: 270 },
  { id: "mackerel",    name: "さば",       category: "fish",         image: "/images/foods/mackerel.png",    water: 62, sodium: 110, potassium: 330, phosphorus: 220 },
  { id: "shrimp",      name: "えび",       category: "fish",         image: "/images/foods/shrimp.png",      water: 79, sodium: 170, potassium: 230, phosphorus: 200 },
  { id: "squid",       name: "いか",       category: "fish",         image: "/images/foods/squid.png",       water: 80, sodium: 200, potassium: 290, phosphorus: 250 },

  // ── dairy_egg_soy 卵・大豆・乳製品 ────────────────────────
  { id: "egg",         name: "卵",                 category: "dairy_egg_soy", image: "/images/foods/egg.png",     water: 76, sodium: 140, potassium: 130, phosphorus: 180 },
  { id: "natto",       name: "納豆",               category: "dairy_egg_soy", image: "/images/foods/natto.png",   water: 60, sodium:   2, potassium: 660, phosphorus: 190 },
  { id: "edamame",     name: "枝豆",               category: "dairy_egg_soy", image: "/images/foods/edamame.png", water: 72, sodium:   1, potassium: 490, phosphorus: 170 },
  { id: "milk",        name: "牛乳",               category: "dairy_egg_soy", image: "/images/foods/milk.png",    water: 87, sodium:  40, potassium: 150, phosphorus:  90 },
  { id: "cheese",      name: "チーズ（プロセス）", category: "dairy_egg_soy", image: "/images/foods/cheese.png",  water: 45, sodium: 800, potassium:  90, phosphorus: 630 },
  { id: "yogurt",      name: "ヨーグルト",         category: "dairy_egg_soy", image: "/images/foods/yogurt.png",  water: 87, sodium:  40, potassium: 170, phosphorus: 100 },

  // ── vegetable 野菜・果物 ───────────────────────────────────
  { id: "cabbage",      name: "キャベツ",     category: "vegetable", image: "/images/foods/cabbage.png",      water: 93, sodium:  5, potassium: 200, phosphorus:  27 },
  { id: "cucumber",     name: "きゅうり",     category: "vegetable", image: "/images/foods/cucumber.png",     water: 95, sodium:  1, potassium: 200, phosphorus:  36 },
  { id: "tomato",       name: "トマト",       category: "vegetable", image: "/images/foods/tomato.png",       water: 94, sodium:  7, potassium: 210, phosphorus:  26 },
  { id: "broccoli",     name: "ブロッコリー", category: "vegetable", image: "/images/foods/broccoli.png",     water: 89, sodium: 14, potassium: 360, phosphorus:  89 },
  { id: "lettuce",      name: "レタス",       category: "vegetable", image: "/images/foods/lettuce.png",      water: 96, sodium:  4, potassium: 200, phosphorus:  22 },
  { id: "eggplant",     name: "なす",         category: "vegetable", image: "/images/foods/eggplant.png",     water: 93, sodium:  0, potassium: 220, phosphorus:  30 },
  { id: "green_pepper", name: "ピーマン",     category: "vegetable", image: "/images/foods/green_pepper.png", water: 93, sodium:  1, potassium: 190, phosphorus:  22 },
  { id: "daikon",       name: "大根",         category: "vegetable", image: "/images/foods/daikon.png",       water: 95, sodium: 16, potassium: 230, phosphorus:  18 },
  { id: "onion",        name: "玉ねぎ",       category: "vegetable", image: "/images/foods/onion.png",        water: 90, sodium:  2, potassium: 150, phosphorus:  31 },
  { id: "carrot",       name: "にんじん",     category: "vegetable", image: "/images/foods/carrot.png",       water: 89, sodium: 30, potassium: 270, phosphorus:  26 },
  { id: "potato",       name: "じゃがいも",   category: "vegetable", image: "/images/foods/potato.png",       water: 81, sodium:  1, potassium: 410, phosphorus:  47 },
  { id: "sweet_potato", name: "さつまいも",   category: "vegetable", image: "/images/foods/sweet_potato.png", water: 66, sodium:  1, potassium: 480, phosphorus:  47 },
  { id: "spinach",      name: "ほうれん草",   category: "vegetable", image: "/images/foods/spinach.png",      water: 92, sodium: 16, potassium: 690, phosphorus:  47 },
  { id: "corn",         name: "とうもろこし", category: "vegetable", image: "/images/foods/corn.png",         water: 77, sodium:  1, potassium: 290, phosphorus: 100 },
  { id: "asparagus",    name: "アスパラガス", category: "vegetable", image: "/images/foods/asparagus.png",    water: 92, sodium:  2, potassium: 270, phosphorus:  60 },

  // ── seasoning 調味料 ───────────────────────────────────────
  { id: "mayonnaise",  name: "マヨネーズ", category: "seasoning",    image: "/images/foods/mayonnaise.png",  water: 15, sodium:  860, potassium:  15, phosphorus:  30 },
  { id: "ketchup",     name: "ケチャップ", category: "seasoning",    image: "/images/foods/ketchup.png",     water: 66, sodium: 1200, potassium: 420, phosphorus:  40 },
  { id: "vinegar",     name: "酢（米酢）", category: "seasoning",    image: "/images/foods/vinegar.png",     water: 93, sodium:    6, potassium:   4, phosphorus:   6 },
  { id: "butter",      name: "バター",     category: "seasoning",    image: "/images/foods/butter.png",      water: 16, sodium:  750, potassium:  28, phosphorus:  17 },

  // ── prepared_food 調理済み・惣菜 ──────────────────────────
  { id: "karaage",    name: "から揚げ",   category: "prepared_food", image: "/images/foods/karaage.png",    water: 54, sodium: 400, potassium: 290, phosphorus: 230 },
  { id: "tonkatsu",   name: "とんかつ",   category: "prepared_food", image: "/images/foods/tonkatsu.png",   water: 45, sodium: 450, potassium: 280, phosphorus: 180 },
  { id: "fried_rice", name: "チャーハン", category: "prepared_food", image: "/images/foods/fried_rice.png", water: 55, sodium: 350, potassium:  70, phosphorus:  60 },
  { id: "curry_rice", name: "カレーライス",category: "prepared_food",image: "/images/foods/curry_rice.png", water: 65, sodium: 400, potassium: 120, phosphorus:  50 },
  { id: "ramen",      name: "ラーメン",   category: "prepared_food", image: "/images/foods/ramen.png",      water: 88, sodium: 800, potassium: 100, phosphorus:  50 },
  { id: "pizza",      name: "ピザ",       category: "prepared_food", image: "/images/foods/pizza.png",      water: 45, sodium: 550, potassium: 120, phosphorus: 130 },
];

export function getFoodRisk(food: Food) {
  return {
    sodium:    food.sodium    > 300,
    potassium: food.potassium > 300,
  };
}
