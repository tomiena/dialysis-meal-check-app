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

/** 分量選択肢。amountG が result ページに渡る gram/ml 量 */
export type Portion = {
  label: string;
  amountG: number;
};

export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  image: string;
  water: number;      // ml per 100g
  sodium: number;     // mg per 100g
  potassium: number;  // mg per 100g
  phosphorus: number; // mg per 100g
  portions?: Portion[];
};

// Values are approximate per 100g (cooked/as-served unless noted)
export const FOODS: Food[] = [

  // ── grain 主食・麺 ─────────────────────────────────────────
  { id: "rice",             name: "白米",         category: "grain",        image: "/images/foods/rice.png",             water: 60, sodium: 0,   potassium:  44, phosphorus:  54,
    portions: [{ label: "少なめ(100g)", amountG: 100 }, { label: "普通盛り(150g)", amountG: 150 }, { label: "大盛り(250g)", amountG: 250 }] },
  { id: "brown_rice",       name: "玄米",         category: "grain",        image: "/images/foods/brown_rice.png",       water: 60, sodium:   1, potassium:  95, phosphorus: 130,
    portions: [{ label: "少なめ(100g)", amountG: 100 }, { label: "普通盛り(150g)", amountG: 150 }, { label: "大盛り(250g)", amountG: 250 }] },
  { id: "onigiri",          name: "おにぎり",     category: "grain",        image: "/images/foods/onigiri.png",          water: 56, sodium: 220, potassium:  29, phosphorus:  40,
    portions: [{ label: "1個(100g)", amountG: 100 }, { label: "大きめ1個(130g)", amountG: 130 }, { label: "2個", amountG: 200 }] },
  { id: "bread",            name: "食パン",       category: "grain",        image: "/images/foods/bread.png",            water: 38, sodium: 500, potassium:  97, phosphorus:  85,
    portions: [{ label: "1枚(60g)", amountG: 60 }, { label: "2枚", amountG: 120 }] },
  { id: "whole_grain_bread",name: "全粒粉パン",   category: "grain",        image: "/images/foods/whole_grain_bread.png",water: 38, sodium: 450, potassium: 190, phosphorus: 170,
    portions: [{ label: "1枚(60g)", amountG: 60 }, { label: "2枚", amountG: 120 }] },
  { id: "udon",             name: "うどん",       category: "grain",        image: "/images/foods/udon.png",             water: 75, sodium: 200, potassium:  20, phosphorus:  18,
    portions: [{ label: "半玉(120g)", amountG: 120 }, { label: "1玉(240g)", amountG: 240 }] },
  { id: "soba",             name: "そば",         category: "grain",        image: "/images/foods/soba.png",             water: 68, sodium:  60, potassium: 100, phosphorus:  95,
    portions: [{ label: "半分(120g)", amountG: 120 }, { label: "1杯(200g)", amountG: 200 }] },
  { id: "spaghetti",        name: "スパゲティ",   category: "grain",        image: "/images/foods/spaghetti.png",        water: 65, sodium:   1, potassium:  55, phosphorus:  90,
    portions: [{ label: "少なめ(150g)", amountG: 150 }, { label: "普通(200g)", amountG: 200 }] },

  // ── soup 汁物 ──────────────────────────────────────────────
  { id: "miso_soup",      name: "みそ汁",     category: "soup", image: "/images/foods/miso_soup.png",      water: 93, sodium: 580, potassium:  80, phosphorus:  35,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }, { label: "少しだけ", amountG: 30 }] },
  { id: "vegetable_soup", name: "野菜スープ", category: "soup", image: "/images/foods/vegetable_soup.png", water: 93, sodium: 400, potassium: 200, phosphorus:  30,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }, { label: "少しだけ", amountG: 30 }] },

  // ── drink 飲み物 ───────────────────────────────────────────
  { id: "water",        name: "水",                       category: "drink", image: "/images/foods/water.png",        water: 100, sodium:  0, potassium:   0, phosphorus:  0,
    portions: [{ label: "コップ1杯(200ml)", amountG: 200 }, { label: "半分(100ml)", amountG: 100 }, { label: "ペット小(350ml)", amountG: 350 }] },
  { id: "green_tea",    name: "お茶（緑茶）",             category: "drink", image: "/images/foods/green_tea.png",    water: 100, sodium:  0, potassium:  27, phosphorus:  2,
    portions: [{ label: "湯呑み(150ml)", amountG: 150 }, { label: "コップ1杯(200ml)", amountG: 200 }, { label: "ペット小(350ml)", amountG: 350 }] },
  { id: "black_tea",    name: "紅茶",                     category: "drink", image: "/images/foods/black_tea.png",    water: 100, sodium:  1, potassium:   8, phosphorus:  2,
    portions: [{ label: "カップ1杯(150ml)", amountG: 150 }, { label: "多め(230ml)", amountG: 230 }] },
  { id: "coffee",       name: "コーヒー",                 category: "drink", image: "/images/foods/coffee.png",       water:  99, sodium:  1, potassium:  65, phosphorus:  7,
    portions: [{ label: "カップ1杯(150ml)", amountG: 150 }, { label: "多め(230ml)", amountG: 230 }] },
  { id: "orange_juice", name: "オレンジジュース（100%）", category: "drink", image: "/images/foods/orange_juice.png", water:  89, sodium:  1, potassium: 200, phosphorus: 13,
    portions: [{ label: "小パック(125ml)", amountG: 125 }, { label: "コップ1杯(200ml)", amountG: 200 }] },
  { id: "apple_juice",  name: "リンゴジュース",           category: "drink", image: "/images/foods/apple_juice.png",  water:  88, sodium:  1, potassium: 100, phosphorus: 10,
    portions: [{ label: "小パック(125ml)", amountG: 125 }, { label: "コップ1杯(200ml)", amountG: 200 }] },
  { id: "cola",         name: "コーラ",                   category: "drink", image: "/images/foods/cola.png",         water:  89, sodium: 10, potassium:   1, phosphorus: 18,
    portions: [{ label: "半缶(175ml)", amountG: 175 }, { label: "缶1本(350ml)", amountG: 350 }] },
  { id: "beer",         name: "ビール",                   category: "drink", image: "/images/foods/beer.png",         water:  93, sodium:  4, potassium:  34, phosphorus: 15,
    portions: [{ label: "半缶(175ml)", amountG: 175 }, { label: "缶1本(350ml)", amountG: 350 }] },

  // ── meat 肉 ────────────────────────────────────────────────
  { id: "beef",             name: "牛もも肉",     category: "meat",         image: "/images/foods/beef.png",             water: 68, sodium:  60, potassium: 290, phosphorus: 175 },
  { id: "pork",             name: "豚肉",         category: "meat",         image: "/images/foods/pork.png",             water: 63, sodium:  60, potassium: 290, phosphorus: 200 },
  { id: "chicken_breast",   name: "鶏むね肉",     category: "meat",         image: "/images/foods/chicken_breast.png",   water: 74, sodium:  60, potassium: 330, phosphorus: 220 },
  { id: "chicken_thigh",    name: "鶏もも肉",     category: "meat",         image: "/images/foods/chicken_thigh.png",    water: 72, sodium:  70, potassium: 290, phosphorus: 200 },
  { id: "ground_meat",      name: "ひき肉",       category: "meat",         image: "/images/foods/ground_meat.png",      water: 61, sodium:  70, potassium: 280, phosphorus: 160 },

  // ── fish 魚介 ──────────────────────────────────────────────
  { id: "salmon",           name: "さけ（生）",   category: "fish",         image: "/images/foods/salmon.png",           water: 72, sodium:  66, potassium: 350, phosphorus: 240 },
  { id: "tuna",             name: "まぐろ",       category: "fish",         image: "/images/foods/tuna.png",             water: 70, sodium:  43, potassium: 380, phosphorus: 270 },
  { id: "mackerel",         name: "さば",         category: "fish",         image: "/images/foods/mackerel.png",         water: 62, sodium: 110, potassium: 330, phosphorus: 220 },
  { id: "shrimp",           name: "えび",         category: "fish",         image: "/images/foods/shrimp.png",           water: 79, sodium: 170, potassium: 230, phosphorus: 200 },
  { id: "squid",            name: "いか",         category: "fish",         image: "/images/foods/squid.png",            water: 80, sodium: 200, potassium: 290, phosphorus: 250 },

  // ── dairy_egg_soy 卵・大豆・乳製品 ────────────────────────
  { id: "egg",              name: "卵",                 category: "dairy_egg_soy", image: "/images/foods/egg.png",    water: 76, sodium: 140, potassium: 130, phosphorus: 180 },
  { id: "tofu",             name: "豆腐",               category: "dairy_egg_soy", image: "/images/foods/tofu.png",   water: 88, sodium:   5, potassium: 125, phosphorus:  99 },
  { id: "natto",            name: "納豆",               category: "dairy_egg_soy", image: "/images/foods/natto.png",  water: 60, sodium:   2, potassium: 660, phosphorus: 190 },
  { id: "edamame",          name: "枝豆",               category: "dairy_egg_soy", image: "/images/foods/edamame.png",water: 72, sodium:   1, potassium: 490, phosphorus: 170 },
  { id: "milk",             name: "牛乳",               category: "dairy_egg_soy", image: "/images/foods/milk.png",   water: 87, sodium:  40, potassium: 150, phosphorus:  90 },
  { id: "butter",           name: "バター",             category: "dairy_egg_soy", image: "/images/foods/butter.png", water: 16, sodium: 750, potassium:  28, phosphorus:  17 },
  { id: "cheese",           name: "チーズ（プロセス）", category: "dairy_egg_soy", image: "/images/foods/cheese.png", water: 45, sodium: 800, potassium:  90, phosphorus: 630 },
  { id: "yogurt",           name: "ヨーグルト",         category: "dairy_egg_soy", image: "/images/foods/yogurt.png", water: 87, sodium:  40, potassium: 170, phosphorus: 100 },

  // ── vegetable 野菜・果物 ───────────────────────────────────
  { id: "cabbage",          name: "キャベツ",     category: "vegetable", image: "/images/foods/cabbage.png",       water: 93, sodium:  5, potassium: 200, phosphorus:  27 },
  { id: "napa_cabbage",     name: "白菜",         category: "vegetable", image: "/images/foods/napa_cabbage.png",  water: 95, sodium:  6, potassium: 220, phosphorus:  33 },
  { id: "spinach",          name: "ほうれん草",   category: "vegetable", image: "/images/foods/spinach.png",       water: 92, sodium: 16, potassium: 690, phosphorus:  47 },
  { id: "broccoli",         name: "ブロッコリー", category: "vegetable", image: "/images/foods/broccoli.png",      water: 89, sodium: 14, potassium: 360, phosphorus:  89 },
  { id: "tomato",           name: "トマト",       category: "vegetable", image: "/images/foods/tomato.png",        water: 94, sodium:  7, potassium: 210, phosphorus:  26 },
  { id: "cucumber",         name: "きゅうり",     category: "vegetable", image: "/images/foods/cucumber.png",      water: 95, sodium:  1, potassium: 200, phosphorus:  36 },
  { id: "lettuce",          name: "レタス",       category: "vegetable", image: "/images/foods/lettuce.png",       water: 96, sodium:  4, potassium: 200, phosphorus:  22 },
  { id: "eggplant",         name: "なす",         category: "vegetable", image: "/images/foods/eggplant.png",      water: 93, sodium:  0, potassium: 220, phosphorus:  30 },
  { id: "green_pepper",     name: "ピーマン",     category: "vegetable", image: "/images/foods/green_pepper.png",  water: 93, sodium:  1, potassium: 190, phosphorus:  22 },
  { id: "red_pepper",       name: "赤パプリカ",   category: "vegetable", image: "/images/foods/red_pepper.png",    water: 91, sodium:  1, potassium: 210, phosphorus:  22 },
  { id: "yellow_pepper",    name: "黄パプリカ",   category: "vegetable", image: "/images/foods/yellow_pepper.png", water: 92, sodium:  1, potassium: 200, phosphorus:  22 },
  { id: "daikon",           name: "大根",         category: "vegetable", image: "/images/foods/daikon.png",        water: 95, sodium: 16, potassium: 230, phosphorus:  18 },
  { id: "onion",            name: "玉ねぎ",       category: "vegetable", image: "/images/foods/onion.png",         water: 90, sodium:  2, potassium: 150, phosphorus:  31 },
  { id: "sliced_onion",     name: "玉ねぎスライス",category: "vegetable", image: "/images/foods/sliced_onion.png",  water: 90, sodium:  2, potassium: 150, phosphorus:  31 },
  { id: "carrot",           name: "にんじん",     category: "vegetable", image: "/images/foods/carrot.png",        water: 89, sodium: 30, potassium: 270, phosphorus:  26 },
  { id: "kabocha",          name: "かぼちゃ",     category: "vegetable", image: "/images/foods/kabocha.png",       water: 87, sodium:  1, potassium: 450, phosphorus:  43 },
  { id: "potato",           name: "じゃがいも",   category: "vegetable", image: "/images/foods/potato.png",        water: 81, sodium:  1, potassium: 410, phosphorus:  47 },
  { id: "sweet_potato",     name: "さつまいも",   category: "vegetable", image: "/images/foods/sweet_potato.png",  water: 66, sodium:  1, potassium: 480, phosphorus:  47 },
  { id: "bean_sprouts",     name: "もやし",       category: "vegetable", image: "/images/foods/bean_sprouts.png",  water: 95, sodium:  2, potassium:  69, phosphorus:  51 },
  { id: "corn",             name: "とうもろこし", category: "vegetable", image: "/images/foods/corn.png",          water: 77, sodium:  1, potassium: 290, phosphorus: 100 },
  { id: "asparagus",        name: "アスパラガス", category: "vegetable", image: "/images/foods/asparagus.png",     water: 92, sodium:  2, potassium: 270, phosphorus:  60 },

  // ── seasoning 調味料 ───────────────────────────────────────
  { id: "garlic",           name: "にんにく",     category: "seasoning",    image: "/images/foods/garlic.png",           water: 60, sodium:    5, potassium: 530, phosphorus: 170 },
  { id: "ginger",           name: "しょうが",     category: "seasoning",    image: "/images/foods/ginger.png",           water: 91, sodium:    4, potassium: 270, phosphorus:  25 },
  { id: "soy_sauce",        name: "醤油",         category: "seasoning",    image: "/images/foods/soy_sauce.png",        water: 67, sodium: 7000, potassium: 390, phosphorus: 170 },
  { id: "miso",             name: "みそ",         category: "seasoning",    image: "/images/foods/miso.png",             water: 43, sodium: 4200, potassium: 380, phosphorus: 170 },
  { id: "salt",             name: "塩",           category: "seasoning",    image: "/images/foods/salt.png",             water:  0, sodium:39000, potassium: 100, phosphorus:   0 },
  { id: "mayonnaise",       name: "マヨネーズ",   category: "seasoning",    image: "/images/foods/mayonnaise.png",       water: 15, sodium:  860, potassium:  15, phosphorus:  30 },
  { id: "ketchup",          name: "ケチャップ",   category: "seasoning",    image: "/images/foods/ketchup.png",          water: 66, sodium: 1200, potassium: 420, phosphorus:  40 },
  { id: "salad_dressing",   name: "ドレッシング", category: "seasoning",    image: "/images/foods/salad_dressing.png",   water: 50, sodium:  900, potassium:  60, phosphorus:  30 },
  { id: "vinegar",          name: "酢（米酢）",   category: "seasoning",    image: "/images/foods/vinegar.png",          water: 93, sodium:    6, potassium:   4, phosphorus:   6 },

  // ── prepared_food 調理済み・惣菜 ──────────────────────────
  { id: "karaage",          name: "から揚げ",       category: "prepared_food", image: "/images/foods/karaage.png",         water: 54, sodium: 550, potassium: 310, phosphorus: 250,
    portions: [{ label: "1個(40g)", amountG: 40 }, { label: "3個", amountG: 120 }, { label: "5個", amountG: 200 }] },
  { id: "tonkatsu",         name: "とんかつ",       category: "prepared_food", image: "/images/foods/tonkatsu.png",        water: 45, sodium: 520, potassium: 340, phosphorus: 230 },
  { id: "grilled_chicken",  name: "グリルチキン",   category: "prepared_food", image: "/images/foods/grilled_chicken.png", water: 60, sodium: 550, potassium: 280, phosphorus: 190 },
  { id: "hamburger_steak",  name: "ハンバーグ",     category: "prepared_food", image: "/images/foods/hamburger_steak.png", water: 55, sodium: 500, potassium: 280, phosphorus: 160 },
  { id: "fried_egg",        name: "目玉焼き",       category: "prepared_food", image: "/images/foods/fried_egg.png",       water: 70, sodium: 180, potassium: 120, phosphorus: 170 },
  { id: "french_fries",     name: "フライドポテト", category: "prepared_food", image: "/images/foods/french_fries.png",    water: 40, sodium: 400, potassium: 330, phosphorus:  65 },
  { id: "fried_rice",       name: "チャーハン",     category: "prepared_food", image: "/images/foods/fried_rice.png",      water: 55, sodium: 350, potassium:  70, phosphorus:  60 },
  { id: "curry_rice",       name: "カレーライス",   category: "prepared_food", image: "/images/foods/curry_rice.png",      water: 65, sodium: 210, potassium: 180, phosphorus:  90 },
  { id: "omurice",          name: "オムライス",     category: "prepared_food", image: "/images/foods/omurice.png",         water: 62, sodium: 450, potassium: 130, phosphorus: 120 },
  { id: "ramen",            name: "ラーメン",       category: "prepared_food", image: "/images/foods/ramen.png",           water: 88, sodium: 490, potassium: 100, phosphorus:  80,
    portions: [{ label: "麺のみ（汁残す）", amountG: 200 }, { label: "汁も半分", amountG: 325 }, { label: "1人前", amountG: 450 }] },
  { id: "sushi",            name: "寿司",           category: "prepared_food", image: "/images/foods/sushi.png",           water: 65, sodium: 320, potassium: 170, phosphorus: 150 },
  { id: "sandwich",         name: "サンドイッチ",   category: "prepared_food", image: "/images/foods/sandwich.png",        water: 45, sodium: 600, potassium: 150, phosphorus: 120 },
  { id: "bento",            name: "お弁当",         category: "prepared_food", image: "/images/foods/bento.png",           water: 55, sodium: 820, potassium: 200, phosphorus: 140 },
  { id: "pizza",            name: "ピザ",           category: "prepared_food", image: "/images/foods/pizza.png",           water: 45, sodium: 680, potassium: 170, phosphorus: 180 },
  { id: "gyoza",            name: "餃子",           category: "prepared_food", image: "/images/foods/gyoza.png",           water: 65, sodium: 500, potassium: 200, phosphorus: 100,
    portions: [{ label: "3個(60g)", amountG: 60 }, { label: "5個(100g)", amountG: 100 }, { label: "1人前(6個)", amountG: 120 }] },
  { id: "grilled_fish",     name: "焼き魚",         category: "prepared_food", image: "/images/foods/grilled_fish.png",    water: 65, sodium: 200, potassium: 300, phosphorus: 220 },
  { id: "fried_shrimp",     name: "エビフライ",     category: "prepared_food", image: "/images/foods/fried_shrimp.png",    water: 55, sodium: 500, potassium: 200, phosphorus: 200 },
  { id: "croquette",        name: "コロッケ",       category: "prepared_food", image: "/images/foods/croquette.png",       water: 45, sodium: 400, potassium: 280, phosphorus:  70 },
  { id: "tempura",          name: "天ぷら",         category: "prepared_food", image: "/images/foods/tempura.png",         water: 50, sodium: 300, potassium: 200, phosphorus:  90 },
  { id: "shumai",           name: "しゅうまい",     category: "prepared_food", image: "/images/foods/shumai.png",          water: 60, sodium: 450, potassium: 220, phosphorus: 100 },
  { id: "spring_roll",      name: "春巻き",         category: "prepared_food", image: "/images/foods/spring_roll.png",     water: 45, sodium: 400, potassium: 180, phosphorus:  80 },
  { id: "tamagoyaki",       name: "卵焼き",         category: "prepared_food", image: "/images/foods/tamagoyaki.png",      water: 72, sodium: 350, potassium: 120, phosphorus: 150 },
  { id: "yakisoba",         name: "焼きそば",       category: "prepared_food", image: "/images/foods/yakisoba.png",        water: 60, sodium: 600, potassium: 150, phosphorus:  70 },
  { id: "potato_salad",     name: "ポテトサラダ",   category: "prepared_food", image: "/images/foods/potato_salad.png",    water: 70, sodium: 450, potassium: 250, phosphorus:  50 },
  { id: "macaroni_salad",   name: "マカロニサラダ", category: "prepared_food", image: "/images/foods/macaroni_salad.png",  water: 65, sodium: 400, potassium: 100, phosphorus:  60 },
  { id: "salad",            name: "サラダ",         category: "prepared_food", image: "/images/foods/salad.png",           water: 93, sodium:  10, potassium: 250, phosphorus:  30 },
  { id: "oden",             name: "おでん",         category: "prepared_food", image: "/images/foods/oden.png",            water: 90, sodium: 350, potassium: 130, phosphorus:  60 },
  { id: "tonjiru",         name: "とん汁",         category: "soup",  image: "/images/foods/tonjiru.png",         water: 90, sodium: 550, potassium: 180, phosphorus:  90,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }, { label: "少しだけ", amountG: 30 }] },
  { id: "corn_soup",       name: "コーンスープ",   category: "soup",  image: "/images/foods/corn_soup.png",       water: 85, sodium: 500, potassium: 150, phosphorus:  60,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "barley_tea",      name: "麦茶",           category: "drink", image: "/images/foods/barley_tea.png",      water: 100, sodium:   0, potassium:  13, phosphorus:  2,
    portions: [{ label: "湯呑み(150ml)", amountG: 150 }, { label: "コップ1杯(200ml)", amountG: 200 }, { label: "ペット小(350ml)", amountG: 350 }] },
  { id: "oolong_tea",      name: "ウーロン茶",     category: "drink", image: "/images/foods/oolong_tea.png",      water: 100, sodium:   1, potassium:  13, phosphorus:  2,
    portions: [{ label: "湯呑み(150ml)", amountG: 150 }, { label: "コップ1杯(200ml)", amountG: 200 }, { label: "ペット小(350ml)", amountG: 350 }] },
  { id: "sake",            name: "日本酒",         category: "drink", image: "/images/foods/sake.png",            water:  82, sodium:   2, potassium:   5, phosphorus: 10,
    portions: [{ label: "半合(90ml)", amountG: 90 }, { label: "1合(180ml)", amountG: 180 }] },
  { id: "cafe_au_lait",    name: "カフェオレ",     category: "drink", image: "/images/foods/cafe_au_lait.png",    water:  88, sodium:  35, potassium: 120, phosphorus: 70,
    portions: [{ label: "カップ1杯(180ml)", amountG: 180 }, { label: "半分(90ml)", amountG: 90 }] },
  { id: "tomato_juice",    name: "トマトジュース", category: "drink", image: "/images/foods/tomato_juice.png",    water:  94, sodium: 240, potassium: 260, phosphorus: 20,
    portions: [{ label: "小缶(160ml)", amountG: 160 }, { label: "コップ1杯(200ml)", amountG: 200 }] },
  { id: "vegetable_juice", name: "野菜ジュース",   category: "drink", image: "/images/foods/vegetable_juice.png", water:  93, sodium: 200, potassium: 250, phosphorus: 20,
    portions: [{ label: "小缶(160ml)", amountG: 160 }, { label: "コップ1杯(200ml)", amountG: 200 }] },
  { id: "calpis",          name: "カルピス",       category: "drink", image: "/images/foods/calpis.png",          water:  96, sodium:  10, potassium:  30, phosphorus: 25,
    portions: [{ label: "コップ1杯(200ml)", amountG: 200 }, { label: "多め(350ml)", amountG: 350 }] },
  { id: "cocoa",           name: "ココア",         category: "drink", image: "/images/foods/cocoa.png",           water:  92, sodium:  30, potassium: 160, phosphorus: 100,
    portions: [{ label: "カップ1杯(150ml)", amountG: 150 }, { label: "多め(200ml)", amountG: 200 }] },
  { id: "pasta",           name: "パスタ",         category: "grain", image: "/images/foods/pasta.png",           water:  65, sodium:   1, potassium:  55, phosphorus: 90,
    portions: [{ label: "少なめ(150g)", amountG: 150 }, { label: "普通(200g)", amountG: 200 }] },
  { id: "simmered_fish",    name: "煮魚",           category: "prepared_food", image: "/images/foods/simmered_fish.png",   water:  65, sodium: 700, potassium: 280, phosphorus: 210 },
  { id: "clear_soup",         name: "すまし汁",         category: "soup", image: "/images/foods/clear_soup.png",          water:  99, sodium: 300, potassium:  40, phosphorus:  10,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "clear_soup_tofu",    name: "すまし汁（豆腐入り）", category: "soup", image: "/images/foods/clear_soup_tofu.png",   water:  97, sodium: 300, potassium:  80, phosphorus:  50,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "osuimono",           name: "お吸い物",         category: "soup", image: "/images/foods/osuimono.png",            water:  99, sodium: 400, potassium:  30, phosphorus:  10,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "consomme_soup",      name: "コンソメスープ",   category: "soup", image: "/images/foods/consomme_soup.png",       water:  98, sodium: 400, potassium:  80, phosphorus:  20,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "chicken_broth_soup", name: "鶏がらスープ",     category: "soup", image: "/images/foods/chicken_broth_soup.png",  water:  98, sodium: 400, potassium:  80, phosphorus:  30,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "egg_drop_soup",      name: "かき玉汁",         category: "soup", image: "/images/foods/egg_drop_soup.png",       water:  97, sodium: 600, potassium:  60, phosphorus:  30,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "egg_soup",           name: "たまごスープ",     category: "soup", image: "/images/foods/egg_soup.png",            water:  97, sodium: 500, potassium:  50, phosphorus:  30,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "harusame_soup",      name: "春雨スープ",       category: "soup", image: "/images/foods/harusame_soup.png",       water:  96, sodium: 600, potassium:  60, phosphorus:  20,
    portions: [{ label: "全部飲んだ", amountG: 150 }, { label: "半分", amountG: 75 }] },
  { id: "kenchin_soup",       name: "けんちん汁",       category: "soup", image: "/images/foods/kenchin_soup.png",        water:  94, sodium: 500, potassium: 180, phosphorus:  50,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "minestrone",         name: "ミネストローネ",   category: "soup", image: "/images/foods/minestrone.png",          water:  92, sodium: 450, potassium: 200, phosphorus:  40,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "clam_chowder",       name: "クラムチャウダー", category: "soup", image: "/images/foods/clam_chowder.png",        water:  88, sodium: 500, potassium: 120, phosphorus:  70,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "potage",             name: "ポタージュ",       category: "soup", image: "/images/foods/potage.png",              water:  88, sodium: 400, potassium: 150, phosphorus:  60,
    portions: [{ label: "全部飲んだ", amountG: 180 }, { label: "半分", amountG: 90 }] },
  { id: "cooking_oil",      name: "食用油",         category: "seasoning",     image: "/images/foods/cooking_oil.png",     water:   0, sodium:   0, potassium:   0, phosphorus:   0 },
];

export function getFoodRisk(food: Food) {
  return {
    sodium:    food.sodium    > 300,
    potassium: food.potassium > 300,
  };
}
