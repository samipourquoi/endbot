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

### Ping
Checks if the bot is online.

Usage: `ping`

### Scoreboard
Creates an image of the ingame scoreboard associated to that objective, for all whitelisted players.
It will fetch scores from the first server declared in the config, from all whitelisted players.
It will as well get the total value from all scores.

Usage: `scoreboard <objective>`

### Execute
Execute a command on a server from a bridge channel. Only persons having the role specified in the `op-role` field,
in the config file, will be able to run that command.

Usage: `execute <command>`

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
