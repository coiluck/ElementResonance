// game-status.js
const initialState = {
  player: {
    hp: 0,
    maxHp: 30,
    buff: {
      "daybreak-mark": 0,
      "sand-mark": 0,
      "shield": 0,
      "burn-turn": 0
    },
  },
  enemy: {
    hp: 0,
    maxHp: 0,
    buff: {
      "hollow-mark": 0,
      "fog-mark": 0,
      "lumina-mark": 0,
      "shield": 0,
      "burn-turn": 0
    },
    triggers: null,
    damageReduction: 0,
  },
  turn: 1,
  log: [],
  wasTurnSkippedLastTurn: false,
};

const globalGameState = structuredClone(initialState); // 初期状態でスタート

function resetGlobalState() {
  const freshState = structuredClone(initialState);
  Object.keys(freshState).forEach((key) => {
    globalGameState[key] = freshState[key];
  });
}

export { globalGameState, resetGlobalState };