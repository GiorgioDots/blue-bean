import { Component, ElementRef, OnInit, signal, viewChild } from '@angular/core';
import { Application, Assets, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { ParallaxBackgroundManager } from './parallax/parallax-background-manager';
import { ForegroundParallaxLayer } from './parallax/foreground-parallax-layer';
import { Loading } from './loading/loading';
import { NgStyle } from '@angular/common';
import { Modal } from './modal/modal';

@Component({
  selector: 'app-root',
  imports: [Loading, NgStyle, Modal],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  canvas = viewChild<ElementRef<HTMLCanvasElement>>('pixiCanvas');
  app = new Application();
  parallax = new ParallaxBackgroundManager(this.app);
  blueSprites: Container[] = [];
  loadingOpacity = signal(1);

  selectedBlue = signal('');
  modalOpen = signal(false);

  async ngOnInit(): Promise<void> {
    await this.app.init({
      background: '#ffffff',
      resizeTo: document.body,
      canvas: this.canvas()?.nativeElement,
      resolution: window.devicePixelRatio,
      autoDensity: true,
    });

    const tasks: Promise<void>[] = [];
    for (let i = 1; i <= 5; i++) {
      tasks.push(
        new Promise<void>(async (resolve, reject) => {
          try {
            this.parallax.addLayer({
              texture: await Assets.load(`/parallax/${i}.png`),
              parallax: i,
            });
            resolve();
          } catch (e) {
            reject();
          }
        })
      );
    }

    await Promise.allSettled(tasks);
    this.parallax.setup();

    const blueTasks: Promise<Texture>[] = [];
    for (let i = 1; i <= 59; i++) {
      blueTasks.push(
        new Promise<Texture>(async (resolve, reject) => {
          try {
            const texture = await Assets.load(`/blue/${i}.jpeg`);
            resolve(texture);
          } catch (error) {
            reject();
          }
        })
      );
    }

    // Setup blue sprites
    const blueTextures = (await Promise.allSettled(blueTasks))
      .filter((k) => k.status == 'fulfilled')
      .map((k) => k.value);

    const foreground = new ForegroundParallaxLayer(
      blueTextures,
      this.app,
      this.parallax.layers.length + 2
    );

    foreground.addTo(this.app.stage);

    // Events
    this.app.renderer.addListener('resize', () => {
      this.parallax.resize();
      foreground.resize();
    });

    // Scroll handler
    let lastXPos: number | undefined;
    this.app.canvas.addEventListener('pointerdown', (e) => {
      lastXPos = e.clientX;
    });
    this.app.canvas.addEventListener('pointermove', (e) => {
      if (lastXPos == undefined) return;
      const delta = lastXPos - e.clientX;
      this.parallax.onUserScroll(delta * 0.4);
      foreground.onUserScroll(delta * 0.4);
      lastXPos = e.clientX;
    });
    this.app.canvas.addEventListener('pointerup', () => {
      lastXPos = undefined;
    });

    // Image open
    this.app.canvas.addEventListener('click', (e) => {
      const item = foreground.getPointItem(e.clientX, e.clientY);
      if (!item) return;
      this.selectedBlue.set(item.sprite.texture.source.label);
      this.modalOpen.set(true);
    });

    //
    this.app.ticker.add((time) => {
      this.parallax.update(time.deltaTime, this.modalOpen());
      foreground.update(time.deltaTime, this.modalOpen());
      this.loadingOpacity.update((p) => p - 0.02);
    });
  }

  createBlueSprite(texture: Texture, radius: number): Container {
    const container = new Container();

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    const scale =
      Math.max(this.app.renderer.width / texture.width, this.app.renderer.height / texture.height) *
      0.1;
    sprite.width = texture.width * scale;
    sprite.height = texture.height * scale;

    container.addChild(sprite);

    const mask = new Graphics()
      .roundRect(
        (-texture.width * scale) / 2,
        (-texture.height * scale) / 2,
        texture.width * scale,
        texture.height * scale,
        radius
      )
      .fill({ color: 0xffffff, alpha: 0.4 });

    container.addChild(mask);
    sprite.mask = mask;

    return container;
  }

  closeModal() {
    this.modalOpen.set(false);
    this.selectedBlue.set('');
  }
}
