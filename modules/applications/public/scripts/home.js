"use strict";

const application = document.querySelectorAll("example-application");
const acceptedFilter = document.querySelectorAll(".accepted");
const declinedFilter = document.querySelectorAll(".declined");
const pendingFilter = document.querySelectorAll(".pending");
const options = document.querySelector("#filter-options");
const search = document.querySelector("#search-box");
const userProfilePic = document.querySelector("#logged-user-profile-pic");

const hideUsers = () => {
	for (let i = 0; i < acceptedFilter.length; i++) {
		acceptedFilter[i].style.display = "none";
	}

	for (let i = 0; i < declinedFilter.length; i++) {
		declinedFilter[i].style.display = "none";
	}

	for (let i = 0; i < pendingFilter.length; i++) {
		pendingFilter[i].style.display = "none";
	}
};

options.addEventListener("change", () => {
	const optionsValue = document.querySelector("#filter-options").value;

	switch (optionsValue) {
	default:
	case "none":
		for (let i = 0; i < acceptedFilter.length; i++) acceptedFilter[i].style.display = "";
		for (let i = 0; i < declinedFilter.length; i++) declinedFilter[i].style.display = "";
		for (let i = 0; i < pendingFilter.length; i++) pendingFilter[i].style.display = "";

		break;
	case "accepted":
		hideUsers();
		for (let i = 0; i < acceptedFilter.length; i++) acceptedFilter[i].style.display = "";

		break;
	case "declined":
		hideUsers();
		for (let i = 0; i < declinedFilter.length; i++) declinedFilter[i].style.display = "";

		break;
	case "pending":
		hideUsers();
		for (let i = 0; i < pendingFilter.length; i++) pendingFilter[i].style.display = "";

		break;
	}
});

search.addEventListener("input", () => {
	const searchValue = document.querySelector("#search-box").value.toUpperCase();
	const ul = document.querySelector("#applications");
	const li = ul.querySelectorAll("li");

	for (let i = 0; i < li.length; i++) {
		const a = li[i].querySelectorAll("a")[0];
		const username = a.querySelector("h3");
		const txtValue = username.textContent || username.innerText;

		if (txtValue.toUpperCase().indexOf(searchValue) > -1) {
			li[i].style.display = "";
		} else {
			li[i].style.display = "none";
		}
	}
});
