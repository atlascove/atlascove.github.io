import React, { Component } from 'react';
import API from '../../ctrl/API';
import { withRouter } from 'react-router-dom';
import Button from 'material-ui/Button';
import Details from './new/NewMissionDetailsComponent';
import Editors from './new/NewMissionEditorsComponent';
import Grid from 'material-ui/Grid';
import Mission from '../../model/Mission';
import NewMission from './new/NewMissionComponent';
import Typography from 'material-ui/Typography';
import Wait from '../WaitComponent';

/**
 * Mission edit component allows to change description of an existing mission.
 */
class MissionEditComponent extends Component {
	constructor() {
		super();
		
		this.state = {};
		this.psTokens = {};
	}
	
	/**
	 * Handler for save button click
	 * @private
	 */
	_save() {
		if(NewMission.CheckDetails(this.state) && NewMission.CheckEditors(this.state)) {
			//Try to create updated mission
			try {
				const opts = Object.assign({}, this.state.mission.options);
				
				if(!opts.data) { opts.data = { options: {} }; }
				opts.data.options.editors = NewMission.UIEditorsToDb(this.state);
				
				const mUpdated = new Mission(
					this.state.mission.id,
					this.state.details.type,
					this.state.details.theme,
					{ name: this.state.details.areaname, bbox: this.state.mission.area.bbox },
					{ full: this.state.details.fulldesc, short: this.state.details.shortdesc },
					this.state.mission.status,
					this.state.mission.features,
					opts
				);
				
				PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Please wait while the mission is updated.") });
				
				//Call API to save changes
				API.UpdateMission(mUpdated, this.state.user.name, this.state.user.id)
				.then(() => {
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Mission was successfully updated") });
					this.props.history.push("/mission/"+this.state.mission.id);
				})
				.catch(e => {
					console.log("Failed updating");
					console.error(e);
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when updating the mission"), details: e.message });
				});
			}
			catch(e) {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something is wrong with your mission."), details: e.message });
			}
		}
	}
	
	render() {
		if(this.state.details && this.state.editors) {
			//Restore editors restrictions according to datasource
			let editors = "all";
			
			if(
				this.state.mission
				&& this.state.mission.options
				&& this.state.mission.options.data
				&& this.state.mission.options.data.options
				&& this.state.mission.options.data.options.allowedEditors
			) {
				editors = this.state.mission.options.data.options.allowedEditors;
			}
			
			return <div>
				<Typography variant="display1">{I18n.t("Edit")}</Typography>
				<Details data={this.state.details} onChange={d => this.setState({ details: d })} />
				<Editors
					data={this.state.editors}
					dataSource={this.state.datasource}
					showOnly={editors}
					onChange={d => this.setState({ editors: d })} style={{marginTop: 10}}
				/>
				<Grid container alignItems="center" direction="row" justify="flex-end" spacing={16}>
					<Grid item>
						<Button variant="raised" color="primary" onClick={() => this._save()}>
							{I18n.t("Save")}
						</Button>
					</Grid>
				</Grid>
			</div>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentDidMount() {
		this.psTokens.wantUser = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			API.GetMissionDetails(this.props.match.params.mid, data.id !== -1 ? data.id : undefined)
			.then(m => {
				if(m.options.canEdit) {
					const newState = Object.assign({}, NewMission.MissionToState(m), { user: data });
					this.setState(newState);
				}
				else {
					PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You're not authorized to edit this mission") });
					this.props.history.push("/mission/"+m.id);
				}
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get details of this mission"), details: e.message });
			});
		});
		setTimeout(() => PubSub.publish("USER.INFO.WANTS"), 1000);
	}
	
	componentWillUnmount() {
		if(this.psTokens.wantUser) {
			PubSub.unsubscribe(this.psTokens.wantUser);
		}
	}
}

export default withRouter(MissionEditComponent);
