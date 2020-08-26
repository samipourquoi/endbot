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
- `online` in a bridge channel
- `online --all`

### Ping
Checks if the bot is online.

Usage: `ping`

### Scoreboard
Creates an image of the ingame scoreboard associated to that objective, for all whitelisted players.
It will fetch scores from the first server declared in the config, from all whitelisted players.

Usage: `scoreboard <objective>`

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
- `embed field add "<name>","<value>",<inline>:boolean`
- `embed field splice <index>`

## Server

### Help
Sends a help pannel on the server.

Usage: `help`

### Scoreboard
Displays a scoreboad in game, for non-ops.

Usage:
- `scoreboard <objective>`
- `scoreboard <objective> query <player>` Queries a score from a player.