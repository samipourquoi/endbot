# Modules
Modules are a great way to add commands that are not directly related to the Minecraft bot.
The native modules are at the moment:
- `ping`: Adds the `ping` command. It serves a purpose of example rather than an actual useful command;
- `embed_editor`: Adds the `embed` command. With it, you can create and modify visually embeds via discord commands.

# Code it yourself!
You can create your own modules! You can find a simple example in `modules/ping/`.

You need to create that hierarchy to create your own module:
```
modules/<module_name>
├── index.js
└── src
    ├── discord
    └── server
```

The `index.js` file must contain the following:
```javascript
module.exports = {
	package: "Ping Command",
	discord: "src/discord",
	server: "src/server",
};
```

Our discord commands will be found in `<module_name>/src/discord`. Let's write a command which adds 1 to a counter every time you execute it.
Create a file named `Counter.js` and include:

```javascript
const Command = require("@root/src/commands/Command.js");

class Count extends Command {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Counter",
			"usage": "count",
			"description": "Check if the bot is online"
		};
	}

	run(message, args) {
	}
}

module.exports = Count;
```

Now write the actual code! The `run()` function will be executed every time the command is triggered. To implement our counter, we could do:
```javascript
constructor(client) {
	//...
	this.counter = 0;
}

run(message, args) {
	this.counter += 1;
	message.channel.send(`The total count is now at ${this.counter}!`);
}
```

And here you have your command working! 

Now let's do the same command but for the server. Create a new `Counter.js` file in `src/server`. The code will be the following:
```javascript
const ServerCommand = require("@root/src/commands/ServerCommand.js");

class Counter extends ServerCommand {
	constructor(client) {
		super(client);
		this.info = {
			"name": "Counter",
			"usage": "count",
			"description": "Check if the bot is online"
		};
		this.counter = 0;
	}

	run(rcon, author, args) {
		this.counter += 1;
		rcon.succeed(`${author} added 1 to the total count! It is now at ${this.counter}`);
	}
}

module.exports = Counter;
```

And here you're all set! Read the other commands to get a better overview of all the available functions.

# Contribute
Feel free to make a Pull Request if you feel like one of your module would be worth adding to the bot!
