import { saveData, loadData } from './save-data.js';

document.querySelector('.top-start-game-button').addEventListener('click', function() {
  // ゲームで使用する変数
  window.cards = [];
  for (let i = 1; i <= 45; i++) {
    if (i % 3 === 1) {
      // レアリティ1のみ所持した状態で開始
      window.cards.push(i);
    }
  }
  // デッキは所持しているカードのうち10枚
  window.deck = [];
  window.round = 1;
  window.maxDeckCards = 10;
  window.maxHoldCards = 3;
  window.isGameStart = false;
  window.playerHp = 30;
  window.essence = {
    attributes: [
      { attribute: '虚', count: 0 },
      { attribute: '霧', count: 0 },
      { attribute: '燐', count: 0 },
      { attribute: '暁', count: 0 },
      { attribute: '砂', count: 0 }
    ],
    cardTypes: [
      { type: '通常', count: 0 },
      { type: 'コンボ', count: 0 },
      { type: '刻印', count: 0 }
    ],
    rarity: 0,
  };
  // 新規で始める
  localStorage.clear();
  saveData();
  // ラウンド数を更新
  document.querySelectorAll('.middle-round-number').textContent = `${window.round}`;
});

// 続きからを押した場合
document.querySelector('.top-continue-game-button').addEventListener('click', function() {
  loadData();
  // ラウンド数を更新
  document.querySelectorAll('.middle-round-number').textContent = `${window.round}`;
});

import { message } from './message.js';
import { CharacterAnimation, characterAnim } from './game-player-animation.js';
import { globalGameState, resetGlobalState } from './game-status.js';
import { playSoundEffect } from './music.js';

document.getElementById('middle-game-start-button').addEventListener('click', function() {
  if (document.querySelector('.middle-button-container .middle-deck').classList.contains('middle-deck-first')) {
    message('caution', 'デッキを設定してください');
    playSoundEffect("disable");
    return;
  }
  playSoundEffect("metallic");
  window.isGameStart = true;
  saveData();
  // アニメーション開始
  characterAnim.start();
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  gameInit();
  setUpEnemy();
  resetGlobalState();
  globalGameState.player.hp = window.playerHp;
  setTimeout(function() {
    // gameモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game').classList.remove('fade-out');
    document.getElementById('modal-game').style.display = 'flex';  // 注意！
    document.getElementById('modal-game').classList.add('fade-in');
  }, 500);
});

import { playMusic, stopMusic } from './music.js';

async function changeMusic() {
  await stopMusic();
  playMusic("theme2");
}

