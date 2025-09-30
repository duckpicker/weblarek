import {IProduct} from "../../types";

export class Cart {
    productList: IProduct [] = [];

    getProductList(): IProduct [] {
        return this.productList;
    }

    addProduct(product: IProduct): void {
        this.productList.push(product);
    }

    removeProduct(id: string): void {
        this.productList = this.productList.filter(c => c.id !== id);
    }

    getTotalPrice(): number {
        return this.productList.reduce((a, b) => a + (b.price ?? 0), 0);
    }

    clearCart(): void {
        this.productList = [];
    }

    hasProduct(id: string): boolean {
        return this.productList.some(c => c.id === id);
    }
}