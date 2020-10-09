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

Configure the bot in the next section. Learn about the JSON syntax if you don't know it yet [here](https://www.digitalocean.com/community/tutorials/an-introduction-to-json).

Create a discord app by following [this tutorial](https://discordpy.readthedocs.io/en/latest/discord.html).

Lastly, activate the Developer mode on Discord to grab necessary IDs, in [this page](https://discordia.me/en/developer-mode).

# Config file

In the `server.properties` of your server(s), change these properties:
- `broadcast-rcon-to-ops` to `false` to prevent command log spam to ops
- `enable-rcon` to `true`
- `rcon.port` choose a unique port
- `rcon.password` choose a password.

Copy `config.template.json` to `config.json` in the root directory.
Fill in the fields:
- `token` Token of your discord bot
- `prefix` Prefix of the bot. Defaulted to `!`. Feel free to change it to whatever single character you want.
- `backup-role` ID of the role allowed to use the [`backup`](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md#backup)
command.
- `backup-format` Format in which the archived backup will be in. Defaulted and recommended to use `tar.gz`.
- `op-role`: ID of the role allowed to use the [`execute`](https://github.com/samipourquoi/endbot/blob/master/COMMANDS.md#execute) command.
- `servers` Array of the configuration of all servers. You can add as many as you want.
    - `name` Name with which the bot will use when refering to that server.
    - `host` IP of the server, without any ports.
    - `rcon-port` Port of the Rcon of the server.
    - `rcon-password` Password of the Rcon.
    - `bridge-channel` ID of the channel that will be used as a bridge.
    - `requires_op-role` True/False: Wheather or not the op-role is required to execute commands on the server
    - `log-path` Absolute path to the `latest.log` file of the server. It's usually found in `logs`.
	
	
## Optional fields
- `colors-override`: For instance, the color `#B96AD0` appears gray in game when speaking through a bridge,
but appears purple to our eyes. The color actually is closer to gray than purple, but we don't see it this way. To solve that issue, you can include the following:
```json
"colors-override": {
	"#B96AD0": "light_purple"
}
```
The list of color names are: `dark_red`, `red`, `gold`, `yellow`, `dark_green`, `green`, 
`aqua`, `dark_aqua`, `dark_blue`, `blue`, `light_purple`, `dark_purple`, `white`, `gray`, `dark_gray`, `black`.

# Run

To start the bot, run:
```shell script
$ npm start
```

There are some flags useful for debugging:
- `--no-servers` will disable the connection of the bot to the MC servers. It will crash if someone tries to execute
a command requiring a server.
- `--debug` will print debug informations, like those from the discord connection.

To use a flag, do: (notice the `--`)
```shell script
$ npm start -- <flags>
```
