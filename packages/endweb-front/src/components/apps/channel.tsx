import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { GETChannel } from "endweb-back/src/api";
import { getChannel } from "../../api";

export function Channel() {
	const [messages, setMessages] = useState([] as object[]);
	const { app_id } = useParams() as { app_id: string };
	console.log(messages);

	useEffect(() => {
		getChannel(app_id).then(setMessages);
	}, []);

	return (
		<div className="channel">
			<h1>Channel</h1>

			{/*{messages.map(message => ())}*/}
		</div>
	)
}
