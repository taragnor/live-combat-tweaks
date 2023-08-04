import { getGame } from "./getGame.js";
import { LiveCombatSettings } from "./settings.js";

async function delay(ms: number) : Promise<void> {
	return new Promise<void>( function (c, _r)  {
		setTimeout( ()=> c(), ms);
	});

}

export class CombatFocus {
	static init() {
		console.log("Init Combat Focus");
		Hooks.on("updateCombat", (c: Combat, delta: {}) => this.onNewTurn(c, delta));
		Hooks.on("updateCombat", (c: Combat, delta: {}) => this.onNewTurn(c, delta));

	}

	static releaseAllTokens(scene: Scene) {
		scene.tokens
			.filter(x=> x.object!.controlled)
			.forEach( x=>x.object!.release());
	}

	static selectToken(tokenDoc : TokenDocument) {
		tokenDoc.object!.control();
	}

	static async centerOnToken( token: TokenDocument) {
		const game = getGame();
		const scale = !game.user!.isGM ? LiveCombatSettings.getCenterScaleValue(): undefined;
		const position = token.object!.center;
		const panZone = {
			x:position.x,
			y: position.y,
			scale,
		};
		if (canvas)
			await canvas.animatePan (panZone);
		else
			throw new Error("No canvas found");
	}

	static async onNewTurn(combat: Combat, delta: any) {
		if (delta.turn == undefined && delta.round == undefined) return;
		const game = getGame();
		const combatant = combat.combatant;
		if (!combatant) return;
		const scene = combat.scene!;
		const token = combatant.token!;
		const isGM = game.user!.isGM;
		this.releaseAllTokens(scene);
		await delay(500); //waits for visible to refresh to determine visibility
		if (isGM)  {
			if (!token.hasPlayerOwner && isGM) {
				this.selectToken(token);
			}
		} else {
			if (token.isOwner) {
				this.selectToken(token);
			} else {
				if (!token.object!.visible)
					return;
			}
		}
		await this.centerOnToken(token);
	}
}
