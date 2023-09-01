import { AttackWindow, AtkData } from "./AttackWindow.js";
import { DamageWindow, HPData } from "./DMMacroDialogs.js"
import { getGame } from "./getGame.js";
 

export class CombatMacros {

	static async damageTokens(): Promise<void> {
		const game = getGame();
		const tokens = game.scenes!.current!.tokens.contents.filter( x=> x.object?.controlled);
		const windowRet = await DamageWindow.create(tokens);
		const scene = game.scenes!.current!;
		for (const entry of windowRet) {
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
	}


	static async tokenAttack() : Promise<void> {
		const game = getGame();
		const tokens = game.scenes!.current!.tokens.contents.filter( x=> x.object?.controlled);
		for (const token of tokens) {
			const atkData : AtkData = await AttackWindow.create(token);
			if (!atkData) return;
			const {itemName} = atkData;
			if (itemName) {
				//@ts-ignore
				dnd5e.documents.macro.rollItem(itemName);
			}
		}



	}

}




