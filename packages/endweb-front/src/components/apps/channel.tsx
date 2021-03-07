import React from "react";
import { useParams } from "react-router";

export function Channel() {
	const { app_id } = useParams() as { app_id: string };
	console.log(app_id);

	return (
		<div className="channel">
			<h1>channel</h1>
		</div>
	)
}
