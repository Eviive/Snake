import { router } from "./pages/router.js";

(() => {

	router();
	
	window.addEventListener("hashchange", router);

})();