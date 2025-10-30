import { Card } from "./Card";
import { EventEmitter } from "./base/Events";

export class CardPreview extends Card {
    private events: EventEmitter;

    private _inCart: boolean = false;

    constructor(events: EventEmitter, container: HTMLElement) {
        super(container);
        this.events = events;

        this._button.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            if (this._inCart) {
                this.events.emit('basked:remove', {card: this});
            }
            else {
                this.events.emit('basked:add', {card: this});
            }
        });
    }

    set inCart(value: boolean) {
        this._inCart = value;
        this.button = this._inCart ? "Удалить из корзины" : "Купить";
    }

    disable() {
        this._button.disabled = true;
        this._button.textContent = "Недоступно";
    }
}