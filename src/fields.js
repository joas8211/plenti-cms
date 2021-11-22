import { PlainText } from './fields/plainText.js';
import { pascalCaseToCamelCase } from './utils.js';

/**
 * @type {Field[]}
 */
const allFieldConstructors = [
    PlainText,
];

/**
 * @type {{ [type: string]: typeof Field }}
 */
export const fields = {};

for (const field of allFieldConstructors) {
    const type = pascalCaseToCamelCase(field.name);
    fields[type] = field;

    for (const preset in field.presets) {
        fields[preset] = field;
    }
}