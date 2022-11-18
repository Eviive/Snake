import { displayPage } from "./router.js";

export const game = (level: number) => {
	displayPage("#level-template", page => {
		const title = page.querySelector(".title")
		
		if (title) {
			title.textContent = `Level ${level}`;
		}
	});
};