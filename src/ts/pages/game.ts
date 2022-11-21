import { Game } from "../game/Game.js";
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

	let snake: Game | null = null;

	const afterMount = async () => {
		snake = await Game.builder(level);
		
		snake.run();
	};

	const onUnmount = () => {
		snake?.close();
	};
	
	displayPage("#level-template", { onMount, afterMount, onUnmount });
};