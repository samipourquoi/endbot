# EndBot

Minecraft linking bot with other general utilities. Made for the technical minecraft server called [EndTech](https://discord.gg/t7UwaDc).
However, it can be used by anyone willing to do so.

Click [here](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md) for the documentation.

# Setup

Make sure you have the latest version of [Node](https://nodejs.org/en/) installed. 

First of all, open the command line. Do not copy the `$` at the start of each command.

Run this command to clone and open the bot files: 
```shell script
$ git clone https://github.com/samipourquoi/endbot.git
$ cd endbot
```

Then install the dependencies:
```shell script
$ npm install
```

Configure the bot in the next section. Learn about the JSON syntaxt if you don't know it yet [here](https://www.digitalocean.com/community/tutorials/an-introduction-to-json).

Create a discord app by following [this tutorial](https://discordpy.readthedocs.io/en/latest/discord.html).

Lastly, activate the Developper mode on Discord to grab necessary IDs, in [this page](https://discordia.me/en/developer-mode).

# Config file

Copy `config.template.json` to `config.json` in the root directory.
Fill in the fields:
- `token` Token of your discord bot
- `prefix` Prefix of the bot. Defaulted to `!`. Feel free to change it to whatever single character you want.
- `backup-role` ID of the role allowed to use the [`backup`](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md#backup) 
command.
- `backup-format` Format in which the archived backup will be in. Defaulted and recommended to use `tar.gz`.
- `servers` Array of the configuration of all servers
    - `name` Name with which the bot will use when refering to that server.
    - `host` IP of the server, without any ports.
    - `rcon-port` Port of the Rcon of the server.
    - `rcon-password` Password of the Rcon.
    - `bridge-channel` ID of the channel that will be used as a bridge.
    - `log-path` Absolute path to the `latest.log` file of the server. It's usually fount in `logs`.

# Run

To start the bot, run 
```shell script
$ npm start
``` 
