import { Field } from '../field.js';
import { content } from '../state/content.js';
import { kebabCaseToTitleCase } from '../utils.js';

export class PlainText extends Field {
    static defaults = {
        multiline: false,
        placeholder: '',
    };

    static presets = {
        'inlineText': {},
        'title': { placeholder: 'Title' },
        'multilineText': { multiline: true },
    };

    #sizeTestElement;
    #inputElement;
    #realValue;
    #fieldId;
    #objectId;
    #objectStore;

    constructor(target) {
        super(target);

        this.#realValue = target.textContent.trim();
        const ids = target.getAttribute('data-cms-field').split(':');
        this.#fieldId = ids[1] || ids[0];
        if (!this.options.placeholder) {
            this.options.placeholder = kebabCaseToTitleCase(this.#fieldId);
        }

        this.#sizeTestElement = document.createElement('span');
        Object.assign(this.#sizeTestElement.style, {
            display: 'none',
            whiteSpace: 'pre',
        })

        this.#inputElement = document.createElement('textarea');
        this.#inputElement.rows = 1;
        this.#inputElement.placeholder = this.options.placeholder;
        Object.assign(this.#inputElement.style, {
            display: 'inline',
            resize: 'none',
            overflow: 'hidden',
            writingMode: 'unset',
            textRendering: 'unset',
            color: 'unset',
            letterSpacing: 'unset',
            wordSpacing: 'unset',
            textTransform: 'unset',
            textIndent: 'unset',
            textShadow: 'unset',
            textAlign: 'unset',
            background: 'unset',
            cursor: 'text',
            margin: 'unset',
            font: 'unset',
            padding: 'unset',
            border: 'unset',
            flexDirection: 'unset',
            overflowWrap: 'unset',
        });
        this.#inputElement.addEventListener('input', () => this.#onInput());
        if (!this.options.multiline) {
            this.#inputElement.addEventListener('keydown', event => {
                if (event.key == 'Enter') {
                    event.preventDefault();
                }
            });
        }

        window.addEventListener('resize', () => this.#resize());

        const objectElement = target.closest('[data-cms-object]');
        this.#objectId = objectElement.getAttribute('data-cms-object');
        this.#objectStore = content.getObjectStore(this.#objectId);
        this.#objectStore.subscribe(value => {
            this.#inputElement.value = this.#fieldId in value ?
                value[this.#fieldId] :
                this.#realValue;
            this.#resize();
        });

        const object = this.#objectStore.get();
        this.#inputElement.value = this.#fieldId in object ?
            object[this.#fieldId] :
            this.#realValue;
        target.innerHTML = '';
        target.appendChild(this.#sizeTestElement);
        target.appendChild(this.#inputElement);
        this.#resize();
    }

    #onInput() {
        this.#resize();
        this.#updateValue();
    }

    #resize() {
        this.#sizeTestElement.style.display = 'inline';
        this.#sizeTestElement.textContent = this.#inputElement.value || this.options.placeholder;
        this.#inputElement.style.width = (this.#sizeTestElement.offsetWidth + 1) + 'px';
        this.#sizeTestElement.style.display = 'none';
        this.#inputElement.style.height = '';
        this.#inputElement.style.height = this.#inputElement.scrollHeight + 'px';
    }

    #updateValue() {
        const object = this.#objectStore.get();
        object[this.#fieldId] = this.#inputElement.value;
        this.#objectStore.set(object);
    }
}