import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import { ChevronDown } from 'mdi-material-ui';
import { Link } from 'react-router-dom';
import API from '../../ctrl/API';
import ExpansionPanel, { ExpansionPanelSummary, ExpansionPanelDetails } from 'material-ui/ExpansionPanel';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import MissionsFilters from './MissionsFiltersComponent';
import MissionsList from './MissionsListComponent';
import MissionsMap from './MissionsMapComponent';
import MissionsTable from './MissionsTableComponent';
import Pager from '../PagerComponent';
import Tabs, { Tab } from 'material-ui/Tabs';
import Typography from 'material-ui/Typography';
import Wait from '../WaitComponent';

const MAP_HEIGHT = { "xs": 300, "sm": 400, "md": 500, "lg": 600, "xl": 700 };

/**
 * A paginated mission list allows to display a mission list, page per page
 */
class PaginatedMissionListComponent extends Component {
	constructor() {
		super();

		this.state = {
			showFilters: true,
			currentFilters: {},
			missions: null,
			nextMissions: null,
			map: null,
			page: 1,
			tab: 0
		};

		this.apiCallToken = 0;
	}

	_fetchMissions(state) {
		//Mechanism to avoid late API answer overwrite latest request results
		this.apiCallToken++;
		const currentToken = parseInt(this.apiCallToken.toString());

		if(state.tab === 0) {
			//Fetching next page
			if(this.state.page === state.page - 1 && this.state.nextMissions) {
				this.setState({ missions: this.state.nextMissions, nextMissions: null });
			}
			//Fetching another page or first load
			else {
				this.setState({ missions: null, nextMissions: null });

				//List missions for this page
				API.GetMissions(
					state.page,
					state.currentFilters.type,
					state.currentFilters.theme,
					this.props.status === "depends" ? (state.currentFilters.usage === "contributed" ? "online" : (state.currentFilters.status || "all")) : (this.props.admin || this.props.user ? (state.currentFilters.status || "all") : null),
					this.props.width === "xs" || state.currentFilters.editor,
					state.currentFilters.complete,
					this.props.user && !this.props.admin ? this.props.user.id : null,
					state.currentFilters.sort,
					(this.props.admin || state.currentFilters.usage === "created") ? null : this.props.user && this.props.user.id
				)
				.then(missions => {
					if(currentToken === this.apiCallToken) {
						this.setState({ missions: missions });
					}
				})
				.catch(e => {
					console.error(e);
					PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions"), details: e.message });
				});
			}

			//Next page of missions
			API.GetMissions(
				state.page+1,
				state.currentFilters.type,
				state.currentFilters.theme,
				this.props.status === "depends" ? (state.currentFilters.usage === "contributed" ? "online" : (state.currentFilters.status || "all")) : (this.props.admin || this.props.user ? (state.currentFilters.status || "all") : null),
				this.props.width === "xs" || state.currentFilters.editor,
				state.currentFilters.complete,
				this.props.user && !this.props.admin ? this.props.user.id : null,
				state.currentFilters.sort,
				(this.props.admin || state.currentFilters.usage === "created") ? null : this.props.user && this.props.user.id
			)
			.then(missions => {
				if(currentToken === this.apiCallToken) {
					this.setState({ nextMissions: missions });
				}
			})
			.catch(e => console.error(e));
		}
		else {
			this.setState({ map: null });

			API.GetMissionsMap(
				state.currentFilters.type,
				state.currentFilters.theme,
				this.props.status === "depends" ? (state.currentFilters.usage === "contributed" ? "online" : (state.currentFilters.status || "all")) : (this.props.admin || this.props.user ? (state.currentFilters.status || "all") : null),
				this.props.width === "xs" || state.currentFilters.editor,
				state.currentFilters.complete,
				this.props.user && !this.props.admin ? this.props.user.id : null,
				(this.props.admin || state.currentFilters.usage === "created") ? null : this.props.user && this.props.user.id
			)
			.then(missions => {
				if(currentToken === this.apiCallToken) {
					this.setState({ map: missions });
				}
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Something went wrong when fetching missions"), details: e.message });
			});
		}
	}

	_setMissionStatus(m, status) {
		m.status = status;

		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating the mission") });
		API.UpdateMission(m, this.props.user.name, this.props.user.id)
		.then(() => {
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Mission visibility was changed") });
			this.setState({ missions: null, nextMissions: null });
			this._fetchMissions(this.state);
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't change mission visibility"), details: e.message });
		});
	}

