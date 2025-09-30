import {IApi, IOrderRequest, IOrderResponse, IProduct} from "../../types";

export class LarekApi {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    public async fetchProductList(): Promise<IProduct[]> {
        const res = await this.api.get<{ items: IProduct[] }>('/product/');
        return res.items;
    }

    public async submitOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this.api.post<IOrderResponse>('/order/', order);
    }
}