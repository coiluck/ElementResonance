// result-reward.js
import { playMusic, stopMusic } from './music.js';
import { characterAnim } from './game-player-animation.js';
import { playVictoryAnimation } from './win-animation.js';

async function changeMusic() {
  await stopMusic();
  playMusic("theme1");
}

import { saveData } from './save-data.js';

export async function finishGame() {
  window.playerHp = globalGameState.player.hp;
  console.log(`今のプレイヤーのHPは${window.playerHp}です`);
  window.isGameStart = false;
  saveData();

  // 勝利アニメーション
  playVictoryAnimation();
  // 少し待ってから音楽再生
  await new Promise(resolve => setTimeout(resolve, 400));
  playSoundEffect("clear");
  // 勝利アニメーションが終わるまで待つ
  await new Promise(resolve => setTimeout(resolve, 2100));

  // 背景音楽を停止
  changeMusic();

  // resultで選択する報酬を用意（これにはawaitをつけない）
  resultReward();

  // ラウンドを更新
  window.round++;
  document.querySelectorAll('.middle-round-number').forEach(round => {
    round.textContent = `${window.round}`;
  });

  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // resultモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-result').classList.remove('fade-out');
    document.getElementById('modal-result').style.display = 'block';
    document.getElementById('modal-result').classList.add('fade-in');
  }, 500);

  // プレイヤーのアニメーションを停止
  characterAnim.stop();
}

import { globalGameState } from './game-status.js';
import { message } from './message.js';
import { playSoundEffect } from './music.js';

let isRewardProcessing = false;

async function resultReward() {
  // 怖いから一応保存しておく
  const round = window.round;
  // 振り分けポイント
  const rewardPointArray = [2, 2, 5, 4, 4, 6, 5, 5];
  const rewardPoint = rewardPointArray[round - 1];
  // 自然属性
  const naturalAttribute = ['hollow', 'fog', 'lumina', 'daybreak', 'sand'];
  let rewardAttributeArray = [];
  for (let i = 0; i < parseInt(round / 6 + 2); i++) {
    // 2から3個
    const attribute1 = naturalAttribute[Math.floor(Math.random() * naturalAttribute.length)];
    let attribute2 = naturalAttribute[Math.floor(Math.random() * naturalAttribute.length)];
    // 重複チェック
    while (attribute1 === attribute2) {
      attribute2 = naturalAttribute[Math.floor(Math.random() * naturalAttribute.length)];
    }
    rewardAttributeArray.push([attribute1, attribute2]);
  }
  // カードタイプ
  const cardType = ['normal', 'combo', 'mark'];
  let rewardCardTypeArray = [];
  for (let i = 0; i < 2; i++) {
    // 2個
    rewardCardTypeArray.push(cardType[Math.floor(Math.random() * cardType.length)]);
  }
  // HPがMAXでないなら回復
  let rewardHp = null;
  if (globalGameState.player.hp < globalGameState.player.maxHp) {
    rewardHp = globalGameState.player.maxHp / 100 * 10; // 10%の回復
  }

  // ボスラウンドの場合の特殊報酬
  let deckLimitUp = 0;
  let maxHoldCardsUp = 0;
  if (round === 3) {
    // これでデッキ12、スロット3
    deckLimitUp = 2;
  } else if (round === 6) {
    // これでデッキ15、スロット4
    deckLimitUp = 3;
    maxHoldCardsUp = 1;
  }

  // すべてを同じ配列にまとめる
  const allRewards = [];

  // ポイントを追加
  allRewards.push({ type: 'point', value: rewardPoint });
  // 属性を追加
  rewardAttributeArray.forEach(pair => {
    allRewards.push({ type: 'attribute', value: pair });
  });
  // カードタイプを追加
  rewardCardTypeArray.forEach(type => {
    allRewards.push({ type: 'cardType', value: type });
  });
  // HP回復を追加
  if (rewardHp !== null) {
    allRewards.push({ type: 'hp', value: rewardHp });
  }

  // ボスラウンドなら特殊報酬を追加
  if (round === 3) {
    allRewards.push({ type: 'deckLimitUp', value: deckLimitUp });
  } else if (round === 6) {
    allRewards.push({ type: 'deckLimitUp', value: deckLimitUp });
    allRewards.push({ type: 'maxHoldCardsUp', value: maxHoldCardsUp });
  }

  // modalの表示を待つ
  await new Promise(resolve => setTimeout(resolve, 800));
  // DOMに追加 & 表示
  isRewardProcessing = true;
  await processRewards(allRewards);
  isRewardProcessing = false;
}

