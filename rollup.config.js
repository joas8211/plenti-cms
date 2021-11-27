
import { importAsString } from './src/rollupPlugins/importAsString';

/** @type {import('rollup').RollupOptions} */
const options =  {
    input: {
        'plenti-cms': 'src/entry.js'
    },
    output: {
        dir: 'dist',
    },
    plugins: [
        importAsString(['html', 'css']),
    ],
};

export default options;