document.querySelector('.middle-synthesis').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 表示の更新
  initMiddleSynthesis();
  // モーダルを表示
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle-synthesis').classList.remove('fade-out');
    document.getElementById('modal-game-middle-synthesis').style.display = 'block';
    document.getElementById('modal-game-middle-synthesis').classList.add('fade-in');
  }, 500);
});

document.getElementById('middleSynthesis-close-button').addEventListener('click', function() {
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

// 所持状況に応じて表示を変える
function initMiddleSynthesis() {
  // 選択状態をリセット
  selectedSynthesisOptions.attribute = null;
  selectedSynthesisOptions.cardType = null;
  selectedSynthesisOptions.rarity = null;
  previewCard = null;
  // 画面も
  document.querySelectorAll('.middleSynthesis-selected, .middleSynthesis-selected-img, .middleSynthesis-unselectable').forEach(el => {
    el.classList.remove('middleSynthesis-selected', 'middleSynthesis-selected-img', 'middleSynthesis-unselectable');
  });
  // プレビューをリセット
  document.querySelector('.middleSynthesis-preview img').src = './images/synthesis-text-preview.avif';
  document.querySelector('.middleSynthesis-confirm').style.visibility = 'hidden';
  // カードタイプ
  const cardTypeElements = document.querySelectorAll('.middleSynthesis-cardtype-item');
  cardTypeElements.forEach(element => {
    const typeName = element.textContent.trim();
    const cardTypeData = window.essence.cardTypes.find(card => card.type === typeName);

    // 所持数を表示し、所持数が0なら選択不可
    if (cardTypeData && cardTypeData.count > 0) {
      element.style.setProperty('--after-content', `'所持: ${cardTypeData.count}'`);
    } else {
      element.style.setProperty('--after-content', `'所持: 0'`);
      element.classList.add('middleSynthesis-unselectable');
    }
  });

  // レアリティ
  const userRarity = window.essence.rarity;
  document.getElementById('middleSynthesis-rarity-label').style.setProperty('--after-content', `'所持: ${userRarity}'`);
  document.querySelectorAll('.middleSynthesis-rarity-item').forEach(element => {
    const requiredRarity = parseInt(element.textContent.trim(), 10);
    // 必要なレアリティより所持レアリティが低い場合は選択不可
    if (userRarity < requiredRarity) {
      element.classList.add('middleSynthesis-unselectable');
    }
  });

  // 属性
  const attributeItems = document.querySelectorAll('.middleSynthesis-attribute-item');
  attributeItems.forEach(item => {
    const pElement = item.querySelector('p');
    if (!pElement) return;
    const attributeName = pElement.textContent.trim();
    const attributeData = window.essence.attributes.find(attr => attr.attribute === attributeName);

    // 所持数を表示し、所持数が0なら選択不可
    if (attributeData && attributeData.count > 0) {
      pElement.style.setProperty('--after-content', `'所持: ${attributeData.count}'`);
    } else {
      pElement.style.setProperty('--after-content', `'所持: 0'`);
      item.classList.add('middleSynthesis-unselectable');
    }
  });

  // 各カテゴリに選択機能を追加
  setupItemSelection('.middleSynthesis-attribute-item', 'attribute', '属性');
  setupItemSelection('.middleSynthesis-cardtype-item', 'cardType', 'カードタイプ');
  setupItemSelection('.middleSynthesis-rarity-item', 'rarity', 'レアリティ');
}

// 今選択されているもの
let selectedSynthesisOptions = {
  attribute: null,
  cardType: null,
  rarity: null,
};

function setupItemSelection(itemsSelector, category, categoryNameJP) {
  const items = document.querySelectorAll(itemsSelector);

  items.forEach(item => {
    // 選択不可クラスがついている場合は、イベントリスナを設定しない
    if (item.classList.contains('middleSynthesis-unselectable')) {
      return;
    }
    item.addEventListener('click', (event) => {
      const currentItem = event.currentTarget;
      // 同じカテゴリ内のすべての選択クラスを削除
      if (category === 'attribute') {
        // 属性の場合はimgタグから専用クラスを削除
        items.forEach(el => {
          const img = el.querySelector('img');
          if (img) img.classList.remove('middleSynthesis-selected-img');
        });
      } else {
        // 属性以外の場合は今まで通り
        items.forEach(el => el.classList.remove('middleSynthesis-selected'));
      }
      // 選択クラスを追加
      if (category === 'attribute') {
        // 属性の場合はimgタグに専用クラスを追加
        const img = currentItem.querySelector('img');
        if (img) img.classList.add('middleSynthesis-selected-img');
      } else {
        // 属性以外の場合は自身にクラスを追加
        currentItem.classList.add('middleSynthesis-selected');
      }
      // 値を取得
      const selectedValue = category === 'attribute' ? currentItem.dataset.attribute : currentItem.textContent.trim();
      // 選択状態を保持する変数を更新
      selectedSynthesisOptions[category] = selectedValue;

      console.log(`${selectedValue}${categoryNameJP}がクリックされました`);

      // 三種類選択済みの場合はpreviewを更新
      if (selectedSynthesisOptions.attribute && selectedSynthesisOptions.cardType && selectedSynthesisOptions.rarity) {
        updatePreview();
        document.querySelector('.middleSynthesis-confirm').style.visibility = 'visible';
        // previewCardはupdatePreview関数で更新
      } else {
        document.querySelector('.middleSynthesis-preview img').src = './images/synthesis-text-preview.avif';
        document.querySelector('.middleSynthesis-confirm').style.visibility = 'hidden';
        previewCard = null;
      }
    });
  });
}

// 「対応化」
const attributeMapToEng = {
  '虚': 'hollow',
  '霧': 'fog',
  '燐': 'lumina',
  '暁': 'daybreak',
  '砂': 'sand'
};
const cardTypeMapToEng = {
  '通常': 'normal',
  'コンボ': 'combo',
  '刻印': 'mark'
};
let previewCard = null;

function updatePreview() {
  // 現在選択されているオプションを取得
  const { attribute, cardType, rarity } = selectedSynthesisOptions;
  // 検索用に値を変換する
  const searchElement = attributeMapToEng[attribute];
  const searchType = cardTypeMapToEng[cardType];
  const searchRarity = Number(rarity);
  // JSONデータを取得して、条件に合うものを探す
  fetch('cards.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(cards => {
      // 3つの条件すべてに一致するカードを検索
      const foundCard = cards.find(card =>
        card.element === searchElement &&
        card.type === searchType &&
        card.rarity === searchRarity
      );
      // 結果をコンソールに出力
      if (foundCard) {
        document.querySelector('.middleSynthesis-preview img').src = foundCard.image
        previewCard = foundCard;
      } else {
        console.log('条件に一致するカードは見つかりませんでした。');
      }
    })
    .catch(error => {
      console.error('カードデータの取得または検索中にエラーが発生しました:', error);
    });
}

import { saveData } from './save-data.js';

// 合成ボタンを押したら
document.querySelector('.middleSynthesis-confirm').addEventListener('click', function() {
  if (!previewCard) {
    alert('不具合が発生しました。一度開始画面に戻ってから再度開いてください。');
    return;
  }
  // カードをwindow.cardsに追加
  if (!Array.isArray(window.cards)) {
    window.cards = [];
  }
  window.cards.push(previewCard.id);
  window.cards.sort((a, b) => a - b);
  console.log(`カードID: ${previewCard.id} を所持カードに追加しました。`);
  // カードを表示
  showCard();
  // 属性を消費
  const attrToUpdate = window.essence.attributes.find(a => a.attribute === selectedSynthesisOptions.attribute);
  if (attrToUpdate) attrToUpdate.count--;
  // カードタイプを消費
  const typeToUpdate = window.essence.cardTypes.find(t => t.type === selectedSynthesisOptions.cardType);
  if (typeToUpdate) typeToUpdate.count--;
  // レアリティを消費
  const rarityToConsume = parseInt(selectedSynthesisOptions.rarity, 10);
  window.essence.rarity -= rarityToConsume;
  // 表示を更新
  initMiddleSynthesis();
  // データを保存
  saveData();
});

function showCard() {
  const card = document.createElement('div');
  card.className = 'middleSynthesis-card';
  card.innerHTML = `<img src="${previewCard.image}">`;
  document.getElementById('modal-game-middle-synthesis').appendChild(card);
  setTimeout(() => {
    card.classList.add('middleSynthesis-show');
  }, 50);
  setTimeout(() => {
    card.classList.add('middleSynthesis-hide');
    setTimeout(() => {
      card.remove();
    }, 800);
  }, 2000);
}