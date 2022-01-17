import YAML from "yaml";
import { readFileSync } from "fs";
import { IConfig } from "./interfaces";

export class Config {
	token!: string;

	constructor() {
		const config = this.readConfigFile();
		this.token = config.token;
	}

	private readConfigFile(file = "config.yml"): IConfig {
		try {
			const config = readFileSync(file, "utf-8");
			return YAML.parse(config);
		} catch {
			console.log(
				"Please make a configuration file before starting the bot"
			);
			process.exit();
		}
	}
}
