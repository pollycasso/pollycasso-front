import { Howl, Howler } from 'howler';

export class SoundManager {
  private static bgm: Howl | null = null;
  private static currentBgmUrl: string | null = null;

  static resume() {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }
  }

  static playBgm(url: string, volume: number) {
    if (this.currentBgmUrl === url && this.bgm) {
      this.bgm.volume(volume);
      if (!this.bgm.playing()) this.bgm.play();
      return;
    }

    this.stopBgm();

    this.bgm = new Howl({
      src: [url],
      loop: true,
      html5: true,
      volume,
      preload: true,
    });

    this.currentBgmUrl = url;
    this.bgm.play();
  }

  static stopBgm() {
    if (this.bgm) {
      this.bgm.stop();
      this.bgm.unload();
      this.bgm = null;
      this.currentBgmUrl = null;
    }
  }

  static setBgmVolume(volume: number) {
    if (this.bgm) this.bgm.volume(volume);
  }

  static playSfx(url: string, volume: number) {
    if (!url) return;

    const sfx = new Howl({
      src: [url],
      volume: volume,
      html5: false,
      onend: () => {
        sfx.unload();
      },
      onloaderror: () => {
        console.error('SFX 로드 실패:', url);
      },
    });

    sfx.play();
  }
}