	_setMissionTemplate(m, template) {
		m.options.template = template;

		PubSub.publish("UI.MESSAGE.WAIT", { message: I18n.t("Updating the mission") });
		API.UpdateMission(m, this.props.user.name, this.props.user.id)
		.then(() => {
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: template ? I18n.t("Mission was set as a template") : I18n.t("Mission was removed from template list") });
			this.setState({ missions: null, nextMissions: null });
			this._fetchMissions(this.state);
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.WAITDONE");
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't edit template list"), details: e.message });
		});
	}

	render() {
		let missionsarea = null;
		const noMission = <Typography variant="body1" style={{textAlign: "center", margin: 20}}>
			{I18n.t("Oh, there is no mission corresponding to these criterias.")}<br />
			{this.props.width !== "xs" && <Link to='/mission/new'>{I18n.t("But you can create your own mission if you want !")}</Link>}
		</Typography>;

		const noMoreMission = ((this.state.nextMissions === null || this.state.nextMissions.length === 0) && !this.props.synthetic) ? <Typography variant="body1" style={{textAlign: "center", margin: 20}}>
			{I18n.t("Oh, there is no more missions matching these criterias.")}<br />
			{this.props.width !== "xs" && <Link to='/mission/new'>{I18n.t("But you can create your own mission if you want !")}</Link>}
		</Typography> : null;

		if(this.state.tab === 0 && this.state.missions) {
			missionsarea = this.state.missions.length > 0 ? <div>
				{this.props.synthetic || this.state.currentFilters.usage === "created" ?
					<MissionsTable
						missions={this.state.missions}
						admin={this.props.admin}
						onChangeMissionStatus={(m,s) => this._setMissionStatus(m, s)}
						onSetTemplate={(m,s) => this._setMissionTemplate(m, s)}
					/>
					: <MissionsList missions={this.state.missions} />
				}

				{noMoreMission}

				<Pager
					style={{marginTop: 10}}
					onChange={p => this.setState({ page: p, missions: null, nextMissions: null })}
					isLast={this.state.nextMissions === null || this.state.nextMissions.length === 0}
					page={this.state.page}
				/>
			</div> : noMission;
		}
		else if(this.state.tab === 1 && this.state.map) {
			missionsarea = this.state.map.features.length > 0 ? <MissionsMap missions={this.state.map} style={{height: MAP_HEIGHT[this.props.width]}} /> : noMission;
		}
		else {
			missionsarea = <Wait />;
		}

		return <div style={this.props.style}>
			<Grid container spacing={16}>
				<Grid item hidden={{only: "xs"}} sm={4} md={3} lg={2}>
					<Typography variant="subheading">{I18n.t("Filters")}</Typography>
					<MissionsFilters
						status={this.props.status === "depends" ? this.props.user && this.state.currentFilters.usage === "created" : this.props.admin || this.props.user}
						completeness={true}
						values={this.state.currentFilters}
						onChange={d => this.setState({ currentFilters: d })}
						sorting={this.state.tab === 0}
						usage={!this.props.admin && this.props.user}
					/>
				</Grid>
				<Grid item xs={12} hidden={{smUp: true}}>
					<ExpansionPanel>
						<ExpansionPanelSummary expandIcon={<ChevronDown />}>
							<Typography variant="subheading">{I18n.t("Filters")}</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails>
							<MissionsFilters
								values={this.state.currentFilters}
								sorting={this.state.tab === 0}
								onChange={d => this.setState({ currentFilters: d })}
								usage={!this.props.admin && this.props.user}
							/>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				</Grid>
				<Grid item xs={12} sm={8} md={9} lg={10}>
					<Tabs
						value={this.state.tab}
						style={{marginBottom: 10}}
						indicatorColor="primary"
						textColor="primary"
						onChange={(e,v) => this.setState({ tab: v }) }
					>
						<Tab label={I18n.t("List")} />
						<Tab label={I18n.t("Map")} />
					</Tabs>
					{missionsarea}
				</Grid>
			</Grid>
		</div>;
	}

	componentWillMount() {
		const state = Object.assign({}, this.state);

		if(this.props.status === "depends") {
			state.currentFilters = { usage: "contributed" };
			this.setState(state);
		}

		this._fetchMissions(state);
	}

	componentWillUpdate(nextProps, nextState) {
		if(
			this.state.tab !== nextState.tab
			|| Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)
			|| this.state.page !== nextState.page
		) {
			const newState = Object.assign({}, nextState);

			if(Hash(nextState.currentFilters) !== Hash(this.state.currentFilters)) {
				newState.page = 1;
				this.setState({ page: 1, missions: null, nextMissions: null });
			}

			this._fetchMissions(newState);
		}
	}
}

export default withWidth()(PaginatedMissionListComponent);
