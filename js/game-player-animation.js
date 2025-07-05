export class CharacterAnimation {
  constructor() {
    this.currentFrame = 1;
    this.isPlaying = false;
    this.animationInterval = null;
    this.direction = 1;
    this.speed = 15; // フレーム/秒
      
    this.MIN_FRAME = 1;
    this.MAX_FRAME = 26;
      
    this.imageElement = document.querySelector('.game-main-characters-player-image img');
      
    if (!this.imageElement) {
      console.error('player image container not found');
      return;
    }
      
    this.updateFrame();
  }
  
  // フレーム更新
  updateFrame() {
    if (!window.isGameStart) return;
      
    this.imageElement.src = `./images/character_player/${this.currentFrame}.avif`;
  }
  
  // 次のフレームに進む
  nextFrame() {
    if (!window.isGameStart) {
      this.stop();
      return;
    }
      
    this.currentFrame += this.direction;
      
    // 範囲チェックと方向転換
    if (this.currentFrame >= this.MAX_FRAME) {
      this.currentFrame = this.MAX_FRAME;
      this.direction = -1;
    } else if (this.currentFrame <= this.MIN_FRAME) {
      this.currentFrame = this.MIN_FRAME;
      this.direction = 1;
    }
      
    this.updateFrame();
  }
  
  // 開始
  start() {
    if (!window.isGameStart || this.isPlaying) return;
      
    this.isPlaying = true;
    const interval = 1000 / this.speed;
    this.animationInterval = setInterval(() => this.nextFrame(), interval);
  }
  
  // 停止
  stop() {
    this.isPlaying = false;
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  }
  
  // リセット
  reset() {
    this.stop();
    this.currentFrame = this.MIN_FRAME;
    this.direction = 1;
    this.updateFrame();
  }
}

// 使用
export const characterAnim = new CharacterAnimation();