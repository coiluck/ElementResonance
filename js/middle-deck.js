document.querySelector('.middle-deck').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 表示の更新
  initMiddleDeck();
  initMiddlePermanent();
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle-deck').classList.remove('fade-out');
    document.getElementById('modal-game-middle-deck').style.display = 'flex'; // 注意!!!
    document.getElementById('modal-game-middle-deck').classList.add('fade-in');
  }, 500);
});
document.getElementById('middleDeck-close-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 表示の更新
  initMiddleDeck();
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
      // <img src="..."> を作成
      const cardImage = document.createElement('img');
      cardImage.src = cardData.image; 
      // <img> を <div> の中に追加
      cardContainer.appendChild(cardImage);
      // 完成したカード要素を親要素に追加
      deckList.appendChild(cardContainer);
    }
  }
}

async function initMiddlePermanent() {
  // 永続スロットのカードを表示する要素を取得
  const permanentHolder = document.getElementById('middleDeck-permanent-holder');
  permanentHolder.innerHTML = '';
  // カードスロット分の置き場を表示
  for (let i = 0; i < window.maxHoldCards; i++) {
    const cardContainer = document.createElement('div');
    cardContainer.className = 'middleDeck-permanent-holder-slot';
    permanentHolder.appendChild(cardContainer);
  }
  // データを取得
  const response = await fetch('cards.json');
  const cardsMasterData = await response.json();
  // デッキのカードを表示する要素を取得
  const deckList = document.getElementById('middleDeck-permanent-cards');
  deckList.innerHTML = '';
  // window.cards 配列内の各カードIDに対して処理を行う
  for (const cardId of window.cards) {
    // cardIdに一致するカード情報をマスターデータから検索
    const cardData = cardsMasterData.find(card => card.id === cardId);
    // 一致するカード情報が見つかった場合
    if (cardData) {
      // <div class="middleDeck-permanent-cards"> を作成
      const cardContainer = document.createElement('div');
      cardContainer.className = 'middleDeck-permanent-cards';
      // <img src="..."> を作成
      const cardImage = document.createElement('img');
      cardImage.src = cardData.image; 
      // <img> を <div> の中に追加
      cardContainer.appendChild(cardImage);
      // 完成したカード要素を親要素に追加
      deckList.appendChild(cardContainer);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // タブ要素とコンテンツラッパーの取得
  const middleDeckTabs = document.querySelectorAll('.middleDeck-tab-button');
  const middleDeckContentWrapper = document.querySelector('.middleDeck-tab-content');

  // タブ切り替えのロジック
  middleDeckTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 全てのタブからアクティブクラスを削除
      middleDeckTabs.forEach(t => t.classList.remove('middleDeck-active'));
      // クリックされたタブにアクティブクラスを追加
      tab.classList.add('middleDeck-active');

      const attributeIndex = parseInt(tab.dataset.attributeIndex, 10);
      if (middleDeckContentWrapper) {
        // コンテンツエリアを対応する位置にスライド
        middleDeckContentWrapper.style.transform = `translateX(-${attributeIndex * 50}%)`;
      }
    });
  });
});