"use strict";

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

client.login(config.token);
client.once("ready", () => console.log("Hello World"));
