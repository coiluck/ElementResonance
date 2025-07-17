import { stopMusic,playSoundEffect } from './music.js';

export function endGame(isClear) {
  // 背景音楽を停止
  stopMusic(3);
  // ゲーム終了
  if (isClear) {
    playSoundEffect("clear");
    // localstorageをクリア
    localStorage.clear();
    // modal-endを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.classList.remove('fade-in');
      modal.classList.add('fade-out')
    });
    setTimeout(function() {
      document.querySelectorAll('.modal').forEach(function(modal) {
        modal.style.display = 'none';
      });
      document.getElementById('modal-end').classList.remove('fade-out');
      document.getElementById('modal-end').style.display = 'block';
      document.getElementById('modal-end').classList.add('fade-in');
    }, 500);
    // アニメーション
    AnimationOfResultModal(isClear);
  } else {
    console.log("fail");
    // localstorageをクリア
    localStorage.clear();
    // 背景を赤黒い色に
    const modalEndOverlay = document.createElement('div');
    modalEndOverlay.classList.add('modal-end-overlay');
    document.getElementById('modal-end').appendChild(modalEndOverlay);
    // modal-endを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.classList.remove('fade-in');
      modal.classList.add('fade-out')
    });
    setTimeout(function() {
      document.querySelectorAll('.modal').forEach(function(modal) {
        modal.style.display = 'none';
      });
      document.getElementById('modal-end').classList.remove('fade-out');
      document.getElementById('modal-end').style.display = 'block';
      document.getElementById('modal-end').classList.add('fade-in');
    }, 500);
    // アニメーション
    AnimationOfResultModal(isClear);
  }
}

// result用のアニメーション
async function AnimationOfResultModal(isClear) {
  const imgWrap = document.querySelector('.img-wrap');
  const lineContainer = document.querySelector('.line-container');
  const lines = document.querySelectorAll('.line');

  // 画像アニメーションを実行
  imgWrap.classList.remove('no-display');
  imgWrap.classList.remove('animate');
  void imgWrap.offsetWidth;
  imgWrap.classList.add('animate');
  // タイトル変更
  if (isClear) {
    document.getElementById('end-title').textContent = 'Game Clear';
    document.getElementById('end-subtext').innerHTML = subtextContent.clear;
  } else {
    document.getElementById('end-title').textContent = 'Game Over';
    document.getElementById('end-subtext').innerHTML = subtextContent.fail;
  }
  // json
  const response = await fetch('cards.json');
  const cardsData = await response.json();
  // 少し待ってから線を伸ばす（画像アニメ完了後）
  setTimeout(() => {
    // 個別の線のアニメーション
    lines.forEach(line => {
      line.classList.remove('animate');
      void line.offsetWidth;
      line.classList.add('animate');
    });
    // 1.5秒後に位置を上に移動
    setTimeout(() => {
      imgWrap.style.top = '10%';
      lineContainer.style.top = '10%';
      // アニメーション完了後の表示処理
      setTimeout(() => {
        const title = document.getElementById('end-title');
        const subtext = document.getElementById('end-subtext');
        const deckListContainer = document.getElementById('end-deck-list-container');
        const button = document.getElementById('end-button');
        let delay = 0;
        // タイトル表示
        setTimeout(() => {
          title.classList.remove('no-display');
          title.classList.add("fade-in");
        }, delay);
        delay += 200;
        // サブテキスト表示
        setTimeout(() => {
          subtext.classList.remove('no-display');
          subtext.classList.add("fade-in");
        }, delay);
        delay += 200;
        // デッキリスト表示
        window.deck.forEach((card, index) => {
          if (index === 0) {
            deckListContainer.classList.remove('no-display');
            deckListContainer.classList.add('fade-in');
            // 最終的なコンテナの高さを計算
            const finalContainerHeight = heightCalc();
            deckListContainer.style.height = `${finalContainerHeight}px`;
          }
          setTimeout(() => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('end-deck-item');
            cardElement.classList.add('fade-in');
            deckListContainer.appendChild(cardElement);
            const cardImage = document.createElement('img');
            const cardData = cardsData.find(item => item.id === card);
            cardImage.src = cardData.image;
            cardElement.appendChild(cardImage);
          }, delay + index * 200);
        });
        // 最後にボタン表示（リストの後）
        setTimeout(() => {
          button.classList.remove('no-display');
          button.classList.add("fade-in");
        }, delay + window.deck.length * 200 + 200);
      }, 1000); // 上移動完了からさらに 1秒後
    }, 750);
  }, 750); // 最初の画像アニメ開始から 750ms
}

