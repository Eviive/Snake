export const showPopup = (root, config, keydown = true) => {
    const popupTemplate = document.querySelector("template#popup-template");
    if (!popupTemplate) {
        throw new Error("Popup template not found");
    }
    const popupClone = popupTemplate.content.cloneNode(true);
    const title = popupClone.querySelector(".popup-title h2");
    if (title) {
        title.textContent = config.title;
    }
    if (config.homeLink === false) {
        const homeLink = popupClone.querySelector(".popup-title a");
        homeLink?.remove();
    }
    const message = popupClone.querySelector(".popup-message");
    if (message) {
        message.textContent = config.message;
    }
    const button = popupClone.querySelector(".popup-button");
    const events = [];
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
        if (config.content) {
            popup.firstElementChild?.insertBefore(config.content, button);
        }
        root.appendChild(popupClone);
        const animation = popup.animate([
            { opacity: 0 },
            { opacity: 1 }
        ], {
            duration: 300,
            easing: "ease",
            fill: "forwards"
        });
        animation.onfinish = () => {
            const popupEvent = (e) => {
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
            });
            if (keydown) {
                events.push({
                    target: window,
                    type: "keydown",
                    handler: popupEvent
                });
            }
            for (const { target, type, handler } of events) {
                target.addEventListener(type, handler, { once: true });
            }
        };
    }
    return cleanupEvents;
};
