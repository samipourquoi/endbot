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

	private readConfigFile() {
		const config = readFileSync("config.yml", "utf-8");
		return YAML.parse(config)
	}
}
