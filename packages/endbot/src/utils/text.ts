export module TextUtils {
	export function getCurrentDate() {
		const date = new Date();

		let year = date.getFullYear();

		let month = (1 + date.getMonth()).toString();
		month = month.length > 1 ? month : "0" + month;

		let day = date.getDate().toString();
		day = day.length > 1 ? day : "0" + day;

		return day + "-" + month + "-" + year;
	}

	export function getCurrentTime() {
		const time = new Date()

		let hours = time.getHours().toString();
		hours = hours.length > 1 ? hours : "0" + hours;

		let minutes = time.getMinutes().toString()
		minutes = minutes.length > 1 ? minutes : "0" + minutes;

		let seconds = time.getSeconds().toString();
		seconds = seconds.length > 1 ? seconds : "0" + seconds;

		return hours + ":" + minutes + ":" + seconds;

	}
}
