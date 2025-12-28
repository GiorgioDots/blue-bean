import { AfterViewInit, Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-loading',
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
})
export class Loading implements AfterViewInit, OnDestroy {
  private offset = 0;
  stop = false;
  
  ngAfterViewInit() {
    requestAnimationFrame(this.animate);
  }

  ngOnDestroy(): void {
    this.stop = true;
  }

  animate = () => {
    this.offset += 0.2;

    document.documentElement.style.setProperty('--parallax-x', `${this.offset}px`);

    if (!stop)
      requestAnimationFrame(this.animate);
  };
}
