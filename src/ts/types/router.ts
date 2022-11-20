export interface CallbackFunctions {
	onMount?: (root: Element, page: DocumentFragment) => void;
	afterMount?: () => void;
}