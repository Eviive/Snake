export interface CallbackFunctions {
	onMount?: (root: Element, page: DocumentFragment) => void;
	afterMount?: (root: Element) => void;
	onUnmount?: () => void;
}

export interface PopupConfig {
	title: string;
	message: string;
	button: string;
	handler: (e: Event) => void;
}