export interface CallbackFunctions {
	onMount?: (root: Element, page: DocumentFragment) => void;
	afterMount?: (root: Element) => void;
	onUnmount?: () => void;
}

export interface PopupConfig {
	title: string;
	homeLink?: boolean;
	message: string;
	content?: DocumentFragment;
	button: string;
	handler: (e: Event) => void;
}