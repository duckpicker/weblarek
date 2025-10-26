import "./scss/styles.scss";

import {WebLarekAPI} from "./components/WebLarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {cloneTemplate, ensureElement} from "./utils/utils";
import {EventEmitter} from "./components/base/Events";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {Contacts} from "./components/Contacts";
import {Success} from "./components/common/Success";
import {IProduct, OrderForm} from "./types";
import {Card} from "./components/Card";
import {Order} from "./components/Order";
import {Page} from "./components/Page";
import {Buyer} from "./components/models/Buyer";
import {Cart} from "./components/models/Cart";
import {Catalog} from "./components/models/Catalog";

const api = new WebLarekAPI(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const events = new EventEmitter();
const buyer = new Buyer();
const cart = new Cart();
const catalog = new Catalog();

const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const page = new Page(events, document.body);
const basket = new Basket(events);
const orderForm = new Order(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#order')), 'online');
const contactsForm = new Contacts(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#contacts')));

events.on('contacts:submit', () => {
    const payload = {
        payment: buyer.payment,
        email: buyer.email,
        phone: buyer.phone,
        address: buyer.address,
        total: cart.getTotalPrice(),
        items: cart.getProductList().map(p => p.id)
    };
    api.orderProducts(payload)
        .then(() => {
            const success = new Success(cloneTemplate(ensureElement<HTMLTemplateElement>('#success')), {
                onClick: () => modal.close()
            });
            modal.render({content: success.render({total: payload.total})});
            cart.clearCart();
            buyer.clearData();
        })
        .catch(err => console.error(err));
});

events.on('order:open', () => {
    modal.render({
        content: orderForm.render({
            payment: 'online',
            address: '',
            valid: false,
            errors: []
        })
    });
});

events.on('order:submit', () => {
    modal.render({
        content: contactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
});

events.on('order:ready', () => {
    contactsForm.valid = true;
});

events.on(/^order\.\w+:change$/, (data: { field: keyof OrderForm; value: string }) => {
    if (data.field === 'payment') buyer.payment = data.value as any;
    else buyer.address = data.value;

    const orderErrors = buyer.validateBuyerData().filter(e => e.includes('адрес') || e.includes('способ'));
    orderForm.errors = orderErrors.join('; ');
    orderForm.valid = orderErrors.length === 0;
});

events.on(/^contacts\..*:change/, (data: { field: keyof OrderForm; value: string }) => {
    if (data.field === 'email') buyer.email = data.value;
    if (data.field === 'phone') buyer.phone = data.value;

    const contactErrors = buyer.validateBuyerData().filter(e => e.includes('почту') || e.includes('номер'));
    contactsForm.errors = contactErrors.join('; ');
    contactsForm.valid = contactErrors.length === 0;
});


events.on('basket:open', () => {
    modal.render({content: basket.render()});
});

events.on('modal:open', () => {
    page.locked = true;
});
events.on('modal:close', () => {
    page.locked = false;
    buyer.clearData();
});

events.on('card:select', (item: IProduct) => {
    modal.render({content: renderPreviewCard(item)});
});

events.on('items:change', (items: IProduct[]) => {
    catalog.setProductList(items);
    page.catalog = catalog.getProductList().map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render(item);
    });
});

events.on('basket:change', () => {
    page.counter = cart.getProductList().length;
    basket.items = cart.getProductList().map(item => {
        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                cart.removeProduct(item.id);
                events.emit('basket:change');
            }
        });
        return card.render(item);
    });
    basket.total = cart.getTotalPrice();
});

function renderPreviewCard(item: IProduct) {
    const card = new Card(cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (cart.hasProduct(item.id)) {
                cart.removeProduct(item.id);
                card.button = 'В корзину';
            } else {
                cart.addProduct(item);
                card.button = 'Удалить из корзины';
            }
            events.emit('basket:change');
        }
    });
    card.button = cart.hasProduct(item.id) ? 'Удалить из корзины' : 'В корзину';
    return card.render(item);
}

api.getProductList()
    .then(items => events.emit('items:change', items))
    .catch(err => console.error(err));
