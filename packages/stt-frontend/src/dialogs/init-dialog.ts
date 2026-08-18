import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/filled-text-field.js'
import {html} from 'lit'
import '../card-element.js'
import {store} from '../store.js'
import {initWS} from '../ws.js'
import {Dialog} from './dialogs.js'

let dialog: Dialog | undefined

export function closeInitDialog() {
	dialog?.close()
}

export function showInitDialog() {
	if (!dialog) {
		dialog = new Dialog(
			html`<md-icon class="mr-1">router_off</md-icon>Connection error`,
			html`<!-- -->
				<p class="mt-0">Couldn't connect, Make sure:</p>
				<ul>
					<li>Hostname and port are correct (below).</li>
					<li>
						The server (<a
							href="https://github.com/vdegenne/lac-monorepo/tree/main/packages/run"
							target="_blank"
							>lac-run</a
						>) is running.
					</li>
					<li>
						If you are using a local address (e.g. 192.168.x.x), make sure the
						machine running this app here is connected on the same local network
						as the server.
					</li>
				</ul>

				<card-element headline="WebSocket">
					${store.F.TEXTFIELD('Hostname', 'host', {supportingText: 'IP of the remote machine running `lac-run` (e.g. "192.168.x.x")', autofocus: true})}
					${store.F.TEXTFIELD('Port', 'port', {type: 'number'})}
					<div class="text-right">
						<md-filled-button @click="${() => initWS()}"
							>Retry</md-filled-button
						>
					</div>
				</card-element>
				<!-- -->`,
			{
				closeButton: undefined,
				onClose() {
					dialog = undefined
				},
			},
		)
	}
}
