import html from './toolbar.html';
import css from './toolbar.css';

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
    }
});