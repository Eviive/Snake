import { displayPage } from "./router.js";

export const home = () => {

	const onMount = (root: Element) => {
		root.className = "home";
	};
	
	displayPage("#home-template", { onMount });
};