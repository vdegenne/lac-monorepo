import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {DEFAULT_PORT} from 'lac-api/shared.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {Page, availablePages, getMainPage} from './pages/index.js'
import toast from 'toastit'
import {getWS, initWS, setClipboardContent} from './ws.js'
import {showInitDialog} from './dialogs/init-dialog.js'
import {debounce} from '@vdegenne/debouncer'
import {stateless} from './stateless.js'

@saveToLocalStorage('stt-frontend:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() host = 'localhost'
	@state() port = DEFAULT_PORT

	@state() clipboard: string | null = null

	F = new FormBuilder(this)

	#firstUpdated = false

	protected async updated(changed: PropertyValues<this>) {
		let pagePromise = Promise.resolve()

		if (changed.has('page')) {
			const page = availablePages.includes(this.page) ? this.page : '404'

			// TODO: use vite way to import dynamic links
			pagePromise = import(`./pages/page-${page}.ts`)
				// .then(() => console.log(`Page ${page} loaded.`))
				.catch(() => {})
		}
		if (this.page === 'main') {
			await pagePromise
		}

		if (changed.has('clipboard')) {
			if (this.#firstUpdated && this.clipboard !== null) {
				if (this.clipboard !== getWS()?.value) {
					debounce(setClipboardContent, 100)(this.clipboard).catch(Boolean)
				}
			}

			const textarea = getMainPage()?.textarea
			await textarea?.updateComplete
			if (stateless.lockClipboard && textarea) {
				textarea.value = this.clipboard as string
			}
		}

		this.#firstUpdated = true
	}

	protected firstUpdated() {
		if (!this.host || !this.port) {
			showInitDialog()
		} else {
			initWS(this.host, this.port)
		}
	}
}

export const store = new AppStore()

// @ts-ignore
window.store = store
