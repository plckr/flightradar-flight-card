import EmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { LitElement, ReactiveController } from 'lit';

export class CarouselController implements ReactiveController {
  private host: LitElement;
  private _embla: EmblaCarouselType | null = null;
  private _emblaOptions: EmblaOptionsType;

  constructor(
    host: LitElement,
    options: EmblaOptionsType = {
      loop: true,
      align: 'start',
    }
  ) {
    this.host = host;
    host.addController(this);
    this._emblaOptions = options;
  }

  hostConnected() {
    this._embla = EmblaCarousel(this.host, this._emblaOptions, [
      Autoplay({ active: false, delay: 2000 }),
    ]);
  }

  hostDisconnected(): void {
    this._embla?.destroy();
  }

  public destroy() {
    if (this._embla) {
      this._embla.destroy();
      this._embla = null;
    }
  }

  public scrollPrev() {
    if (this._embla) {
      this._embla.scrollPrev();
    }
  }

  public scrollNext() {
    if (this._embla) {
      this._embla.scrollNext();
    }
  }
}