/* allRewardsの中はこんな感じ
[
  {
    "type": "point",
    "value": 2
  },
  {
    "type": "attribute",
    "value": [
      "lumina",
      "hollow"
    ]
  },
  {
    "type": "attribute",
    "value": [
      "sand",
      "daybreak"
    ]
  },
  {
    "type": "cardType",
    "value": "combo"
  },
  {
    "type": "cardType",
    "value": "normal"
  },
  {
    "type": "hp",
    "value": 3
  }
]
*/
async function processRewards(rewards) {
  for (const reward of rewards) {
    // コンテナ
    const el = document.createElement('div');
    el.classList.add('reward-item-container');
    el.classList.add('fade-in');
    document.querySelector('.reward-container').appendChild(el);

    // タイトル
    const textTitle = document.createElement('div');
    textTitle.classList.add('reward-item-text-title');
    el.appendChild(textTitle);

    // アイコン
    const iconEl = document.createElement('div');
    iconEl.classList.add('reward-item-icon');
    el.appendChild(iconEl);

    // 効果値
    const textValue = document.createElement('div');
    textValue.classList.add('reward-item-text-value');
    el.appendChild(textValue);

    // 場合分け（全部一気にやる）
    const attributeMapToJp = {
      'hollow': '虚',
      'fog': '霧',
      'lumina': '燐',
      'daybreak': '暁',
      'sand': '砂'
    };
    const cardTypeMapToJp = {
      'normal': '通常',
      'combo': 'コンボ',
      'mark': '刻印'
    };
    switch (reward.type) {
      case 'point':
        el.classList.add('reward-item-point');
        textTitle.textContent = 'レアリティ';
        iconEl.innerHTML = `<img src="./images/rarity.avif">`;
        textValue.textContent = `+${reward.value}`;
        break;
      case 'attribute':
        el.classList.add('reward-item-attribute');
        textTitle.textContent = '自然属性';
        iconEl.remove(); // アイコンは二つを専用のクラスで表示する
        textValue.remove(); // テキストは不要、ボタンにする
        // アイコン
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('reward-item-icon-attribute');
        el.appendChild(iconContainer);
        const icon1 = document.createElement('div');
        icon1.classList.add('reward-item-icon-attribute-1');
        icon1.dataset.attribute = reward.value[0];
        icon1.innerHTML = `<img src="./images/attribute_icon/${reward.value[0]}.avif" alt="${reward.value[0]}">`;
        iconContainer.appendChild(icon1);
        const icon2 = document.createElement('div');
        icon2.classList.add('reward-item-icon-attribute-2');
        icon2.dataset.attribute = reward.value[1];
        icon2.innerHTML = `<img src="./images/attribute_icon/${reward.value[1]}.avif" alt="${reward.value[1]}">`;
        iconContainer.appendChild(icon2);
        // 選択肢ボタン
        const choiceContainer = document.createElement('div');
        choiceContainer.classList.add('reward-item-attribute-option-container');
        el.appendChild(choiceContainer);
        const button1 = document.createElement('div');
        button1.classList.add('reward-item-attribute-option');
        button1.textContent = `${attributeMapToJp[reward.value[0]]}属性`;
        choiceContainer.appendChild(button1);
        const button2 = document.createElement('div');
        button2.classList.add('reward-item-attribute-option');
        button2.textContent = `${attributeMapToJp[reward.value[1]]}属性`;
        choiceContainer.appendChild(button2);
        button1.addEventListener('click', () => {
          if (button2.classList.contains('reward-item-attribute-option-selected')) {
            button2.classList.remove('reward-item-attribute-option-selected');
          }
          button1.classList.add('reward-item-attribute-option-selected');
        });
        button2.addEventListener('click', () => {
          if (button1.classList.contains('reward-item-attribute-option-selected')) {
            button1.classList.remove('reward-item-attribute-option-selected');
          }
          button2.classList.add('reward-item-attribute-option-selected');
        });
        break;
      case 'cardType':
        el.classList.add('reward-item-cardType');
        textTitle.textContent = 'カードタイプ';
        iconEl.innerHTML = `<img src="./images/cardtype.avif">`;
        textValue.textContent = `${cardTypeMapToJp[reward.value]}カード`;
        break;
      case 'hp':
        el.classList.add('reward-item-hp');
        textTitle.textContent = '回復';
        iconEl.innerHTML = `<img src="./images/hp.avif">`;
        textValue.textContent = `HP +${reward.value}`;
        break;
      case 'deckLimitUp':
        el.classList.add('reward-item-deckLimitUp');
        textTitle.textContent = 'デッキ上限';
        iconEl.innerHTML = `<img src="./images/deck_limit.avif">`;
        textValue.textContent = `+${reward.value}`;
        break;
      case 'maxHoldCardsUp':
        el.classList.add('reward-item-maxHoldCardsUp');
        textTitle.textContent = 'スロット上限';
        iconEl.innerHTML = `<img src="./images/max_hold_cards.avif">`;
        textValue.textContent = `+${reward.value}`;
        break;
    }

    // ボタン（属性選択のボタンより下にするために最後につける）
    const button = document.createElement('button');
    button.classList.add('reward-item-button');
    button.textContent = '獲得';
    el.appendChild(button);

    // イベントリスナー
    button.addEventListener('click', () => {
      // 何度も押せなくする
      button.disabled = true;
      // 獲得
      switch (reward.type) {
        case 'point':
          window.essence.rarity += reward.value;
          break;

        case 'attribute':
          // 選択された属性の要素を取得
          const selectedButton = el.querySelector('.reward-item-attribute-option-selected');
          if (selectedButton) {
            const selectedAttributeJp = selectedButton.textContent.replace('属性', '');
            // window.essence.attributes内の対応するオブジェクトを探す
            const attributeToUpdate = window.essence.attributes.find(a => a.attribute === selectedAttributeJp);
            if (attributeToUpdate) {
              attributeToUpdate.count++;
            }
          } else {
            // どちらも選択されていない
            message('warning', '属性を選択してください');
            playSoundEffect("disable");
            button.disabled = false;
            return;
          }
          break;

        case 'cardType':
          const cardTypeJp = cardTypeMapToJp[reward.value];
          // window.essence.cardTypes内の対応するオブジェクトを探す
          const cardTypeToUpdate = window.essence.cardTypes.find(c => c.type === cardTypeJp);
          if (cardTypeToUpdate) {
            cardTypeToUpdate.count++;
          }
          break;

        case 'hp':
          window.playerHp += reward.value;
          if (window.playerHp > 30) {
            window.playerHp = 30;
          }
          break;

        case 'deckLimitUp':
          window.maxDeckCards += reward.value;
          break;
        case 'maxHoldCardsUp':
          window.maxHoldCards += reward.value;
          break;
      }
      // データを保存
      saveData();

      // 消去
      el.classList.remove('fade-in');
      el.classList.add('fade-out');
      el.style.transition = 'transform 0.4s ease';
      el.style.transform = 'scale(0.9)';
      // 消えてから実行
      setTimeout(() => {
        el.remove();
        // 追加アニメーション中は実行しない
        if (isRewardProcessing) {
          return;
        }
        const allRewardItems = document.querySelectorAll('.reward-item-container');
        if (allRewardItems.length === 0) {
          // すべてのモーダルを閉じる
          document.querySelectorAll('.modal').forEach(function(modal) {
            modal.classList.remove('fade-in');
            modal.classList.add('fade-out')
          });
          setTimeout(function() {
            // middleモーダルを表示
            document.querySelectorAll('.modal').forEach(function(modal) {
              modal.style.display = 'none';
            });
            document.getElementById('modal-game-middle').classList.remove('fade-out');
            document.getElementById('modal-game-middle').style.display = 'block';
            document.getElementById('modal-game-middle').classList.add('fade-in');
          }, 500);
        }
      }, 400);
    });

    // 次がまだあるなら待機時間
    if (rewards.indexOf(reward) < rewards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
