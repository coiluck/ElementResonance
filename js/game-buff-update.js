// game-buff-update.js
import { globalGameState } from './game-status.js';

export function updateBuff(target, buffName, value) {
  // globalGameState の値を更新する
  if (globalGameState[target] && globalGameState[target].buff[buffName] !== undefined) {
    if (buffName.endsWith("-mark")) {
      // ここは刻印
      if (globalGameState[target].buff[buffName] + value >= 3) {
        // 刻印の上限を超えない
        globalGameState[target].buff[buffName] = 3;
      } else if (globalGameState[target].buff[buffName] + value <= 0) {
        // 刻印の下限を超えない
        globalGameState[target].buff[buffName] = 0;
      } else {
        // 普通に足し算
        globalGameState[target].buff[buffName] += value;
      }
    } else if (buffName === "burn-turn") {
      // ここは聖焔の再誕
      // 呼び出されるのは追加時とstart-game.jsのsetUpNextTurn()内での残りターン更新のみ
      if (value === 3) {
        // 発動時なのでturnを3にセット
        globalGameState[target].buff[buffName] = value;
      } else {
        // ターン減算（valueには-1を入れる）
        globalGameState[target].buff[buffName] += value;
        // 値が負にならないように調整
        if (globalGameState[target].buff[buffName] < 0) {
          globalGameState[target].buff[buffName] = 0;
        }
      }
    } else if (buffName === "damage-reduction") {
      // ここはダメージ軽減
      globalGameState[target].buff[buffName] += value;
    } else {
      // ここはshield
      globalGameState[target].buff[buffName] += value;
    }
    // ログ
    console.log(`Updated ${target}'s ${buffName} to ${value}`);
    console.log(globalGameState);
  } else {
    console.error(`Invalid target or buffName: ${target}, ${buffName}`);
    return;
  }
  // DOMに反映
  renderBuffs();
}

import { buffDescriptions } from './game-buff-descriptions.js';

export function renderBuffs() {
  // ページに一つだけのツールチップ要素を取得（なければ作成）
  const tooltip = document.getElementById('game-buff-tooltip') || createTooltipElement();

  const targets = [
    // プレイヤーと敵の情報
    {
      selector: '.game-main-characters-player-status-buff',
      buffs: globalGameState.player.buff,
      triggers: null
    },
    {
      selector: '.game-main-characters-enemy-status-buff',
      buffs: globalGameState.enemy.buff,
      triggers: globalGameState.enemy.triggers
    }
  ];

  for (const target of targets) {
    const buffContainer = document.querySelector(target.selector);
    if (!buffContainer) {
      console.error(`Error: Buff container element not found with selector: ${target.selector}`);
      continue;
    }

    buffContainer.innerHTML = ''; // コンテナをクリア

    for (const [buffName, buffValue] of Object.entries(target.buffs)) {
      let icon = null;
      // triggerは後で
      if (buffName === 'trigger') {
        continue;
      }
      // 通常のバフ
      else if (typeof buffValue === 'number' && buffValue > 0) {
        icon = document.createElement('div');
        icon.className = `game-buff-${buffName}`;
        // "-mark"で終わる場合
        if (buffName.endsWith('-mark')) {
          icon.classList.add('game-buff-mark-icon');
        }
        // 数値を表示するためのスタイル
        const number = document.createElement('div');
        number.className = 'game-buff-number';
        number.textContent = buffValue;
        icon.appendChild(number);
      }
      // アイコンが生成された場合のみ、DOMへの追加とイベントリスナーの設定を行う
      if (icon) {
        // 説明文のイベントリスナー
        addTooltipEventListeners(icon, buffName, tooltip);
        buffContainer.appendChild(icon);
      }
    }

    // triggerはここで
    if (target.triggers && Array.isArray(target.triggers)) {
      for (const trigger of target.triggers) {
        const icon = document.createElement('div');
        icon.className = 'game-buff-trigger';

        // データ属性に個別の説明文を設定
        icon.dataset.description = trigger.description;

        // イベントリスナー
        addTooltipEventListeners(icon, 'trigger', tooltip);
        buffContainer.appendChild(icon);
      }
    }
  }
}


// ページに説明枠を追加
export function createTooltipElement() {
  const tooltip = document.createElement('div');
  tooltip.id = 'game-buff-tooltip';
  tooltip.className = 'buff-tooltip';
  document.body.appendChild(tooltip);
  return tooltip;
}
export function addTooltipEventListeners(iconElement, buffName, tooltipElement) {
  const showTooltip = (event) => {
    // アイコンの位置を基準に
    const iconRect = iconElement.getBoundingClientRect();
    // 説明文を取得
    const description = iconElement.dataset.description || buffDescriptions[buffName] || '説明が見つかりません。';
    // 説明文を表示
    tooltipElement.textContent = description;
    tooltipElement.style.display = 'block';
    // 説明をアイコンの上に配置
    const topPos = iconRect.top - tooltipElement.offsetHeight - 5; // 5pxのマージン
    const leftPos = iconRect.left + (iconRect.width / 2) - (tooltipElement.offsetWidth / 2);
    
    tooltipElement.style.top = `${topPos}px`;
    tooltipElement.style.left = `${leftPos}px`;
  };
  const hideTooltip = () => {
    tooltipElement.style.display = 'none';
  };
  // イベントリスナーを設定
  iconElement.addEventListener('mouseover', showTooltip);
  iconElement.addEventListener('click', showTooltip);
  iconElement.addEventListener('mouseout', hideTooltip);
}
