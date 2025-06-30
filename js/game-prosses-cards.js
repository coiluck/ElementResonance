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

    // 次のカードに適用される一時的な効果
    this.nextCardModifiers = [];
    
    // ターン中に永続的に適用される効果
    this.turnModifiers = [];

    // ターン終了時に実行される効果
    this.endOfTurnEffects = [];
  }
}

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ゲームログ用の関数
function log(message) {
  const logParent = document.querySelector('.game-cards');
  // .game-logs-container が存在するか確認。なければ作成して追加
  let logContainer = logParent.querySelector('.game-logs-container');
  if (!logContainer) {
    logContainer = document.createElement('div');
    logContainer.className = 'game-logs-container';
    logParent.appendChild(logContainer);
  }
  if (logContainer.style.display === 'none') {
    logContainer.style.display = 'block';
  }
  // ログ要素を作成して追加
  const logElement = document.createElement('div');
  logElement.className = 'game-log';
  logElement.textContent = message;
  logContainer.appendChild(logElement);
  // ログの最後にスクロール
  logContainer.scrollTop = logContainer.scrollHeight;
  // gameStateのlogに追加
  globalGameState.log.push(message);
  // ログの高さを調整
  adjustOverlayHeight();
}
// ログの高さを調整
function adjustOverlayHeight() {
  const parent = document.querySelector('.game-cards');
  const overlay = document.querySelector('.game-logs-container');
  if (parent && overlay) {
    overlay.style.height = `${parent.scrollHeight}px`;
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

  // 待機時間
  const WAIT_TIME_MS = 1000; 

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
  const selectedCards = cards.map(id => allCards.find(card => card.id === id))
  // このターンに使用したカードとして記録
  context.playedCardsInTurn = selectedCards;

  // カードを1枚ずつ処理
  for (const card of selectedCards) {
    // DOMに召喚&エフェクト

    // damageを持つカードの処理
    if (card.damage) {
      for (const damageInfo of card.damage) {
        // "when": "now" のものだけを処理
        if (damageInfo.when === 'now') {
          // ダメージ計算を呼ぶ
          effectRegistry.damage.execute(card, damageInfo, context);
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
      // 待機
      await wait(WAIT_TIME_MS);
    }

    // 特殊効果（effect!==null）の処理
    if (card.effect) {
      for (const effectInfo of card.effect) {
        const handler = effectRegistry[effectInfo.type];
        if (handler) {
          // effectRegistryの中のオブジェクトのexecute関数を実行
          handler.execute(card, effectInfo, context);
          // 待機
          await wait(WAIT_TIME_MS);
        }
      }
    }
    // 「次のカードに適用」の効果はここでリセット
    context.nextCardModifiers = [];
  }

  // ターン終了時効果の処理
  // **効果は待機列に入れておいて相手の行動の後に解決されるべき** <- リリスの効果とかどうする
  // そのためにはletで関数外で宣言した効果の配列を相手行動後に呼び出せばいい
  // これは後で消す
  if (context.endOfTurnEffects.length > 0) {
    await wait(WAIT_TIME_MS);
    for (const endEffect of context.endOfTurnEffects) {
      endEffect(context);
    }
  }

  // おしまい
  console.log('--- Turn End ---');

  // 更新されたゲーム状態を返す
  return globalGameState;
}

import { updateBuff } from './game-buff-update.js';

// 個別の処理用クラス
class DamageEffect {
  execute(card, effectInfo, context) {
    const damage = effectInfo.value || 0;
    const damageValue = damage + 0; // 最終的なダメージ **あとでここの処理にaddAllなどを反映**
    const times = effectInfo.times || 1;
    const timesValue = times * 1; // 最終的な発動回数 **あとでここの処理にaddAllなどを反映**
    for (let i = 0; i < timesValue; i++) {
      if (context.globalState.enemy.buff.shield > 0 && context.globalState.enemy.buff.shield > damageValue) {
        // バリアがあってダメージで割れない
        context.globalState.enemy.buff.shield -= damageValue;
      } else if (context.globalState.enemy.buff.shield > 0 && context.globalState.enemy.buff.shield <= damageValue) {
        // バリアがあってダメージで割れる
        context.globalState.enemy.buff.shield = 0;
      } else {
        // バリアがない
        context.globalState.enemy.hp -= damageValue;
      }
      // 最終HPの表示更新
      document.querySelector('.game-main-characters-enemy-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${context.globalState.enemy.hp} / ${context.globalState.enemy.maxHp})`;
      document.querySelector('.game-main-characters-enemy-status-hp').textContent = `HP: ${context.globalState.enemy.hp}/${context.globalState.enemy.maxHp}`;
      log(`${card.name}のダメージ効果が発動！`);
    }
  }
}
class HealEffect {
  execute(card, effectInfo, context) {
    const healValue = effectInfo.value || 3;
    if (context.globalState.player.hp + healValue > context.globalState.player.maxHp) {
      context.globalState.player.hp = context.globalState.player.maxHp;
      log(`${card.name}の回復効果が発動！ 最大HPに回復しました`);
    } else {
      context.globalState.player.hp += healValue;
      log(`${card.name}の回復効果が発動！`);
    }
    // 最終HPの表示更新
    document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${context.globalState.player.hp} / ${context.globalState.player.maxHp})`;
    document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${context.globalState.player.hp}/${context.globalState.player.maxHp}`;
  }
}
class ShieldEffect {
  execute(card, effectInfo, context) {
    updateBuff('player', 'shield', effectInfo.value || 3);
    log(`${card.name}のバリア効果が発動！`);
  }
}
class ReduceCoolTimeEffect {
  execute(card, effectInfo, context) {
    const coolTimeValue = effectInfo.value || 1;
    // クールタイムは後で実装
  }
}
class DamageCombo2Effect {
  execute(card, effectInfo, context) {
    // 同じ属性であるカードのid
    const attributeCount = Array.from({length: 9}, (_, i) => card.id - 4 + i);
    const ratio = context.playedCardsInTurn.filter(playedCard => attributeCount.includes(playedCard.id)).length;
    const basicDamage = effectInfo.value || 1;
    const damageValue = basicDamage * ratio;
    const times = effectInfo.times || 1;
    const timesValue = times * 1; // 最終的な発動回数 **あとでここの処理にaddAllなどを反映**
    for (let i = 0; i < timesValue; i++) {
      if (context.globalState.enemy.buff.shield > 0 && context.globalState.enemy.buff.shield > damageValue) {
        // バリアがあってダメージで割れない
        context.globalState.enemy.buff.shield -= damageValue;
      } else if (context.globalState.enemy.buff.shield > 0 && context.globalState.enemy.buff.shield <= damageValue) {
        // バリアがあってダメージで割れる
        context.globalState.enemy.buff.shield = 0;
      } else {
        // バリアがない
        context.globalState.enemy.hp -= damageValue;
      }
      // 最終HPの表示更新
      document.querySelector('.game-main-characters-enemy-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${context.globalState.enemy.hp} / ${context.globalState.enemy.maxHp})`;
      document.querySelector('.game-main-characters-enemy-status-hp').textContent = `HP: ${context.globalState.enemy.hp}/${context.globalState.enemy.maxHp}`;
      log(`${card.name}のダメージ効果が発動！`);
    }
  }
}
class AddMarkEffect {
  execute(card, effectInfo, context) {
    const markValue = effectInfo.value || 1;
    const buffName = card.element + "-mark";
    const elementTargetMap = {
      'daybreak': 'player',
      'sand':     'player',
      'hollow':   'enemy',
      'fog':      'enemy',
      'lumina':   'enemy'
    };
    // buff対象を取得
    const target = elementTargetMap[card.element];
    updateBuff(target, buffName, markValue);
  }
}
class HollowCombo3Effect {
  execute(card, effectInfo, context) {
    // ええ困った...
  }
}
class HollowMark3Effect {
  execute(card, effectInfo, context) {
    window.isSkipEnemyTurn = true;
    // 減らす処理
  }
}
class FogCombo3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}
class FogMark3Effect {
  execute(card, effectInfo, context) {
    const hp = context.globalState.player.hp;
    const maxHp = context.globalState.player.maxHp;
    const damage = Math.floor(25 * (1 - Math.pow(hp / maxHp, 2)));
    // 減らす処理
  }
}
class LuminaCombo3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}
class LuminaMark3Effect {
  execute(card, effectInfo, context) {
    // 面倒
    updateBuff('enemy', 'burn-turn', 3);
  }
}
class DaybreakCombo3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}
class DaybreakMark3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}
class SandCombo3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}
class SandMark3Effect {
  execute(card, effectInfo, context) {
    // 面倒
  }
}