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

	const afterMount = async (root: Element) => {
		snake = await Game.builder(level);
		
		snake.onGameOver = (score: number, goal?: number) => {
			const popupTemplate = document.querySelector<HTMLTemplateElement>("template#popup-template");

			if (!popupTemplate) {
				alert("Game over");
				return;
			}
			
			const popupClone = popupTemplate.content.cloneNode(true) as DocumentFragment;
			
			const title = popupClone.querySelector(".popup-title");

			if (title) {
				title.textContent = "Game over";
			}
			
			const message = popupClone.querySelector(".popup-message");

			if (message) {
				message.textContent = `You scored ${score} points${goal ? ` out of ${goal}` : ""}`;
			}

			const button = popupClone.querySelector(".popup-button");
			
			if (button) {
				button.textContent = "Play again";
				
				button.addEventListener("click", () => {
					const popup = document.querySelector(".popup");

					if (popup) {
						popup.addEventListener("transitionend", () => {
							popup.remove();
							snake?.restart();
						}, { once: true });

						popup.classList.add("popup-hidden");
					}
				});
			}
			
			root.appendChild(popupClone);
		};
		
		snake.run();
	};

	const onUnmount = () => {
		snake?.close();
	};
	
	displayPage("level-template", { onMount, afterMount, onUnmount });
};