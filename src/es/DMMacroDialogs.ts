
export type HPData = {
	tokenId: string | null,
	hpDelta: number,
};
type templateDataType = {
	FDActors: Actor[],
	HDActors: Actor[]
};

export class DamageWindow extends Dialog {
	static async create(tokens: TokenDocument[]) : Promise<HPData[]> {
		const actors = tokens.map(x=> x?.actor).filter(a=>a) as Actor[];
		const templateData = {
			FDActors: actors,
			HDActors: [],
		} satisfies templateDataType;
		const template = "modules/live-combat/templates/DamageWindow.hbs";
		const html = await renderTemplate(template,templateData);
		const dialogData = this.getDialogData(html, templateData);
		//@ts-ignore
		return Dialog.wait(dialogData);
	}

	private static getDialogData(html: string, templateData: templateDataType) {
		return {
			title: "Test Dialog",
			content: html,
			buttons: {
				execute: {
					icon: '<i class="fas fa-check"></i>',
					label: "Go",
					callback: (html: string): HPData[] => {
						const hpChangeAmount = Number($(html).find("#amount").val());
						const actors= templateData.FDActors
							.map(actor => ({
								tokenId: actor.token?.id ?? null,
								hpDelta: hpChangeAmount
							})
							).concat(
								templateData.HDActors
								.map(actor => ({
									tokenId: actor.token?.id ?? null,
									hpDelta: Math.floor(hpChangeAmount/2),
								})
								)
							);
						return actors;
					},
				},
				j: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: (html: string): HPData[] => {
						return [];
					},
				}
			},
			default: "two",
			render: (html: string) => {
				this.enableListeners(html, templateData);

			},
			close: (html: string) : HPData[] => [],
		};
	}

	private static enableListeners(html: string, templateData:templateDataType) {
		$(html).find(".full-damage .actor").on("click", 
			(ev: JQuery.ClickEvent) => this.click_fullDamage(ev, templateData)
		);
		$(html).find(".half-damage .actor").on("click", 
			(ev: JQuery.ClickEvent) => this.click_halfDamage(ev, templateData)
		);

	}

	private static click_fullDamage(ev: JQuery.ClickEvent, templateData: templateDataType) {
		const id :string =$(ev.currentTarget).closest(".actor").data("actorId");
		if (!id) throw new Error("Can't find ID");
		this.shiftActor(id, templateData.FDActors, templateData.HDActors);
	}

	private static click_halfDamage(ev: JQuery.ClickEvent, templateData: templateDataType) {
		const id :string =$(ev.currentTarget).closest(".actor").data("actorId");
		if (!id) throw new Error("Can't find ID");
		this.shiftActor(id, templateData.HDActors, templateData.FDActors);
	}

	private static shiftActor(actorId: string, sourceArr: Actor[], destArr: Actor[]) : void {
		const actor = sourceArr.find(a=> a.id== actorId);
		if (!actor)
			throw new Error(`Can't find actor ${actorId}`);
		sourceArr.splice(sourceArr.indexOf(actor),1 );
		destArr.push(actor);
	}


}
