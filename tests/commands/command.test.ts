import { ICommandContext, ICommandInfo } from "../../src/lib/interfaces.js";
import { Command } from "../../src/commands/command.js";
import { mockMember } from "../mockHelpers.js";

const commandInfo = {
    roles_allowed: ["test_role"],
    users_allowed: ["test_user"],
} as ICommandInfo;

const command = new Command(commandInfo);

describe("Command class", () => {
    const member = mockMember();

    it("Throws an error when run() is called", async () => {
        // If the parent run() function is called, it means the child command
        // run() function is not implemented
        const cmdContext = {} as unknown as ICommandContext;
        await expect(command.run(cmdContext)).rejects.toThrowError("no functionality");
    });

    // The following tests are for the hasPermission() function
    it("Returns false when user doesn't have permission to run command", async () => {
        jest.spyOn(member.roles.cache, "has").mockImplementationOnce(() => false);
        expect(await command.hasPermission(member)).toBeFalsy();
    });

    it("Returns true when user has permission to run command", async () => {
        // The first test is if the member has a permitted role
        jest.spyOn(member.roles.cache, "has").mockImplementationOnce(() => true);
        expect(await command.hasPermission(member)).toBeTruthy();

        // The second test is if the member has a permitted user id
        (member as any).id = "test_user";

        jest.spyOn(member.roles.cache, "has").mockImplementationOnce(() => false);
        expect(await command.hasPermission(member)).toBeTruthy();
    });

    it("Returns true when no permissions are set for the command", async () => {
        command.roles_allowed = [];
        command.users_allowed = [];
        expect(await command.hasPermission(member)).toBeTruthy();
    });
});
