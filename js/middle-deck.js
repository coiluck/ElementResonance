document.querySelector('.middle-deck').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 表示の更新
  initMiddleDeck();
  // middleDeckモーダルを表示
  setTimeout(function() {
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle-deck').classList.remove('fade-out');
    document.getElementById('modal-game-middle-deck').style.display = 'flex'; // 注意!!!
    document.getElementById('modal-game-middle-deck').classList.add('fade-in');
    // スクロールをリセット
    document.getElementById('middleDeck-deckList').scrollTo(0, 0);
  }, 500);
});
document.getElementById('middleDeck-close-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle').classList.remove('fade-out');
    document.getElementById('modal-game-middle').style.display = 'block';
    document.getElementById('modal-game-middle').classList.add('fade-in');
  }, 500);
}); 

async function initMiddleDeck() {
  // デッキを整列
  window.cards.sort((a, b) => a - b);
  // window.deck に含まれる各カードIDの数をカウント
  const deckIdCounts = window.deck.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});
  // データを取得
  const response = await fetch('cards.json');
  const cardsMasterData = await response.json();
  // デッキのカードを表示する要素を取得
  const deckList = document.getElementById('middleDeck-deckList');
  deckList.innerHTML = '';

  // window.cards 配列内の各カードIDに対して処理を行う
  for (const cardId of window.cards) {
    // cardIdに一致するカード情報をマスターデータから検索
    const cardData = cardsMasterData.find(card => card.id === cardId);
    // 一致するカード情報が見つかった場合
    if (cardData) {
      // <div class="middleDeck-cards"> を作成
      const cardContainer = document.createElement('div');
      cardContainer.className = 'middleDeck-cards';
      cardContainer.id = cardData.id; // 識別のためのID
      // 型が違うみたい（なぜ？）なのでこんな方法に
      // deckIdCountsにcardIdが存在し、かつカウントが0より大きい場合
      if (deckIdCounts[cardId] && deckIdCounts[cardId] > 0) {
        // 既に選択中なら'deck-deckselect'クラスを追加
        cardContainer.classList.add('deck-deckselect');
        // カウントを1減らす
        deckIdCounts[cardId]--;
      }

      // <img src="..."> を作成
      const cardImage = document.createElement('img');
      cardImage.src = cardData.image;
      cardContainer.appendChild(cardImage);

      cardContainer.addEventListener('click', handleCardClick);

      // 完成したカード要素を親要素に追加
      deckList.appendChild(cardContainer);
    }
  }
  const confirmButton = document.getElementById('middleDeck-confirm');
  if (confirmButton) {
    confirmButton.addEventListener('click', handleConfirmClick);
  }
  // 表示はリセットされてるからheaderの表示を更新
  document.getElementById('middleDeck-totalCards').textContent = window.cards.length;
  document.getElementById('middleDeck-selectedCards').textContent = `${window.deck.length}/${window.maxDeckCards}`;
}

import { playSoundEffect } from './music.js';

// カードがクリックされたときの処理
function handleCardClick(event) {
  // クリック音
  playSoundEffect("click1");
  // クリック対象
  const targetCard = event.currentTarget;
  // カードが既に選択されているかどうか
  const isSelected = targetCard.classList.contains('deck-deckselect');
  // 枚数制限チェック
  let selectedCards = document.querySelectorAll('.deck-deckselect');
  if (selectedCards.length >= window.maxDeckCards && !isSelected) {
    return;
  }
  // okなら選択中にする
  targetCard.classList.toggle('deck-deckselect');
  selectedCards = document.querySelectorAll('.deck-deckselect');
  // 選択中の枚数を表示
  document.getElementById('middleDeck-selectedCards').textContent = `${selectedCards.length}/${window.maxDeckCards}`
}


import { saveData } from './save-data.js';

// 確定ボタンがクリックされたときの処理
function handleConfirmClick() {
  // すべての要素を取得
  const selectedCards = document.querySelectorAll('.deck-deckselect');
  // 取得した要素のidを取得
  const selectedIds = Array.from(selectedCards).map(card => Number(card.id));
  // window.deckをidの配列にする
  window.deck = selectedIds;
  console.log("現在のデッキ:", window.deck);
  saveData();
  // ここからはmodalの切り替え
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle').classList.remove('fade-out');
    document.getElementById('modal-game-middle').style.display = 'block';
    document.getElementById('modal-game-middle').classList.add('fade-in');
  }, 500);
};












const middleModal = document.getElementById('modal-game-middle');
// 未設定表示の切り替え
const observer = new MutationObserver(() => {
  const display = window.getComputedStyle(middleModal).display;
  if (display === 'block') {
    checkUnset();
  }
})
// 監視の設定
const config = {
  attributes: true,
  attributeFilter: ['style']
};
// 監視開始
observer.observe(middleModal, config);
// 未設定表示の判定・反映
function checkUnset() {
  if (window.deck.length !== window.maxDeckCards) {
    document.querySelector('.middle-button-container .middle-deck').classList.add('middle-deck-first');
  } else {
    document.querySelector('.middle-button-container .middle-deck').classList.remove('middle-deck-first');
  }
}