# lac-api

Helpers to interact with the Local Area Clipboard server ([`lac-run`](https://github.com/vdegenne/lac-monorepo/tree/main/packages/run))

## Usage

### Http endpoints

```js
import {Lac} from 'lac-api';

const clipboard = new Lac({
  host : '192.168.x.x' // IP of the machine running `lac-run`
})

await lac.set('hello world')

const content = await lac.get()
console.log(content) // hello world
```
