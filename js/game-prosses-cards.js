// 数値をwindow.maxHoldCardsの個数与えられるのでそれを処理する
// アニメーションは知らん。あとでいいかんじにする
// カードタイプごとに処理を分けて、メイン処理の中で呼び出す
export function processCards(cards) {
  // 効果をまとめる
  const effectRegistry = {
    "damage": new DamageEffect(),
    "heal": new HealEffect(),                 // 暁の通常
    "shield": new ShieldEffect(),             // 砂の通常
    "reduceCoolTime": new ReduceCoolTimeEffect(), // コンボタイプのレアリティ1
    "damageCombo2": new DamageCombo2Effect(), // コンボタイプのレアリティ2
    "addMark": new AddMarkEffect(),           // 刻印タイプ
    "HC-3": new HollowCombo3Effect(),         // 破壊霊 メア
    "HM-3": new HollowMark3Effect(),          // Dancing Night
    "FC-3": new FogCombo3Effect(),            // 蒼穹竜姫 クア
    "FM-3": new FogMark3Effect(),             // 氷牙狼王 ガルム
    "LC-3": new LuminaCombo3Effect(),         // 血染の闘華 リリス
    "LM-3": new LuminaMark3Effect(),          // 聖焔の再誕
    "DC-3": new DaybreakCombo3Effect(),       // 祈りの少女 ココネ
    "DM-3": new DaybreakMark3Effect(),        // 蒼翼機竜 アーク
    "SC-3": new SandCombo3Effect(),           // 轟閃の影 ゼラ
    "SM-3": new SandMark3Effect(),            // 蟲王
  };
  cards.forEach(card => {
    switch (card.type) {
      case 'normal':
        processNormalCard(card);
        break;
      case 'combo':
        processComboCard(card);
        break;
    }
  });
}