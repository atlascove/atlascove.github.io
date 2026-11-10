import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import { FormControlLabel } from 'material-ui/Form';

/**
 * This dialog is used to check that user is not creating duplicates by inadvertance.
 */
class MissionReviewFeatureDuplicateDialogComponent extends Component {
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
			<DialogTitle>{I18n.t("Confirm import")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{I18n.t("Another similar feature already exists in OpenStreetMap. Are you sure the feature you want to import is really a different one ?")}
					<br />
					{I18n.t("If you're not sure, please go back to check again.")}
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
					{I18n.t("No, I should go back")}
				</Button>
				<Button onClick={() => this.props.onValid(this.state.checkbox)} color="primary" autoFocus>
					{I18n.t("Yes, I'm sure they're different")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
}

export default MissionReviewFeatureDuplicateDialogComponent;
