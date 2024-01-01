import { Message, TextChannel, escapeMarkdown } from "discord.js";
import specialMessages from "../../assets/special_messages.json" with { type: "json" };

export class DiscordMessage {
    static async filter(line: string, channel: TextChannel): Promise<string | void> {
        const regex = /\[Server thread\/INFO\]: (.*)/;
        const text = line.match(regex);
        if (!text) return; // Filter out messages not part of the INFO log

        let message = text[1];
        // Remove messages of entities dying
        if (
            (message.startsWith("Villager") && message.endsWith("'")) ||
            message.startsWith("Named entity class_")
        )
            return;

        // Remove messages that aren't from players or special
        if (message.startsWith("<")) {
            message = await this.formatContent(message, channel);
        } else if (!this.isSpecial(message)) {
            return;
        }

        return escapeMarkdown(message);
    }

    private static async formatContent(message: string, channel: TextChannel): Promise<string> {
        if (message.includes("@")) message = await this.formatUsersAndRoles(message, channel);
        if (message.includes("#")) message = this.formatChannels(message, channel);
        return message;
    }

    private static async formatUsersAndRoles(
        message: string,
        channel: TextChannel,
    ): Promise<string> {
        // Members need to be fetched as the cache doesn't always contain all members. Not sure why,
        // but the cache can be used for roles and channels just fine (as well as members in the
        // MinecraftMessage class)
        const members = await channel.guild!.members.fetch();
        members.forEach((member) => {
            const memberId = "<@" + member.id + ">";
            const memberName = "@" + member.displayName;
            if (message.includes(memberName)) {
                message = message.replaceAll(memberName, memberId);
            }
        });

        const roles = channel.guild!.roles.cache;
        roles.forEach((role) => {
            const roleId = "<@&" + role.id + ">";
            const roleName = "@" + role.name;
            if (message.includes(roleName)) {
                message = message.replaceAll(roleName, roleId);
            }
        });

        return message;
    }

    private static formatChannels(message: string, channel: TextChannel): string {
        const channels = channel.guild!.channels.cache;
        channels.forEach((discordChannel) => {
            const channelId = "<#" + discordChannel.id + ">";
            const channelName = "#" + discordChannel.name;
            if (message.includes(channelName)) {
                message = message.replaceAll(channelName, channelId);
            }
        });

        return message;
    }

    private static isSpecial(message: string): boolean {
        for (const phrase of specialMessages) {
            if (message.includes(phrase)) {
                return true;
            }
        }

        return false;
    }
}

export class MinecraftMessage {
    static format(message: Message): string {
        const userColor = message.member!.roles.highest.hexColor;
        const userName = { text: message.member!.displayName, color: userColor };
        const messageContent = this.formatContent(message);
        const text = ["[", userName, "] ", messageContent];
        return JSON.stringify(text);
    }

    private static formatContent(message: Message): string {
        let content = message.content;
        if (content.includes("<@")) content = this.formatUsersAndRoles(message, content);
        if (content.includes("<#")) content = this.formatChannels(message, content);
        return content;
    }

    private static formatUsersAndRoles(message: Message, content: string): string {
        const members = message.guild!.members.cache;
        members.forEach((member) => {
            const memberId = "<@" + member.id + ">";
            if (content.includes(memberId)) {
                content = content.replaceAll(memberId, "@" + member.displayName);
            }
        });

        const roles = message.guild!.roles.cache;
        roles.forEach((role) => {
            const roleId = "<@&" + role.id + ">";
            if (content.includes(roleId)) {
                content = content.replaceAll(roleId, "@" + role.name);
            }
        });

        return content;
    }

    private static formatChannels(message: Message, content: string): string {
        const channels = message.guild!.channels.cache;
        channels.forEach((channel) => {
            const channelId = "<#" + channel.id + ">";
            if (content.includes(channelId)) {
                content = content.replaceAll(channelId, "#" + channel.name);
            }
        });

        return content;
    }
}
