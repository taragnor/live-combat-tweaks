interface Actor {
	statuses: Set<string>
}

interface PlaceableObject {
	get controlled(): boolean;
}
