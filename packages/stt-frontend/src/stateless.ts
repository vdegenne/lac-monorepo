import {ReactiveController as Snar, state} from '@snar/lit'

class StatelessController extends Snar {
	@state() loading = false
	@state() audioPlaying = false
	@state() autorunWasBlocked = false
}

export const stateless = new StatelessController()

// @ts-ignore
window.stateless = stateless
