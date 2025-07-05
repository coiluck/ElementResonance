// game-process-enemy.js
let enemyHpNow = 0;
// このターン開始時の敵HP
export function setEnemyHpNow(hp) {
  enemyHpNow = hp;
}

import { globalGameState } from './game-status.js';

export async function processEnemyTurn() {
  // 敵のターン進行処理
  console.log('敵のターン進行処理');
  // 特殊行動か通常行動かを判別
}
