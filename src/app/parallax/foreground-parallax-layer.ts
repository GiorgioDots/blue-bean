import { Application, Container, Texture } from 'pixi.js';
import { RoundedParallaxItem } from './rounded-parallax-item';

export class ForegroundParallaxLayer {
  private items: RoundedParallaxItem[] = [];
  private speed: number;
  private itemsPad = 40;

  private scrollX = 0;
  private velocity = 0;
  private lastInteraction = performance.now();
  private idleDelay = 3000; // ms before auto-scroll
  private autoSpeed = 0.2;
  private hasInteracted = false;

  constructor(textures: Texture[], private app: Application, speed = 1) {
    this.speed = speed;

    let x = 0;

    for (const tex of textures) {
      const item = new RoundedParallaxItem(tex, 18, app);
      item.container.x = x;
      item.container.y = app.renderer.height - 20;

      this.items.push(item);
      x += item.sprite.width + this.itemsPad;
    }
  }

  addTo(stage: Container) {
    this.items.forEach((i) => stage.addChild(i.container));
  }

  onUserScroll(deltaX: number) {
    this.velocity = deltaX;
    this.lastInteraction = performance.now();
    this.hasInteracted = true;
  }

  update(delta: number, disableIdle: boolean) {
    const now = performance.now();
    const idle = now - this.lastInteraction > this.idleDelay || !this.hasInteracted;

    if (idle && !disableIdle) {
      this.velocity = this.autoSpeed;
    }

    this.scrollX = delta * this.velocity * this.speed;

    this.velocity *= 0.9;

    for (const item of this.items) {
      item.container.x -= this.scrollX;

      // wrap
      if (this.scrollX > 0 && item.container.x + item.container.width < 0) {
        item.container.x += this.totalWidth();
      }
      if (
        this.scrollX < 0 &&
        item.container.x + item.container.width > this.app.renderer.width + item.container.width
      ) {
        item.container.x -= this.totalWidth();
      }
    }
  }

  resize() {
    const { width, height } = this.app.renderer;

    this.items.forEach((l) => l.resize(width, height));
    let x = 0;

    for (const item of this.items) {
      item.container.x = x;
      x += item.sprite.width + this.itemsPad;
      item.container.y = this.app.renderer.height - 20;
    }
  }

  getPointItem(x: number, y: number) {
    return this.items.find(
      (k) =>
        y > k.container.y - k.container.height &&
        y < k.container.y &&
        x < k.container.x + k.container.width &&
        x > k.container.x
    );
  }

  private totalWidth() {
    return this.items.reduce((a, b) => a + b.container.width + this.itemsPad, 0);
  }
}
