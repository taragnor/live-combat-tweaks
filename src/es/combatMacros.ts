import { DamageWindow, HPData } from "./DMMacroDialogs"
import { getGame } from "./getGame";

export class CombatMacros {
	static _dmWindow: HPData[]= [];

	static async DamageTokens(): Promise<void> {
		const game = getGame();
		const tokens = game.scenes!.current!.tokens.contents.filter( x=> x.object?.controlled);
		if (this._dmWindow) return;
		this._dmWindow = await DamageWindow.create(tokens);
		const scene = game.scenes!.current!;
		for (const entry of this._dmWindow) {
			const token = scene.tokens.get(entry.tokenId);
			const hpChange = entry.hpDelta;
			if (token && token.actor) {
				await this.applyDamage(token.actor, hpChange);
			} else {
				ui.notifications!.error(`Cant' find token ${entry.tokenId}`);
			}
		}
		this._dmWindow = [];
	}

	static async  applyDamage (actor: Actor, dmg: number) : Promise<void>  {
		//@ts-ignore
		let tmp = actor.system.attributes.hp.temp ?? 0;
		//@ts-ignore
		let current = actor.system.attributes.hp.value ?? 0;
		const tmpabsorb = Math.max(tmp, dmg);
		tmp -= tmpabsorb;
		dmg -= tmpabsorb;
		current -= dmg;
		await actor.update(
			{
				"system.attributes.hp.value" : current,
				"system.attributes.hp.temp" : tmp
			});
	}

}




//@ts-ignore
window.TaragnorDNDMacros = CombatMacros;
