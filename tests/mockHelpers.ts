import { GuildMember, TextChannel } from "discord.js";
import { IConfig } from "../src/lib/interfaces.js";
import YAML from "yaml";
import fs from "fs";

export function mockChannel(): TextChannel {
    return { send: jest.fn() } as unknown as TextChannel;
}

export function mockMember(): GuildMember {
    return {
        roles: {
            cache: { has: jest.fn() },
            highest: { hexColor: "#000000" },
        },
    } as unknown as GuildMember;
}

export function readConfig(): IConfig {
    const testConfig = fs.readFileSync("./tests/config.test.yml", "utf-8");
    return YAML.parse(testConfig);
}