async function gameInit() {
  changeMusic();

  // HPを反映（敵はsetUpEnemy関数で設定）
  document.querySelector('.game-main-characters-player-status-hp').textContent = `HP: ${window.playerHp}/30`;
  document.querySelector('.game-main-characters-player-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${window.playerHp} / ${globalGameState.player.maxHp})`;

  const gameCardsContainer = document.querySelector('.game-cards');
  const cardHolder = document.querySelector('.game-main-HoldCards-player');

  // デッキを反映
  gameCardsContainer.innerHTML = '';
  try {
    const response = await fetch('cards.json');
    const cardsData = await response.json();
    const cardMap = new Map(cardsData.map(card => [card.id, card]));
    window.deck.forEach(cardId => {
      const cardData = cardMap.get(cardId);
      if (cardData) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'game-image-container';
        cardContainer.dataset.cardId = cardData.id;
        cardContainer.dataset.imageIcon = cardData.image_icon;
        cardContainer.dataset.element = cardData.element;
        cardContainer.innerHTML = `<img src="${cardData.image}" alt="Card">`;
        gameCardsContainer.appendChild(cardContainer);
      }
    });
  } catch (error) {
    console.error('カードデータの読み込みに失敗しました:', error);
    return;
  }

  // スロットを反映
  cardHolder.innerHTML = '';
  for (let i = 0; i < window.maxHoldCards; i++) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'game-holder-slot';
    cardHolder.appendChild(cardContainer);
  }

  // スロットをクリア
  const clearSlot = (slotToClear) => {
    const cardIdToFree = slotToClear.dataset.cardId;
    const elementToRemove = slotToClear.dataset.element;

    if (!cardIdToFree) return;

    // スロットをリセット
    slotToClear.innerHTML = '';
    delete slotToClear.dataset.cardId;
    delete slotToClear.dataset.element;
    if (elementToRemove) {
      slotToClear.classList.remove(`game-${elementToRemove}`);
    }

    // 対応するgame-cardsのクラスを解除
    const handCardToFree = document.querySelector(`.game-cards .game-image-container[data-card-id="${cardIdToFree}"]`);
    if (handCardToFree) {
      handCardToFree.classList.remove('game-is-used-in-slot');
    }
    
    // 選択状態とターン進行チェック
    clearAllSelectionStates();
    checkAllSlotsFilled();
  };

  // スロットのオーバーレイをクリア
  const overlay = document.querySelector('.game-process-turn-overlay.show');
  if (overlay) {
    overlay.remove();
  }

  const clearAllSelectionStates = () => {
    document.querySelectorAll('.game-card-selected').forEach(c => c.classList.remove('game-card-selected'));
    document.querySelectorAll('.game-stanby-slot').forEach(s => s.classList.remove('game-stanby-slot'));
  };

  const setupCardClickListener = (cardElement) => {
    cardElement.addEventListener('click', (event) => {
      // game-cardsの選択中カードクリック時
      if (cardElement.classList.contains('game-is-used-in-slot')) {
        playSoundEffect("disable");
        const cardIdToFind = cardElement.dataset.cardId;
        // このカードIDを持つスロットを探す
        const slotToClear = document.querySelector(`.game-holder-slot[data-card-id="${cardIdToFind}"]`);
        if (slotToClear) {
          clearSlot(slotToClear); // 見つけたらスロットをクリア
        }
        return; // 選択処理は行わない
      }

      // 通常のカード選択処理
      playSoundEffect("click1");
      event.stopPropagation();
      const isAlreadySelected = cardElement.classList.contains('game-card-selected');
      clearAllSelectionStates();
      if (!isAlreadySelected) {
        cardElement.classList.add('game-card-selected');
        document.querySelectorAll('.game-holder-slot').forEach(slot => {
          if (!slot.dataset.cardId) {
            slot.classList.add('game-stanby-slot');
          }
        });
      }
    });
  };

  const setupSlotClickListener = (slotElement) => {
    slotElement.addEventListener('click', () => {
      const selectedCard = document.querySelector('.game-card-selected');
      const isStanbySlot = slotElement.classList.contains('game-stanby-slot');
      const isFilledSlot = slotElement.dataset.cardId && !isStanbySlot;

      if (selectedCard && isStanbySlot) {
        // スロットにカードを配置
        playSoundEffect("click2");
        slotElement.innerHTML = `<img src="${selectedCard.dataset.imageIcon}" alt="Card Icon">`;
        slotElement.dataset.cardId = selectedCard.dataset.cardId;
        slotElement.dataset.element = selectedCard.dataset.element;
        slotElement.classList.add(`game-${selectedCard.dataset.element}`);
        selectedCard.classList.add('game-is-used-in-slot');
        clearAllSelectionStates();
        checkAllSlotsFilled();
      
      } else if (!selectedCard && isFilledSlot) {
        // 手札のカードを選択せずに、既にカードがセットされているスロットをクリックした場合、そのスロットのカードを手札に戻す
        playSoundEffect("disable");
        clearSlot(slotElement);
      
      } else if (selectedCard && isFilledSlot) {
        // 手札のカードを選択した状態で、既にカードがセットされているスロットをクリックした場合、カードを入れ替える
        playSoundEffect("click2");
        const oldCardIdToFree = slotElement.dataset.cardId;
        const handCardToFree = document.querySelector(`.game-cards .game-image-container[data-card-id="${oldCardIdToFree}"]`);
        if (handCardToFree) {
          handCardToFree.classList.remove('game-is-used-in-slot');
        }

        const oldElementToRemove = slotElement.dataset.element;
        slotElement.classList.remove(`game-${oldElementToRemove}`);
        slotElement.innerHTML = `<img src="${selectedCard.dataset.imageIcon}" alt="Card Icon">`;
        slotElement.dataset.cardId = selectedCard.dataset.cardId;
        slotElement.dataset.element = selectedCard.dataset.element;
        slotElement.classList.add(`game-${selectedCard.dataset.element}`);
        selectedCard.classList.add('game-is-used-in-slot');
        clearAllSelectionStates();
        checkAllSlotsFilled();
      }
    });
  };

  // 作成した要素にイベントリスナを設定
  document.querySelectorAll('.game-image-container').forEach(setupCardClickListener);
  document.querySelectorAll('.game-holder-slot').forEach(setupSlotClickListener);
}

