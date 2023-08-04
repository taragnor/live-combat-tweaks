import { LiveCombatSettings } from "./settings.js";
import {CombatFocus} from "./combatFocus.js";

Hooks.on("ready", () => {
	LiveCombatSettings.init();
	CombatFocus.init();
});
//@ts-ignore
window.liveTweaks = {};
