import {Logger} from '@vdegenne/debug'
import {Hash, Router} from '@vdegenne/router'
import chalk from 'chalk'
import {Page} from './pages/index.js'
import {store} from './store.js'
// import {Page} from './pages/index.js'

export const hash = new Hash<{fspath: string}>()
const logger = new Logger({
	colors: {
		log: chalk.yellow,
	},
})

const locationChangedCallback = async ({
	location,
	parts,
}: {
	location: Location
	event: Event | null
	parts: Readonly<string[]>
}): Promise<void> => {
	logger.log('Location has changed')
	await store.updateComplete
	hash.reflectHashToParams()
	if (window.location.host.endsWith('.github.io')) {
		parts = parts.slice(1)
	}
	if (parts.length === 0) {
		store.page = 'main'
	} else {
		store.page = parts[0] as Page
	}

	const params = new URLSearchParams(location.search)

	// if (params.has('q')) {
	// 	store.input = params.get('q') ?? ''
	// }
}

export const router = new Router(locationChangedCallback, {
	handlePageShow: false,
})
