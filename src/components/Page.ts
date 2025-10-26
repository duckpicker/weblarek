import { EventEmitter } from './base/Events';
import { ensureElement } from '../utils/utils';

export class Page {
    private events: EventEmitter;
    private root: HTMLElement;
    private gallery: HTMLElement;
    private basketButton: HTMLElement;
    private basketCounter: HTMLElement;

    constructor(events: EventEmitter, root: HTMLElement) {
        this.events = events;
        this.root = root;

        this.gallery = ensureElement<HTMLElement>('.gallery');
        this.basketButton = ensureElement<HTMLElement>('.header__basket');
        this.basketCounter = ensureElement<HTMLElement>('.header__basket-counter');

        this.basketButton.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set catalog(items: HTMLElement[]) {
        this.gallery.replaceChildren(...items);
    }

    set counter(value: number) {
        this.basketCounter.textContent = String(value);
        this.basketCounter.classList.toggle('hidden', value === 0);
    }

    set locked(value: boolean) {
        if (value) {
            this.root.classList.add('page--locked');
        } else {
            this.root.classList.remove('page--locked');
        }
    }
}
