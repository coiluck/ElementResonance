import { isContinueGame } from './save-data.js';

document.addEventListener('DOMContentLoaded', isShowContinueButton);

export function isShowContinueButton () {
  // 前回のデータがあるなら「続きから」を表示
  const isContinue = isContinueGame();
  if (isContinue) {
    console.log('前回のデータがあります');
    if (isContinue.isGameStart || isContinue.round === 1) {
      document.querySelector('.top-continue-game-button').style.display = 'none';
    } else {
      document.querySelector('.top-continue-game-button').style.display = 'flex';
    }
  } else {
    console.log('前回のデータがありません');
    document.querySelector('.top-continue-game-button').style.display = 'none';
  }
}

// galleryへ
document.querySelector('.top-card-list-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // カード図鑑モーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-gallery').classList.remove('fade-out');
    document.getElementById('modal-gallery').style.display = 'block';
    // スクロールをリセット（表示されていないとダメみたい）
    document.querySelectorAll('.gallery-attribute-page').forEach(function(page) {
      page.scrollTop = 0;
    });
    document.getElementById('modal-gallery').classList.add('fade-in');
  }, 500);
});
// rulesへ
document.querySelector('.top-rules-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // rulesモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-rules').classList.remove('fade-out');
    document.getElementById('modal-rules').style.display = 'block';
    // スクロールをリセット（表示されていないとダメみたい）
    document.querySelector('.rules-container').scrollTop = 0;
    document.getElementById('modal-rules').classList.add('fade-in');
  }, 500);
});
// game開始
document.querySelector('.top-start-game-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // gameモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle').classList.remove('fade-out');
    document.getElementById('modal-game-middle').style.display = 'block';
    document.getElementById('modal-game-middle').classList.add('fade-in');
  }, 500);
});
document.querySelector('.top-continue-game-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // gameモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle').classList.remove('fade-out');
    document.getElementById('modal-game-middle').style.display = 'block';
    document.getElementById('modal-game-middle').classList.add('fade-in');
  }, 500);
});

// topへ戻るのはこの関数
document.getElementById('gallery-close-button').addEventListener('click', toTop);
document.getElementById('rules-close-button').addEventListener('click', toTop);
document.getElementById('middle-close-button').addEventListener('click', toTop);

export function toTop() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 「続きから」ボタンが必要か判定
  isShowContinueButton();

  setTimeout(function() {
    // Topモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-top').classList.remove('fade-out');
    document.getElementById('modal-top').style.display = 'block';
    document.getElementById('modal-top').classList.add('fade-in');
  }, 500);
};


import { playMusic, stopMusic, playSoundEffect } from './music.js';

// クリック音
const buttons = document.querySelectorAll('button');
// 各ボタンにイベントリスナーを追加
buttons.forEach(button => {
  const isExcluded =
    button.classList.contains('top-start-game-button') ||
    button.classList.contains('top-continue-game-button') ||
    button.id === 'middle-close-button' ||
    button.id === 'middle-game-start-button';
  if (!isExcluded) {
    button.addEventListener('click', () => {
      playSoundEffect("switch");
    });
  } else if (button.id === 'middle-game-start-button'){
    return; // ここはstart-game.jsで処理
  } else if (button.id === 'middle-close-button') {
    button.addEventListener('click', () => {
      playSoundEffect("disable");
      stopMusic();
    });
  } else {
    // 豪華な音
    button.addEventListener('click', () => {
      playSoundEffect("metallic");
      setTimeout(() => {
        playMusic("theme1");
      }, 300);
    });
  }
});