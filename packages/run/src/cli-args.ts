export function getPortArg(): number | undefined {
	const args = process.argv

	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--port' || args[i] === '-p') {
			const value = args[i + 1]

			if (value !== undefined) {
				const port = Number(value)

				if (Number.isInteger(port) && port >= 1 && port <= 65535) {
					return port
				}
			}

			return undefined
		}
	}

	return undefined
}
