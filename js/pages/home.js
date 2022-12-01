import { defaultGameSettings } from "../types/game.js";
import { showPopup } from "../utils/popup.js";
import { displayPage } from "./router.js";
export const home = () => {
    let popupUnmount = null;
    const onMount = (root) => {
        root.className = "home";
    };
    const afterMount = (root) => {
        const settingsButton = root.querySelector(".settings-button");
        if (settingsButton) {
            let settings = {};
            const savedSettings = localStorage.getItem("settings");
            if (savedSettings) {
                settings = JSON.parse(savedSettings);
            }
            else {
                settings = defaultGameSettings;
            }
            const saveSettings = () => {
                localStorage.setItem("settings", JSON.stringify(settings));
            };
            settingsButton.addEventListener("click", () => {
                const settingsFragment = document.createDocumentFragment();
                const settingsWrapper = document.createElement("ul");
                settingsWrapper.className = "settings-wrapper";
                const settingsItem = document.createElement("li");
                settingsItem.className = "settings-item";
                const settingsLabel = document.createElement("label");
                settingsLabel.className = "settings-label";
                settingsLabel.textContent = "Smooth movement :";
                const settingsInput = document.createElement("input");
                settingsInput.className = "settings-input";
                settingsInput.type = "checkbox";
                settingsInput.name = "smooth-movement";
                settingsInput.checked = !!settings.smoothMovement;
                settingsInput.addEventListener("input", () => {
                    settings = {
                        ...settings,
                        smoothMovement: settingsInput.checked
                    };
                });
                settingsItem.appendChild(settingsLabel);
                settingsItem.appendChild(settingsInput);
                settingsWrapper.appendChild(settingsItem);
                settingsFragment.appendChild(settingsWrapper);
                popupUnmount = showPopup(root, {
                    title: "Settings",
                    homeLink: false,
                    message: "Customize your settings",
                    content: settingsFragment,
                    button: "Save",
                    handler: () => saveSettings?.()
                }, false);
            });
        }
    };
    const onUnmount = () => {
        popupUnmount?.();
    };
    displayPage("home-template", { onMount, afterMount, onUnmount });
};
