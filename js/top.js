document.addEventListener('DOMContentLoaded', function() {
  // 前回のデータがあるなら「続きから」を表示
  const lastGameData = localStorage.getItem('lastGameData');
  if (!lastGameData) {
    console.log('前回のデータがありません');
  }
});

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

// topへ戻るのはこの関数
document.getElementById('gallery-close-button').addEventListener('click', toTop);
document.getElementById('rules-close-button').addEventListener('click', toTop);
document.getElementById('middle-close-button').addEventListener('click', toTop);

function toTop() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
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