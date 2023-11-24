import { exec } from "child_process";
import { App, Notice, Plugin } from "obsidian";
import * as path from "path";

var isWin = process.platform === "win32";

export default class DeployOchrsPlugin extends Plugin {
	async onload() {
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"upload-cloud",
			"Deploy using Ochrs",
			() => deploy(this.app)
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "run-deploy-script",
			name: "Deploy with Ochrs",
			callback: () => deploy(this.app),
		});
	}

	onunload() {}
}

const deploy = (app: App) => {
	new Notice("Starting deployment");

	const file = app.vault.getFiles().find((f) => f.name === "Index.md");
	if (file) {
		if (isWin) {
			const text = app.vault.getResourcePath(file);
			const indexPath = text.split("Index.md")[0].slice(11);
			const vaultDir = path.dirname(
				indexPath.slice(indexPath.indexOf("/"))
			)
				.replace("/","")
				.replace(/\//g,"\\");

			exec(
				"bash -c ./update-notes.sh",
				{ cwd: vaultDir },
				(error, stdout, stderr) => {
					if (error) {
						new Notice(error.message);
						return;
					}
					new Notice(stdout);
					const msg = "Finished deploying!";
					new Notice(msg);
				}
			);
		} else {
			const text = app.vault.getResourcePath(file);
			const indexPath = text.split("Index.md")[0].slice(11);
			const vaultDir = path.dirname(indexPath.slice(indexPath.indexOf("/")));
	
			exec(
				`${vaultDir}/update-notes.sh`,
				{ cwd: vaultDir },
				(error, stdout, stderr) => {
					if (error) {
						new Notice(error.message);
						return;
					}
					new Notice(stdout);
					const msg = "Finished deploying!";
					new Notice(msg);
				}
			);
		}
	} else {
		new Notice("No index found");
	}
};
