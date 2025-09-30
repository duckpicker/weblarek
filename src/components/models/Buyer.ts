import {IBuyer, TPayment} from "../../types";

export class Buyer implements IBuyer {
    address: string = '';
    email: string = '';
    payment: TPayment = '';
    phone: string = '';

    setBuyerData(buyer: Partial<IBuyer>): void {
        if (buyer.address !== undefined) this.address = buyer.address;
        if (buyer.email !== undefined) this.email = buyer.email;
        if (buyer.payment !== undefined) this.payment = buyer.payment;
        if (buyer.phone !== undefined) this.phone = buyer.phone;
    }

    getBuyerData(): IBuyer {
        return {
            address: this.address,
            email: this.email,
            payment: this.payment,
            phone: this.phone
        }
    }

    clearData(): void {
        this.address = '';
        this.email = '';
        this.payment = '';
        this.phone = '';
    }

    validateBuyerData(): string [] {
        return [
            !this.address?.trim() && "Укажите адрес доставки",
            !this.email?.trim()   && "Укажите почту",
            !this.phone?.trim()   && "Укажите номер телефона",
            !this.payment?.trim() && "Выберите способ оплаты"
        ].filter(Boolean) as string[];
    }
}