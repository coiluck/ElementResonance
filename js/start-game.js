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