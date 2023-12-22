import { Command } from "../../src/lib/command.js";
import { ICommandInfo } from "../../src/interfaces.js";
import { Message } from "discord.js";
import { mockMember } from "../mockHelpers.js";

const commandInfo = {
    roles_allowed: ["test_role"],
    users_allowed: ["test_user"],
} as ICommandInfo;

const command = new Command(commandInfo);

describe("Command class", () => {
    const mockMessage = {
        member: mockMember(),
    } as unknown as Message;

    it("Throws an error when run() is called", async () => {
        // If the parent run() function is called, it means the child command
        // run() function is not implemented
        await expect(command.run()).rejects.toThrowError("no functionality");
    });

    // The following tests are for the hasPermission() function
    it("returns false when user doesn't have permission to run command", async () => {
        jest.spyOn(mockMessage.member!.roles.cache, "has").mockImplementation(() => false);
        expect(await command.hasPermission(mockMessage)).toBeFalsy();
    });

    it("returns true when user has permission to run command", async () => {
        // The first test is if the member has a permitted role
        jest.spyOn(mockMessage.member!.roles.cache, "has").mockImplementationOnce(() => true);
        expect(await command.hasPermission(mockMessage)).toBeTruthy();

        // The second test is if the member has a permitted user id
        (mockMessage as any).member.id = "test_user";

        jest.spyOn(mockMessage.member!.roles.cache, "has").mockImplementation(() => false);
        expect(await command.hasPermission(mockMessage)).toBeTruthy();
    });

    it("returns true when no permissions are set for the command", async () => {
        command.roles_allowed = [];
        command.users_allowed = [];
        expect(await command.hasPermission(mockMessage)).toBeTruthy();
    });
});
