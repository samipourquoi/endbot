import { Message } from "discord.js";
import { MinecraftMessage } from "../src/lib/messages.js";
import { mockMember } from "./mockHelpers.js";

describe("MinecraftMessage class", () => {
    const member = mockMember();
    (member as any).roles.highest = { hexColor: "#000000" };

    const members = {
        cache: [
            { id: "10", displayName: "user1" },
            { id: "11", displayName: "user2" },
        ],
    };
    const roles = {
        cache: [
            { id: "10", name: "role1" },
            { id: "11", name: "role2" },
        ],
    };
    const channels = {
        cache: [
            { id: "10", name: "channel1" },
            { id: "11", name: "channel2" },
        ],
    };

    it("Formats a simple message correctly", () => {
        const mockMessage = { content: "simple", member: member } as unknown as Message;
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain("simple");
        expect(msg).toContain((member as any).roles.highest.hexColor);
    });

    it("Formats a message with user", () => {
        const mockMessage = {
            content: "channel <@11>",
            guild: {
                members: members,
                roles: { cache: [] },
            },
            member: member,
        } as unknown as Message;
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain("channel @user2");
    });

    it("Formats a message with role", () => {
        const mockMessage = {
            content: "channel <@&11>",
            guild: {
                members: { cache: [] },
                roles: roles,
            },
            member: member,
        } as unknown as Message;
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain("channel @role2");
    });

    it("Formats a message with channel", () => {
        const mockMessage = {
            content: "channel <#11>",
            guild: {
                channels: channels,
            },
            member: member,
        } as unknown as Message;
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain("channel #channel2");
    });

    it("Formats a complex message", () => {
        const mockMessage = {
            content: "channel <#11> user <@10> role <@&10> channel <#11> user <@11> role <@&10>",
            guild: {
                channels: channels,
                members: members,
                roles: roles,
            },
            member: member,
        } as unknown as Message;
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain(
            "channel #channel2 user @user1 role @role1 channel #channel2 user @user2 role @role1",
        );
    });
});