// subtextの内容
const subtextContent = {
  clear: "<span>あなたはこれらのカードと戦い抜いた。</span><span>勝利はあなたのものだった。</span>",
  fail: "<span>敗北はあなたの運命だった。</span><span>あなたは道半ばで倒れた。</span>"
}

// コンテナの高さを計算
function heightCalc() {
  const windowWidth = window.innerWidth;

  // 計算に必要な定数をCSSから定義
  const containerWidthPercentage = 0.8; // コンテナの幅 (80%)
  const gap = 10;                       // gap
  const padding = 10;                   // padding
  let minCardWidth = 90;                // カードの最小幅: minmax(90px, 1fr)
  if (windowWidth < 480) {
    minCardWidth = 60;
  }
  const cardAspectRatio = 7 / 5;        // カードのアスペクト比 (高さ / 幅)

  // ステップ1: グリッドが使用できるコンテナ内部の幅を計算
  const containerTotalWidth = windowWidth * containerWidthPercentage;
  const containerContentWidth = containerTotalWidth - (padding * 2);

  // ステップ2: 1行に何枚のカードが入るかを計算
  const cardsPerRow = Math.floor((containerContentWidth + gap) / (minCardWidth + gap));

  // ステップ3: 実際のカードの幅を計算
  const totalGapWidthInRow = (cardsPerRow - 1) * gap;
  const cardWidth = (containerContentWidth - totalGapWidthInRow) / cardsPerRow;
  
  // ステップ4: アスペクト比を使ってカードの高さを計算
  const cardHeight = cardWidth * cardAspectRatio;

  // ステップ5: 全カードを並べるのに何行必要かを計算
  const totalCards = window.deck.length;
  const numberOfRows = Math.ceil(totalCards / cardsPerRow);

  // ステップ6: コンテナの最終的な高さを計算
  // 基本の高さ計算
  const totalRowsHeight = numberOfRows * cardHeight;
  const totalGapsHeight = (numberOfRows - 1) * gap;
  const totalPaddingHeight = padding * 2;

  let finalContainerHeight = totalRowsHeight + totalGapsHeight + totalPaddingHeight;

  // 【修正1】行数が3行以上の場合の補正
  // CSS Grid での実際のレンダリング時の微調整
  if (numberOfRows >= 3) {
    // 画面幅による補正係数
    let correctionFactor = 1.0;
    
    if (windowWidth < 480) {
      // 非常に小さい画面: より大きな補正が必要
      correctionFactor = 1.06;
    }
    
    finalContainerHeight *= correctionFactor;
  }

  // 【修正2】ブラウザの丸め処理に対応するため、小数点以下を切り上げ
  finalContainerHeight = Math.ceil(finalContainerHeight);

  console.log(`1行あたりのカード数: ${cardsPerRow}枚`);
  console.log(`カードの実際の幅: ${cardWidth.toFixed(2)}px`);
  console.log(`カードの高さ: ${cardHeight.toFixed(2)}px`);
  console.log(`行数: ${numberOfRows}行`);
  console.log(`補正後の高さ: ${finalContainerHeight.toFixed(2)}px`);

  return finalContainerHeight;
}

// 画面リサイズ時のheightCalc呼び出し処理
let resizeTimeout;

window.addEventListener('resize', function() {
  // デバウンス処理（連続したリサイズイベントを制限）
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function() {
    const deckListContainer = document.getElementById('end-deck-list-container');
    
    // コンテナが存在し、表示されている場合のみ実行
    if (deckListContainer && deckListContainer.style.display !== 'none' && !deckListContainer.classList.contains('no-display')) {
      const newHeight = heightCalc();
      deckListContainer.style.height = `${newHeight}px`;
    }
  }, 100); // 100ms後に実行（頻繁な呼び出しを防ぐ）
});


import { toTop } from './top.js';

// Topへ戻る
document.getElementById('end-button').addEventListener('click', toTop);