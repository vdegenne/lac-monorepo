import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {Page, availablePages} from './pages/index.js'
// import {saveToLocalStorage} from 'snar-save-to-local-storage'

// @saveToLocalStorage('LAN-clipboard:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	F = new FormBuilder(this)

	protected updated(changed: PropertyValues<this>) {
		let pagePromise = Promise.resolve()

		if (changed.has('page')) {
			const page = availablePages.includes(this.page) ? this.page : '404'

			// TODO: use vite way to import dynamic links
			pagePromise = import(`./pages/page-${page}.ts`)
				// .then(() => console.log(`Page ${page} loaded.`))
				.catch(() => {})
		}

		// if (this.page === 'main') {
		// 	await pagePromise
		// }
	}
}

export const store = new AppStore()

// @ts-ignore
window.store = store
