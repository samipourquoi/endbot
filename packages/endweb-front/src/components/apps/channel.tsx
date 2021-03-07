import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { GETChannel } from "endweb-back/src/api";
import { getChannel } from "../../api";
import { TextUtils } from "endbot/dist/utils/text";
import { ArchiveMessage } from "endbot/dist/structures/archive";
import "../../styles/apps/channel.scss";

export function Channel() {
	const [messages, setMessages] = useState([] as GETChannel);
	const { app_id } = useParams() as { app_id: string };

	useEffect(() => {
		getChannel(app_id).then(setMessages);
	}, []);

	const nub = () => {
		let lastAuthorID: number;
		const nubbed: JSX.Element[] = [];

		messages.forEach(message => {
			nubbed.push(<ChannelMessage
				message={message}
				showUsername={lastAuthorID != message.author.id}
			/>);
			lastAuthorID = message.author.id;
		});

		return nubbed;
	}

	return (
		<div className="channel">
			<h1>Channel</h1>

			{nub()}
		</div>
	);
}

type ChannelMessageProps = {
	message: ArchiveMessage,
	showUsername: boolean
}

function ChannelMessage({ message, showUsername }: ChannelMessageProps) {
	return (
		<div className="message">
			{showUsername ?
				(<h2>
					{message.author.username}
					<span className="timestamp">
						{TextUtils.getFormattedDate(message.timestamp)}
					</span>
				</h2>) :
				void 0}
			<p>{message.content}</p>
		</div>
	);
}
