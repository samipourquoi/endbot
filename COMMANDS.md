# Commands

Here is the documentation of all the commands provided by the bot.

## Discord

### Help
Displays a help pannel.

Usage: `help [--server | --discord]`

### Backup
Backups a server. Execute in a bridge channel.
It will create a `backups` folder at the root of the bot files and will store all the future backups there.
You can choose the extension of the archived backup in the config file. `tar.gz` is default and is recommended.

Usage: `backup`

### Online
Sends the list of all online players across servers.

Usage:
- `online`
- `online --all`

Alias: `o`

### Scoreboard
Creates an image of the ingame scoreboard associated to that objective, for all whitelisted players.
It will fetch scores from the first server declared in the config, from all whitelisted players.
It will as well get the total value from all scores.

Usage: 
- `scoreboard <objective>`
- `scoreboard <objective> --all` will get scores for all the players that have ever logged on the server.

Alias: `s`

### MSPT & TPS
Sends the MSPT (millisecond per tick) and TPS (ticks per second) of a server. **REQUIRES [CARPET MOD](https://github.com/gnembon/fabric-carpet)
TO WORK PROPERLY**

Usage:
- `tps`
- `mspt` both work the exact same way
- `mspt --all`

### Execute
Execute a command on a server from a bridge channel. Only persons having the role specified in the `op-role` field,
in the config file, will be able to run that command.

Usage: `execute <command>`

### SQL
Makes SQL queries to the database. Only persons having the role specified in the `op-role` field,
in the config file, will be able to run that command.

### Embed Editor
Creates and edits embeds.

Usage:
- `embed create` creates an empty embed.
- `embed create from <url>` creates an embed from raw JSON, from an URL. Use https://leovoel.github.io/embed-visualizer/.
- `embed delete` deletes your ongoing embed.
- `embed publish <#channel>` posts the embed to the provided channel.
- `embed publish <webhook url>` posts the embed as the provided webhook.
- `embed title|description|footer "<content>"`
- `embed color <hex color>`
- `embed field add "<name>","<value>",<inline>` with inline being a boolean
- `embed field splice <index>`

Usage: `sql <statement>`

### Ping
Checks if the bot is online.

Usage: `ping`

## Server

### Help
Sends a help pannel on the server.

Usage: `help`

### Scoreboard
Displays a scoreboad in game, for non-ops.

Usage:
- `scoreboard <objective>` displays an objective on the sidebar
- `scoreboard clear` clears any objective from the sidebar
- `scoreboard <objective> query <player>` Queries a score from a player.
- `scoreboard <objective> total` Gets the total of all scores combined
- `scoreboard <objective> list` displays objective to the player list (by pressing tab)

Alias: `s`

### Scoreboard presets
Save, and then succesively display configured objectives.

Usage:
- `preset set foo ["objective1","objective2"]`:
	- creates a preset named 'foo' with the objectives 'objective1' and 'objective2';
	- if a preset named 'foo' is already configured, it will override it;
	- You can't override a preset if you didn't create it.
- `preset remove foo` removes the preset named 'foo'.
- `preset display foo` succesively displays the objectives configured in 'foo'.
- `preset delay <duration>` sets the duration between each objective.
- `preset list` lists all the configured presets.

Note: you can 'stop' displaying a preset by doing `scoreboard clear` or any other command.
