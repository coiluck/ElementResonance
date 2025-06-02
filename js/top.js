document.addEventListener('DOMContentLoaded', function() {
  // 前回のデータがあるなら「続きから」を表示
  const lastGameData = localStorage.getItem('lastGameData');
  if (!lastGameData) {
    console.log('前回のデータがありません');
  }
});

// ボタンのクリックイベント
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
    document.getElementById('modal-gallery').classList.add('fade-in');
  }, 500);
});

