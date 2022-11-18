import { Snake } from "../snake/Snake.js";
import { displayPage } from "./router.js";

export const game = (level: number) => {

	const titleText = `Level ${level}`;
	
	const onMount = (root: Element, page: DocumentFragment) => {

		document.title = `Snake - ${titleText}`;
		
		root.className = "game";
		
		const title = page.querySelector(".title")
		
		if (title) {
			title.textContent = titleText;
		}
	};

	const afterMount = async () => {
		const snake = await Snake.builder(level);

		snake.run();
	};
	
	displayPage("#level-template", { onMount, afterMount });
};