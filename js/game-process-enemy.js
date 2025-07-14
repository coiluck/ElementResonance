// game-process-enemy.js
let enemyHpNow = 0;
// このターン開始時の敵HP
export function setEnemyHpNow(hp) {
  enemyHpNow = hp;
}

import { globalGameState } from './game-status.js';
import { log } from './game-prosses-cards.js';

// 待機時間
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const WAIT_TIME_MS = 1000; 

// ターン全体の処理
class EnemyTurnContext {
  constructor(globalGameState) {
    // ゲーム全体の永続的な状態
    this.globalState = globalGameState;

    // 次のカードに適用される一時的な効果
    this.nextCardModifiers = [];
    
    // ターン中に永続的に適用される効果
    this.turnModifiers = [];
  }
}

export async function processEnemyTurn() {
  log('=== 敵のターン ===');

  let specialActionOccurred = false;

  // トリガーをチェック
  while (globalGameState.enemy.triggers && globalGameState.enemy.triggers.length > 0) {
    const nextTrigger = globalGameState.enemy.triggers[0];
    
    // トリガーが発動するHPの閾値
    const hpThresholdValue = globalGameState.enemy.maxHp * (nextTrigger.hp / 100);

    // ターン開始時のHPが閾値以上 ^ 現在のHPが閾値を下回った -> 特殊行動
    if (enemyHpNow >= hpThresholdValue && globalGameState.enemy.hp < hpThresholdValue) {
      // 特殊行動発動
      specialActionOccurred = true;
      log(`特殊行動発動！`);
      await wait(WAIT_TIME_MS);
      // カード使用
      await useCard([nextTrigger.card]);
      // 発動したトリガーを配列から削除
      globalGameState.enemy.triggers.shift();
    } else {
      break;
    }
  }

  // 通常行動
  if (!specialActionOccurred) {
    console.log('通常行動');
    // 使用カードを取得
    const cardElements = document.querySelectorAll('.game-enemy-slot');
    const cardIds = Array.from(cardElements).map(el => el.dataset.cardId);
    // カード使用
    await useCard(cardIds);
  }
  
  log('=== ターン終了！ ===');
}

async function useCard(cardsIdText) {
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
    "shield": new ShieldEffect(),             // バリア
    "addMark": new AddMarkEffect(),           // 刻印付与（ラスボスのみ）
    "addNextDamage": new AddNextDamageEffect(), // 吸血少女
    "addTurnDamage": new AddTurnDamageEffect(), // 執行人 ゼガ
    "LC-3": new LuminaCombo3Effect(),         // 血染の闘華 リリス
    "LM-3": new LuminaMark3Effect(),          // 聖焔の再誕
    "Six": new SixEffect(),                   // 反撃の狼煙（6）
    "N-collapse": new NCollapseEffect(),       // 万象崩落・極（9）
    "N-echo": new NEchoEffect(),               // 幽魂の残響（9）
    "N-order": new NOrderEffect(),             // 秩序への断罪（9）
    "N-sync": new NSyncEffect(),               // 共鳴との同調（9）
  };
  // ターン進行処理の初期化
  const context = new EnemyTurnContext(globalGameState);
  // id -> jsonデータ
  const cards = cardsIdText.map(id => Number(id));
  const selectedCards = cards.map(id => allCards.find(card => card.id === id))

  // カードを1枚ずつ処理
  for (const card of selectedCards) {
    log(`--${card.name}の効果が発動！--`);

    // damageを持つカードの処理
    if (card.damage) {
      for (const damageInfo of card.damage) {
        // "when": "now" のものだけを処理
        if (damageInfo.when === 'now') {
          // ダメージ計算を呼ぶ
          await effectRegistry.damage.execute(card, damageInfo, context);
        }
      }
      // 待機
      await wait(WAIT_TIME_MS);
    }

    // 特殊効果（effect!==null）の処理
    if (card.effect) {
      for (const effectInfo of card.effect) {
        // jsonで定義したtypeに基づいて、対応するクラスのインスタンスを取得
        const handler = effectRegistry[effectInfo.type];
        if (handler) {
          await handler.execute(card, effectInfo, context);
          await wait(WAIT_TIME_MS);
        }
      }
    }
  }
  // 更新されたゲーム状態を返す <- いる？
  return globalGameState;
}

