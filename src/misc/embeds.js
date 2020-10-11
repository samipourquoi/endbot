const Discord = require("discord.js");

/**
 * Returns a predefined common error embed.<br>
 * Possible errors are:
 * - `bridge`: "You must be in a bridge channel to do that!"
 * - `args`: "Invalid arguments! Do !help for more info."
 * - `unexpected`: "An unexpected error has occured while performing that command"
 *
 * @param {String} error
 * @return {Discord.MessageEmbed}
 */
function error(error) {
	switch (error) {
	case "bridge":
		return this.generate("error")
			.setTitle("You must be in a bridge channel to do that!");
	case "args":
		return this.generate("error")
			.setTitle("Invalid arguments! Do " + this.prefix + "help for more info.");
	case "unexpected":
		return this.generate("error")
			.setTitle("An unexpected error has occured while performing that command");
	}
}

/**
 * Generates empty embeds with predefined colors.
 *
 * @param {String} color
 * @return {Discord.MessageEmbed}
 */
function generate(color) {
	switch (color) {
	case "result":
		color = "#86ff40";
		break;
	case "error":
		color = "#ff483b";
		break;
	case "warn":
		color = "#f2a007";
	default:
		color = "#2F3136";
	}
	
	return new Discord.MessageEmbed().setColor(color);
}

module.exports = {
	error,
	generate
};
