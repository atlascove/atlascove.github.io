import React, { Component } from 'react';
import { Twemoji } from 'react-emoji-render';
import Snackbar from 'material-ui/Snackbar';

/**
 * Alert component handles non-blocking dialogs display to user.
 * This component listens to {@link Events|UI.MESSAGE.BASIC} events.
 */
class AlertComponent extends Component {
	constructor() {
		super();
		this.state = {
			duration: 6000,
			message: "",
			smiley: null,
			type: "info",
			open: false
		};
		
		PubSub.subscribe("UI.MESSAGE.BASIC", (msg, data) => {
			this.setState({
				message: data.message+(data.details ? " ("+data.details+")" : ""),
				duration: data.duration || (data.details ? 6000 : 3000),
				type: data.type || "info",
				open: true,
				smiley: data.smiley || null
			});
		});
	}
	
	render() {
		const message = this.state.smiley ? <Twemoji text={this.state.message+" "+this.state.smiley} /> : this.state.message;
		
		return <Snackbar
			open={this.state.open}
			autoHideDuration={this.state.duration}
			onClose={() => this.setState({ open: false })}
			message={message}
		/>;
	}
}

export default AlertComponent;

/**
 * Event for displaying a non-blocking message to user.
 * @event UI.MESSAGE.BASIC
 * @type {Object} Event data
 * @property {string} [type] The kind of message (error, alert, info). Defaults to info.
 * @property {string} message The message text.
 * @property {int} [duration] The message display duration in milliseconds. Defaults to 3000.
 * @memberof Events
 */
