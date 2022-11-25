import { EventConfig } from "../types/event";
import { PopupConfig } from "../types/router.js";

export const showPopup = (root: Element, config: PopupConfig) => {

	const popupTemplate = document.querySelector<HTMLTemplateElement>("template#popup-template");

	if (!popupTemplate) {
		throw new Error("Popup template not found");
	}
	
	const popupClone = popupTemplate.content.cloneNode(true) as DocumentFragment;
	
	const title = popupClone.querySelector(".popup-title");
	if (title) {
		title.textContent = config.title;
	}
	
	const message = popupClone.querySelector(".popup-message");
	if (message) {
		message.textContent = config.message;
	}

	const button = popupClone.querySelector(".popup-button");

	const events: EventConfig[] = [];

	const cleanupEvents = () => {
		for (const { target, type, handler } of events) {
			target.removeEventListener(type, handler);
		}
		events.length = 0;
	};
	
	if (button) {
		button.textContent = config.button;

		const popup = popupClone.querySelector(".popup");
		
		if (!popup) {
			throw new Error("Popup not found");
		}
		
		root.appendChild(popupClone);
		
		const animation = popup.animate([
			{ opacity: 0 },
			{ opacity: 1 }
		], {
			duration: 300,
			easing: "ease",
			fill: "forwards"
		})
		
		animation.onfinish = () => {
			const popupEvent = (e: Event) => {
				cleanupEvents();
				
				animation.reverse();
				
				animation.onfinish = () => {
					popup.remove();
					
					setTimeout(() => {
						config.handler(e);
					}, 250);
				};
			};
			
			events.push({
				target: button,
				type: "click",
				handler: popupEvent
			}, {
				target: window,
				type: "keydown",
				handler: popupEvent
			});

			for (const { target, type, handler } of events) {
				target.addEventListener(type, handler, { once: true });
			}
		};
	}

	return cleanupEvents;
};