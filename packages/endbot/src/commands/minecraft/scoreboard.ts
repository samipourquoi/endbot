import { Command, QuotedType } from "@samipourquoi/commander";
import { command, minecraft, MinecraftContext } from "../dispatcher";
const scoreboards = require("../../../assets/scoreboards.json");

@command(minecraft)
export class ScoreboardCommand
    extends Command {
    
    constructor() {
        super();

        this.register
            .with.literal("scoreboard", "score", "sb", "s")
            .__.with.arg("<objective>", new QuotedType()).run(scoreboard)
            .__.__.with.literal("list", "query", "total").run(scoreboard)
            .__.__.__.with.arg("<player>", new QuotedType()).run(scoreboard);
    }
}

async function scoreboard(ctx: MinecraftContext) {
    let objective = ctx.args[1];
    if (objective in scoreboards) {
        objective = scoreboards[objective]
    }
    let display = (ctx.args[2] === "list") ? "list" : "sidebar";

    if (objective === "clear") {
        await ctx.bridge.rcon.send(`scoreboard objectives setdisplay ${display}`);
        await ctx.bridge.succeed(`Cleared the ${display} from any objective`);
    } 
    else if (ctx.args[2] === "total") {
        let data = await ctx.bridge.rcon.send("scoreboard players list");
        let players = data.substring(data.indexOf(": ")+2).split(", ");
        let scores = [];
        let i = players.length;
        while (i--) {
            let player = players[i];
            let data = await ctx.bridge.rcon.send(`scoreboard players get ${player} ${objective}`)
            if (data.includes("Can't get value of")) continue;
            if (data.includes("Unknown scoreboard objective")) {
                await ctx.bridge.error(data)
                return;
            }
            scores.push(data.split(" ")[2]);
        }
        let total = scores.reduce((a, b) => a + parseInt(b), 0);
        await ctx.bridge.succeed(`The total of ${objective} is ${total}`);
    }
    else if (ctx.args[2] === "query") {
        const player = ctx.args[3];
        const response =(await ctx.bridge.rcon.send(`scoreboard players get ${player} ${objective}`)).replace(/\[|]/g, "");
        (response.includes("Unknown scoreboard objective")) ? await ctx.bridge.error(response) : await ctx.bridge.succeed(response);
    }
    else {
        const response = (await ctx.bridge.rcon.send(`scoreboard objectives setdisplay ${display} ${objective}`));
        if (response.includes("Unknown scoreboard objective")) await ctx.bridge.error(response);
    }
}
