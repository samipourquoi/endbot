import { Message } from "discord.js";

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
