import { Command, QuotedType } from "@samipourquoi/commander";
import { createCanvas, registerFont } from "canvas";
import { Bridge, Bridges } from "../../bridge/bridge";
import { Embed } from "../../utils/embeds";
import { Colors } from "../../utils/theme";
import { command, discord, DiscordContext } from "../dispatcher";
const scoreboards = require("../../../assets/scoreboards.json");

@command(discord)
class ScoreboardCommand
    extends Command {

    constructor() {
        super();

        this.register
            .with.literal("scoreboard","score", "sb", "s")
            .__.with.arg("<objective>", new QuotedType()).run(online)
            .__.__.with.literal("-all", "-a", "-board", "-b", "query", "total").run(online)
						.__.__.__.with.arg("<player>", new QuotedType()).run(online);
    }
}

async function online(ctx: DiscordContext) {
    let bridges = Bridges.getFromMessage(ctx.message);
    if (bridges.length == 0) bridges = Bridges.instances;

    await Scoreboard(bridges[0], ctx);
}

async function Scoreboard(bridge: Bridge, ctx: DiscordContext) {
	let playerList = (ctx.args[2]) ? await bridge.rcon.send("scoreboard players list") : await bridge.rcon.send("whitelist list");
	let players = playerList.substring(playerList.indexOf(": ")+2).split(", ");
	let objective = ctx.args[1];
	if (objective in scoreboards) {
		objective = scoreboards[objective]
	}

	let scores = []
	let i = (ctx.args[2] === "query") ? 1 : players.length;
	while (i--) {
		let player = players[i]
		if (ctx.args[2] === "query") player = ctx.args[3];
		if (!players.includes(player)) {
			await ctx.message.channel.send(Embed.error("Unknown player"));
			return;
		}
		let data = await bridge.rcon.send(`scoreboard players get ${player} ${objective}`)
		if (data.includes("Can't get value of")) continue;
		if (data.includes("Unknown scoreboard objective") || data.includes("Objective names cannot be longer than 16")) {
			await ctx.message.channel.send(Embed.error("Unknown scoreboard objective"));
			return;
		}
		scores.push([player, data.split(" ")[2]]);
	}
	scores.sort((a, b) => +b[1] - +a[1]);
	if (ctx.args[2] === "-board" || ctx.args[2] === "-b") scores.splice(15);
	if (ctx.args[2] !== "query") scores.push(["Total", String(scores.reduce((a, b) => a + parseInt(b[1]), 0))]);
	if (ctx.args[2] === "total") scores = scores.slice(-1);

    // Creates the style for the embed and sends it
    const FONT_SIZE = 22;
    const MARGIN = 10;
    const OBJECTIVE_NAME_SPACE = 9;
    const SPACE_BETWEEN = 2;

    await scoreboardEmbed(scores, objective, ctx);

    async function scoreboardEmbed(scores: any, objective: string, ctx: DiscordContext) {
        let canvas = createCanvas(300, (FONT_SIZE + SPACE_BETWEEN) * scores.length + MARGIN*3 + OBJECTIVE_NAME_SPACE);
        registerFont("assets/minecraft.ttf", { family: "Minecraft" });
        let context = canvas.getContext("2d");
        context.font = FONT_SIZE + "px Minecraft";

        //Background
        context.fillStyle = Colors.GREY;
        context.fillRect(0, 0, canvas.width, canvas.height);

        //Objective name
        context.fillStyle = Colors.WHITE;
        let objectiveNameWidth = context.measureText(objective).width;
        context.fillText(objective, canvas.width/2 - objectiveNameWidth/2, FONT_SIZE + MARGIN/2);

        //Names
        context.fillStyle = Colors.LIGHT_GREY;
        for (let i = 0, j = scores.length; i < j; i++) {
            let name = scores[i][0];
            if (name == "Total") context.fillStyle = Colors.WHITE;
            context.fillText(name, MARGIN, (FONT_SIZE + SPACE_BETWEEN)*(i + 1) + MARGIN*2 + OBJECTIVE_NAME_SPACE);
        }

        //Scores
        context.fillStyle = Colors.RED;
        for (let i = 0, j = scores.length; i < j; i++) {
            let score = scores[i][1];
            let scoreWidth = context.measureText(score).width;
            context.fillText(score, canvas.width - MARGIN - scoreWidth, (FONT_SIZE + SPACE_BETWEEN)*(i + 1) + MARGIN*2 + OBJECTIVE_NAME_SPACE);
        }

        //Send image
        let buffer = canvas.toBuffer();
        await ctx.message.channel.send({files: [buffer]});
    }
}
