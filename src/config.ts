import YAML from "yaml";
import { readFileSync } from "fs";

export class Config {
	token!: string;

	constructor() {
		this.init();
	}

	private init() {
		const config = this.readConfigFile();
		this.token = config.token;
	}

	private readConfigFile(file = "config.yml") {
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
