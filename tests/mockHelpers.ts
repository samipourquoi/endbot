import { IConfig } from "../src/lib/interfaces.js";
import YAML from "yaml";
import fs from "fs";

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const mockMember = () => ({
    roles: {
        cache: { has: jest.fn() },
        highest: { hexColor: "#000000" },
    },
});

export function readConfig(): IConfig {
    const testConfig = fs.readFileSync("./tests/config.test.yml", "utf-8");
    return YAML.parse(testConfig);
}
