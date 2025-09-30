import './scss/styles.scss';
import { Catalog } from "./components/models/Catalog";
import { Cart } from "./components/models/Cart";
import { Buyer } from "./components/models/Buyer";
import { Api } from "./components/base/Api";
import { LarekApi } from "./components/models/LarekApi";
import { API_URL } from "./utils/constants";
import { IBuyer } from "./types";

const productsModel = new Catalog();
const cartModel = new Cart();
const buyerModel = new Buyer();

const api = new Api(API_URL);
const larekApi = new LarekApi(api);

larekApi.fetchProductList().then(products => {
    console.log('Товары с сервера:', products);

    productsModel.setProductList(products);
    console.log('Каталог:', productsModel.getProductList());

    const firstProduct = productsModel.getProductList()[0];
    console.log('Первый товар:', firstProduct);
    console.log('Поиск по id:', productsModel.getProductById(firstProduct.id));

    cartModel.addProduct(firstProduct);
    cartModel.addProduct(productsModel.getProductList()[1]);
    console.log('Корзина после добавления:', cartModel.getProductList());
    console.log('Есть ли товар в корзине:', cartModel.hasProduct(firstProduct.id));
    console.log('Общая стоимость:', cartModel.getTotalPrice());
    console.log('Кол-во товаров:', cartModel.getProductList().length);

    cartModel.removeProduct(firstProduct.id);
    console.log('Корзина после удаления:', cartModel.getProductList());

    cartModel.clearCart();
    console.log('Корзина очищена:', cartModel.getProductList());

    const buyer: IBuyer = {
        payment: 'card',
        email: 'ivan.ivanov@mail.ru',
        phone: '+79271234567',
        address: 'Россия, Саратов',
    };

    buyerModel.setBuyerData(buyer);
    console.log('Покупатель:', buyerModel.getBuyerData());

    buyerModel.setBuyerData({ payment: '' });
    buyerModel.setBuyerData({ address: '   ' });
    console.log('После изменения полей:', buyerModel.getBuyerData());
    console.log('Ошибки валидации:', buyerModel.validateBuyerData());

    buyerModel.setBuyerData(buyer);
    console.log('Валидация:', buyerModel.validateBuyerData());

    cartModel.addProduct(productsModel.getProductList()[0]);
    cartModel.addProduct(productsModel.getProductList()[1]);

    const orderData = {
        items: cartModel.getProductList().map(p => p.id),
        payment: buyer.payment,
        address: buyer.address,
        email: buyer.email,
        phone: buyer.phone,
        total: cartModel.getTotalPrice(),
    };

    larekApi.submitOrder(orderData)
        .then(response => {
            console.log('Заказ оформлен:', response);
            cartModel.clearCart();
            console.log('Корзина после заказа:', cartModel.getProductList());
        })
        .catch(err => {
            console.error('Ошибка при оформлении заказа:', err);
        });

    buyerModel.clearData();
    console.log('Покупатель очищен:', buyerModel.getBuyerData());
});