// すべてのスロットが埋まっているかチェック
function checkAllSlotsFilled() {
  const allSlots = document.querySelectorAll('.game-holder-slot');
  const filledCardIds = [];

  allSlots.forEach(slot => {
    if (slot.dataset.cardId) {
      filledCardIds.push(parseInt(slot.dataset.cardId, 10));
    }
  });
  
  window.selectedSlotCards = filledCardIds;

  // リキャストやスロットに入っていないカードを取得
  const usableCards = document.querySelectorAll('.game-image-container:not(.game-card-recast):not(.game-is-used-in-slot)');

  // 埋まっていたらボタンを表示し、埋まっていなかったらボタンを削除
  if (filledCardIds.length === window.maxHoldCards) {
    showButton(filledCardIds);
  }  else if (usableCards.length === 0) {
    showButton(filledCardIds);
  } else if (document.querySelector('.game-process-turn-overlay')) {
    document.querySelector('.game-process-turn-overlay').remove();
  }
}

import { processEndOfTurnEffects } from './game-process-cards.js';

// ボタンを表示
function showButton(filledCardIds) {
  // 親コンテナを取得
  const container = document.querySelector('.game-main-HoldCards');
  if (!container) return; 
  container.style.position = 'relative';
  // オーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'game-process-turn-overlay';
  // ボタンを作成
  const button = document.createElement('button');
  button.textContent = 'ターン進行';
  button.className = 'game-process-turn-button';
  button.addEventListener('click', async () => {
    // 再キャスト時間を更新
    setUpRecastTime();
    // 前のターンにスキップしたかどうか
    globalGameState.wasTurnSkippedLastTurn = window.isSkipEnemyTurn;
    window.isSkipEnemyTurn = false;
    // ターン進行処理を呼ぶ
    const isGameFinished = await processTurn(filledCardIds);
    // ゲームが終了していたら処理を中断
    if (isGameFinished) {
      return; 
    }
    if (!window.isSkipEnemyTurn) {
      // 敵のターン進行処理を呼ぶ
      await processEnemyTurn();
    }
    await processEndOfTurnEffects();
    setUpNextTurn();
  });
  // 要素を組み立て
  overlay.appendChild(button);
  container.appendChild(overlay);
  // アニメーションのために'show'クラスを追加
  setTimeout(() => {
    overlay.classList.add('show');
  }, 10);
}

import { processCards } from './game-process-cards.js';
import { processEnemyTurn } from './game-process-enemy.js';

// ターンが進行した際の処理
async function processTurn(cardIds) {
  console.log('すべてのスロットが埋まりました。選択されたカードID:', cardIds);
  // ボタンを非表示
  document.querySelector('.game-process-turn-button').remove();
  const isGameFinished = await processCards(cardIds);
  return isGameFinished;
}


// jsonのキャッシュ
let cardsDataCache = null;
async function getCardsData() {
  if (!cardsDataCache) {
    const response = await fetch('cards.json');
    cardsDataCache = await response.json();
  }
  return cardsDataCache;
}
let enemyDataCache = null;
async function getEnemyData() {
  if (!enemyDataCache) {
    const response = await fetch('enemy.json');
    enemyDataCache = await response.json();
  }
  return enemyDataCache;
}

