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

    // ダメージ発生回数
    this.turnHitCount = 0;
  }
}

// 待機時間
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const WAIT_TIME_MS = 1000; 

// ゲームログ用の関数
export function log(message) {
  console.log(message);  // 後で消して（さすがにうるさい）
  const logParent = document.querySelector('.game-cards');
  // .game-logs-container が存在するか確認。なければ作成して追加
  let logContainer = logParent.querySelector('.game-logs-container');
  if (!logContainer) {
    logContainer = document.createElement('div');
    logContainer.className = 'game-logs-container';
    logParent.appendChild(logContainer);
    // ログの先頭にスクロール
    logContainer.scrollTop = 0;
  }
  if (logContainer.style.display === 'none') {
    logContainer.style.display = 'block';
    // ログの先頭にスクロール
    logContainer.scrollTop = 0;
  }
  // ログ要素を作成して追加
  const logElement = document.createElement('div');
  logElement.className = 'game-log';
  logElement.textContent = message;
  logContainer.appendChild(logElement);
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

import { finishGame } from './result-reward.js';

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

  log(`=== プレイヤーのターン ===`);

  // 効果をまとめる
  const effectRegistry = {
    "damage": new DamageEffect(),             // 基本ダメージ
    "heal": new HealEffect(),                 // 暁の通常
    "shield": new ShieldEffect(),             // 砂の通常
    "reduceCoolTime": new ReduceCoolTimeEffect(), // コンボタイプのレアリティ1
    "damageCombo2": new DamageCombo2Effect(), // コンボタイプのレアリティ2
    "addMark": new AddMarkEffect(),           // 刻印タイプ
    "addNextDamage": new AddNextDamageEffect(), // 吸血少女
    "addTurnDamage": new AddTurnDamageEffect(), // 執行人 ゼガ
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
    log(`--${card.name}の効果が発動！--`);
    // DOMに召喚&エフェクト

    // damageを持つカードの処理
    if (card.damage) {
      for (const damageInfo of card.damage) {
        // "when": "now" のものだけを処理
        if (damageInfo.when === 'now') {
          // ダメージ計算を呼ぶ
          await effectRegistry.damage.execute(card, damageInfo, context);
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
        // jsonで定義したtypeに基づいて、対応するクラスのインスタンスを取得
        const handler = effectRegistry[effectInfo.type];
        if (handler) {
          await handler.execute(card, effectInfo, context);
          await wait(WAIT_TIME_MS);
        }
      }
    }

    // DC3やSC3の、これ以降のカードに付与する効果
    const addedTurnEffects = context.turnModifiers.filter(
      m => m.modifierType === 'addedEffectOnCardPlay'
    );

    if (addedTurnEffects.length > 0) {
      log(`--ターン中持続効果が発動--`);
      for (const effect of addedTurnEffects) {
        switch (effect.type) {
          case 'heal':
            playSoundEffect("buff");
            const healValue = effect.value;
            // HPが最大値を超えないように回復
            const newHp = Math.min(globalGameState.player.maxHp, globalGameState.player.hp + healValue);
            const actualHeal = newHp - globalGameState.player.hp;
            if (actualHeal > 0) {
                log(`[${effect.source}の効果] プレイヤーのHPが${actualHeal}回復`);
                globalGameState.player.hp = newHp;
            }
            
            // HPバーの表示更新
            document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${globalGameState.player.hp} / ${globalGameState.player.maxHp})`;
            document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${globalGameState.player.hp}/${globalGameState.player.maxHp}`;
            break;

          case 'shield':
            playSoundEffect("buff");
            const shieldValue = effect.value;
            log(`[${effect.source}の効果] プレイヤーが${shieldValue}のバリアを獲得`);
            updateBuff('player', 'shield', shieldValue);
            break;
        }
      }
      // 追加効果が発動したので待機
      await wait(WAIT_TIME_MS);
    }
    
    // ゲーム終了処理
    if (globalGameState.enemy.hp <= 6) {
      finishGame();
      return;
    }
  }

  // ターン終了時効果の処理
  // 後で書く

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

class HealEffect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    const healValue = effectInfo.value || 3;
    if (globalGameState.player.hp + healValue > globalGameState.player.maxHp) {
      globalGameState.player.hp = globalGameState.player.maxHp;
      log(`プレイヤーを最大HPに回復しました`);
    } else {
      globalGameState.player.hp += healValue;
      log(`プレイヤーを${healValue}回復しました`);
    }
    // 最終HPの表示更新
    document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${context.globalState.player.hp} / ${context.globalState.player.maxHp})`;
    document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${context.globalState.player.hp}/${context.globalState.player.maxHp}`;
  }
}
class ShieldEffect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    updateBuff('player', 'shield', effectInfo.value || 3);
    log(`プレイヤーに${effectInfo.value}バリア`);
  }
}
class ReduceCoolTimeEffect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    const coolTime = effectInfo.value || 1;
    let sameElementCount = null;
    // contextからカード取得しておいて
    context.playedCardsInTurn.forEach(playedCard => {
      // 同じ属性のカードをカウント
      if (playedCard.id >= card.id - 3 && playedCard.id <= card.id + 5) {
        sameElementCount++;
      }
    });
    // 再使用間隔を減算
    document.querySelectorAll('.game-cards .game-image-container[data-recast-time]').forEach(slot => {
      const cardIdInDeck = Number(slot.dataset.cardId);
      if (cardIdInDeck < card.id - 3 || cardIdInDeck > card.id + 5) {
        // 他属性のリキャストは減算しない
        return;
      }
      let recastTime = Number(slot.dataset.recastTime);
      recastTime -= coolTime * sameElementCount;
      slot.dataset.recastTime = recastTime;
      if (recastTime <= 0) {
        slot.classList.remove('game-card-recast');
        slot.removeAttribute('data-recast-time');
      }
    });
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
    const timesValue = times * 1;
    dealDamage(damageValue, timesValue, context, card.name, true);
    // ターン中の追加ダメージ
    context.turnModifiers
      .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
      .forEach(added => dealDamage(added.value, 1, context, added.source, false));
    // 次のカードへの追加ダメージ
    context.nextCardModifiers
      .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
      .forEach(added => dealDamage(added.value, 1, context, added.source, false));
  }
}
class AddMarkEffect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");

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
    // ログ用
    const ATTRIBUTES = {
      'hollow': '虚',
      'fog': '霧',
      'lumina': '燐',
      'daybreak': '暁',
      'sand': '砂'
    };
    log(`${ATTRIBUTES[card.element]}の刻印を${markValue}追加`);
  }
}
// HollowCombo3Effect は DamageCombo2Effect で処理
class HollowMark3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    updateBuff('enemy', 'hollow-mark', 2);
    log(`虚の刻印を2追加`);
    if (globalGameState.enemy.buff['hollow-mark'] === 3) {
      // 前のターンにスキップしていたかチェック
      if (globalGameState.wasTurnSkippedLastTurn) {
        log(`しかし、連続してターンをスキップすることはできない！`);
        return; 
      }
      // スキップ
      log(`虚の刻印を3消費`);
      updateBuff('enemy', 'hollow-mark', -3);
      log(`敵のターンをスキップ`);
      window.isSkipEnemyTurn = true;
    }
  }
}
class FogCombo3Effect {
  execute(card, effectInfo, context) {
    // ダメージ処理
    dealDamage(context.turnHitCount, 2, context, card.name, false);
    // ターン中の追加ダメージ
    context.turnModifiers
      .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
      .forEach(added => dealDamage(added.value, 1, context, added.source, false));
    // 次のカードへの追加ダメージ
    context.nextCardModifiers
      .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
      .forEach(added => dealDamage(added.value, 1, context, added.source, false));
  }
}
class FogMark3Effect {
  execute(card, effectInfo, context) {
    updateBuff('enemy', 'fog-mark', 2);
    log(`霧の刻印を2追加`);
    if (globalGameState.enemy.buff['fog-mark'] === 3) {
      log(`霧の刻印を3消費`);
      const hp = globalGameState.player.hp;
      const maxHp = globalGameState.player.maxHp;
      const damage = Math.floor(25 * (1 - Math.pow(hp / maxHp, 2)));
      dealDamage(damage, 1, context, card.name, false);
      // ターン中の追加ダメージ
      context.turnModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));
      // 次のカードへの追加ダメージ
        context.nextCardModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));
      // 減らす処理
      updateBuff('enemy', 'fog-mark', -3);
      log(`敵に${damage}ダメージ`);
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
    updateBuff('enemy', 'lumina-mark', 2);
    log(`燐の刻印を2追加`);
    if (globalGameState.enemy.buff['lumina-mark'] === 3) {
      log(`燐の刻印を3消費`);
      updateBuff('enemy', 'lumina-mark', -3);
      updateBuff('enemy', 'burn-turn', 3);
      log(`敵に火傷効果`);
    }
  }
}
class DaybreakCombo3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    const modifier = {
      modifierType: 'addedEffectOnCardPlay',
      type: 'heal',
      value: 2,
      source: card.name
    };
    context.turnModifiers.push(modifier);
    log(`このターン、すべてのカードに追加で「HPを2回復」の効果が付与`);
  }
}
class DaybreakMark3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    updateBuff('player', 'daybreak-mark', 2);
    log(`暁の刻印を2追加`);
    const daybreak = globalGameState.player.buff['daybreak-mark'] || 0;
    const sand = globalGameState.player.buff['sand-mark'] || 0;
    const mark = daybreak + sand;
    log(`暁の刻印: ${daybreak}、砂の刻印: ${sand}、合計: ${mark}`);
    if (mark !== 0) {
      updateBuff('player', 'daybreak-mark', -3);
      updateBuff('player', 'sand-mark', -3);
      log(`暁の刻印と砂の刻印をすべて消費`);
      const healValue = mark * 3;
      globalGameState.player.hp += healValue;
      if (globalGameState.player.hp + healValue > globalGameState.player.maxHp) {
        globalGameState.player.hp = globalGameState.player.maxHp;
      } else {
        globalGameState.player.hp += healValue;
      }
      // 最終HPの表示更新
      document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${globalGameState.player.hp} / ${globalGameState.player.maxHp})`;
      document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${globalGameState.player.hp}/${globalGameState.player.maxHp}`;
      log(`プレイヤーを${healValue}回復`);
    }
  }
}
class SandCombo3Effect {
  execute(card, effectInfo, context) {
    playSoundEffect("buff");
    const modifier = {
      modifierType: 'addedEffectOnCardPlay',
      type: 'shield',
      value: 2,
      source: card.name
    };
    context.turnModifiers.push(modifier);
    log(`このターン、すべてのカードに追加で「バリアを2付与」の効果が付与`);
  }
}
class SandMark3Effect {
  execute(card, effectInfo, context) {
    updateBuff('player', 'sand-mark', 2);
    log(`砂の刻印を2追加`);
    const daybreak = globalGameState.player.buff['daybreak-mark'] || 0;
    const sand = globalGameState.player.buff['sand-mark'] || 0;
    const mark = daybreak + sand;
    log(`暁の刻印: ${daybreak}、砂の刻印: ${sand}、合計: ${mark}`);
    if (mark !== 0) {
      updateBuff('player', 'daybreak-mark', -3);
      updateBuff('player', 'sand-mark', -3);
      log(`暁の刻印と砂の刻印をすべて消費`);
      const damage = mark * 3;
      // ダメージ処理
      dealDamage(damage, 1, context, card.name, false);
      // ターン中の追加ダメージ
      context.turnModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));
      // 次のカードへの追加ダメージ
      context.nextCardModifiers
        .filter(m => m.modifierType === 'addedDamage' && m.type === 'damage')
        .forEach(added => dealDamage(added.value, 1, context, added.source, false));
      // バリア処理
      const shield = Math.floor(damage * 0.5);
      updateBuff('player', 'shield', shield);
      log(`${shield}バリアを獲得`);
    }
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

    // ヒット数を加算
    context.turnHitCount++;

    // バリア貫通とダメージ処理
    if (canIgnoreBarrier === true) {
      // 直接HPを減らす
      globalGameState.enemy.hp -= finalDamage;
      logMessage += ' [直接ダメージ]';
    } else {
      // バリアを考慮
      if (globalGameState.enemy.buff.shield > 0) {
        const damageToShield = Math.min(globalGameState.enemy.buff.shield, finalDamage);
        const damageToHp = finalDamage - damageToShield;

        globalGameState.enemy.buff.shield -= damageToShield;
          
        if (damageToHp > 0) {
          // バリアが割れる場合
          globalGameState.enemy.hp -= damageToHp;
        }
      } else {
        // バリアがない場合は直接HPを減らす
        globalGameState.enemy.hp -= finalDamage;
      }
    }
    // 音
    playSoundEffect("attack");
    // 表示更新
    document.querySelector('.game-main-characters-enemy-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${globalGameState.enemy.hp} / ${globalGameState.enemy.maxHp})`;
    document.querySelector('.game-main-characters-enemy-status-hp').textContent = `HP: ${globalGameState.enemy.hp}/${globalGameState.enemy.maxHp}`;
    // ログ出力
    log(`${finalDamage}ダメージ (基本値:${baseDamage} + バフ:${totalBuffValue}${buffDetailLog})`);
    // 待機
    if (i < times - 1) {
      await wait(WAIT_TIME_MS);
    }
  }
}