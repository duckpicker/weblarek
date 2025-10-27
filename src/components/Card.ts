import {Component} from "./base/Component";
import {IProduct} from "../types";
import {bem, ensureElement} from "../utils/utils";
import {categoryMap} from "../utils/constants";

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

type CardModifier = 'compact' | 'full';

export class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _image: HTMLImageElement;
    protected _price: HTMLElement;
    protected _description: HTMLElement;
    protected _category: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);

        // @ts-ignore
        this._category = container.querySelector('.card__category');
        // @ts-ignore
        this._button = container.querySelector('.card__button');
        // @ts-ignore
        this._image = container.querySelector('.card__image');
        // @ts-ignore
        this._description = container.querySelector('.card__text, .card__description');

        if (actions?.onClick) {
            if (this._button) this._button.addEventListener('click', actions.onClick);
            else container.addEventListener('click', actions.onClick);
        }
    }

    toggle(modifier: CardModifier) {
        this.toggleClass(bem('card', undefined, modifier).name);
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set price(value: number | null) {
        if (!this._price) return;

        if (value == null) {
            this.setText(this._price, 'Бесценно');
            if (this._button && !this._button.classList.contains('basket__item-delete')) {
                this._button.textContent = 'Недоступно';
                this._button.disabled = true;
            }
        } else {
            this.setText(this._price, `${value} синапсов`);
            if (this._button && !this._button.classList.contains('basket__item-delete')) {
                this._button.disabled = false;
                if (!this._button.textContent || this._button.textContent === 'Недоступно') {
                    this._button.textContent = 'В корзину';
                }
            }
        }
    }


    set category(value: string) {
        this.setText(this._category, value);
        if (!this._category) return;
        Object.values(categoryMap).forEach(c => this._category.classList.remove(c));
        const categoryClass = categoryMap[value.toLowerCase() as keyof typeof categoryMap];
        if (categoryClass) this._category.classList.add(categoryClass);
    }

    set image(value: string) {
        this.setImage(this._image, value, this.title);
    }

    set description(value: string) {
        this.setText(this._description, value);
    }

    set button(value: string) {
        this.setText(this._button, value)
    }
}