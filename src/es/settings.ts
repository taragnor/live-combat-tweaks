import { localize , getGame} from "./getGame.js";

export class LiveCombatSettings {
	static init	() {

		const game = getGame();
		game.settings.register("live-combat-taragnor", "scaleZoomLevel", {
			name: localize(	"live-combat-taragnor.settings.scaleZoom.name"),
			hint: localize("CityOfMist.settings.weaknessCap.hint"),
			scope: "world",
			config: true,
			type: Number,
			default:0.5,
			//@ts-ignore
			restrict: true
		});

	}

	static get(str: string) : unknown {
		const game = getGame();
		return game.settings.get("live-combat-taragnor", str) ;
	}

	static getCenterScaleValue(): number {
		return this.get("scaleZoomLevel") as number;
	}


}
