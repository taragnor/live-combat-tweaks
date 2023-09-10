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
			let hpChange = entry.hpDelta;
			// console.log(`HP change: ${hpChange}`);
			if (token && token.actor) {
				if (entry.save) {
					const {type, dc, save_for_half} = entry.save;
					//@ts-ignore
					const rollTotal :number = (await token.actor.rollAbilitySave(type)).total;
					if (rollTotal > dc)  {
						if (save_for_half)
							hpChange = Math.floor(hpChange/2);
						if (!entry.status?.failOnly && entry?.status?.addState) {
							//TODO: change this to active effects
							// await token.actor.addState(entry.status.statusName);
						}
					} else {
						if (entry.status && entry.status.addState) {
							//TODO: change this to active effects
							// await token.actor.addState(entry.status.statusName);
						}
					}
				}
				if (hpChange != 0) {
					//@ts-ignore
					await token.actor.applyDamage(hpChange, 1);
				}
				if (entry.status && !entry.status.addState) {
					//TODO: change this to active effects
					// await token.actor.removeState(entry.status.statusName);
				}
				if (entry.resize) {
					//@ts-ignore
					const size : "tiny" | "med" | "sm" | "lg"| "huge" | "grg"  = token.actor.system.traits.size;
					let base = {size: 1, scale: 1};
					switch (size) {
						case "tiny":
							base.size = 0.5; base.scale=0.5;
							break;
						case "sm":
							base.size = 1; base.scale=0.8;
							break;
						case "med":
							base.size = 1; base.scale=1;
							break;
						case "lg":
							base.size = 2; base.scale=1;
							break;
						case "huge":
							base.size = 3; base.scale=1;
							break;
						case "grg":
							base.size = 4; base.scale=1;
							break;
						default:
							size satisfies never;
							break;
					}
					switch (entry.resize) {
						case "normal":
							break;
						case "half":
							base.size = base.size * 0.5; base.scale *= 0.9;
							break;
						case "alter":
							base.size = base.size * 1; base.scale *= 0.8;
							break;
						default:
							entry.resize satisfies never;
					}
					token.update( {
						width: base.size,
						height: base.size,
						texture: {
							scaleX: base.scale,
							scaleY: base.scale,
						}
					});
				}
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

	static async tokenResizer() : Promise<void> {
		const game = getGame();
		//TODO mkae this
		// const windowRet = await ResizerWindow.create();
		const tokens = game.scenes!.current!.tokens.contents.filter( x=> x.object?.controlled);
		for (const token of tokens) {
			//Resizing code here
		}
	}
}
