// game-prosses-cards.js
// 選択したカードidを複数与えられるのでそれを処理する

// ゲーム全体の永続的な状態
import { globalGameState } from './game-status.js';

// ターン全体の処理
class TurnContext {
  constructor(globalGameState) {
    // ゲーム全体の永続的な状態
    this.globalState = globalGameState;

    // このターンに選択されたカード（順番も保持）
    this.playedCardsInTurn = [];

    // このターンに発生する最終的な結果
    this.results = {
      damage: 0,
      heal: 0,
      shield: 0,
    };

    // 次のカードに適用される一時的な効果
    this.nextCardModifiers = [];
    
    // ターン中に永続的に適用される効果
    this.turnModifiers = [];

    // ターン終了時に実行される効果
    this.endOfTurnEffects = [];
  }
}

export async function processCards(cards) {
  // カードデータを取得
  let allCards;
  try {
    const response = await fetch('cards.json');
    allCards = await response.json();
  } catch (error) {
    console.error('カードデータの取得に失敗しました:', error);
    return;
  }

  // 効果をまとめる
  const effectRegistry = {
    "damage": new DamageEffect(),             // 基本ダメージ
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
  // ターン進行処理の初期化
  const context = new TurnContext(globalGameState);
  // id -> jsonデータ
  const selectedCards = allCards.filter(card => cards.includes(card.id));

  // カードを1枚ずつ処理
  for (const card of selectedCards) {
    // このターンに使用したカードとして記録
    context.playedCardsInTurn.push(card);

    // 即時ダメージ（damage!==null）の処理
    if (card.damage) {
      for (const damageInfo of card.damage) {
        // "when": "now" のものだけを処理
        if (damageInfo.when === 'now') {
          // ダメージ計算（修飾子を適用）
          let currentDamage = damageInfo.value * (damageInfo.times || 1);
          
          // ここで修飾子を適用するロジックを呼ぶ（例）
          // currentDamage = applyModifiers(currentDamage, context);

          context.results.damage += currentDamage;
          console.log(`[Effect] 「${card.name}」の効果により、${currentDamage}の追加ダメージが発生しました。`);
        }
        // "when": "last" のものはターン終了時効果として登録
        else if (damageInfo.when === 'last') {
          context.endOfTurnEffects.push((ctx) => {
            const damageValue = damageInfo.value * (damageInfo.times || 1);
            ctx.results.damage += damageValue;
            console.log(`[ターン終了時効果] ${card.name}により${damageValue}ダメージ`);
          });
        }
      }
    }

    // 特殊効果（effect!==null）の処理
    if (card.effect) {
      for (const effectInfo of card.effect) {
        const handler = effectRegistry[effectInfo.type];
        if (handler) {
          // ハンドラにカード情報と現在のコンテキストを渡して実行
          // ハンドラ内部でcontext.resultsやmodifiersを操作する
          handler.execute(card, effectInfo, context);
        }
      }
    }
    
    // 「次のカードに適用」の効果はここで消費する
    context.nextCardModifiers = [];
  }

  // --- 3. ターン終了時効果の処理 ---
  for (const endEffect of context.endOfTurnEffects) {
    // ターン終了時効果を実行
    endEffect(context);
  }

  // --- 4. 最終結果の適用 ---
  const logEntry = {
    turn: globalGameState.turn,
    playedCards: selectedCards.map(c => c.name),
    damageDealt: context.results.damage,
    healed: context.results.heal,
    shieldGained: context.results.shield,
    playerHpBefore: globalGameState.player.hp,
    enemyHpBefore: globalGameState.enemy.hp,
  };

  // 敵にダメージを適用
  globalGameState.enemy.hp -= context.results.damage;

  // プレイヤーのHPを回復（最大HPを超えない）
  globalGameState.player.hp = Math.min(
    globalGameState.player.maxHp,
    globalGameState.player.hp + context.results.heal
  );

  // シールドを加算（これは単純加算か、上書きか、ゲームの仕様による）
  // 例: globalGameState.player.shield += context.results.shield;
  globalGameState.player.shield += context.results.shield;

  // --- 5. 状態の更新 ---
  logEntry.playerHpAfter = globalGameState.player.hp;
  logEntry.enemyHpAfter = globalGameState.enemy.hp;
  globalGameState.log.push(logEntry);
  globalGameState.turn += 1;

  console.log('--- Turn End ---');
  console.log('Final Results:', context.results);
  console.log('New Game State:', globalGameState);

  // 更新されたゲーム状態を返す
  return globalGameState;
}


// 処理用
class DamageEffect {
  execute(card, effectInfo, context) {
    const damageValue = effectInfo.value || 0;
    context.results.damage += damageValue;
    console.log(`[Effect] 「${card.name}」の効果により、${damageValue}の追加ダメージが発生しました。`);
  }
}

class DamageCombo2Effect {
  execute(card, effectInfo, context) {
    const targetElement = card.element;

    const playedCards = context.playedCardsInTurn;

    const comboCount = playedCards.filter(
      playedCard => playedCard.element === targetElement
    ).length;

    const damagePerCard = effectInfo.value || 0;

    const totalComboDamage = comboCount * damagePerCard;
    
    context.results.damage += totalComboDamage;

    console.log(`[Effect] 「${card.name}」のコンボ効果が発動！`);
    console.log(`         -> ${targetElement}属性${comboCount}枚 × ${damagePerCard}ダメージ = ${totalComboDamage}の追加ダメージ！`);
  }
}