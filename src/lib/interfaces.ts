import { GuildMember, TextChannel } from "discord.js";
import { Bridge } from "../bridge.js";

export interface IConfig {
    token: string;
    prefixes: string[];
    servers?: IServer[];
}

export interface ICommandContext {
    cmdName: string;
    args: string[];
    author: GuildMember;
    bridges: Bridge[];
    channel: TextChannel;
}

export interface ICommandInfo {
    name: string;
    aliases?: string[];
    short_description: string;
    description: string;
    usage: string;
    roles_allowed?: string[];
    users_allowed?: string[];
}

export interface IServer {
    name: string;
    host: string;
    rcon_port?: number;
    rcon_password: string;
    channel_id: string;
    folder_path: string;
}

export interface IPacket {
    size: number;
    id: number;
    type: number;
    body: string;
}

export interface QueueItem {
    getData: () => Promise<string>;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
}
