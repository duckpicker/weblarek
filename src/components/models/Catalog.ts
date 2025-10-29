import {IProduct} from "../../types";
import {EventEmitter} from "../base/Events";

export class Catalog {
    private productList: IProduct [] = [];
    private selectedProduct: IProduct | null = null;
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    setProductList(products: IProduct []): void {
        this.productList = products;
        this.events.emit('items:change', this.productList);
    }

    getProductList(): IProduct [] {
        return this.productList;
    }

    getProductById(id: string): IProduct | undefined {
        return this.productList.find(c => c.id === id) || undefined;
    }

    setSelectedProduct(product: IProduct): void {
        this.selectedProduct = product;
        this.events.emit('preview:update', this.selectedProduct);
    }

    getSelectedProduct(): IProduct | null {
        return this.selectedProduct;
    }
}