import { renderBuffs } from './game-buff-update.js';
import { addMark } from './game-process-enemy.js';

// 敵を設定
async function setUpEnemy() {
  // 敵データを取得
  const enemyData = await getEnemyData();
  const enemy = enemyData.find(enemy => enemy.round === window.round);
  if (globalGameState.turn === 1) {
    console.log("敵情報:", enemy);
    // トリガー情報を設定
    if (enemy.triggers && Array.isArray(enemy.triggers)) {
      globalGameState.enemy.triggers = enemy.triggers;
      globalGameState.enemy.buff.trigger = enemy.triggers.length;
    } else {
      // トリガーがない場合
      globalGameState.enemy.triggers = [];
      globalGameState.enemy.buff.trigger = 0;
    }
    console.log("敵のトリガー情報:", globalGameState.enemy.triggers);
    // ダメージ軽減の設定
    if(enemy.damageReduction) {
      globalGameState.enemy.buff['damage-reduction'] = enemy.damageReduction;
    }
  }
  // cards.jsonを読み込む（敵の使用カードの設定で必要）
  const cardsData = await getCardsData();
  // DOMに反映
  document.querySelector('.game-main-characters-enemy-name').textContent = enemy.name;
  document.querySelector('.game-main-characters-enemy-image').innerHTML = `<img src="${enemy.image}" alt="Card">`;
  // 敵のデッキを反映
  setUpEnemyDeck(enemy.deck, cardsData);
  // HPのセットアップは最初のターンだけ
  if (globalGameState.turn === 1) {
    globalGameState.enemy.hp = enemy.hp;
    globalGameState.enemy.maxHp = enemy.hp;
    document.querySelector('.game-main-characters-enemy-status-hp').textContent = `HP: ${enemy.hp}/${enemy.hp}`;
    document.querySelector('.game-main-characters-enemy-status-hp-bar .hp-bar-inner').style.width = `calc(100% * ${globalGameState.enemy.hp} / ${globalGameState.enemy.maxHp})`;
  }
  // 刻印を追加
  if (window.round === 9) {
    addMark();
  }
  // triggeerとdeckのホバーの反映
  renderBuffs();
}

import { createTooltipElement, addTooltipEventListeners } from './game-buff-update.js';

async function setUpEnemyDeck(enemyDeck, cardsMaster) {
  // 説明文を作成
  const tooltip = document.getElementById('game-buff-tooltip') || createTooltipElement();
  // 表示先を取得
  const container = document.querySelector('.game-main-HoldCards-enemy');
  if (!container) {
    console.error('game-main-HoldCards-enemyが見つかりません。');
    return;
  }
  container.innerHTML = '';
  // 使用するカード
  const deckIndex = (globalGameState.turn - 1) % enemyDeck.length; // ターン数は1から始まるので-1する（最初は配列の0番目）
  console.log(`${globalGameState.turn}ターン目用のデッキを用意しました`);
  const currentCardIds = enemyDeck[deckIndex]; // 配列の中のいずれかの配列を取得
  // 取得した配列の画像を表示
  currentCardIds.forEach(cardId => {
    // カードIDに一致する情報をcards.jsonから探し出す
    const cardData = cardsMaster.find(card => card.id === cardId);

    if (cardData) {
      // <div class="game-enemy-slot"></div> を作成
      const slotDiv = document.createElement('div');
      slotDiv.className = 'game-enemy-slot';
      slotDiv.dataset.description = cardData.description;
      slotDiv.dataset.cardId = cardData.id;
      // <img src={image_icon}> を作成
      const image = document.createElement('img');
      image.src = cardData.image_icon;
      // divの中にimgを入れる
      slotDiv.appendChild(image);
      // 親要素（container）に作成したdivを追加する
      container.appendChild(slotDiv);
      // ホバーのイベントリスナを設定
      addTooltipEventListeners(slotDiv, null, tooltip);
    } else {
      console.warn(`ID:${cardId} のカードがcards.jsonに見つかりませんでした。`);
    }
  });
}

