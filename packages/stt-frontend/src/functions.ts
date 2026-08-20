import {getMainPage} from './pages/index.js'

export function clearClipboardContent() {
	const textarea = getMainPage()!.textarea!
	textarea.value = ''
	textarea.dispatchEvent(new KeyboardEvent('input', {isComposing: false}))
	textarea.focus()
}
