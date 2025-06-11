// ゲームで使用する変数
// 実際にはローカルストレージから取得
window.cards = [];
window.deck = [];
window.holdCards = [];
window.maxDeckCards = 10;
window.maxHoldCards = 3;
window.maxPermanentCards = 1;
window.round = 1;
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
  window.deck = window.cards.slice(0, 10);
  window.holdCards = [
    {
      placeId: 0,
      cardId: 0,
    }
  ];
  window.round = 1;
  window.maxDeckCards = 10;
  window.maxHoldCards = 3;
  window.maxPermanentCards = 1;
  window.isGameStart = false;
  window.essence = {
    attributes: [],
    cardTypes: [],
    rarity: 0,
  }
});