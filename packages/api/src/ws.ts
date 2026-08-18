import {ReactiveController, state} from '@snar/lit'
import {DEFAULT_PORT} from './shared.js'

type ValueListener = (value: string) => void
type ConnectionListener = () => void
type ErrorListener = (error: Error) => void

const DEFAULT_CONNECTION_TIMEOUT = 2000
const INITIAL_RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 10000

export class LacWS extends ReactiveController {
	@state() value: string | undefined

	private host = 'localhost'
	private port = DEFAULT_PORT
	private socket?: WebSocket
	private connectionTimer?: ReturnType<typeof setTimeout>
	private reconnectTimer?: ReturnType<typeof setTimeout>
	private reconnectDelay = INITIAL_RECONNECT_DELAY
	private connectionTimeout = DEFAULT_CONNECTION_TIMEOUT
	private closing = false

	#valueListeners = new Set<ValueListener>()
	#connectListeners = new Set<ConnectionListener>()
	#disconnectListeners = new Set<ConnectionListener>()
	#errorListeners = new Set<ErrorListener>()

	constructor({
		host = 'localhost',
		port = DEFAULT_PORT,
	}: {
		/**
		 * the IP address of the local machine running the LAC server (`lac-run`).
		 */
		host?: string

		/**
		 * Overrides the default port (37283).
		 */
		port?: number
	} = {}) {
		super()

		this.host = host
		this.port = port
	}

	updated() {
		if (this.value === undefined) {
			return
		}

		for (const listener of this.#valueListeners) {
			listener(this.value)
		}
	}

	subscribe(callback: ValueListener) {
		this.#valueListeners.add(callback)

		return () => {
			this.#valueListeners.delete(callback)
		}
	}

	subscribeConnect(callback: ConnectionListener) {
		this.#connectListeners.add(callback)

		return () => {
			this.#connectListeners.delete(callback)
		}
	}

	subscribeDisconnect(callback: ConnectionListener) {
		this.#disconnectListeners.add(callback)

		return () => {
			this.#disconnectListeners.delete(callback)
		}
	}

	subscribeError(callback: ErrorListener) {
		this.#errorListeners.add(callback)

		return () => {
			this.#errorListeners.delete(callback)
		}
	}

	set(value: string) {
		if (this.socket?.readyState === WebSocket.OPEN) {
			this.socket.send(value)
		}
	}

	connect({
		timeout = DEFAULT_CONNECTION_TIMEOUT,
	}: {
		timeout?: number
	} = {}) {
		if (this.socket || this.closing) {
			return
		}

		this.closing = false
		this.connectionTimeout = timeout

		const socket = new WebSocket(`ws://${this.host}:${this.port}/ws`)

		this.socket = socket

		let connected = false
		let socketError = false
		let timedOut = false

		this.connectionTimer = setTimeout(() => {
			if (this.socket !== socket || connected) {
				return
			}

			timedOut = true
			socket.close()
		}, timeout)

		socket.onopen = () => {
			if (this.socket !== socket) {
				return
			}

			connected = true
			this.clearConnectionTimer()
			this.reconnectDelay = INITIAL_RECONNECT_DELAY

			for (const listener of this.#connectListeners) {
				listener()
			}
		}

		socket.onmessage = (event) => {
			if (this.socket !== socket) {
				return
			}

			this.value = event.data
		}

		socket.onerror = () => {
			socketError = true
		}

		socket.onclose = () => {
			if (this.socket !== socket) {
				return
			}

			this.clearConnectionTimer()
			this.socket = undefined

			if (!connected) {
				if (timedOut) {
					this.emitError(
						new Error(`LAC WebSocket connection timed out after ${timeout}ms`),
					)
				} else if (socketError) {
					this.emitError(new Error('LAC WebSocket connection error'))
				}
			} else {
				for (const listener of this.#disconnectListeners) {
					listener()
				}
			}

			if (!this.closing) {
				this.scheduleReconnect()
			}
		}
	}

	disconnect() {
		this.closing = true

		this.clearConnectionTimer()

		if (this.reconnectTimer !== undefined) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = undefined
		}

		this.socket?.close()
		this.socket = undefined
	}

	private emitError(error: Error) {
		for (const listener of this.#errorListeners) {
			listener(error)
		}
	}

	private scheduleReconnect() {
		if (this.reconnectTimer !== undefined || this.closing) {
			return
		}

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = undefined

			this.connect({
				timeout: this.connectionTimeout,
			})

			this.reconnectDelay = Math.min(
				this.reconnectDelay * 2,
				MAX_RECONNECT_DELAY,
			)
		}, this.reconnectDelay)
	}

	private clearConnectionTimer() {
		if (this.connectionTimer !== undefined) {
			clearTimeout(this.connectionTimer)
			this.connectionTimer = undefined
		}
	}
}
