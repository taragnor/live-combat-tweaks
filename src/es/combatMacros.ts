import { DamageWindow, HPData } from "./DMMacroDialogs.js"
import { getGame } from "./getGame.js";

export class CombatMacros {
	static _dmWindow: HPData[]= [];

	static async DamageTokens(): Promise<void> {
		const game = getGame();
		const tokens = game.scenes!.current!.tokens.contents.filter( x=> x.object?.controlled);
		if (this._dmWindow.length> 0) return;
		this._dmWindow = await DamageWindow.create(tokens);
		const scene = game.scenes!.current!;
		for (const entry of this._dmWindow) {
			if (!entry.tokenId) continue;
			const token = scene.tokens.get(entry.tokenId);
			const hpChange = entry.hpDelta;
			// console.log(`HP change: ${hpChange}`);
			if (token && token.actor) {
				//@ts-ignore
				await token.actor.applyDamage(hpChange, 1);
			} else {
				ui.notifications!.error(`Cant' find token ${entry.tokenId}`);
			}
		}
		this._dmWindow = [];
	}


}




