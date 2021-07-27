import { MessageEmbed } from "discord.js";
import { Colors } from "./theme";

export class Embed {

	static error(title: string, description?: string) {
		/** To send the message in the description only
		 *  set the first parameter with empty quotes
		 */

		return new MessageEmbed()
			.setColor(Colors.ERROR)
			.setTitle(title)
			.setDescription(description || "")
	}
}
