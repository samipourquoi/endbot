# EndBot
Minecraft linking bot with other general utilities. Made for the technical minecraft server called [EndTech][0].
However, it can be used by anyone willing to do so.

## Compile and use
To recommended way is to use [Docker][1].

Create a discord bot account as shown [here][2].
Activating the Developer mode on Discord will also be useful ([link][3]).

Finally, learn more about the YAML syntax if you don't already know it
[here][4].

Open the command line and clone the repository:
```shell
$ git clone https://github.com/samipourquoi/endbot.git
$ cd endbot
```

Simply run:
```shell
$ make prod

# if you don't have make installed:
$ cd docker
$ docker-compose up -d
```

It will create a new file under `config/config.yml`. Fill it accordingly to the following section.

For each server configured, you will need to run this command on the host machine.
Make sure you replace `<path/to/logs/latest.log>` and `<server_name>` to an actual value. 
Search how to run a process in the background on your os.
```shell
$ tail -f -n0 <path/to/logs/latest.log> | 
  while read x; do echo -n $x |
  curl -X POST -d @- http://localhost:34345/link/<server_name>; done
```

Once your config is done, rerun the above command, and you're good to go!

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
  - # Your server name. Can be anything.
    name: MyCoolServer
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
[2]: https://discordpy.readthedocs.io/en/latest/discord.html
[3]: https://discordia.me/en/developer-mode
[4]: https://docs.ansible.com/ansible/latest/reference_appendices/YAMLSyntax.html
