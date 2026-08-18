import commonjs from '@rollup/plugin-commonjs'
import {nodeResolve} from '@rollup/plugin-node-resolve'
// import typescript from '@rollup/plugin-typescript'

export default {
	input: 'lib/index.js',

	output: {
		file: 'dist/index.js',
		format: 'es',
		sourcemap: true,
		banner: '#!/usr/bin/env node',
	},

	plugins: [
		nodeResolve(),
		commonjs(),
		// typescript()
	],

	external: ['koa', 'ws'],
}
