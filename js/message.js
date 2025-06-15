let messageCounter = 0;

// 時間経過でメッセージを削除
function removeMessageElement(el) {
  if (!el) return;
  // すでに削除中の場合は何もしない
  if (el.classList.contains('is-removing')) {
    return;
  }
  el.classList.add('is-removing');
  el.addEventListener('transitionend', () => {
    el.remove();
  }, { once: true });
}

// 引数として指定できるのは
// type: success, info, warning, cautionのいずれか
// text: メッセージ内容
// duration: 3000ms = 3秒（デフォルト）、infinity = 無限
export function message(type, text, duration = 3000) {
  const box = document.getElementById('message-box');
  if (!box) {
    console.error('Error: Element with id "message-box" not found.');
    return null;
  }

  const id = `message-${++messageCounter}`;
  
  let emoji;
  switch(type) {
    case 'success': emoji = '✅'; break;
    case 'info':    emoji = 'ℹ️'; break;
    case 'warning': emoji = '⚠️'; break;
    case 'caution': emoji = '⚠️'; break;
    default: emoji = '❗';
  }
    
  const el = document.createElement('div');
  el.className = 'messageBox-message';
  el.id = id;
  
  const progressBarHTML = duration !== 'infinity' ? `
    <div class="messageBox-progress">
        <div class="messageBox-fill"></div>
    </div>
  ` : '';

  el.innerHTML = `
    <div class="messageBox-content">
      ${emoji} ${text}
    </div>
    ${progressBarHTML}
  `;
    
  box.appendChild(el);
    
  const fillEl = el.querySelector('.messageBox-fill');
  let removeTimeout = null;

  requestAnimationFrame(() => {
    el.classList.add('is-visible');
  });

  if (duration !== 'infinity' && typeof duration === 'number') {
    removeTimeout = setTimeout(() => {
      removeMessageElement(el);
    }, duration);

    if (fillEl) {
      setTimeout(() => {
        fillEl.style.transition = `width ${duration / 1000}s linear`;
        fillEl.style.width = '0%';
      }, 100);
    }
  }

  el.onclick = () => {
    if (removeTimeout) {
      clearTimeout(removeTimeout);
    }
    removeMessageElement(el);
  };
  
  return id;
}


export function deleteMessage() {
  // すべてのメッセージを削除
  const box = document.getElementById('message-box');
  const messages = box.querySelectorAll('.messageBox-message');
  messages.forEach(msgEl => {
    removeMessageElement(msgEl);
  });
}