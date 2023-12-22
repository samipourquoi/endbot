import { IConfig, IServer } from "./interfaces.js";
import YAML from "yaml";
import { readFileSync } from "fs";

export class Config {
    token!: string;
    servers: IServer[] = [];

    constructor() {
        const config = this.readConfigFile();
        this.setServerConfig(config);
        this.token = config.token;
    }

    private readConfigFile(): IConfig {
        try {
            const config = readFileSync("config.yml", "utf-8");
            return YAML.parse(config);
        } catch {
            // TODO: Specify if file was not found or there was a syntax error
            console.log("Please make a configuration file before starting the bot");
            process.exit();
        }
    }

    private setServerConfig(config: IConfig): void {
        // Since a '==' is used instead of a '===', it will return
        // when config.servers is either null or undefined
        if (config.servers == null) return;

        for (const server of config.servers) {
            // Sets default options if they aren't provided in the config file
            server.rcon_port ??= 25575;

            this.servers.push(server);
        }
    }
}
