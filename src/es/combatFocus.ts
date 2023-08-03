export class CombatFocus {
	static init() {
		Hooks.on("combatRound", (c: Combat, delta: {}) => this.onNewTurn(c, delta));

	}

	static onNewTurn(combat: Combat, delta: {}) {
		const {tokenId, combatantId} = combat.current;

	}
}
