import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import { FormControlLabel } from 'material-ui/Form';

/**
 * Login dialog component informs user on the login procedure of OpenStreetMap.
 * It allows user to go to connect page on OSM, or create an account.
 */
class MissionReviewFeatureDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			checkbox: false
		};
	}
	
	render() {
		return <Dialog
			open={this.props.open}
			onClose={this.props.onClose}
		>
			<DialogTitle>{I18n.t("Confirm edit")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{this.props.hasEditor ?
						I18n.t("You haven't given any answer to the question, please confirm that you edited the feature using an external OSM editor.")
						: I18n.t("Please confirm that you edited the feature in an external OSM editor, according to mission instructions.")
					}
					<br />
					{I18n.t("If you're not sure what you should do with this feature, you can go back and review another one using Skip button")}
				</DialogContentText>
				
				<FormControlLabel
					control={
						<Checkbox
							checked={this.state.checkbox}
							onChange={ev => this.setState({ checkbox: ev.target.checked })}
							value="nomoreconfirm"
						/>
					}
					label={I18n.t("Don't show this message for this mission anymore")}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={this.props.onClose} color="default">
					{this.props.hasEditor ?
						I18n.t("No, I should go back")
						: I18n.t("No, I should edit before")
					}
				</Button>
				<Button onClick={() => this.props.onValid(this.state.checkbox)} color="primary" autoFocus>
					{I18n.t("Yes, I edited elsewhere")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default MissionReviewFeatureDialogComponent;
