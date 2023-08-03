import { getGame } from "./getGame";
import { LiveCombatSettings } from "./settings";

export class CombatFocus {
	static init() {
		Hooks.on("combatRound", (c: Combat, delta: {}) => this.onNewTurn(c, delta));

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
	}

	static async onNewTurn(combat: Combat, _delta: {}) {
		const game = getGame();
		const combatant = combat.combatant;
		if (!combatant) return;
		// const {tokenId, sceneId, actorId} = combatant as Combatant & {tokenId: string, sceneId: string, actorId:string};
		// const scene = game.scenes!.get(sceneId)!;
		// const token = scene.tokens.get(tokenId)!;
		const token = combatant.token!;
		const isGM =game.user!.isGM;
		if (!token.hasPlayerOwner && isGM) {
			this.releaseAllTokens(combat.scene!);
			this.selectToken(token);
			return;
		}
		if (token.hasPlayerOwner && !isGM) {
			if (token.isOwner) {
				this.releaseAllTokens(combat.scene!);
				this.selectToken(token);
			}
		}
		await this.centerOnToken(token);
	}
}
