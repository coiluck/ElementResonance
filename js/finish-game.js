import { stopMusic } from './music.js';
import { characterAnim } from './game-player-animation.js';
import { resultReward } from './result-reward.js';

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

  // resultで選択する報酬を用意
  resultReward();

  // ラウンドを更新
  window.round++;
  document.querySelectorAll('.middle-round-number').forEach(round => {
    round.textContent = `${window.round}`;
  });

  // プレイヤーのアニメーションを停止 // modal消えてからだな
  characterAnim.stop();

}