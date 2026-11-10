import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogActions, DialogContent, DialogContentText, DialogTitle } from 'material-ui/Dialog';
import TagInput from '../../TagInputComponent';
import TextField from 'material-ui/TextField';

/**
 * Login dialog component informs user on the login procedure of OpenStreetMap.
 * It allows user to go to connect page on OSM, or create an account.
 */
class NewMissionEditorsSingleChoiceAnswerDialogComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			label: "",
			image: "",
			tags: null,
			error_label: false,
			error_image: false
		};
	}
	
	/**
	 * Checks if data was correctly set-up, then callbacks parent
	 * @private
	 */
	_onCreate() {
		if(this.state.label.trim().match(/^.{1,50}$/)) {
			if(
				this.state.image.trim().length === 0
				|| this.state.image.trim().match(/^(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-]$/)
			) {
				if(this.state.tags && Object.keys(this.state.tags).length > 0) {
					this.props.onCreate({
						label: this.state.label.trim(),
						image: this.state.image.trim() === 0 ? null : this.state.image.trim(),
						tags: this.state.tags
					});
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Your tag list should only contain key=value entries (one per line)") });
				}
			}
			else {
				this.setState({ error_image: true });
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Your image link should be a valid URL pointing to .png or .jpg file") });
			}
		}
		else {
			this.setState({ error_label: true });
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("Your answer name should contain between 1 and 50 characters") });
		}
	}
	
	render() {
		return <Dialog
			open={this.props.open}
			onClose={this.props.onClose}
		>
			<DialogTitle>{I18n.t("New answer")}</DialogTitle>
			<DialogContent>
				<DialogContentText>
					{I18n.t("Choose a label, an image (optional) and set tags changes for this answer.")}
				</DialogContentText>
				
				<TextField
					id="label"
					margin="normal"
					autoFocus fullWidth required
					error={this.state.error_label}
					label={I18n.t("Answer name")}
					helperText={I18n.t("Synthetic label for this choice")}
					placeholder={I18n.t("Tree, Pillar, Zebra...")}
					value={this.state.label}
					onChange={ev => this.setState({ label: ev.target.value, error_label: false })}
				/>
				
				<TextField
					id="url"
					margin="normal"
					fullWidth
					error={this.state.error_image}
					label={I18n.t("Image URL")}
					helperText={I18n.t("Direct link to a JPG or PNG picture")}
					type="url"
					placeholder="https://..."
					value={this.state.image}
					onChange={ev => this.setState({ image: ev.target.value, error_image: false })}
				/>
				
				<TagInput
					tags={this.state.tags}
					onChange={newTags => this.setState({ tags: newTags })}
					helper={I18n.t("Tags to add if answer is selected.")}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={this.props.onClose} color="default">
					{I18n.t("Cancel")}
				</Button>
				<Button onClick={() => this._onCreate()} color="primary">
					{I18n.t("Save")}
				</Button>
			</DialogActions>
		</Dialog>;
	}
	
	componentWillMount() {
		if(this.props.data) {
			this.setState({
				label: this.props.data.label,
				image: this.props.data.image,
				tags: this.props.data.tags,
				error_label: false,
				error_image: false
			});
		}
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.data) {
			this.setState({
				label: nextProps.data.label,
				image: nextProps.data.image,
				tags: nextProps.data.tags,
				error_label: false,
				error_image: false
			});
		}
		else {
			this.setState({
				label: "",
				image: "",
				tags: null,
				error_label: false,
				error_image: false
			});
		}
	}
}

export default NewMissionEditorsSingleChoiceAnswerDialogComponent;
