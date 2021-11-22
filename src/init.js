import { authenticate } from './auth.js';
import { fields } from './fields.js';
import { kebabCaseToCamelCase } from './utils.js';

(async () => {
    authenticate();

    for (const element of document.querySelectorAll('[data-cms-field]')) {
        const ids = element.getAttribute('data-cms-field').split(':');
        const type = kebabCaseToCamelCase(ids[0]);
        if (!fields[type]) continue;
        new fields[type](element);
    }
})();