# lac-api

Helpers to interact with the Local Area Clipboard server ([`lac-run`](https://github.com/vdegenne/lac-monorepo/tree/main/packages/run))

## Usage

### Initialize

```js
import {Lac} from 'lac-api'

const clipboard = new Lac({
	host: '192.168.x.x', // IP of the machine running `lac-run`
})
```

### Set content

```js
lac.set('hello world') // promisified
```

### Get content

```js
const content = await lac.get()
console.log(content) // hello world
```

### WS

```js
import {LacWS} from 'lac-api'

const clipboard = new LacWS({
	host: '192.168.x.x', // IP of the machine running `lac-run`
})

// listen for changes
const unsub = clipboard.subscribe((value) => {
	console.log(`Content changed: "${value}"`)
})

// modify the content (sent over the WS connection)
clipboard.set('hello world')
```