async function setUpNextTurn() {
  // 火傷効果の解決
  processFireScar();
  globalGameState.turn++;
  setUpEnemy();
  // ログをクリア
  const logContainer = document.querySelector('.game-logs-container');
  if (logContainer) {
    logContainer.scrollTop = 0;
    logContainer.innerHTML = '';
    logContainer.style.display = 'none';
  } else {
    console.error('ログのクリアに失敗しました');
  }
  // スロットをクリア
  const gameAttributes = ['daybreak', 'sand', 'lumina', 'fog', 'hollow'];
  document.querySelectorAll('.game-holder-slot').forEach(slot => {
    slot.innerHTML = '';
    // data-* 属性を削除
    Array.from(slot.attributes).forEach(attribute => {
      if (attribute.name.startsWith('data-')) {
        slot.removeAttribute(attribute.name);
      }
    });
    // game-${属性} クラスを削除
    gameAttributes.forEach(attr => {
      slot.classList.remove(`game-${attr}`);
    });
  });
  // 再キャスト時間を更新
  updateRecastTime();
  // 選択中のカードをクリア
  document.querySelectorAll('.game-image-container').forEach(card => {
    card.classList.remove('game-is-used-in-slot');
  });
  // オーバーレイを非表示
  const overlay = document.querySelector('.game-process-turn-overlay.show');
  if (overlay) {
    overlay.remove();
  }
  // すべてのカードが使えない場合
  checkAllSlotsFilled()
}

function setUpRecastTime() {
  const usingCards = document.querySelectorAll('.game-image-container.game-is-used-in-slot');
  usingCards.forEach(card => {
    const cardId = Number(card.dataset.cardId);
    const cardRarity = cardId % 3 === 0 ? 3 : cardId % 3;
    const recastTime = cardRarity + 2;
    card.dataset.recastTime = recastTime;
  });
}
function updateRecastTime() {
  const usingCards = document.querySelectorAll('.game-image-container[data-recast-time]');
  usingCards.forEach(card => {
    card.classList.add('game-card-recast');
    let recastTime = Number(card.dataset.recastTime);
    if (recastTime > 0) {
      recastTime -= 1;
      card.dataset.recastTime = recastTime
      if (recastTime <= 0) {
        card.classList.remove('game-card-recast');
        card.removeAttribute('data-recast-time');
      }
    }
  });
}

import { updateBuff } from './game-buff-update.js';

function processFireScar() {
  const isEnemyFire = globalGameState.enemy.buff['burn-turn'];
  const isPlayerFire = globalGameState.player.buff['burn-turn'];
  if (isEnemyFire) {
    updateBuff('enemy', 'burn-turn', -1);
    // ダメージ処理
    if (globalGameState.player.buff.shield > 0) {
      const damageToShield = Math.min(globalGameState.player.buff.shield, 5); // 敵のやけどダメージは5
      const damageToHp = 5 - damageToShield;

      globalGameState.player.buff.shield -= damageToShield;
        
      if (damageToHp > 0) {
        // バリアが割れる場合
        globalGameState.player.hp -= damageToHp;
      }
      // 減ったバリアを表示更新
      renderBuffs();
    } else {
      // バリアがない場合は直接HPを減らす
      globalGameState.player.hp -= 5;
    }
  } else if (isPlayerFire) {
    updateBuff('player', 'burn-turn', -1);
    // ダメージ処理
    if (globalGameState.enemy.buff.shield > 0) {
      const damageToShield = Math.min(globalGameState.enemy.buff.shield, 3); // プレイヤーのやけどダメージは3
      const damageToHp = 3 - damageToShield;

      globalGameState.enemy.buff.shield -= damageToShield;
        
      if (damageToHp > 0) {
        // バリアが割れる場合
        globalGameState.enemy.hp -= damageToHp;
      }
      // 減ったバリアを表示更新
      renderBuffs();
    } else {
      // バリアがない場合は直接HPを減らす
      globalGameState.enemy.hp -= 3;
    }
  }
}