import {ReactiveController, state} from '@snar/lit'
import {DEFAULT_PORT} from './shared.js'

type Listener = (value: string) => void

export class LacWS extends ReactiveController {
	@state() value = ''

	private host = 'localhost'
	private port = DEFAULT_PORT
	private socket?: WebSocket
	private reconnectTimer?: ReturnType<typeof setTimeout>
	private reconnectDelay = 500
	private closing = false

	#listeners = new Set<Listener>()

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
		super()

		this.host = host
		this.port = port

		this.connect()
	}

	updated() {
		for (const listener of this.#listeners) {
			listener(this.value)
		}
	}

	subscribe(callback: Listener) {
		this.#listeners.add(callback)

		return () => {
			this.#listeners.delete(callback)
		}
	}

	set(value: string) {
		this.socket?.send(value)
	}

	connect() {
		if (this.socket || this.closing) {
			return
		}

		const host = this.host.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:')

		const socket = new WebSocket(`${host}:${this.port}/ws`)

		this.socket = socket

		socket.onopen = () => {
			this.reconnectDelay = 500
		}

		socket.onmessage = (event) => {
			this.value = event.data
		}

		socket.onclose = () => {
			if (this.socket !== socket) {
				return
			}

			this.socket = undefined

			if (!this.closing) {
				this.scheduleReconnect()
			}
		}

		socket.onerror = () => {
			socket.close()
		}
	}

	disconnect() {
		this.closing = true

		if (this.reconnectTimer !== undefined) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}

		this.socket?.close()
		this.socket = undefined
	}

	private scheduleReconnect() {
		if (this.reconnectTimer !== undefined || this.closing) {
			return
		}

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined
			this.connect()

			this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000)
		}, this.reconnectDelay)
	}
}