import { updateBuff } from './game-buff-update.js';
import { playSoundEffect } from './music.js';

// 個別の処理用クラス
class DamageEffect {
  async execute(card, effectInfo, context) {
    const times = effectInfo.times || 1;

    // 攻撃回数繰り返す
    for (let i = 0; i < times; i++) {

      // カード自身の基本ダメージを処理
      await dealDamage(effectInfo.value, 1, context, card.name, false);

      // ターン中の追加ダメージ
      context.turnModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));

      // 次のカードへの追加ダメージ
      context.nextCardModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));

      // 待機
      if (i < times - 1) {
        await wait(WAIT_TIME_MS);
      }
    }

    // 「次のカードへの効果」は全て消費されたのでリセット
    context.nextCardModifiers = [];
  }
}

// このターンの効果
class AddTurnDamageEffect {
  execute(card, effectInfo, context) {
    const modifier = {
      modifierType: 'addedDamage', 
      type: 'damage',
      value: effectInfo.value,
      source: card.name
    };
    context.turnModifiers.push(modifier);
    log(`このターンの全ての攻撃時に ${effectInfo.value} の追加ダメージ`);
  }
}
class AddNextDamageEffect {
  execute(card, effectInfo, context) {
    const modifier = {
      modifierType: 'addedDamage',
      type: 'damage',
      value: effectInfo.value,
      source: card.name
    };
    context.nextCardModifiers.push(modifier);
    log(`次の攻撃時に ${effectInfo.value} の追加ダメージ`);
  }
}

// バリア
class ShieldEffect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    updateBuff('enemy', 'shield', effectInfo.value || 3);
    log(`敵に${effectInfo.value}バリア`);
  }
}

// 刻印付与
class AddMarkEffect {
  execute(card, effectInfo, context) {
    // ここで行うことなのか？？
    const markArray = ['daybreak-mark', 'sand-mark', 'hollow-mark', 'fog-mark', 'lumina-mark'];
    for (let i = 0; i < effectInfo.value; i++) {
      const randomMark = markArray[Math.floor(Math.random() * markArray.length)];
      updateBuff('enemy', randomMark, 1);
    }
  }
}

class LuminaCombo3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    const modifier = {
      modifierType: 'buff',
      type: 'damage',
      value: effectInfo.value,
      source: card.name
    };
    context.turnModifiers.push(modifier);
    log(`このターン、与えるダメージが${effectInfo.value}増加`);
  }
}
class LuminaMark3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    updateBuff('enemy', 'burn-turn', 3);
    log(`プレイヤーに火傷効果`);
  }
}

class SixEffect {
  async execute(card, effectInfo, context) {
    // バリアの半分を消費して、消費の3倍ダメージ
    const halfShield = Math.floor(globalGameState.enemy.buff.shield / 2);
    const damage = halfShield * 3;
    // バリアを消費
    globalGameState.enemy.buff.shield -= halfShield;
    await dealDamage(damage, 1, context, card.name, false);
  }
}

