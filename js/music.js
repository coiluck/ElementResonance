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
export function stopMusic(fadeDuration = 1.0) {
  return new Promise((resolve) => {
    if (bgmAudio) {
      const fadeSteps = 30;
      const stepTime = (fadeDuration * 1000) / fadeSteps;
      const volumeStep = bgmAudio.volume / fadeSteps;
      const fadeInterval = setInterval(() => {
        if (bgmAudio.volume - volumeStep > 0) {
          bgmAudio.volume -= volumeStep;
        } else {
          bgmAudio.volume = 0;
          bgmAudio.pause();
          bgmAudio = null;
          clearInterval(fadeInterval);
          resolve();
        }
      }, stepTime);
    } else {
      resolve();
    }
  });
}

// 効果音の再生
export function playSoundEffect(sound) {
  let se;
  if (sound === "click1" || sound === "click2" || sound === "back") {
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
  se.play();
}