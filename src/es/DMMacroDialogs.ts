
type SaveType = "str" | "dex" | "con" | "int" | "wis" | "cha";

export type HPData = {
	tokenId: string | null,
	hpDelta: number,
	save: null | {
		type: SaveType,
		dc: number,
		save_for_half: boolean,// save for half damage
	},
	status: null | {
		statusName: string,
		failOnly: boolean, //status on failed save only
		addState: boolean, //tells to add or subtract
	}
	resize: null | "normal" | "half" | "alter",
};
type templateDataType = {
	FDActors: Token[],
	HDActors: Token[]
};

export class DamageWindow {
	dialog: Dialog;
	conf: (hpData: HPData[]) => void
	rej: (reason: string) => void;
	template: string;
	templateData: templateDataType;

	static async create(tokens: TokenDocument[]) : Promise<HPData[]> {
		const Actualtokens = tokens.map(x=> x?.object).filter(a=>a) as Token[];
		const templateData = {
			FDActors: Actualtokens,
			HDActors: [],
		} satisfies templateDataType;
		const template = "modules/live-combat-taragnor/templates/DamageWindow.hbs";
		return new Promise ( (conf, rej) => {
		const wnd = new DamageWindow(conf, rej);
			wnd.create(template, templateData);
		});
		// return Dialog.wait(dialogData);
	}

	constructor (conf : (hpData: HPData[]) => void, rej: (reason:string) => void ) {
		this.conf = conf;
		this.rej = rej;
	}

	async create(template: string, templateData: templateDataType) {
		const html = await renderTemplate(template,templateData);
		this.templateData = templateData;
		this.template = template;
		const data = this.getDialogData(html, templateData);
		this.dialog = new Dialog(data);
		this.dialog.render(true);
	}

	private getDialogData(html: string, templateData: templateDataType) {
		return {
			title: "HP mod dialog",
			content: html,
			buttons: {
				execute: {
					icon: '<i class="fas fa-check"></i>',
					label: "Go",
					callback: (html: HTMLElement | JQuery<HTMLElement>): HPData[] => {
						const raw = $(html).find(".amount-input").val();
						const saveData = this.prepareSaveData(html);
						const stateData = this.prepareStateData(html);
						const hpChangeAmount = Number(raw);
						const sizeData =this.prepareSizeData(html);
						const actors= templateData.FDActors
							.map(token => ({
								tokenId: token.id ?? null,
								hpDelta: hpChangeAmount,
								save: saveData,
								status: stateData,
								resize: sizeData,
							} satisfies HPData )
							).concat(
								templateData.HDActors
								.map(token => ({
									tokenId: token.id ?? null,
									hpDelta: Math.floor(hpChangeAmount/2),
									save: saveData,
									status: stateData,
									resize: sizeData,
								} satisfies HPData)
								)
							);
						this.conf(actors);
						return actors;
					},
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: (): HPData[] => {
						this.conf([]);
						return [];
					},
				}
			},
			default: "execute",
			render: (html: HTMLElement |  JQuery<HTMLElement>) => {
				this.enableListeners(html);
			},
			close: () => this.rej("closed"),
		};
	}

	private prepareSaveData(html: HTMLElement |  JQuery<HTMLElement>) : null | HPData["save"] {
		const type = String($(html).find(".save-type option:selected").val());
		if (type == "none") return null;
		const dc = Number($(html).find(".save-dc").val());
			const save_for_half =  $(html).find(".save-for-half").is(":checked");
		return {
			type: type as SaveType ,
			dc,
			save_for_half
		}
	}

	private prepareStateData (html: HTMLElement |  JQuery<HTMLElement>) : null | HPData["status"] {
		const removeState = $(html).find(".remove-state").is(":checked");
		const failOnly = $(html).find(".failed-save-state").is(":checked");
		const statusName  =String($(html).find(".state-selector option:selected").val())

		return {
			statusName,
			failOnly,
			addState: !removeState
		}

	}
	private prepareSizeData(html: HTMLElement |  JQuery<HTMLElement>) {
		const size = String($(html).find(".token-size option:selected").val());
		switch (size) {
			case "no-change": return null;
			case "normal": return "normal";
			case "half": return "half";
			case "alter": return "alter";
			default: throw new Error(`Unrecognized token size value ${size}`);


		}

	}

	private enableListeners(html: HTMLElement |  JQuery<HTMLElement>) {
		$(html).find(".full-damage .actor").on("click",
			(ev: JQuery.ClickEvent) => this.click_fullDamage(ev)
		);
		$(html).find(".half-damage .actor").on("click",
			(ev: JQuery.ClickEvent) => this.click_halfDamage(ev)
		);
		setTimeout( ()=> $(html).find(".amount-input").focus(), 1);

	}

	private click_fullDamage(ev: JQuery.ClickEvent) {
		const id :string =$(ev.currentTarget).closest(".actor").data("actorId");
		if (!id) throw new Error("Can't find ID");
		const templateData = this.templateData;
		this.shiftActor(id, templateData.FDActors, templateData.HDActors);
		this.refreshHTML();
	}

	private click_halfDamage(ev: JQuery.ClickEvent) {
		const id :string =$(ev.currentTarget).closest(".actor").data("actorId");
		if (!id) throw new Error("Can't find ID");
		const templateData = this.templateData;
		this.shiftActor(id, templateData.HDActors, templateData.FDActors);
		this.refreshHTML();
	}

	private shiftActor(actorId: string, sourceArr: Token[], destArr: Token[]) : void {
		const actor = sourceArr.find(a=> a.id== actorId);
		if (!actor)
		throw new Error(`Can't find actor ${actorId}`);
		sourceArr.splice(sourceArr.indexOf(actor),1 );
		destArr.push(actor);
	}

	private async refreshHTML() {
		const html = await renderTemplate(this.template, this.templateData);
		const x = $(this.dialog.element).find("form").html(html);
		this.enableListeners(x)

	}
}
