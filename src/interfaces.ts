export interface IConfig {
	token: string;
}

export interface ICommandInfo {
	name: string;
	aliases?: string[];
	description: string;
	usage: string;
	roles_allowed?: string[];
	users_allowed?: string[];
}