class NCollapseEffect {
  async execute(card, effectInfo, context) {
    // すべての刻印を消費
    const playerMark = globalGameState.player.buff['daybreak-mark'] + globalGameState.player.buff['sand-mark'];
    const enemyMark = globalGameState.enemy.buff['hollow-mark'] + globalGameState.enemy.buff['fog-mark'] + globalGameState.enemy.buff['lumina-mark'];
    const damage = (playerMark + enemyMark) * 2;
    updateBuff('enemy', 'hollow-mark', -3);
    updateBuff('enemy', 'fog-mark', -3);
    updateBuff('enemy', 'lumina-mark', -3);
    updateBuff('enemy', 'daybreak-mark', -3);
    updateBuff('enemy', 'sand-mark', -3);
    // ダメージ計算
    await dealDamage(2, damage, context, card.name, false);
  }
}
class NEchoEffect {
  async execute(card, effectInfo, context) {
    // 刻印を消費しない
    const playerMark = globalGameState.player.buff['daybreak-mark'] + globalGameState.player.buff['sand-mark'];
    const enemyMark = globalGameState.enemy.buff['hollow-mark'] + globalGameState.enemy.buff['fog-mark'] + globalGameState.enemy.buff['lumina-mark'];
    const damage = (playerMark + enemyMark) * 2;
    // ダメージ計算
    await dealDamage(damage, 1, context, card.name, false);
  }
}
class NOrderEffect {
  async execute(card, effectInfo, context) {
    const playerDeck = window.deck;
    let normalCount = 0;
    let comboCount = 0;
    let markCount = 0;
    // デッキのカードを判定
    for (const card of playerDeck) {
      if (card % 9 === 1 || card % 9 === 2 || card % 9 === 3) {
        normalCount++;
      } else if (card % 9 === 4 || card % 9 === 5 || card % 9 === 6) {
        comboCount++;
      } else if (card % 9 === 7 || card % 9 === 8 || card % 9 === 9 || card % 9 === 0) {
        markCount++;
      }
    }
    // ダメージ計算
    const damage = 20 - Math.min(normalCount, comboCount, markCount) * 4;
    await dealDamage(damage, 1, context, card.name, false);
  }
}
class NSyncEffect {
  execute(card, effectInfo, context) {
    // ダメージを1軽減（計算処理はgame-process-cards.jsのdealDamage関数で行う）
    playSoundEffect("buff");
    updateBuff('enemy', 'damage-reduction', 1);
    log(`これ以降、ダメージを1軽減`);
  }
}

// ダメージを与える関数
async function dealDamage(baseDamage, times, context, sourceName = 'error name', canIgnoreBarrier) {
  let totalBuffValue = 0;
  const buffLogParts = [];
  // ターン中の永続バフ（リリスなど）
  context.turnModifiers
    .filter(m => m.modifierType === 'buff' && m.type === 'damage')
    .forEach(buff => {
      totalBuffValue += buff.value;
      buffLogParts.push(`${buff.source}+${buff.value}`);
    });
  // 次のカードへのバフ
  context.nextCardModifiers
    .filter(m => m.modifierType === 'buff' && m.type === 'damage')
    .forEach(buff => {
      totalBuffValue += buff.value;
      buffLogParts.push(`${buff.source}+${buff.value}`);
    });
  
  const buffDetailLog = buffLogParts.length > 0 ? ` (バフ内訳: ${buffLogParts.join(', ')})` : '';

  // ダメージ処理ループ
  for (let i = 0; i < times; i++) {
    const finalDamage = baseDamage + totalBuffValue;
  
    if (finalDamage <= 0) {
      console.log(`[${sourceName}]の攻撃はダメージが0以下のためスキップされました。`);
      continue;
    }

    // バリア貫通とダメージ処理
    if (canIgnoreBarrier === true) {
      // 直接HPを減らす
      globalGameState.player.hp -= finalDamage;
      logMessage += ' [直接ダメージ]';
    } else {
      // バリアを考慮
      if (globalGameState.player.buff.shield > 0) {
        const damageToShield = Math.min(globalGameState.player.buff.shield, finalDamage);
        const damageToHp = finalDamage - damageToShield;

        globalGameState.player.buff.shield -= damageToShield;
          
        if (damageToHp > 0) {
          // バリアが割れる場合
          globalGameState.player.hp -= damageToHp;
        }
      } else {
        // バリアがない場合は直接HPを減らす
        globalGameState.player.hp -= finalDamage;
      }
    }
    // 音
    playSoundEffect("attack");
    // 表示更新
    document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${globalGameState.player.hp} / ${globalGameState.player.maxHp})`;
    document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${globalGameState.player.hp}/${globalGameState.player.maxHp}`;
    // ログ出力
    log(`${finalDamage}ダメージ (基本値:${baseDamage} + バフ:${totalBuffValue}${buffDetailLog})`);
    // 待機
    if (i < times - 1) {
      await wait(WAIT_TIME_MS);
    }
  }
}