import { getGame } from "./getGame";
const SCALE_VALUE = 2; // test number

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
		const scale = SCALE_VALUE ; 
		const position = token.object!.center;
		const panZone = {
			x:position.x,
			y: position.y,
			scale,
		};
		if (canvas)
			await canvas.animatePan (panZone);
	}

	static async onNewTurn(combat: Combat, delta: {}) {
		const combatant = combat.combatant;
		if (!combatant) return;
		// const {tokenId, sceneId, actorId} = combatant as Combatant & {tokenId: string, sceneId: string, actorId:string};
		// const scene = game.scenes!.get(sceneId)!;
		// const token = scene.tokens.get(tokenId)!;
		const token = combatant.token!;
		//TODO: ownership check
		this.releaseAllTokens(combat.scene!);
		this.selectToken(token);
		await this.centerOnToken(token);


	}
}
