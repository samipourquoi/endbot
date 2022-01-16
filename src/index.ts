import { Client, Intents, Message } from "discord.js";
import { Config } from "./config.js";
import { Endbot } from "./endbot.js";

const config = new Config();

const endbot = new Endbot(config);
