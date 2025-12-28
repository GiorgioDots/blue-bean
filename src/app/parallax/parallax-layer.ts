import { GL_WRAP_MODES, Texture, TilingSprite, WRAP_MODES } from 'pixi.js';

export type ParallaxLayerConfig = {
  texture: Texture;
  parallax: number; // 0.1 = far, 1 = near
};

export class ParallaxLayer {
  sprite: TilingSprite;
  parallax: number;

  constructor(private config: ParallaxLayerConfig, width: number, height: number) {
    this.parallax = config.parallax;
    this.sprite = new TilingSprite({
      texture: config.texture,
      width,
      height,
    });
    this.sprite.position.set(0, 0);

    const scale = height / this.config.texture.height;

    this.sprite.tileScale.set(scale);
  }

  resize(width: number, height: number) {
    this.sprite.width = width;
    this.sprite.height = height;
    this.sprite.tileScale.set(height / this.config.texture.height);
  }

  update(scrollX: number) {
    this.sprite.tilePosition.x = -scrollX * this.parallax;
  }
}
