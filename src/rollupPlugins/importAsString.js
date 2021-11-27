/**
 * @param {(string|RegExp)[]} matchers Array of file extension or regex matcher
 * @returns {import('rollup').Plugin}
 */
export function importAsString(matchers) {
    function test(file) {
        for (const matcher of matchers) {
            if (matcher instanceof RegExp) {
                if (matcher.test(file))
                    return true;
            } else if (typeof matcher == 'string') {
                const escapedExtension = matcher
                    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const extensionMatcher = new RegExp(`\\.${escapedExtension}$`);
                if (extensionMatcher.test(file))
                    return true;
            } else {
                throw new Error('Type of matcher must be RegExp or string.');
            }
        }
        return false;
    }

    return {
        name: 'Import as String',
        transform(code, id) {
            if (test(id)) {
                return `export default ${JSON.stringify(code)};`;
            }
            return null;
        },
    };
};