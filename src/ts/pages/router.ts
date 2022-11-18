import { CallbackFunctions } from "../types/router.js";
import { home } from "./home.js";
import { game } from "./game.js";

export const router = () => {
	const hash = window.location.hash;

	const matches = hash.match(/^#level-[0-9]+$/);
	
	if (matches) {
		const level = parseInt(matches[0].split("-")[1]);
		
		game(level);
	} else {
		home();
	}
};

export const displayPage = (template: string, callbacks: CallbackFunctions = {}) => {
	const root = document.querySelector("#root");

	const pageTemplate = document.querySelector(template);

	if (root && pageTemplate instanceof HTMLTemplateElement) {
		const pageFragment = pageTemplate.content;
		
		callbacks.onMount && callbacks.onMount(root, pageFragment);
		
		root.replaceChildren(pageFragment.cloneNode(true));
		
		callbacks.afterMount && callbacks.afterMount();
	}
};