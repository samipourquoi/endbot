import { readFileSync } from "fs";
import { parse } from "yaml";
import { Config } from "../src/config";

describe("Bot config", () => {
	const testConfig = readFileSync("./tests/config.test.yml", "utf-8");
	const expectedConfig = parse(testConfig);

	const mockReadConfigFile = jest
		.spyOn(Config.prototype as any, "readConfigFile")
		.getMockImplementation()!;

	it("exits if a config file is not found", () => {
		const mockExit = jest
			.spyOn(process as any, "exit")
			.mockImplementation(() => {});

		mockReadConfigFile("nonexistent_file");
		expect(mockExit).toHaveBeenCalled();
	});

	it("sets the correct values when called", () => {
		const mockReadConfigFile = jest.fn();
		mockReadConfigFile.mockReturnValue(expectedConfig);
		(Config as any).prototype.readConfigFile = mockReadConfigFile;

		const config = new Config();
		expect(config.token).toBe(expectedConfig.token);
	});
});
