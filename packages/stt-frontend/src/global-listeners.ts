import {$} from 'html-vision'
import {openSettingsDialog} from './imports.js'
import {translateSelection} from './server/functions.js'

const inputNames = ['INPUT', 'TEXTAREA', 'MD-FILLED-TEXT-FIELD']
export function eventIsFromInput(event: Event) {
	return (event.composedPath() as HTMLElement[]).some((el) => {
		return (
			inputNames.includes(el.tagName) || el.hasAttribute?.('contenteditable')
		)
	})
}

window.addEventListener('keypress', async (event: KeyboardEvent) => {
	// console.log(event)

	if (event.altKey || event.ctrlKey) {
		return
	}

	if (eventIsFromInput(event)) {
		return
	}

	const button = $(`[key="${event.key}"]`)
	if (button) {
		button?.click()
		return
	}

	switch (event.key) {
		case 'd':
			// ;(await getThemeStore()).toggleMode()
			break
		case 's':
			openSettingsDialog()
			break
	}
})

// document.addEventListener('keydown', (event: KeyboardEvent) => {
// 	const key = event.key
//
// 	const isLetter = key.length === 1 && /[a-zA-Z]/.test(key)
//
// 	const editingKeys = [
// 		'Backspace',
// 		'Delete',
// 		'ArrowLeft',
// 		'ArrowRight',
// 		'ArrowUp',
// 		'ArrowDown',
// 		'Enter',
// 		'Tab',
// 	]
//
// 	const isEditingKey = editingKeys.indexOf(key) !== -1
//
// 	if (isLetter || isEditingKey) {
// 		toast('ok')
// 	}
// })

window.addEventListener('voice-recorder-submit', async (event: Event) => {
	const {input, mode} = (event as CustomEvent).detail
	if (input && mode === 0) {
		// const {store} = await import('./store.js')
		// store.search = input
	}
})

// document.addEventListener('selectionchange', function () {
// 	const selection = document.getSelection()?.toString().trim()
// 	if (selection) {
// 		stateless.lastSelection = selection
// 	}
// })
