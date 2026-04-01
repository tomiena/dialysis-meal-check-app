import type { JudgeResult } from "./judge";

export function generateAdvice(result: JudgeResult): string {
  const { overall, sodium, potassium, phosphorus } = result;

  if (overall === "ok") {
    return "今日の食事はバランスが良いですね。このまま無理せず続けていきましょう。";
  }

  const ngIssues: string[] = [];
  const cautionIssues: string[] = [];
  if (sodium?.status === "ng")       ngIssues.push("塩分");
  else if (sodium?.status === "caution") cautionIssues.push("塩分");
  if (potassium?.status === "ng")    ngIssues.push("カリウム");
  else if (potassium?.status === "caution") cautionIssues.push("カリウム");
  if (phosphorus?.status === "ng")   ngIssues.push("リン");
  else if (phosphorus?.status === "caution") cautionIssues.push("リン");

  const allIssues = [...ngIssues, ...cautionIssues];

  if (overall === "ng") {
    if (allIssues.length >= 2) {
      return "焦らず、次の食事では一つだけ気をつけることから始めてみましょう。あなたの努力は必ず体に届いています。";
    }
    if (ngIssues.includes("塩分")) {
      return "塩分がかなり多い食事です。汁物を残したり、調味料を控えめにすることで体への負担を減らせます。次の食事で意識してみてください。";
    }
    if (ngIssues.includes("カリウム")) {
      return "カリウムが高めです。バナナ・いも類・生野菜は控え、野菜は必ず茹でてから食べるようにしましょう。";
    }
    if (ngIssues.includes("リン")) {
      return "リンが高めです。乳製品・加工食品・ナッツ類には特に多く含まれます。食材を選ぶときに少し意識してみてください。";
    }
  }

  // caution
  if (allIssues.length >= 2) {
    return "いくつかの栄養素が少し多めです。一度に全部直そうとせず、まず塩分から少しずつ意識してみましょう。";
  }
  if (cautionIssues.includes("塩分") || ngIssues.includes("塩分")) {
    return "塩分が少し多めです。汁物を残したり、調味料を控えめにすると体がぐっと楽になりますよ。";
  }
  if (cautionIssues.includes("カリウム") || ngIssues.includes("カリウム")) {
    return "カリウムが少し高めです。野菜は茹でこぼしをするだけでぐっと減らせます。";
  }
  if (cautionIssues.includes("リン") || ngIssues.includes("リン")) {
    return "リンが少し多めです。加工食品や乳製品を少し控えると改善しやすくなります。";
  }

  return "今日も記録できました。続けることが大切です。";
}

export function generateProfessionalAdvice(result: JudgeResult): string {
  const { overall, sodium, potassium, phosphorus } = result;

  if (overall === "ok") {
    return "今回の食事内容はナトリウム・カリウム・リンのいずれも目標範囲内に収まっています。透析患者さんにとって食事管理は治療の一部です。この調子で毎食の記録を続け、体調の変化を主治医や栄養士に共有しましょう。";
  }

  if (overall === "ng") {
    if (sodium.status === "ng" && potassium.status === "ng") {
      return `塩分（${sodium.value}mg）とカリウム（${potassium.value}mg）がともに基準を超えています。汁物を半分残す・野菜は必ず茹でこぼすだけで大きく改善できます。次の食事から一つずつ取り組んでみてください。`;
    }
    if (sodium.status === "ng") {
      return `今回の塩分は${sodium.value}mgで1食の目安700mgを超えています。塩分過多は口渇・体重増加・血圧上昇につながります。汁物を残す・醤油や味噌を控えるだけで改善できます。次の食事で意識してみましょう。`;
    }
    if (potassium.status === "ng") {
      return `カリウムが${potassium.value}mgと基準を超えています。カリウムの蓄積は不整脈のリスクを高めます。いも類・バナナ・生野菜を控え、野菜は必ず茹でてから食べることでカリウムを効果的に減らせます。`;
    }
    if (phosphorus.status === "ng") {
      return `リンが${phosphorus.value}mgと基準を超えています。リンの蓄積は骨や血管に悪影響を与えます。乳製品・加工食品・ナッツ類を控え、リン吸着薬を処方されている場合は食事と一緒に服用しましょう。`;
    }
  }

  if (sodium.status === "caution") {
    return `塩分が${sodium.value}mgとやや多めです。汁物を半分残す・漬物を控えるなど小さな工夫を積み重ねることが体の負担を減らします。透析間の体重増加が気になる場合は特に意識してみてください。`;
  }
  if (potassium.status === "caution") {
    return `カリウムが${potassium.value}mgとやや高めです。野菜の茹でこぼし（ゆで汁は捨てる）を習慣にするだけで30〜40%減らせます。生野菜サラダをおひたしに変えるだけでも効果的です。`;
  }
  if (phosphorus.status === "caution") {
    return `リンが${phosphorus.value}mgとやや高めです。チーズ・牛乳・加工食品に多く含まれます。リン吸着薬を処方されている場合は毎食しっかり服用することが重要です。次回の採血でリン値を確認しましょう。`;
  }

  return "今回の食事内容を記録しました。継続的な記録が体調管理の第一歩です。気になる点は次回の受診時に栄養士にご相談ください。";
}
