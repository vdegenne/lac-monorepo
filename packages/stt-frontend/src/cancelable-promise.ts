export type CancelablePromise<T> = Promise<T> & {cancel: () => void}

export function makeCancelable<T>(
	executor: (signal: AbortSignal) => Promise<T>
): CancelablePromise<T> {
	const controller = new AbortController()

	const promise = executor(controller.signal) as CancelablePromise<T>

	promise.cancel = () => controller.abort()

	return promise
}

/**
 * EXEMPLE
 */
class SearchService {
	#currentSearch?: CancelablePromise<any>

	searchMap(query: string) {
		this.#currentSearch?.cancel()

		const job = makeCancelable(async (signal) => {
			const res = await fetch(`/api/search?q=${query}`, {signal})
			const data = await res.json()

			signal.throwIfAborted()

			const results = []

			for (const item of data.items) {
				signal.throwIfAborted()

				const enriched = await fetch(`/api/enrich/${item.id}`, {signal})
				results.push(await enriched.json())
			}

			return results
		})

		this.#currentSearch = job

		return job
	}

	getCurrentSearch() {
		return this.#currentSearch
	}

	cancelCurrentSearch() {
		this.#currentSearch?.cancel()
	}
}
