// ゲームで使用する変数
// 実際にはローカルストレージから取得
window.cards = []; // 所持カード
window.deck = []; // デッキの選択中
window.holdCards = []; // 永続スロットの選択中
window.maxDeckCards = 10; // デッキの最大枚数
window.maxHoldCards = 3; // スロットの最大枚数
window.maxPermanentCards = 0; // 永続スロットの最大枚数
window.round = 1; // 現在のラウンド
window.isGameStart = false; // これだけはローカルストレージに保存する必要ないかも
window.essence = {
  attributes: [],
  cardTypes: [],
  rarity: 0,
}

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
  window.holdCards = [];
  window.round = 1;
  window.maxDeckCards = 10;
  window.maxHoldCards = 3;
  window.maxPermanentCards = 0;
  window.isGameStart = false;
  window.essence = {
    attributes: [{
      attribute: '虚',
      count: 0,
    }, {
      attribute: '霧',
      count: 0,
    }, {
      attribute: '燐',
      count: 0,
    }, {
      attribute: '暁',
      count: 0,
    }, {
      attribute: '砂',
      count: 0,
    }],
    cardTypes: [{
      type: '通常',
      count: 0,
    }, {
      type: 'コンボ',
      count: 0,
    }, {
      type: '刻印',
      count: 0,
    }],
    rarity: 0,
  }
});

import { message } from './message.js';

document.getElementById('middle-game-start-button').addEventListener('click', function() {
  if (document.querySelector('.middle-button-container .middle-deck').classList.contains('middle-deck-first')) {
    message('caution', 'デッキを設定してください');
    return;
  }
  window.isGameStart = true;
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  gameInit();
  setUpEnemy();
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


async function gameInit() {
  const gameCardsContainer = document.querySelector('.game-cards');
  // ★変更点: スロットの親要素を '.game-main-HoldCards-player' に変更
  const cardHolder = document.querySelector('.game-main-HoldCards-player');

  // --- 1. デッキを反映 ---
  gameCardsContainer.innerHTML = '';

  try {
    const response = await fetch('cards.json');
    const cardsData = await response.json();
    const cardMap = new Map(cardsData.map(card => [card.id, card.image]));

    window.deck.forEach(cardId => {
      const imagePath = cardMap.get(cardId);
      if (imagePath) {
        const cardContainer = document.createElement('div');
        cardContainer.className = 'game-image-container';
        cardContainer.dataset.cardId = cardId;
        cardContainer.innerHTML = `<img src="${imagePath}" alt="Card">`;
        gameCardsContainer.appendChild(cardContainer);
      }
    });
  } catch (error) {
    console.error('カードデータの読み込みに失敗しました:', error);
    return;
  }

  // --- 2. スロットを反映 ---
  cardHolder.innerHTML = '';
  for (let i = 0; i < window.maxHoldCards; i++) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'game-holder-slot';
    cardHolder.appendChild(cardContainer);
  }

  // --- 3. イベントリスナのロジックを定義 ---

  const clearAllSelectionStates = () => {
    document.querySelectorAll('.game-card-selected').forEach(c => c.classList.remove('game-card-selected'));
    document.querySelectorAll('.game-stanby-slot').forEach(s => s.classList.remove('game-stanby-slot'));
  };

  const setupCardClickListener = (cardElement) => {
    cardElement.addEventListener('click', (event) => {
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

      // === ケース1: カードを選択中に、待機スロットをクリック (カードを配置) ===
      if (selectedCard && isStanbySlot) {
        slotElement.innerHTML = selectedCard.innerHTML;
        slotElement.dataset.cardId = selectedCard.dataset.cardId;
        // ★変更点: 手札のカードを消さないので .remove() を削除
        // selectedCard.remove(); 
        
        clearAllSelectionStates();
        checkAllSlotsFilled();

      // ★変更点: ケース2: カード未選択で、使用済みスロットをクリック (スロットを空にする) ===
      } else if (!selectedCard && isFilledSlot) {
        // 手札に戻す必要がないため、スロットの中身をクリアするだけ
        slotElement.innerHTML = '';
        delete slotElement.dataset.cardId;
        
        checkAllSlotsFilled();

      // ★変更点: ケース3: カードを選択中に、使用済みスロットをクリック (カードを上書き) ===
      } else if (selectedCard && isFilledSlot) {
        // 手札のカード情報でスロットを上書きする
        slotElement.dataset.cardId = selectedCard.dataset.cardId;
        slotElement.innerHTML = selectedCard.innerHTML;

        // 入れ替えではないので、スロットのカードを手札に戻す処理は不要
        
        clearAllSelectionStates();
        checkAllSlotsFilled();
      }
    });
  };

  // --- 4. 作成した要素にイベントリスナを設定 ---
  document.querySelectorAll('.game-image-container').forEach(setupCardClickListener);
  document.querySelectorAll('.game-holder-slot').forEach(setupSlotClickListener);
}

/**
 * すべてのスロットが埋まっているかチェックし、埋まっていればターン処理を呼び出す関数
 */
function checkAllSlotsFilled() {
  const allSlots = document.querySelectorAll('.game-holder-slot');
  const filledCardIds = [];

  allSlots.forEach(slot => {
    if (slot.dataset.cardId) {
      filledCardIds.push(parseInt(slot.dataset.cardId, 10));
    }
  });
  
  window.selectedSlotCards = filledCardIds;

  if (filledCardIds.length === window.maxHoldCards) {
    processTurn(filledCardIds);
  }
}


// ターンが進行した際の処理
function processTurn(cardIds) {
  console.log('すべてのスロットが埋まりました。選択されたカードID:', cardIds);
  // 例: alert('Turn starts with cards: ' + cardIds.join(', '));
  // ここに、ターンが進行した際の実際のゲームロジックを記述します。
}

async function setUpEnemy() {
  const response = await fetch('enemy.json');
  const enemyData = await response.json();
  console.log(`${window.round}ラウンドの敵データを読み込みました。`);
  // 敵データを取得
  const enemy = enemyData.find(enemy => enemy.round === window.round);
  console.log(enemy);
  // DOMに反映
  document.querySelector('.game-main-characters-enemy-name').textContent = enemy.name;
}