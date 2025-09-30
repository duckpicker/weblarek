import {IProduct} from "../../types";

export class Catalog {
    private productList: IProduct [] = [];

    setProductList(products: IProduct []): void {
        this.productList = products;
    }

    getProductList(): IProduct [] {
        return this.productList;
    }

    getProductById(id: string): IProduct | undefined {
        return this.productList.find(c => c.id === id) || undefined;
    }
}