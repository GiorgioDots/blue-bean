import { Container, Texture, Sprite, Graphics, Application } from 'pixi.js';

export class RoundedParallaxItem {
  container = new Container();
  sprite: Sprite;
  mask: Graphics;

  constructor(private texture: Texture, private radius: number, private app: Application) {
    this.container = new Container();

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0, 1);
    const scale = Math.min(app.renderer.height / texture.height) * 0.25;
    this.sprite.width = texture.width * scale;
    this.sprite.height = texture.height * scale;

    this.container.addChild(this.sprite);

    this.mask = new Graphics()
      .roundRect(
        0,
        (-texture.height * scale),
        texture.width * scale,
        texture.height * scale,
        radius
      )
      .fill({ color: 0xffffff, alpha: 0.4 });

    this.container.addChild(this.mask);
    this.sprite.mask = this.mask;
  }

  resize(width: number, height: number) {
    const scale = Math.min(height / this.sprite.texture.height) * 0.25;
    this.updateScale(scale);
    // this.sprite.width = this.sprite.texture.width * scale;
    // this.sprite.height = this.sprite.texture.height * scale;
    // this.container.removeChild(this.mask);
    // this.mask = new Graphics()
    //   .roundRect(
    //     0,
    //     (-this.sprite.texture.height * scale),
    //     this.sprite.texture.width * scale,
    //     this.sprite.texture.height * scale,
    //     this.radius
    //   )
    //   .fill({ color: 0xffffff, alpha: 0.4 });

    // this.container.addChild(this.mask);
    // this.sprite.mask = this.mask;
  }

  update(scrollX: number, speed: number) {
    this.container.position.x = -scrollX * speed;
  }

  updateScale(scale?: number) {
    scale ??= Math.min(this.app.renderer.height / this.sprite.texture.height) * 0.25;
    this.sprite.width = this.sprite.texture.width * scale;
    this.sprite.height = this.sprite.texture.height * scale;
    this.container.removeChild(this.mask);
    this.mask = new Graphics()
      .roundRect(
        0,
        (-this.sprite.texture.height * scale),
        this.sprite.texture.width * scale,
        this.sprite.texture.height * scale,
        this.radius
      )
      .fill({ color: 0xffffff, alpha: 0.4 });

    this.container.addChild(this.mask);
    this.sprite.mask = this.mask;
  }
}
