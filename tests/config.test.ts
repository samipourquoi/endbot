import { Config } from "../src/config.js";
import fs from "fs";
import { readConfig } from "./mockHelpers.js";

describe("Config class", () => {
    let config;

    const expectedConfig = readConfig();
    const mockReadConfigFile = jest
        .spyOn(Config.prototype as any, "readConfigFile")
        .getMockImplementation()!;

    (Config as any).prototype.readConfigFile.mockReturnValue(expectedConfig);

    it("sets the correct values when initialized", () => {
        config = new Config();
        expect(config.token).toBe(expectedConfig.token);
        expect(config.servers).toStrictEqual(expectedConfig.servers);
    });

    it("finds and reads the config file correctly", () => {
        // Make readFileSync read the test config instead of the actual config
        jest.spyOn(fs, "readFileSync").mockReturnValueOnce(
            fs.readFileSync("./tests/config.test.yml", "utf-8"),
        );
        const parsedConfig = mockReadConfigFile();
        expect(parsedConfig).toStrictEqual(expectedConfig);
    });

    it("exits if a config file is not found", () => {
        // Don't print out the error message when running the test
        jest.spyOn(console, "log").mockImplementationOnce(() => {});

        // Throw an error internally to make sure it is caught properly
        jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
            throw new Error();
        });

        const mockExit = jest.spyOn(process as any, "exit").mockImplementationOnce(() => {});
        mockReadConfigFile();
        expect(mockExit).toHaveBeenCalled();
    });

    it("sets default server configurations if they aren't explicitly provided", () => {
        const minimalServerConfig = expectedConfig.servers![0];
        delete minimalServerConfig.rcon_port;

        config = new Config();
        expect(config.servers[0].rcon_port).toBe(25575);
    });

    it("doesn't try to set up servers if none are provided", () => {
        const noServerConfig = expectedConfig;

        noServerConfig.servers = undefined;
        config = new Config();
        expect(config.servers).toStrictEqual([]);

        delete noServerConfig.servers;
        config = new Config();
        expect(config.servers).toStrictEqual([]);
    });
});
