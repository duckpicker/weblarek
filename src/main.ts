import "./scss/styles.scss";

import {WebLarekAPI} from "./components/WebLarekAPI";
import {API_URL, CDN_URL} from "./utils/constants";
import {cloneTemplate, ensureElement} from "./utils/utils";
import {EventEmitter} from "./components/base/Events";
import {AppData} from "./components/AppData";
import {Modal} from "./components/common/Modal";
import {Basket} from "./components/common/Basket";
import {Contacts} from "./components/Contacts";
import {Success} from "./components/common/Success";
import {IProduct, OrderForm} from "./types";
import {Card} from "./components/Card";
import {Order} from "./components/Order";
import {Page} from "./components/Page";

const api = new WebLarekAPI(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const events = new EventEmitter();
const appData = new AppData(events);

const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const page = new Page(events, document.body);
const basket = new Basket(events);
const orderForm = new Order(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#order')));
const contactsForm = new Contacts(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#contacts')));

events.on('contacts:submit', () => {
    const payload = {
        payment: appData.buyer.payment,
        email: appData.buyer.email,
        phone: appData.buyer.phone,
        address: appData.buyer.address,
        total: appData.order.total,
        items: appData.order.items
    };
    api.orderProducts(payload)
        .then((result) => {
            const success = new Success(
                cloneTemplate(ensureElement<HTMLTemplateElement>('#success')),
                {
                    onClick: () => {
                        modal.close();
                        appData.clearOrder();
                    }
                }
            );

            modal.render({
                content: success.render(result)
            });
            appData.clearOrder();
            appData.clearBuyer();
        })
        .catch(err => {
            console.error(err);
        });
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
})

events.on('order:submit', () => {
    modal.render({
        content: contactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
})

events.on('order:ready', () => {
    contactsForm.valid = true;
});

events.on(/^order\.\w+:change$/, (data: { field: keyof OrderForm, value: string }) => {
    appData.setBuyerField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: { field: keyof OrderForm, value: string }) => {
    appData.setBuyerField(data.field, data.value);
});

events.on('formErrors:change', (errors: Partial<OrderForm>) => {
    const {payment, address, email, phone} = errors;
    orderForm.valid = !payment && !address;
    orderForm.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
    contactsForm.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

events.on('basket:open', () => {
    modal.render({
        content: basket.render()
    });
});

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
    appData.clearBuyer();
});

events.on('card:select', (item: IProduct) => {
    appData.setPreview(item);
});

events.on('items:change', (items: IProduct[]) => {
    page.catalog = items.map(item => {
        const card = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render(item);
    })
});

events.on('basket:change', () => {
    page.counter = appData.order.items.length;

    basket.items = appData.order.items.map(itemId => {
        const item = appData.items.find(i => i.id === itemId);
        if (!item) return null;

        const card = new Card(cloneTemplate(cardBasketTemplate), {
            onClick: () => appData.removeFromOrder(item)
        });

        return card.render(item);
    }).filter(Boolean);

    basket.total = appData.order.total;
});

events.on('preview:change', (item: IProduct) => {
    if (item) {
        const card = new Card(cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                if (appData.inOrder(item)) {
                    appData.removeFromOrder(item);
                    card.button = 'В корзину';
                } else {
                    appData.addToOrder(item);
                    card.button = 'Удалить из корзины';
                }
            }
        });

        card.button = appData.inOrder(item) ? 'Удалить из корзины' : 'В корзину';

        modal.render({
            content: card.render(item)
        });
    } else {
        modal.close();
    }
});

api.getProductList().then(appData.setItems.bind(appData)).catch(err => {
    console.error(err)
});
