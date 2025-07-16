// save-data.js
export function saveData() {
  // すべてのグローバル変数をまとめる
  const gameData = {
    essence: window.essence,
    cards: window.cards,
    deck: window.deck,
    holdCards: window.holdCards,
    maxDeckCards: window.maxDeckCards,
    maxHoldCards: window.maxHoldCards,
    maxPermanentCards: window.maxPermanentCards,
    round: window.round,
    isGameStart: window.isGameStart,
    playerHp: window.playerHp,
  };
  try {
    // JSON文字列に変換して保存
    const jsonGameData = JSON.stringify(gameData);
    localStorage.setItem('gameData', jsonGameData);
    console.log('ゲームデータを保存しました。');
  } catch (e) {
    console.error('ゲームデータの保存に失敗しました。', e);
  }
}

export function loadData() {
  // localStorageから保存されたJSON文字列を取得
  const savedData = localStorage.getItem('gameData');

  // 保存されたデータがある場合のみ処理を実行
  if (savedData) {
    try {
      // JSON文字列をオブジェクトに復元
      const gameData = JSON.parse(savedData);

      // 復元したデータを各グローバル変数に再代入
      window.essence = gameData.essence;
      window.cards = gameData.cards;
      window.deck = gameData.deck;
      window.holdCards = gameData.holdCards;
      window.maxDeckCards = gameData.maxDeckCards;
      window.maxHoldCards = gameData.maxHoldCards;
      window.maxPermanentCards = gameData.maxPermanentCards;
      window.round = gameData.round;
      window.isGameStart = gameData.isGameStart;
      window.playerHp = gameData.playerHp;
      
      console.log('ゲームデータを読み込みました。');
      return true; // 読み込み成功
    } catch (e) {
      console.error('ゲームデータの読み込みに失敗しました。', e);
      return false; // パース失敗
    }
  }
  console.log('保存されたデータがありません。');
  return false; // 保存データなし
}

export function isContinueGame() {
  // Topで「続きから」ボタンを表示するかどうかをjudge!
  const savedData = localStorage.getItem('gameData');

  if (!savedData) {
    return null;
  }

  try {
    // JSON文字列をオブジェクトにパースし、その結果を返す
    const gameData = JSON.parse(savedData);
    return gameData;
  } catch (e) {
    console.error('ゲームデータの読み込み（パース）に失敗しました。', e);
    // 失敗した場合もnullを返す
    return null;
  }
}