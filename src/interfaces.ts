export interface IConfig {
	token: string;
	servers?: IServer[];
}

export interface ICommandInfo {
	name: string;
	aliases?: string[];
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
}

export interface IPacket {
	size: number;
	id: number;
	type: number;
	body: string;
}
