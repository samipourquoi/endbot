export module TextUtils {
	export function getFormattedDate(timestamp: number | Date) {
		const date = new Date(timestamp);

		let year = date.getFullYear();

		let month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : "0" + month;

		let day = date.getDate().toString();
		day = day.length > 1 ? day : "0" + day;

		return day + "/" + month + "/" + year;
	}
}
