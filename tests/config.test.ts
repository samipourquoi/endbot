import { Config } from "../src/config";
import { parse } from "yaml";
import { readFileSync } from "fs";

describe("Config Class", () => {
	const testConfig = readFileSync("./tests/config.test.yml", "utf-8");
	const expectedConfig = parse(testConfig);

	const mockReadConfigFile = jest
		.spyOn(Config.prototype as any, "readConfigFile")
		.getMockImplementation()!;

	it("sets the correct values when called", () => {
		const mockReadConfigFile = jest.fn();
		mockReadConfigFile.mockReturnValue(expectedConfig);
		(Config as any).prototype.readConfigFile = mockReadConfigFile;

		const config = new Config();
		expect(config.token).toBe(expectedConfig.token);
	});

	it("finds and reads the config file correctly", () => {
		const parsedConfig = mockReadConfigFile("./tests/config.test.yml");
		expect(parsedConfig).toMatchObject(expectedConfig);
	});

	it("exits if a config file is not found", () => {
		const mockExit = jest.spyOn(process as any, "exit").mockImplementation(() => {});

		mockReadConfigFile("nonexistent_file");
		expect(mockExit).toHaveBeenCalled();
	});
});
