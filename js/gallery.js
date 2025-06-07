let allCardsData = []; // 全カードデータを格納するグローバル変数

document.addEventListener('DOMContentLoaded', () => {
  // 拡大表示エリアの要素を取得
  const enlargedCardEffectText = document.getElementById('gallery-card-effect-text');

  // 属性の定義（英語と日本語の対応化<-言葉気持ち悪すぎる）
  const ATTRIBUTES = {
    'hollow': '虚',
    'fog': '霧',
    'lumina': '燐',
    'daybreak': '暁',
    'sand': '砂'
  };

  // 指定されたカードを右側の詳細エリアに拡大表示する関数
  function displayEnlargedCard(card) {
    const enlargedPlaceholder = document.querySelector('.gallery-enlarged-card-placeholder');
    const detailArea = document.querySelector('.gallery-card-detail-area');

    // カード画像の表示
    if (enlargedPlaceholder) {
      enlargedPlaceholder.innerHTML = ''; // 既存の内容をクリア
      const img = document.createElement('img');
      img.src = card.image;
      img.alt = card.name;
      enlargedPlaceholder.appendChild(img);
    } else {
      console.error('拡大カード表示用のプレースホルダーが見つかりません。');
    }

    // カード名の表示
    if (detailArea) {
      let titleElement = detailArea.querySelector('h3.enlarged-card-title-js');
      if (!titleElement) {
        titleElement = document.createElement('h3');
        titleElement.classList.add('enlarged-card-title-js');
        const effectsDiv = detailArea.querySelector('.gallery-card-effect');
        if (effectsDiv) {
          // カード効果エリアの先頭にタイトルを挿入
          effectsDiv.insertBefore(titleElement, effectsDiv.firstChild);
        } else {
          detailArea.appendChild(titleElement); // フォールバック
        }
      }
      titleElement.textContent = card.name;
    } else {
      console.error('カードタイトル表示用の詳細エリアが見つかりません。');
    }

    // カード効果テキストの表示
    if (enlargedCardEffectText) {
      enlargedCardEffectText.textContent = card.description;
    } else {
      console.error('カード効果テキスト要素が見つかりません。');
    }
  }

  // 全ての属性のカードをギャラリーに描画する関数
  function renderAllCards() {
    // 定義された各属性に対して描画処理を実行
    Object.entries(ATTRIBUTES).forEach(([elementName, japaneseName]) => {
      const attributePage = document.getElementById(`gallery-cards-${japaneseName}`);
      if (!attributePage) {
        console.error(`${japaneseName}属性のページが見つかりません`);
        return; // ループの次のイテレーションへ
      }

      // 対象属性のカードデータをフィルタリング
      const attributeCards = allCardsData.filter(card => card.element === elementName);
      
      const typesConfig = [
        { type: 'normal', selector: `#gallery-cards-${japaneseName} section:nth-child(1) .gallery-cards-grid .gallery-card-placeholder` },
        { type: 'combo',  selector: `#gallery-cards-${japaneseName} section:nth-child(2) .gallery-cards-grid .gallery-card-placeholder` },
        { type: 'mark',   selector: `#gallery-cards-${japaneseName} section:nth-child(3) .gallery-cards-grid .gallery-card-placeholder` }
      ];

      typesConfig.forEach(config => {
        const placeholders = attributePage.querySelectorAll(config.selector);
        const cardsOfType = attributeCards.filter(card => card.type === config.type);

        // カードIDでソートして、プレースホルダーの順序と一致させる
        cardsOfType.sort((a, b) => a.id - b.id);

        placeholders.forEach((placeholder, index) => {
          const cardData = cardsOfType[index];
          if (cardData) {
            placeholder.innerHTML = ''; // プレースホルダーのテキストをクリア
            
            const img = document.createElement('img');
            img.src = cardData.image;
            img.alt = cardData.name;
            
            // イベントリスナーの重複を避けるため、プレースホルダーをクローンして置き換える
            const newPlaceholder = placeholder.cloneNode(false);
            newPlaceholder.appendChild(img);
            newPlaceholder.addEventListener('click', () => displayEnlargedCard(cardData));
            placeholder.parentNode.replaceChild(newPlaceholder, placeholder);

          } else {
            // 対応するカードデータがない場合はプレースホルダーをクリアし、イベントリスナーも削除する
            placeholder.innerHTML = ''; 
            const newPlaceholder = placeholder.cloneNode(false);
            placeholder.parentNode.replaceChild(newPlaceholder, placeholder);
          }
        });
      });
    });
  }

  // JSONファイルからカードデータを取得
  fetch('cards.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTPエラー! ステータス: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      allCardsData = data;
      console.log('カードデータが正常に読み込まれました:', allCardsData.length, "枚のカード");
      
      // 全てのカードを描画
      renderAllCards();

      // 初期表示として「虚の通常タイプの1番」のカードを拡大表示する
      let firstHollowNormalCard = null;
      const hollowNormalCards = allCardsData.filter(card => card.element === 'hollow' && card.type === 'normal');
      if (hollowNormalCards.length > 0) {
        // IDでソートして最初のカードを確実に見つける
        hollowNormalCards.sort((a, b) => a.id - b.id);
        firstHollowNormalCard = hollowNormalCards[0];
      }

      if (firstHollowNormalCard) {
        displayEnlargedCard(firstHollowNormalCard);
      } else {
        console.log('デフォルトで表示するカード（虚の通常タイプ1番）が見つかりませんでした。');
      }
    })
    .catch(error => {
      console.error('カードデータの取得中にエラーが発生しました:', error);
    });

  // タブ切り替えのロジック
  const galleryTabs = document.querySelectorAll('.gallery-tab-button');
  const galleryContentWrapper = document.querySelector('.gallery-attribute-content-wrapper');

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 全てのタブからアクティブクラスを削除
      galleryTabs.forEach(t => t.classList.remove('gallery-active'));
      // クリックされたタブにアクティブクラスを追加
      tab.classList.add('gallery-active');

      const attributeIndex = parseInt(tab.dataset.attributeIndex, 10);
      if (galleryContentWrapper) {
        // コンテンツエリアを対応する位置にスライド
        galleryContentWrapper.style.transform = `translateX(-${attributeIndex * 100 / galleryTabs.length}%)`;
      }
    });
  });

  // Topへ戻ったらgalleryをリセット
  const resetButton = document.getElementById('gallery-close-button');
  if(resetButton){
    resetButton.addEventListener('click', function() {
      setTimeout(() => {
        // 選択中カードをリセットし、「虚の通常タイプの1番」のカードを再表示
        if (allCardsData && allCardsData.length > 0) {
          const hollowNormalCards = allCardsData.filter(card => card.element === 'hollow' && card.type === 'normal');
          if (hollowNormalCards.length > 0) {
            hollowNormalCards.sort((a, b) => a.id - b.id);
            displayEnlargedCard(hollowNormalCards[0]);
          } else {
            console.log('リセット用のデフォルトカードが見つかりませんでした。');
          }
        } else {
          console.log('カードデータが未読み込みのため、選択中カードをリセットできません。');
        }
        // タブ表示をリセットして「虚」タブをアクティブにする
        if (galleryTabs && galleryTabs.length > 0 && galleryContentWrapper) {
          galleryTabs.forEach(t => t.classList.remove('gallery-active'));
          if (galleryTabs[0]) {
            galleryTabs[0].classList.add('gallery-active');
            galleryContentWrapper.style.transform = `translateX(0%)`;
          }
        } else {
          console.log('タブ要素が見つからないため、タブをリセットできません。');
        }
      }, 500);
    });
  }
});