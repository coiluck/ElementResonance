export function endGame(isClear) {
  if (isClear) {
    console.log("clear");
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
    document.getElementById('end-subtext').textContent = subtextContent.clear;
  } else {
    document.getElementById('end-title').textContent = 'Game Over';
    document.getElementById('end-subtext').textContent = subtextContent.fail;
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
          button.classList.add("active");
        }, delay + window.deck.length * 200 + 200);
      }, 1000); // 上移動完了からさらに 1秒後
    }, 750);
  }, 750); // 最初の画像アニメ開始から 750ms
}

// subtextの内容
const subtextContent = {
  clear: "おめでとうございます！\nあなたはゲームをクリアしました！",
  fail: "あなたはゲームを失敗しました。\nもう一度挑戦してください。"
}

// コンテナの高さを計算
function heightCalc() {
  const windowWidth = window.innerWidth;

  // 計算に必要な定数をCSSから定義
  const containerWidthPercentage = 0.8; // コンテナの幅 (80%)
  const gap = 10;                       // gap
  const padding = 10;                     // padding
  const minCardWidth = 90;               // カードの最小幅: minmax(90px, 1fr)
  const cardAspectRatio = 7 / 5;        // カードのアスペクト比 (高さ / 幅)

  // ステップ1: グリッドが使用できるコンテナ内部の幅を計算
  const containerTotalWidth = windowWidth * containerWidthPercentage;
  const containerContentWidth = containerTotalWidth - (padding * 2);

  // ステップ2: 1行に何枚のカードが入るかを計算
  // (カードの最小幅 + ギャップ)が、コンテナ内部の幅にいくつ収まるか
  const cardsPerRow = Math.floor((containerContentWidth + gap) / (minCardWidth + gap));

  // ステップ3: 実際のカードの幅を計算
  // 1frによって幅が均等に分配されるため、ギャップを除いた領域をカード数で割る
  const totalGapWidthInRow = (cardsPerRow - 1) * gap;
  const cardWidth = (containerContentWidth - totalGapWidthInRow) / cardsPerRow;
  
  // ステップ4: アスペクト比を使ってカードの高さを計算
  const cardHeight = cardWidth * cardAspectRatio;

  // ステップ5: 全カードを並べるのに何行必要かを計算
  const totalCards = window.deck.length;
  const numberOfRows = Math.ceil(totalCards / cardsPerRow);

  // ステップ6: コンテナの最終的な高さを計算
  // (全行の高さ) + (行間のギャップの合計) + (上下のパディング)
  const totalRowsHeight = numberOfRows * cardHeight;
  const totalGapsHeight = (numberOfRows - 1) * gap;
  const totalPaddingHeight = padding * 2;

  const finalContainerHeight = totalRowsHeight + totalGapsHeight + totalPaddingHeight;

  console.log(`1行あたりのカード数: ${cardsPerRow}枚`);
  console.log(`カードの実際の幅: ${cardWidth.toFixed(2)}px`);
  console.log(`カードの高さ: ${cardHeight.toFixed(2)}px`);
  console.log(`行数: ${numberOfRows}行`);
  console.log(`コンテナの最終的な高さ: ${finalContainerHeight.toFixed(2)}px`);

  return finalContainerHeight;
}