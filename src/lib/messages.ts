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
            if (content.includes(member.id)) {
                content = content.replaceAll("<@" + member.id + ">", "@" + member.displayName);
            }
        });

        const roles = message.guild!.roles.cache;
        roles.forEach((role) => {
            if (content.includes(role.id)) {
                content = content.replaceAll("<@&" + role.id + ">", "@" + role.name);
            }
        });

        return content;
    }

    private static formatChannels(message: Message, content: string): string {
        const channels = message.guild!.channels.cache;
        channels.forEach((channel) => {
            if (content.includes(channel.id)) {
                content = content.replaceAll("<#" + channel.id + ">", "#" + channel.name);
            }
        });

        return content;
    }
}
