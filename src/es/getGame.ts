export function getGame() : Game {
	if (game && "actors" in game) return game;
	throw new Error("Game object inaccessible");
}

export function localize(str : string) : string {
	const game = getGame();
	return game.i18n.localize(str);
}
