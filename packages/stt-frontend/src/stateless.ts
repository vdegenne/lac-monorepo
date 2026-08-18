import {PropertyValues, ReactiveController as Snar, state} from '@snar/lit'
import {store} from './store.js'
import {getWS} from './ws.js'

class StatelessController extends Snar {
	@state() loading = false
	@state() audioPlaying = false
	@state() autorunWasBlocked = false
	@state() feedback = ''

	@state() lockClipboard = true

	// @state() clipboard = ''

	updated(changed: PropertyValues<this>) {
		if (changed.has('lockClipboard') && this.lockClipboard) {
			const wsValue = getWS()?.value
			if (wsValue !== undefined && wsValue !== store.clipboard) {
				store.clipboard = wsValue
			}
		}
	}
}

export const stateless = new StatelessController()

// @ts-ignore
window.stateless = stateless
