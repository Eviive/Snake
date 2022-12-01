import { home } from "./home.js";
import { game } from "./game.js";
const root = document.getElementById("root");
if (!root) {
    throw new Error("Root element not found");
}
let lastPage = null;
export const router = () => {
    const hash = window.location.hash;
    const matches = hash.match(/^#level-[0-9]+$/);
    lastPage?.onUnmount?.();
    const animation = root.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 300,
        easing: "ease",
        fill: "forwards"
    });
    animation.onfinish = () => {
        animation.onfinish = null;
        animation.reverse();
        if (matches) {
            const level = parseInt(matches[0].split("-")[1]);
            game(level);
        }
        else {
            home();
        }
    };
};
export const displayPage = (templateId, callbacks = {}) => {
    const pageTemplate = document.querySelector(`template#${templateId}`);
    if (!pageTemplate) {
        throw new Error(`Template #${templateId} not found`);
    }
    const pageFragment = pageTemplate.content;
    callbacks.onMount?.(root, pageFragment);
    root.replaceChildren(pageFragment.cloneNode(true));
    callbacks.afterMount?.(root);
    lastPage = callbacks;
};
