# EndBot
Minecraft linking bot with other general utilities. Made for the technical minecraft server called [EndTech][0].
However, it can be used by anyone willing to do so.

## Compile and use
To run the bot, you will need the following: [Docker][1], [Node.js][2], and [Yarn][3]. \
Note: Make sure to have the latest recommended version of Node.js

Create a discord bot account as shown [here][4].
Activating the Developer mode on Discord will also be useful ([link][5]).

Finally, learn more about the YAML syntax if you don't already know it
[here][6].

Open the command line and clone the repository:
```shell
$ git clone https://github.com/samipourquoi/endbot.git
$ cd endbot
```
To install the dependencies for the bot, run: 
```shell
$ yarn install
```

Simply run:
```shell
$ make prod

# if you don't have make installed:
$ cd docker
$ docker-compose up -d
```

It will create a new file under `config/config.yml`. Fill it accordingly to the following section.

If you are not running the bot on the same server as your Minecraft server, 
you will need to run the following command on the host machine (for each server configured).
Make sure you replace `<path/to/logs/latest.log>` and `<server_name>` to an actual value. 
Also, replace `localhost` with the ip address of the bot's host machine if the Minecraft server
isn't run on the same machine. Search how to run a process in the background on your os. 
```shell
$ tail -F -n0 <path/to/logs/latest.log> | 
  while read x; do echo -n $x |
  curl -X POST -d @- http://localhost:34345/link/<server_name>; done
  
  #If you are using a Windows OS, you will need WSL to run the above command
  #https://docs.microsoft.com/en-us/windows/wsl/install-win10
```

Once your config is done, run the following to start the bot:
```shell
$ yarn endbot build 
# Only when changes to the config file are made

$ yarn endbot start
```

### Config
In your minecraft server(s), you will need to set these fields in the `server.properties`:
```properties
enable-rcon=true
# If you already have a server with this port open,
# you will need to chose another port.
rcon-port=25575
# Please change this password...
rcon-password=supersecret
# to prevent log spam for ops
broadcast-rcon-to-ops=false
```

Then, create a file at `config/config.yml` if it doesn't already exist and
fill it in according to the following:
```yaml
# Your bot's token. Needs to be kept private.
token: Njg4OTA2Njk0NzQ2ODMzMCYy.Xm7IWw.Na2yuH3tKVrc0qGSef8C0jek3v0

# This is an array: you can add as many
# servers as you want!
servers:
  - # Your server's name. Can be anything.
    name: MyCoolServer
    # If true, a tail will be created to read the server's latest.log
    # If false, a webhook will be created to communicate messages between servers
    is_local: true
    # The full path to the server's latest.log.
    local_folder_path: path/to/logs/latest.log
    # The folder you want the server's backups to be stored in 
    backup_folder_path: path/to/backup_folder
    # If true, a backup will be automatically created on an interval
    auto_backups: false
    # The time in between automatic backups. Time in hours.
    backup_interval: 24
    # Your server's ip. Use host.docker.internal if the server is hosted 
    # on your machine and you're using docker.
    host: host.docker.internal
    # Your server's rcon port.
    rcon_port: 25575
    # Your server's rcon password.
    rcon_password: supersecret
    # The id of a discord channel your server will be linked with.
    # **NEEDS TO BE PUT IN QUOTES**.
    bridge_channel: "764219513511477308"
    # If true, only members having the op-role can execute commands from
    # the bridge channel. Optional, defaults to true.
    ops_only: true

## THE FOLLOWING FIELDS ARE TOTALLY OPTIONAL AND ARE NOT MEANT.
## TO BE USED BY EVERYONE.

# If you're using another MySQL database that the one
# provided in the docker compose configuration, fill these in:
database:
  user: endbot
  host: my.cool.domain
  password: password1234
  db: enddb
  port: 3306

# Config to use the !links command.
discord_links:
  # The id of the server in which the server emotes
  # will be created.
  emote_server_id: "797540402927239198"
```

## Contribute
To run Endbot in a development environment, do:
```shell
$ make dev

# or if you don't have make installed:
$ cd docker
$ docker-compose -f docker-compose.dev.yml up --build
```

It will watch your files and automatically recompile it on change.

[0]: https://discord.gg/t7UwaDc
[1]: https://docker.com
[2]: https://nodejs.org/en/download/
[3]: https://classic.yarnpkg.com/lang/en/
[4]: https://discordpy.readthedocs.io/en/latest/discord.html
[5]: https://discordia.me/en/developer-mode
[6]: https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html
