document.querySelector('.middle-synthesis').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  // 表示の更新
  initMiddleSynthesis();
  // モーダルを表示
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle-synthesis').classList.remove('fade-out');
    document.getElementById('modal-game-middle-synthesis').style.display = 'block';
    document.getElementById('modal-game-middle-synthesis').classList.add('fade-in');
  }, 500);
});

document.getElementById('middleSynthesis-close-button').addEventListener('click', function() {
  // すべてのモーダルを閉じる
  document.querySelectorAll('.modal').forEach(function(modal) {
    modal.classList.remove('fade-in');
    modal.classList.add('fade-out')
  });
  setTimeout(function() {
    // middleDeckモーダルを表示
    document.querySelectorAll('.modal').forEach(function(modal) {
      modal.style.display = 'none';
    });
    document.getElementById('modal-game-middle').classList.remove('fade-out');
    document.getElementById('modal-game-middle').style.display = 'block';
    document.getElementById('modal-game-middle').classList.add('fade-in');
  }, 500);
}); 

// 所持状況に応じて表示を変える
function initMiddleSynthesis() {
  console.log('aaa');
}

