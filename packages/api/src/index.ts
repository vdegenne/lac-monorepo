import {Endpoint, Rest} from '@vdegenne/mini-rest'
import {DEFAULT_PORT} from './shared.js'

export class Lac {
	#rest: Rest<{
		get: {'/': Endpoint<void, string>}
		post: {'/': Endpoint<string, any>}
	}>

	constructor({
		host = 'localhost',
		port = DEFAULT_PORT,
	}: {
		/**
		 * the IP address of the local machine running the LAC server (`lac-run`).
		 */
		host?: string

		/**
		 * Overrides the default port (37283)
		 */
		port?: number
	} = {}) {
		this.#rest = new Rest(`http://${host}:${port}`)
	}

	async get() {
		const response = await this.#rest.get('/')
		if (!response.ok) {
			throw new Error('Make sure the server is running')
		}
		return response.text()
	}

	async set(value: string) {
		const response = await this.#rest.postBody('/', value)
		if (!response.ok) {
			throw new Error('Make sure the server is running')
		}
	}
}

export {LacWS} from './ws.js'
