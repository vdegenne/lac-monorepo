import Koa from 'koa'
import {PORT} from 'lac-api'
import {createServer} from 'node:http'
import {networkInterfaces} from 'node:os'
import {WebSocket, WebSocketServer} from 'ws'

const DEV = process.env.NODE_ENV === 'development'

let value = ''

let writeChain: Promise<void> = Promise.resolve()

const clients = new Set<WebSocket>()

function broadcast(value: string) {
	for (const client of clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(value)
		}
	}
}

function writeValue(newValue: string): Promise<void> {
	const write = writeChain.then(() => {
		value = newValue
		broadcast(value)
	})

	// An error must not block subsequent writes.
	writeChain = write.catch(() => {})

	return write
}

async function readBody(request: NodeJS.ReadableStream): Promise<string> {
	const chunks: Buffer[] = []

	for await (const chunk of request) {
		chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
	}

	return Buffer.concat(chunks).toString('utf8')
}

function getNetworkAddresses() {
	const interfaces = networkInterfaces()
	const addresses: Array<{address: string; name: string}> = []

	for (const [name, entries] of Object.entries(interfaces)) {
		for (const entry of entries ?? []) {
			if (entry.family === 'IPv4' && !entry.internal) {
				addresses.push({
					address: entry.address,
					name,
				})
			}
		}
	}

	return addresses
}

const app = new Koa()

app.use(async (ctx) => {
	if (ctx.method === 'GET' && ctx.path === '/') {
		await writeChain

		ctx.type = 'text/plain'
		ctx.body = value
		return
	}

	if (ctx.method === 'POST' && ctx.path === '/') {
		const newValue = await readBody(ctx.req)

		await writeValue(newValue)

		ctx.status = 204
		return
	}

	ctx.status = 404
})

const server = createServer(app.callback())

const wss = new WebSocketServer({
	noServer: true,
})

wss.on('connection', async (socket) => {
	clients.add(socket)

	if (DEV) {
		console.log(`WebSocket client connected (${clients.size} connected)`)
	}

	socket.on('message', async (data) => {
		const newValue = data.toString()

		await writeValue(newValue)
	})

	socket.on('close', () => {
		clients.delete(socket)

		if (DEV) {
			console.log(`WebSocket client disconnected (${clients.size} connected)`)
		}
	})

	await writeChain

	if (socket.readyState === WebSocket.OPEN) {
		socket.send(value)
	}
})

server.on('upgrade', (request, socket, head) => {
	if (request.url !== '/ws') {
		socket.destroy()
		return
	}

	wss.handleUpgrade(request, socket, head, (ws) => {
		wss.emit('connection', ws, request)
	})
})

server.listen(PORT, () => {
	console.log('\nClipboard server ready\n')
	console.log(`  Local:   http://localhost:${PORT}/`)

	for (const {address, name} of getNetworkAddresses()) {
		console.log(`  Network: http://${address}:${PORT}/  ${name}`)
	}

	console.log()
})
