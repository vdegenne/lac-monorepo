import {LacWS} from 'lac-api'
import toast from 'toastit'
import {closeInitDialog, showInitDialog} from './dialogs/init-dialog.js'
import {store} from './store.js'
import {sleep} from './utils.js'
import {stateless} from './stateless.js'

let ws: LacWS | undefined
let unsub: (() => void) | undefined
let unsubConnect: (() => void) | undefined
let unsubDisconnect: (() => void) | undefined
let unsubError: (() => void) | undefined

export function initWS(host = store.host, port = store.port) {
	if (!host || !port) {
		return
	}
	unsub?.()
	unsubConnect?.()
	unsubDisconnect?.()
	unsubError?.()

	if (ws) {
		ws.disconnect()
		ws = undefined
	}

	let firstFailedMessage = true

	ws = new LacWS({host, port})
	unsub = ws.subscribe((value) => {
		if (stateless.lockClipboard) {
			store.clipboard = value
		}
	})
	unsubConnect = ws.subscribeConnect(() => {
		toast('Connected!')
		closeInitDialog()
	})
	unsubDisconnect = ws.subscribeDisconnect(() => {
		toast('Disconnected')
		showInitDialog()
	})
	unsubError = ws.subscribeError(() => {
		showInitDialog()
		if (firstFailedMessage) {
			sleep(100).then(() => toast('Connection failed'))
			firstFailedMessage = false
		}
	})

	ws.connect({timeout: 1000})
}

export function setClipboardContent(content: string) {
	ws?.set(content)
}

export function getWS() {
	return ws
}
