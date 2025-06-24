// game-status.js
const initialState = {
  player: {
    hp: 0,
    maxHp: 30,
    buff: [],
  },
  enemy: {
    hp: 0,
    maxHp: 0,
    buff: [],
  },
  turn: 1,
  log: [],
};

const globalGameState = structuredClone(initialState); // 初期状態でスタート

function resetGlobalState() {
  const freshState = structuredClone(initialState);
  Object.keys(freshState).forEach((key) => {
    globalGameState[key] = freshState[key];
  });
}

export { globalGameState, resetGlobalState };

/* 使用例

resetGlobalState(); // ← ゲーム開始時に呼ぶ

console.log(globalGameState.turn); // 1
globalGameState.turn += 1;
globalGameState.player.hp -= 10;
*/