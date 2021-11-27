import html from './toolbar.html';
import css from './toolbar.css';
import { content } from '../../state/content';
import { status } from '../../state/status';

customElements.define('plenti-cms-toolbar', class extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    #root;

    constructor() {
        super();

        this.#root = this.attachShadow({ mode: 'closed' });
        this.#root.innerHTML = html;

        const style = document.createElement('style');
        style.innerHTML = css;
        this.#root.appendChild(style);

        status.subscribe(newStatus => {
            this.#root.querySelector('.status').textContent = newStatus;
        });

        this.#root.querySelector('.publish.action')
            .addEventListener('click', () => content.publish());

        this.#root.querySelector('.discard.action')
            .addEventListener('click', () => content.discard());
    }
});