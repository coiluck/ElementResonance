// win-animation.js
const VICTORY_CONFIG = {
  parentElement: document.getElementById('modal-game'), // アニメーションを追加する親要素
  animationDuration: 2500, // アニメーション時間
  victoryText: 'VICTORY', // アニメーションのテキスト
  particleCount: 20 // パーティクルの数
};

let isVictoryAnimating = false;
let victoryAnimationTimeout = null;

export function playVictoryAnimation() {
  if (isVictoryAnimating) return;
  
  isVictoryAnimating = true;
  
  // 既存のアニメーションをクリア
  clearVictoryAnimation();
  
  // アニメーションエリアを作成
  const animationArea = document.createElement('div');
  animationArea.className = 'victory-animation-area';
  animationArea.id = 'victory-animation-area';
  
  // オーバーレイを作成
  const overlay = document.createElement('div');
  overlay.className = 'victory-overlay';
  overlay.id = 'victory-overlay';
  
  // 勝利テキストを作成
  const victoryText = document.createElement('div');
  victoryText.className = 'victory-text';
  victoryText.id = 'victory-text';
  victoryText.textContent = VICTORY_CONFIG.victoryText;
  
  // DOMに追加
  VICTORY_CONFIG.parentElement.appendChild(overlay);
  animationArea.appendChild(victoryText);
  VICTORY_CONFIG.parentElement.appendChild(animationArea);
  
  // パーティクルを作成
  createVictoryParticles(animationArea);
  
  // アニメーション開始
  requestAnimationFrame(() => {
      overlay.classList.add('animate');
      victoryText.classList.add('animate');
  });
  
  // アニメーション終了処理
  victoryAnimationTimeout = setTimeout(() => {
      clearVictoryAnimation();
      isVictoryAnimating = false;
  }, VICTORY_CONFIG.animationDuration);
}

function createVictoryParticles(container) {
  for (let i = 0; i < VICTORY_CONFIG.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'victory-particle';
      particle.style.left = (45 + Math.random() * 10) + '%';
      particle.style.top = (45 + Math.random() * 10) + '%';
      particle.style.animationDelay = Math.random() * 1.5 + 's';
      container.appendChild(particle);
      
      setTimeout(() => {
          particle.classList.add('animate');
      }, Math.random() * 800);
  }
}

function clearVictoryAnimation() {
  // アニメーション要素を削除
  const animationArea = document.getElementById('victory-animation-area');
  const overlay = document.getElementById('victory-overlay');
  
  if (animationArea) {
      animationArea.remove();
  }
  if (overlay) {
      overlay.remove();
  }
  
  // タイムアウトをクリア
  if (victoryAnimationTimeout) {
      clearTimeout(victoryAnimationTimeout);
      victoryAnimationTimeout = null;
  }
}