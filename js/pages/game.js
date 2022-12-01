import { showPopup } from "../utils/popup.js";
import { Game } from "../game/Game.js";
import { displayPage } from "./router.js";
export const game = (level) => {
    const titleText = `Level ${level}`;
    const onMount = (root, page) => {
        document.title = `Snake - ${titleText}`;
        root.className = "game";
        const title = page.querySelector(".title");
        if (title) {
            title.textContent = titleText;
        }
    };
    let snake = null;
    let popupUnmount = null;
    const afterMount = async (root) => {
        const onGameReady = () => {
            popupUnmount = showPopup(root, {
                title: "Ready?",
                message: "Press any key to start.",
                button: "Play",
                handler: () => snake?.run()
            });
        };
        const onGameWin = () => {
            popupUnmount = showPopup(root, {
                title: "You win!",
                message: "Press any key to go back to home.",
                button: "Home",
                handler: () => window.location.hash = ""
            });
        };
        const onGameOver = (score, goal) => {
            popupUnmount = showPopup(root, {
                title: "Game over",
                message: `You scored ${score} points${goal ? ` out of ${goal}` : ""}.`,
                button: "Play again",
                handler: () => snake?.restart()
            });
        };
        snake = await Game.builder(level, onGameReady, onGameWin, onGameOver);
    };
    const onUnmount = () => {
        snake?.close();
        snake = null;
        popupUnmount?.();
    };
    displayPage("level-template", { onMount, afterMount, onUnmount });
};
