import { nearestFrom } from "nearest-colors";

export module ColorUtils {
	const COLORS = {
		dark_red: "#AA0000",
		red: "#FF5555",
		gold: "#FFAA00",
		yellow: "#FFFF55",
		dark_green: "#00AA00",
		green: "#55FF55",
		aqua: "#55FFFF",
		dark_aqua: "#00AAAA",
		dark_blue: "#0000AA",
		blue: "#5555FF",
		light_purple: "#FF55FF",
		dark_purple: "#AA00AA",
		white: "#FFFFFF",
		gray: "#AAAAAA",
		dark_gray: "#555555",
		black: "#000000"
	}
	const nearestColor = nearestFrom(COLORS);

	export function closestMinecraftColor(color: number) {
		// Converts decimal color number to hex color string
		let hex = `#${color.toString(16).padStart(6, "0")}`;

		const result = nearestColor(hex);
		if (Array.isArray(result)) {
			return result[0].value;
		} else {
			return result.value;
		}
	}
}