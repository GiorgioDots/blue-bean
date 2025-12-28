import { Application } from 'pixi.js';
import { ParallaxLayer, ParallaxLayerConfig } from './parallax-layer';

export class ParallaxBackgroundManager {
  layers: ParallaxLayer[] = [];

  private scrollX = 0;
  private velocity = 0;

  private lastInteraction = performance.now();
  private idleDelay = 3000; // ms before auto-scroll
  private autoSpeed = 0.2;
  private hasInteracted = false;

  constructor(private app: Application) {}

  addLayer(config: ParallaxLayerConfig) {
    const layer = new ParallaxLayer(config, this.app.renderer.width, this.app.renderer.height);
    this.layers.push(layer);
  }

  setup() {
    this.layers.sort((a, b) => a.parallax - b.parallax);
    this.layers.forEach((l) => {
      this.app.stage.addChild(l.sprite);
    });
  }

  onUserScroll(deltaX: number) {
    this.velocity = deltaX;
    this.lastInteraction = performance.now();
    this.hasInteracted = true;
  }

  resize() {
    const { width, height } = this.app.renderer;

    this.layers.forEach((l) => l.resize(width, height));
  }

  update(delta: number, disableIdle: boolean) {
    const now = performance.now();
    const idle = now - this.lastInteraction > this.idleDelay || !this.hasInteracted;

    if (idle && !disableIdle) {
      this.velocity = this.autoSpeed;
    }

    this.scrollX += this.velocity * delta;

    // friction
    this.velocity *= 0.9;

    for (const layer of this.layers) {
      layer.update(this.scrollX);
    }
  }
}
