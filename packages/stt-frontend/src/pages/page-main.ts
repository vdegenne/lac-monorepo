import '@material/web/iconbutton/icon-button.js'
import '@material/web/textfield/filled-text-field.js'
import {MdFilledTextField} from '@material/web/textfield/filled-text-field.js'
import {withController} from '@snar/lit'
import {TEXTAREA} from '@vdegenne/forms/FormBuilder.js'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, query} from 'lit/decorators.js'
import toast from 'toastit'
import {clearClipboardContent, handleTextareaInput} from '../functions.js'
import '../material/outlined-field-patch.ts'
import {stateless} from '../stateless.js'
import {store} from '../store.js'
import {copyToClipboard} from '../utils.js'
import {PageElement} from './PageElement.js'
// import '@material/web/textfield/outlined-text-field.js';

declare global {
	interface HTMLElementTagNameMap {
		'page-main': PageMain
	}
}

@customElement('page-main')
@withController(store)
@withController(stateless)
@withStyles(css`
	:host {
	}

	[type='textarea'][locked] {
		/*opacity: 0.5;*/
	}
`)
export class PageMain extends PageElement {
	@query('[type=textarea]') textarea?: MdFilledTextField

	render() {
		return html`<!---->
			<div class="p-6 flex flex-col flex-1 gap-5">
				<div class="flex-1">
					<md-outlined-text-field
						?locked="${stateless.lockClipboard}"
						?readonly="${stateless.lockClipboard}"
						type="textarea"
						class="w-full h-full"
						@compositionstart="${() => {
							handleTextareaInput.cancel()
						}}"
						@compositionend="${() => {
							handleTextareaInput.debounce()
						}}"
						@input="${(event: InputEvent) => {
							if (!event.isComposing) handleTextareaInput.debounce()
						}}"
					>
						<div slot="trailing-icon" class="flex flex-col gap-1">
							<md-icon-button
								?hidden="${stateless.lockClipboard}"
								@click="${() => {
									clearClipboardContent()
								}}"
								><md-icon>clear</md-icon></md-icon-button
							>
							<md-icon-button
								@click="${() => {
									copyToClipboard(this.textarea?.value ?? '')
									toast('copied')
								}}"
								><md-icon>content_copy</md-icon></md-icon-button
							>
						</div>
					</md-outlined-text-field>
				</div>
				<div class="flex items-center gap-2 mb-12">
					${
						stateless.lockClipboard
							? html`<!-- -->
									<md-filled-tonal-button
										@click="${() => {
											stateless.lockClipboard = false
											this.focusTextarea()
										}}"
									>
										<md-icon slot="icon">lock</md-icon>
										Edit content
									</md-filled-tonal-button>
									<!-- -->`
							: html`<!-- -->
									<md-filled-tonal-button
										error
										@click="${() => (stateless.lockClipboard = true)}"
									>
										<md-icon slot="icon">lock_open</md-icon>
										Lock content
									</md-filled-tonal-button>

									<!--<md-filled-tonal-button
										@click="${() => {
											clearClipboardContent()
										}}"
									>
										<md-icon slot="icon">clear</md-icon>
										Clear
									</md-filled-tonal-button>-->
									<!-- -->`
					}
				</div>
				<!-- ${TEXTAREA('Clipboard', store, 'clipboard', {rows: 6, autofocus: true, resetButton: true})} -->
			</div>
			<!----> `
	}

	focusTextarea() {
		this.textarea?.focus()
	}
}

// export const pageMain = new PageMain();
