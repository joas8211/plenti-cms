import { kebabCaseToCamelCase } from './utils.js';

export class Field {
    /**
     * Default options
     */
    static defaults = {};

    /**
     * @type {{ [preset: string]: object }}
     */
    static presets = {};

    /**
     * @type {HTMLElement}
     */
    target;

    /**
     * @type {object}
     */
    options;

    /**
     * @param {HTMLElement} target
     */
    constructor(target) {
        this.target = target;

        const ids = target.getAttribute('data-cms-field').split(':');
        const type = kebabCaseToCamelCase(ids[0]);
        this.options = Object.assign(
            {},
            this.constructor.defaults,
            this.constructor.presets[type] || {},
            JSON.parse(target.getAttribute('data-cms-options') || '{}')
        );

        const outerLink = target.closest('a');
        if (outerLink) outerLink.removeAttribute('href');
    }
}