import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { withRouter } from 'react-router-dom';
import ContentDuplicate from 'mdi-material-ui/ContentDuplicate';
import API from '../../../ctrl/API';
import Button from 'material-ui/Button';
import Geosearch from '../../GeosearchComponent';
import Grid from 'material-ui/Grid';
import IconGridSelect from '../../IconGridSelectComponent';
import NewMissionComponent from './NewMissionComponent';
import SelectList from '../../SelectListComponent';
import Typography from 'material-ui/Typography';
import Wait from '../../WaitComponent';

const styles = theme => {
	return {
		button: { width: "100%" }
	};
};

/**
 * CopyMissionComponent allows to create a new mission using a template.
 */
class CopyMissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			theme: null,
			mission: null,
			place: null,
			missions: null
		};
	}
	
	_create() {
		if(this.state.mission && this.state.mission.id) {
			if(this.state.place && this.state.place.bbox && this.state.place.names) {
				PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Copying template information") });
				
				//Fetch template details
				API.GetMissionDetails(this.state.mission.id)
				.then(m => {
					let names = this.state.place.names;
					
					//Shorten name if needed
					if(names.join(', ').length >= 100) {
						//Remove next to last item if start with same string as last item
						if(names.length >= 3 && names[names.length-2].split(' ')[0].startsWith(names[names.length-1].split(' '))) {
							names.splice(names.length-2, 1);
						}
						
						if(names.length > 3) {
							names.splice(1, names.length-3);
						}
						
						names = names.join(', ');
						if(names.length >= 100) {
							names = names.substring(0, 90)+"...";
						}
					}
					else {
						names = names.join(', ');
					}
					
					const data = NewMissionComponent.MissionToState(m);
					console.log("names", names);
					data.mission.area.name = data.details.areaname = names;
					data.mission.area.bbox = data.datasource.bbox = this.state.place.bbox;
					if(data.datasource.options && data.datasource.options.geojson) {
						delete data.datasource.options.geojson;
					}
					
					PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Please wait while the mission is created, it can take a few minutes.") });
					
					//Create new mission
					API.CreateMission(
						data.mission,
						data.datasource.source,
						data.datasource.options,
						NewMissionComponent.UIEditorsToDb(data),
						this.props.user.name,
						this.props.user.id
					)
					.then(d => {
						this._updateCreation(d.id, d.pictoken);
					})
					.catch(e => {
						console.log("Failed creating");
						console.error(e);
						PubSub.publish("UI.MESSAGE.WAITDONE");
						PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission"), details: e.message });
					});
				})
				.catch(e => {
					console.error(e);
					PubSub.publish("UI.MESSAGE.WAITDONE");
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't copy mission template"), details: e.message });
				});
			}
			else {
				PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You have to choose an area for your mission before continuing. Please search for your place's name, then select one of the entry in the result list.") });
			}
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "alert", message: I18n.t("You have to choose a mission template before continuing. Please click on one of the template in the list.") });
		}
	}
	
	/**
	 * Update loading status after creating a mission.
	 * @private
	 */
	_updateCreation(mid, pictoken) {
		API.GetMissionLoading(pictoken)
		.then(loading => {
			if(loading >= 100) {
				PubSub.publish("UI.MESSAGE.WAITDONE");
				PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Your mission was succesfully created !") });
				this.props.history.push("/mission/"+mid);
			}
			else {
				PubSub.publish("UI.MESSAGE.WAIT", { progress: loading });
				setTimeout(() => this._updateCreation(mid, pictoken), 2000);
			}
		})
		.catch(e => {
			console.log("Failed getting progress");
			console.error(e);
			setTimeout(() => this._updateCreation(mid, pictoken), 2000);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when creating the mission"), details: e.message });
		});
	}
	
	render() {
		let missions = null;
		
		if(this.state.missions) {
			missions = this.state.missions.filter(m => this.state.theme === null || this.state.theme === m.theme);
		}
		
		return this.state.missions ? <div>
			<Grid container spacing={16}>
				<Grid item xs={12} lg={6}>
					<Typography variant="subheading">{I18n.t("Choose a mission")}</Typography>
					<IconGridSelect
						cols={12}
						items={THEMES}
						value={this.state.theme}
						onChange={id => this.setState({ theme: id, mission: null })}
					/>
					
					{missions && missions.length > 0 ?
						<SelectList
							entries={missions}
							onSelect={m => this.setState({ mission: m })}
						/>
						: <Typography variant="body1" style={{textAlign: "center"}}>{I18n.t("There is no template for this theme")}</Typography>
					}
				</Grid>
				
				<Grid item xs={12} lg={6}>
					<Typography variant="subheading">{I18n.t("Choose an area")}</Typography>
					<Geosearch
						onSelect={r => this.setState({ place: r })}
					/>
				</Grid>
			</Grid>
			
			<Grid container spacing={8} alignItems="center" justify="center" style={{marginTop: 10}}>
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Button
						variant="raised"
						color="primary"
						className={this.props.classes.button}
						onClick={() => this._create()}
					>
						{I18n.t("Create")}
					</Button>
				</Grid>
			</Grid>
		</div> : <Wait />;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Create mission"), subtitle: I18n.t("Using a template") });
		
		API.GetMissionsTemplates()
		.then(templates => {
			const entries = templates.map(t => {
				return {
					title: t.shortdesc,
					subtitle: t.fulldesc,
					icon: THEMES[t.theme] ? THEMES[t.theme].icon : THEMES.other.icon,
					id: t.id,
					theme: t.theme
				};
			});
			
			this.setState({ missions: entries });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching templates"), details: e.message });
		});
	}
}

export default withRouter(withStyles(styles)(CopyMissionComponent));
