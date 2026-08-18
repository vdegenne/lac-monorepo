import type {MdDialog} from '@material/web/all.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/filled-text-field.js'
import {withController} from '@snar/lit'
import {customElement} from 'custom-element-decorator'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query, state} from 'lit/decorators.js'
import '../card-element.js'
import '../material/dialog-patch.js'
import '../material/item-patch.js'
import {store} from '../store.js'
import {renderThemeElements} from '../styles/theme-elements.js'
import {themeStore} from '../styles/themeStore.js'
import styles from './settings-dialog.css?inline'
// import '@material/web/textfield/outlined-text-field.js';

@customElement({name: 'settings-dialog', inject: true})
@withStyles(styles)
@withController(themeStore)
@withController(store)
export class SettingsDialog extends LitElement {
	@state() open = false

	@query('md-dialog') dialog!: MdDialog

	render() {
		return html`
			<md-dialog
				?open=${this.open}
				@closed=${() => (this.open = false)}
				style="max-width:min(100vw - 18px, 500px);width:100%"
			>
				<header slot="headline" class="select-none">
					<md-icon>settings</md-icon>
					Settings
				</header>

				<form slot="content" method="dialog" id="form" class="">
					<card-element headline="WebSocket">
						${store.F.TEXTFIELD('Hostname', 'host', {supportingText: 'IP of the remote machine running `lac-run` (e.g. "192.168.x.x")'})}
						${store.F.TEXTFIELD('Port', 'port', {type: 'number'})}
					</card-element>

					<card-element headline="theme">
						${renderThemeElements()}
					</card-element>
				</form>

				<div slot="actions">
					<md-text-button form="form" autofocus>Close</md-text-button>
				</div>
			</md-dialog>
		`
	}

	async show() {
		if (this.dialog.open) {
			const dialogClose = new Promise((resolve) => {
				const resolveCB = () => {
					resolve(null)
					this.dialog.removeEventListener('closed', resolveCB)
				}
				this.dialog.addEventListener('closed', resolveCB)
			})
			this.dialog.close()
			await dialogClose
		}
		this.open = true
	}

	close(returnValue?: string) {
		return this.dialog.close(returnValue)
	}
}

declare global {
	interface Window {
		settingsDialog: SettingsDialog
	}
	interface HTMLElementTagNameMap {
		'settings-dialog': SettingsDialog
	}
}

export const settingsDialog = (window.settingsDialog = new SettingsDialog())
