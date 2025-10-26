import { Form } from "./common/Form";
import { OrderForm, TPayment } from "../types";
import { EventEmitter } from "./base/Events";
import { ensureElement } from "../utils/utils";

export class Order extends Form<OrderForm> {
    protected _paymentCard: HTMLButtonElement;
    protected _paymentCash: HTMLButtonElement;

    constructor(events: EventEmitter, container: HTMLFormElement, defaultPayment: TPayment = 'online') {
        super(events, container);

        this._paymentCard = ensureElement<HTMLButtonElement>('.button_alt[name=card]', this.container);
        this._paymentCash = ensureElement<HTMLButtonElement>('.button_alt[name=cash]', this.container);

        this.setPayment(defaultPayment);

        this._paymentCard.addEventListener('click', () => this.setPayment('online'));
        this._paymentCash.addEventListener('click', () => this.setPayment('offline'));
    }

    private setPayment(value: TPayment) {
        this.payment = value;
        this.onInputChange('payment', value);
    }

    set payment(value: TPayment) {
        this._paymentCard.classList.toggle('button_alt-active', value === 'online');
        this._paymentCash.classList.toggle('button_alt-active', value === 'offline');
    }

    set address(value: string) {
        const input = this.container.elements.namedItem('address') as HTMLInputElement | null;
        if (input) input.value = value;
    }
}
