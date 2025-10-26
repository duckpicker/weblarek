import {IOrderResponse, IProduct} from "../types";
import {Api, ApiListResponse} from "./base/Api";

export interface IFilmAPI {
    getProductList: () => Promise<IProduct[]>;
    getProductItem: (id: string) => Promise<IProduct>;
    orderProducts: (order: {
        payment: string;
        email: string;
        phone: string;
        address: string;
        total: number;
        items: any[];
    }) => Promise<IOrderResponse>;
}

export class WebLarekAPI extends Api implements IFilmAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options)
        this.cdn = cdn;
    }

    getProductItem(id: string): Promise<IProduct> {
        return this.get(`/product/${id}`).then(
            (data: IProduct) => ({
                ...data,
                image: this.cdn + data.image
            })
        );
    }

    getProductList(): Promise<IProduct[]> {
        return this.get('/product').then((data: ApiListResponse<IProduct>) =>
            data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }))
        );
    }

    orderProducts(order: {
        payment: string;
        email: string;
        phone: string;
        address: string;
        total: number;
        items: any[];
    }): Promise<IOrderResponse> {
        return this.post('/order', order).then(
            (data: IOrderResponse) => data
        );
    }
}
