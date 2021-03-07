import React from "react";
import { GetAppInfo } from "endweb-back/src/api";
import "../../styles/apps/ticket-widget.scss";

export type TicketWidgetProps = GetAppInfo

export function TicketWidget(app: TicketWidgetProps) {
	const status = ({ 0: "pending" } as
		{ [k: number]: string })
		[app.status];

	return (<div className="ticket-widget" key={`${app.name}:${app.status}`}>
		<div className="avatar">
			<img src={app.profile_picture} alt={`${app.name}'s profile picture`}/>
		</div>
		<span className="name">{app.name}</span>
		<span className="discriminator">#{app.discriminator}</span>
		<span className={status}>{status}</span>

		<div className="right-part">
			{app.round > 0 ?
				<span className="round">#{app.round}</span> :
				void 0}
			<span className="date">1/01/1970</span>
		</div>
	</div>)
}
