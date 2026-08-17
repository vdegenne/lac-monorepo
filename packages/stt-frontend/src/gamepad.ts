import {ReactiveController} from '@snar/lit'
import {MGamepad, MiniGamepad, Mode} from '@vdegenne/mini-gamepad'
import {state} from 'lit/decorators.js'

class GamepadController extends ReactiveController {
	@state() gamepad: MGamepad | undefined

	constructor() {
		super()
		const minigp = new MiniGamepad({
			// pollSleepMs: 900,
			focusDeadTimeMs: 200,
		})
		minigp.onConnect((gamepad) => {
			// document.body.requestPointerLock()
			let voiceRecorderOpen = false
			window.addEventListener('voice-recorder-open', () => {
				voiceRecorderOpen = true
				gamepad.enabled = false
			})
			window.addEventListener('voice-recorder-close', () => {
				voiceRecorderOpen = false
				setTimeout(() => {
					gamepad.enabled = true
				}, 100)
			})

			this.gamepad = gamepad
			const map = gamepad.mapping
			const {
				LEFT_STICK_UP: lup,
				LEFT_STICK_DOWN: ldown,
				LEFT_STICK_LEFT: lleft,
				LEFT_STICK_RIGHT: lright,
				LEFT_STICK_PRESS: lpress,
				RIGHT_STICK_UP: rup,
				RIGHT_STICK_DOWN: rdown,
				RIGHT_STICK_LEFT: rleft,
				RIGHT_STICK_RIGHT: rright,
				RIGHT_STICK_PRESS: rpress,
				LEFT_BUTTONS_TOP: dpadup,
				LEFT_BUTTONS_BOTTOM: dpaddown,
				LEFT_BUTTONS_LEFT: dpadleft,
				LEFT_BUTTONS_RIGHT: dpadright,
				RIGHT_BUTTONS_BOTTOM: a,
				RIGHT_BUTTONS_RIGHT: b,
				RIGHT_BUTTONS_LEFT: x,
				RIGHT_BUTTONS_TOP: y,
				L1: l1,
				L2: l2,
				R1: r1,
				R2: r2,
				MIDDLE_LEFT: back,
				MIDDLE_RIGHT: start,
				MIDDLE_BOTTOM: screenshot,
				MIDDLE_TOP: guide,
			} = map

			gamepad.for(b).before(({mode}) => {
				switch (mode) {
					case Mode.NORMAL:
						break
				}
			})
		})
	}
}

export const gamepadCtrl = new GamepadController()
