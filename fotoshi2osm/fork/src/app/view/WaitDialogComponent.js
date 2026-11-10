import React, { Component } from 'react';
import { LinearProgress } from 'material-ui/Progress';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import Typography from 'material-ui/Typography';

/**
 * WaitDialog component shows to user a blocking wait message, in order to let application run long processing.
 * This component listens to {@link Events|UI.MESSAGE.WAIT} events.
 */
class WaitDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			open: false,
			message: "",
			value: -1
		};
		
		PubSub.subscribe("UI.MESSAGE.WAIT", (msg, data) => {
			this.setState({
				open: true,
				message: data.message || this.state.message,
				value: data.progress || -1
			});
		});
		
		PubSub.subscribe("UI.MESSAGE.WAITDONE", (msg, data) => {
			this.setState({ open: false });
		});
	}
	
	render() {
		return <Dialog
			disableBackdropClick
			disableEscapeKeyDown
			open={this.state.open}
		>
			<DialogContent>
				<Typography variant="body1" style={{marginBottom: 20}}>{this.state.message}</Typography>
				{this.state.value >= 0 ? <LinearProgress variant="determinate" value={this.state.value} /> : <LinearProgress />}
			</DialogContent>
		</Dialog>;
	}
}

export default WaitDialogComponent;

/**
 * Event for displaying a blocking wait message to user.
 * @event UI.MESSAGE.WAIT
 * @type {Object} Event data
 * @property {string} [message] The message text.
 * @property {int} [progress] The progress in percent (or indeterminate loading if not set)
 * @memberof Events
 */

/**
 * Event for closing a previously opened waiting message.
 * @event UI.MESSAGE.WAITDONE
 * @memberof Events
 */
