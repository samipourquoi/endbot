import { DiscordMessage, MinecraftMessage } from "../src/lib/messages.js";
import { Message, TextChannel } from "discord.js";
import { mockMember } from "./mockHelpers.js";

const guild = {
    members: {
        cache: [
            { id: "10", displayName: "user1" },
            { id: "11", displayName: "user2" },
        ],
        fetch: jest.fn(),
    },
    roles: {
        cache: [
            { id: "10", name: "role1" },
            { id: "11", name: "role2" },
        ],
    },
    channels: {
        cache: [
            { id: "10", name: "channel1" },
            { id: "11", name: "channel2" },
        ],
    },
};
guild.members.fetch.mockReturnValue(guild.members.cache);

describe("DiscordMessage class", () => {
    const channel = { guild: guild } as unknown as TextChannel;

    it("Returns nothing when message is filtered out", async () => {
        const invalidLines = [
            "[00:00:00] [Server thread/WARN]: warning",
            "[00:00:00] [Server thread/INFO]: Villager test died, 'Villager suffocated in a wall'",
            "[00:00:00] [Server thread/INFO]: Named entity class_5762 died from dehydration",
            "[00:00:00] [Server thread/INFO]: Not a special message",
        ];
        for (const line of invalidLines) {
            expect(await DiscordMessage.filter(line, channel)).toBe(undefined);
        }
    });

    it("Returns messages that are from players or are special", async () => {
        const lines = [
            "[00:00:00] [Server thread/INFO]: <Bob> hi",
            "[00:00:00] [Server thread/INFO]: Bob left the game",
        ];
        for (const line of lines) {
            const filteredLine = line.split("INFO]: ")[1];
            expect(await DiscordMessage.filter(line, channel)).toBe(filteredLine);
        }
    });

    it("Formats player messages correctly", async () => {
        // longMsg is used to avoid too long of lines
        const longMsg =
            "[00:00:00] [Server thread/INFO]: <Bob> channel #channel2 user @user1 role @role1 " +
            "channel #channel2 user @user2 role @role1";

        const messages: { [key: string]: string } = {
            "[00:00:00] [Server thread/INFO]: <Bob> hi @user1": "<Bob> hi <@10>",
            "[00:00:00] [Server thread/INFO]: <Bob> hi @role2": "<Bob> hi <@&11>",
            "[00:00:00] [Server thread/INFO]: <Bob> look #channel1": "<Bob> look <#10>",
        };
        messages[longMsg] =
            "<Bob> channel <#11> user <@10> role <@&10> channel <#11> user <@11> role <@&10>";

        for (const [minecraft, discord] of Object.entries(messages)) {
            expect(await DiscordMessage.filter(minecraft, channel)).toBe(discord);
        }
    });
});

describe("MinecraftMessage class", () => {
    const member = mockMember();
    const mockMessage = {
        content: "test",
        guild: guild,
        member: member,
    } as unknown as Message;

    it("Formats a simple message correctly", () => {
        const msg = MinecraftMessage.format(mockMessage);

        expect(msg).toContain("test");
        expect(msg).toContain((member as any).roles.highest.hexColor);
    });

    it("Formats messages with users, roles, and channels", () => {
        const messages = {
            "user <@11>": "user @user2",
            "role <@&10>": "role @role1",
            "channel <#11>": "channel #channel2",
            "channel <#11> user <@10> role <@&10> channel <#11> user <@11> role <@&10>":
                "channel #channel2 user @user1 role @role1 channel #channel2 user @user2 role " +
                "@role1",
        };
        for (const [discord, minecraft] of Object.entries(messages)) {
            mockMessage.content = discord;
            expect(MinecraftMessage.format(mockMessage)).toContain(minecraft);
        }
    });
});
