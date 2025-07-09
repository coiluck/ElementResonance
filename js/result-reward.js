// result-reward.js
import { stopMusic } from './music.js';
import { playMusic } from './music.js';
import { characterAnim } from './game-player-animation.js';

async function changeMusic() {
  await stopMusic();
  playMusic("theme1");
}

export function finishGame() {
  console.log('finishGame');
  window.isGameStart = false;

  // 勝利アニメーションつけるべき？（面倒）

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

  // プレイヤーのアニメーションを停止 // modal消えてからだな
  characterAnim.stop();

}

import { globalGameState } from './game-status.js';

async function resultReward() {
  // 振り分けポイント
  const rewardPointArray = [2, 2, 5, 4, 4, 6, 5, 5];
  const rewardPoint = rewardPointArray[window.round - 1];
  // 自然属性
  const naturalAttribute = ['hollow', 'fog', 'lumina', 'daybreak', 'sand'];
  let rewardAttributeArray = [];
  for (let i = 0; i < parseInt(window.round / 6 + 2); i++) {
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
  if (globalGameState.player.hp < globalGameState.player.hpMax) {
    rewardHp = globalGameState.player.hpMax / 100 * 10; // 10%の回復
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

  // modalの表示を待つ
  await new Promise(resolve => setTimeout(resolve, 800));
  // DOMに追加 & 表示
  await processRewards(allRewards);
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
    document.querySelector('.reward-container').appendChild(el);

    // アイコン
    const iconEl = document.createElement('div');
    iconEl.classList.add('reward-item-icon');
    el.appendChild(iconEl);

    // テキスト
    const textTitle = document.createElement('div');
    textTitle.classList.add('reward-item-text-title');
    el.appendChild(textTitle);

    const textValue = document.createElement('div');
    textValue.classList.add('reward-item-value-text');
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
        textTitle.textContent = 'レアリティ';
        textValue.textContent = reward.value;
        break;
      case 'attribute':
        textTitle.textContent = '自然属性';
        textValue.textContent = reward.value.map(attr => attributeMapToJp[attr]).join(' ');
        iconEl.innerHTML = `<img src="./images/attribute_icon/${reward.value[0]}.avif" alt="${reward.value[0]}">`;
        break;
      case 'cardType':
        textTitle.textContent = 'カードタイプ';
        textValue.textContent = cardTypeMapToJp[reward.value];
        break;
      case 'hp':
        textTitle.textContent = '回復';
        textValue.textContent = reward.value;
        break;
    }

    // 次がまだあるなら待機時間
    if (rewards.indexOf(reward) < rewards.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}
