// music.js
let bgmAudio = null;

// 背景音楽の再生・停止
export function playMusic(music, loop = true) {
  if (bgmAudio) {
    bgmAudio.pause();
    bgmAudio = null;
  }
  bgmAudio = new Audio(`./music/${music}.mp3`);
  bgmAudio.loop = loop;
  if (music === "theme2") {
    bgmAudio.volume = 0.2;
  } else {
    bgmAudio.volume = 0.4;
  }
  bgmAudio.play();
}
let fadeOutInterval = null; // setIntervalのIDを管理する変数
export function stopMusic(fadeDuration = 1.0) {
  return new Promise((resolve) => {
    // 既存のフェードアウト処理が進行中なら停止する
    if (fadeOutInterval) {
      clearInterval(fadeOutInterval);
    }

    // BGMが存在しない、または既に停止している場合は即座に処理を完了
    if (!bgmAudio || bgmAudio.paused) {
      if (bgmAudio) {
        bgmAudio = null;
      }
      resolve();
      return;
    }

    const fadeSteps = 30;
    const stepTime = (fadeDuration * 1000) / fadeSteps;
    const volumeStep = bgmAudio.volume / fadeSteps;

    // setIntervalのIDを保存する
    fadeOutInterval = setInterval(() => {
      // 念のため、各ステップでbgmAudioの存在を確認
      if (!bgmAudio) {
        clearInterval(fadeOutInterval);
        fadeOutInterval = null;
        resolve();
        return;
      }
      
      if (bgmAudio.volume > volumeStep) {
        bgmAudio.volume -= volumeStep;
      } else {
        bgmAudio.volume = 0;
        bgmAudio.pause();
        bgmAudio = null;
        clearInterval(fadeOutInterval);
        
        // 処理が完了したらIDをnullに戻す
        fadeOutInterval = null; 
        resolve();
      }
    }, stepTime);
  });
}

// 効果音の再生
export function playSoundEffect(sound) {
  let se;
  if (sound === "click1" || sound === "click2" || sound === "back" || sound === "clear") {
    se = new Audio(`./music/${sound}.wav`);
  } else {
    se = new Audio(`./music/${sound}.mp3`);
  }
  // switch音だけ小さいので調整
  if (sound === "switch") {
    se.volume = 1.0;
  } else if (sound === "button_special") {
    se.volume = 0.1;
  } else if (sound === "disable") {
    se.volume = 0.5;
  } else {
    se.volume = 0.8;
  }
  // buff音が遅くてダサいので調整
  if (sound === "buff") {
    se.playbackRate = 2.0;
  }
  if (sound === "metallic") {
    se.playbackRate = 0.7;
  }
  se.play();
}