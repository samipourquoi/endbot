import React from "react";
import { render } from "react-dom";
import { TicketList } from "./apps/ticket-list";

function App() {
	return <TicketList/>;
}

render(<App/>, document.getElementById("app"));
