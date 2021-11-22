/**
 * Transforms PascalCase to camelCase.
 * 
 * @param {string} text
 */
export function pascalCaseToCamelCase(text) {
    if (!text) return '';
    return text[0].toLowerCase() + text.slice(1);
}

/**
 * Transforms camelCase to kebab-case.
 * 
 * @param {string} text
 */
export function camelCaseToKebabCase(text) {
    return text.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Transforms PascalCase to kebab-case.
 * 
 * @param {string} text
 */
export function pascalCaseToKebabCase(text) {
    text = pascalCaseToCamelCase(text);
    text = camelCaseToKebabCase(text);
    return text;
}

/**
 * Transforms kebab-case to PascalCase.
 * 
 * @param {string} text
 */
export function kebabCaseToPascalCase(text) {
    let transformedText = '';
    let start = 0;
    let end = 0;
    while (end != -1) {
        end = text.indexOf('-', start);
        const word = end != -1 ?
            text.substring(start, end) :
            text.substr(start);
        if (!word) continue;
        transformedText += word[0].toUpperCase() + word.slice(1);
        start = end + 1;
    }
    return transformedText;
}

/**
 * Transforms kebab-case to camelCase.
 * 
 * @param {string} text
 */
export function kebabCaseToCamelCase(text) {
    text = kebabCaseToPascalCase(text);
    text = pascalCaseToCamelCase(text);
    return text;
}

/**
 * Transforms camelCase to "Title Case".
 * 
 * @param {string} text 
 */
export function camelCaseToTitleCase(text) {
    if (!text) return '';
    return text[0].toUpperCase() + text.slice(1).replace(/([A-Z])/g, ' $1');
}

/**
 * Transforms camelCase to "Title Case".
 * 
 * @param {string} text 
 */
export function pascalCaseToTitleCase(text) {
    return camelCaseToTitleCase(text);
}

/**
 * Transforms kebab-case to "Title Case".
 * 
 * @param {string} text 
 */
export function kebabCaseToTitleCase(text) {
    text = kebabCaseToPascalCase(text);
    text = pascalCaseToTitleCase(text);
    return text;
}