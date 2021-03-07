import React, { useEffect, useState } from "react";
import { GetAppInfo } from "endweb-back/src/api";
import { getAppsInfo } from "../../api";
import { TicketWidget } from "./ticket-widget";

export function TicketList() {
	const [tickets, setTickets] = useState([] as GetAppInfo[]);

	useEffect(() => {
		getAppsInfo().then(setTickets);
	}, []);

	return (<div>
		{ tickets.map(TicketWidget) }
	</div>)
}
