import { authenticate } from './auth.js';
import { fields } from './fields.js';
import './elements/toolbar/toolbar.js';
import { kebabCaseToCamelCase } from './utils.js';

(async () => {
    authenticate();

    const toolbar = document.createElement('plenti-cms-toolbar');
    document.body.appendChild(toolbar);

    for (const element of document.querySelectorAll('[data-cms-field]')) {
        const ids = element.getAttribute('data-cms-field').split(':');
        const type = kebabCaseToCamelCase(ids[0]);
        if (!fields[type]) continue;
        new fields[type](element);
    }
})();