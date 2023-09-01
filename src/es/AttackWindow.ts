export type AtkData  = {
	itemName: string;
} | null;

type templateDataType = {
	token: Token;
	attacks: Item[];
}


export class AttackWindow {
	dialog: Dialog;
	conf: (hpData: AtkData) => void
	rej: (reason: string) => void;
	template: string;
	templateData: templateDataType;

	static ALLOWABLETYPES = ["weapon", "spell", "feat"] ;

	static async create(tokenD: TokenDocument) : Promise<AtkData> {
		const token = tokenD.object as Token;
		if (!token || !token.actor) return null;
		const abilityChoices = token.actor.items.filter(item=> this.ALLOWABLETYPES.includes(item.type));
		if (abilityChoices.length ==0 ) return null;
		const templateData = {
			token,
			attacks: abilityChoices
		} satisfies templateDataType;
		const template = "modules/live-combat-taragnor/templates/AttackWindow.hbs";
		return new Promise ( (conf, rej) => {
		const wnd = new AttackWindow(conf, rej);
			wnd.create(template, templateData);
		});
	}

	constructor (conf : (hpData: AtkData) => void, rej: (reason:string) => void ) {
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

	private getDialogData(html: string, _templateData: templateDataType) {
		return {
			title: "Attack Dialog",
			content: html,
			buttons: {
				execute: {
					icon: '<i class="fas fa-check"></i>',
					label: "Go",
					callback: (html: HTMLElement | JQuery<HTMLElement>): AtkData => {
						const raw = $(html).find('input[name="atk-select"]:checked').val();
						console.log("Raw:" +  raw);
						const atkData =  {
							itemName: String(raw)
						};
						this.conf(atkData);
						return atkData;
					},
				},
				cancel: {
					icon: '<i class="fas fa-times"></i>',
					label: "Cancel",
					callback: (): AtkData => {
						this.conf(null);
						return null;
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

	private enableListeners(html: HTMLElement |  JQuery<HTMLElement>) {
	}

}

