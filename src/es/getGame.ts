export function getGame() : Game {
	if ("actors" in game) return game;
	throw new Error("Game object inaccessible");
}
