"""
TEMPORARY SCRIPT to include slash commands,
while waiting for Discord.js to support it.

Make sure you have these three environments variables:
- GUILD_ID, which is your discord server id,
- CLIENT_ID, which is your bot client id,
- TOKEN, which is your bot token.
"""

import requests
import json
import os

url = "https://discord.com/api/v8/applications/" + os.environ["CLIENT_ID"] + "/guilds/" + os.environ["GUILD_ID"] + "/commands"
headers = {
	"Authorization": "Bot " + os.environ["TOKEN"]
}

commands = {
	"guild": [
		{
			"name": "scoreboard",
			"description": "Send a random adorable animal photo",
			"options": [
				{
					"name": "objective",
					"description": "The name of the scoreboard/objective you want to query",
					"type": 3,
					"required": True
				},
				{
					"name": "whitelist_only",
					"description": "Whether to query for un-whitelisted players or not",
					"type": 5,
					"required": False
				}
			]
		},

		{
			"name": "online",
			"description": "Sends the list of all online players across servers",
			"options": [
				{
					"name": "all",
					"description": "In a chat bridge, whether to get the list of online players from other servers",
					"type": 5,
					"required": True
				}
			]
		},

		{
			"name": "help",
			"description": "Displays a help panel",
			"options": [
				{
					"name": "where",
					"description": "Sends help about server-side commands",
					"required": False,
					"type": 3,
					"choices": [
						{
							"name": "Server",
							"value": "server"
						},
						{
							"name": "Discord",
							"value": "discord",
							"default": True
						}
					]
				}
			]
		},

		{
			"name": "tps",
			"description": "Sends the MSPT and TPS of a server",
			"options": [
				{
					"name": "all",
					"description": "In a chat bridge, whether to query the info from other servers or not",
					"type": 5,
					"required": False
				}
			]
		},

		{
			"name": "mspt",
			"description": "Alias of /tps",
			"options": [
				{
					"name": "all",
					"description": "In a chat bridge, whether to query the info from other servers or not",
					"type": 5,
					"required": False
				}
			]
		},

		{
			"name": "execute",
			"description": "Executes a command on a server from a chat bridge",
			"options": [
				{
					"name": "command",
					"description": "The command to execute",
					"type": 3,
					"required": True
				}
			]
		},

		{
			"name": "ping",
			"description": "Check if the bot is online"
		},

		{
			"name": "sql",
			"description": "Make SQL queries over the database",
			"options": [
				{
					"name": "query",
					"description": "The query to execute",
					"type": 3,
					"required": True
				}
			]
		},

		{
			"name": "embed",
			"description": "Create and edit embeds",
			"options": [
				{
					"name": "create",
					"description": "Create an embed to work with",
					"type": 1,
					"options": [
						{
							"name": "url",
							"description": "URL to a JSON of an embed",
							"required": False,
							"type": 3
						}
					]
				},
				{
					"name": "delete",
					"description": "Delete your current embed",
					"type": 1
				},
				{
					"name": "publish",
					"description": "Publish your embed",
					"type": 2,
					"options": [
						{
							"name": "channel",
							"description": "Publish your current embed to a channel",
							"type": 1,
							"options": [
								{
									"name": "channel",
									"description": "The channel to send the embed to",
									"type": 7,
									"required": True
								}
							]
						},
						{
							"name": "webhook",
							"description": "Publish your current embed as a webhook",
							"type": 1,
							"options": [
								{
									"name": "url",
									"description": "The URL of the webhook to send the embed as",
									"type": 3,
									"required": True
								}
							]
						}
					]
				},
				{
					"name": "title",
					"description": "Edit the title of your current embed",
					"type": 1,
					"options": [
						{
							"name": "content",
							"description": "The content to edit your embed with",
							"type": 3,
							"required": True
						}
					]
				},
				{
					"name": "description",
					"description": "Edit the description of your current embed",
					"type": 1,
					"options": [
						{
							"name": "content",
							"description": "The content to edit your embed with",
							"type": 3,
							"required": True
						}
					]
				},
				{
					"name": "footer",
					"description": "Edit the footer of your current embed",
					"type": 1,
					"options": [
						{
							"name": "content",
							"description": "The content to edit your embed with",
							"type": 3,
							"required": True
						}
					]
				},
				{
					"name": "color",
					"description": "Edit the color of your current embed",
					"type": 1,
					"options": [
						{
							"name": "hex",
							"description": "HTML/Hexadecimal color",
							"type": 3,
							"required": True
						}
					]
				},
				{
					"name": "field",
					"description": "Edit the fields of your current embed",
					"type": 2,
					"options": [
						{
							"name": "add",
							"description": "Add fields to your embed",
							"type": 1,
							"options": [
								{
									"name": "name",
									"description": "The name of the field",
									"type": 3,
									"required": True
								},
								{
									"name": "content",
									"description": "The content of the field",
									"type": 3,
									"required": True
								},
								{
									"name": "inline",
									"description": "Whether the field should be inline or not",
									"type": 5,
									"required": True
								}
							]
						},
						{
							"name": "splice",
							"description": "Remove a field from your embed",
							"type": 1,
							"options": [
								{
									"name": "index",
									"description": "Index of the field you want to remove, starting at 0",
									"required": True,
									"type": 4
								}
							]
						}
					]
				}
			]
		},

		{
			"name": "backup",
			"description": "Backup a server from a chat bridge"
		},

		{
			"name": "ticket",
			"description": "Manage tickets from the application system",
			"options": [
				{
					"name": "accept",
					"description": "Accept an applicant",
					"type": 1
				},
				{
					"name": "decline",
					"description": "Deny an applicant",
					"type": 1
				},
				{
					"name": "vote",
					"description": "Start voting on an applicant",
					"type": 1
				}
			]
		},

		{
			"name": "list",
			"description": "List all people with certain role",
			"options": [
				{
					"name": "role",
					"description": "The role you want to see the people who have it",
					"required": True,
					"type": 8
				}
			]
		}
	],

	"global": []
}


for guild_command in commands["guild"]:
	r = requests.post(url, headers=headers, json=guild_command)
	print(r.json())
