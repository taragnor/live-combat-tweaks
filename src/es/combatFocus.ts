import { getGame } from "./getGame.js";
import { LiveCombatSettings } from "./settings.js";

export class CombatFocus {
	static init() {
		console.log("Init Combat Focus");
		Hooks.on("updateCombat", (c: Combat, delta: {}) => this.onNewTurn(c, delta));
		Hooks.on("updateCombat", (c: Combat, delta: {}) => this.onNewTurn(c, delta));

	}

	static releaseAllTokens(scene: Scene) {
		scene.tokens
		//@ts-ignore
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
		const scene =combat.scene!;
		const token = combatant.token!;
		const isGM =game.user!.isGM;
		if (!token.hasPlayerOwner && isGM) {
			this.releaseAllTokens(scene);
			this.selectToken(token);
		} else if (token.hasPlayerOwner && !isGM && token.isOwner) {
			this.releaseAllTokens(scene);
			this.selectToken(token);
		} else if (!isGM) {
			this.releaseAllTokens(scene);
			if (!token.object!.visible) return;
		}
		await this.centerOnToken(token);
	}
}
