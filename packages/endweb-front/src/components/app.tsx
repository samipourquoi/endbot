import React from "react";
import { render } from "react-dom";
import { TicketList } from "./apps/ticket-list";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Apps } from "./apps";

function App() {
	return (<BrowserRouter>
		<Switch>
			<Route path="/apps" component={Apps}/>
			<Route exact path="/">
				<h1>Home</h1>
			</Route>
			<Route path="/">
				<h1>Unknown path</h1>
			</Route>
		</Switch>
	</BrowserRouter>)
}

render(<App/>, document.getElementById("app"));
