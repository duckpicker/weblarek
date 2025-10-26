import {IBuyer, IProduct, OrderForm, TPayment} from "../types";
import {IEvents} from "./base/Events";

export class AppData {
    items: IProduct[] = [];
    preview?: IProduct = undefined;
    order: { total: number; items: any[] } = {
        total: 0,
        items: []
    };
    buyer: IBuyer = {
        payment: 'online',
        email: '',
        phone: '',
        address: '',
    }
    formErrors: Partial<Record<keyof OrderForm, string>> = {};

    constructor(protected  events: IEvents) {

    }

    setItems(items: IProduct[]) {
        this.items = items;
        this.events.emit('items:change', this.items);
    }

    setPreview(item: IProduct) {
        this.preview = item;
        this.events.emit('preview:change', this.preview);
    }

    inOrder(item: IProduct) {
        return this.order.items.includes(item.id);
    }

    addToOrder(item: IProduct) {
        this.order.items.push(item.id);
        this.order.total += item.price || 0;
        this.events.emit('basket:change', this.order);
    }

    removeFromOrder(item: IProduct) {
        this.order.items = this.order.items.filter(id => id != item.id);
        this.order.total -= item.price || 0;
        this.events.emit("basket:change", this.order);
    }

    clearOrder() {
        this.order.items = [];
        this.order.total = 0;
        this.events.emit('basket:change', this.order);
    }

    clearBuyer() {
        this.buyer = {
            payment: 'online',
            email: '',
            phone: '',
            address: ''
        };
        this.formErrors = {};
        this.events.emit('formErrors:change', this.formErrors);
    }

    setPaymentMethod(method: TPayment) {
        this.buyer.payment = method;
    }

    setBuyerField(field: keyof OrderForm, value: string) {
        if (field === 'payment') this.setPaymentMethod(value as TPayment);
        else this.buyer[field] = value;

        if (this.buyer.payment && this.validateOrder()) this.events.emit('order:ready', this.buyer);
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.buyer.payment) errors.payment = "Выберите способ оплаты";
        if (!this.buyer.email) errors.email = "Укажите почту";
        if (!this.buyer.phone) errors.phone = "Укажите номер телефона";
        if (!this.buyer.address) errors.address = "Укажите адрес доставки"; // исправлено
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}