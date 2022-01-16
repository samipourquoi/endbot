import { readFileSync } from "fs";
import { parse } from "yaml";
import { Config } from "../src/config";

describe("Bot config", () => {
	const testConfig = readFileSync("./tests/config.test.yml", "utf-8");
	const expectedConfig = parse(testConfig);

	const mockReadConfigFile = jest
		.spyOn(Config.prototype as any, "readConfigFile")
		.getMockImplementation()!;

	it("finds and reads the config file correctly", () => {
		const parsedConfig = mockReadConfigFile("./tests/config.test.yml");
		expect(parsedConfig).toMatchObject(expectedConfig);
	});

	it("exits if a config file is not found", () => {
		const mockExit = jest
			.spyOn(process as any, "exit")
			.mockImplementation(() => {});

		mockReadConfigFile("nonexistent_file");
		expect(mockExit).toHaveBeenCalled();
	});

	it("calls init() when instantiated", () => {
		const mockReadConfigFile = jest.fn();
		mockReadConfigFile.mockReturnValue(expectedConfig);
		(Config as any).prototype.readConfigFile = mockReadConfigFile;

		const initSpy = jest.spyOn(Config.prototype as any, "init");

		const config = new Config();
		expect(initSpy).toHaveBeenCalled();
		expect(config.token).toBe(expectedConfig.token);
	});
});
