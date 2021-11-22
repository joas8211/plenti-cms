import { Field } from '../field.js';
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

    constructor(target) {
        super(target);

        const ids = target.getAttribute('data-cms-field').split(':');
        if (!this.options.placeholder && ids[1]) {
            this.options.placeholder = kebabCaseToTitleCase(ids[1]);
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
        this.#inputElement.addEventListener('input', () => this.#resize());
        if (!this.options.multiline) {
            this.#inputElement.addEventListener('keydown', event => {
                if (event.key == 'Enter') {
                    event.preventDefault();
                }
            });
        }

        window.addEventListener('resize', () => this.#resize());

        this.#inputElement.value = target.textContent.trim();
        target.innerHTML = '';
        target.appendChild(this.#sizeTestElement);
        target.appendChild(this.#inputElement);
        this.#resize();
    }

    #resize() {
        this.#sizeTestElement.style.display = 'inline';
        this.#sizeTestElement.textContent = this.#inputElement.value || this.options.placeholder;
        this.#inputElement.style.width = (this.#sizeTestElement.offsetWidth + 1) + 'px';
        this.#sizeTestElement.style.display = 'none';
        this.#inputElement.style.height = '';
        this.#inputElement.style.height = this.#inputElement.scrollHeight + 'px';
    }
}