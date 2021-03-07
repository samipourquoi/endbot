import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { TicketList } from "./ticket-list";
import { Channel } from "./channel";


export function Apps() {
	const { path } = useRouteMatch();

	return (
		<Switch>
			<Route exact path={path} component={TicketList}/>
			<Route exact path={`${path}/:app_id`} component={Channel}/>
		</Switch>
	)
}
