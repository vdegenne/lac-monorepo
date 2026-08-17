import {withController} from '@snar/lit'
import {css, html} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import {stateless} from '../stateless.js'
import {store} from '../store.js'
import {PageElement} from './PageElement.js'

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
`)
export class PageMain extends PageElement {
	render() {
		return html`<!---->
			Main page
			<!----> `
	}
}

// export const pageMain = new PageMain();
