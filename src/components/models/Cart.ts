import {IProduct} from "../../types";
import {EventEmitter} from "../base/Events";
import {CardPreview} from "../CardPreview";

export class Cart {
    productList: IProduct [] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    getProductList(): IProduct [] {
        return this.productList;
    }

    addProduct(product: IProduct, card?: CardPreview): void {
        this.productList.push(product);
        this.events.emit('basket:change', {card: card});
    }

    removeProduct(id: string, card?: CardPreview): void {
        this.productList = this.productList.filter(c => c.id !== id);
        this.events.emit('basket:change', {card: card});
    }

    getTotalPrice(): number {
        return this.productList.reduce((a, b) => a + (b.price ?? 0), 0);
    }

    clearCart(): void {
        this.productList = [];
        this.events.emit('basket:change');
    }

    hasProduct(id: string): boolean {
        return this.productList.some(c => c.id === id);
    }
}