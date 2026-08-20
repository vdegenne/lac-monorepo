import {Debouncer} from '@vdegenne/debouncer'
import {getMainPage} from './pages/index.js'
import {stateless} from './stateless.js'
import {store} from './store.js'

export function clearClipboardContent() {
	const textarea = getMainPage()!.textarea!
	textarea.value = ''
	textarea.dispatchEvent(new KeyboardEvent('input', {isComposing: false}))
	textarea.focus()
}

export const handleTextareaInput = new Debouncer(
	() => {
		if (stateless.lockClipboard) return
		const textarea = getMainPage()!.textarea!
		const value = textarea.value
		if (value !== undefined) store.clipboard = value
	},
	100,
	{throwOnCancel: false},
)
