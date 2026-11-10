import React, { Component } from 'react';
import API from '../../ctrl/API';
import { CircularProgress } from 'material-ui/Progress';
import Grid from 'material-ui/Grid';
import Time from '../StatisticsTimeComponent';
import Score from '../UsersScoreComponent';
import Status from './MissionStatisticsStatusComponent';
import Typography from 'material-ui/Typography';

/**
 * Mission statistics component show statistics for a given mission.
 */
class MissionStatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	render() {
		let content = null;
		
		if(this.state.stats) {
			content = <Grid container spacing={16}>
				<Grid item xs={12} md={7} lg={8} xl={9}>
					<Typography variant="subheading">{I18n.t("Activity (last 3 months)")}</Typography>
					<Time data={this.state.stats.days} height={300} />
				</Grid>
				<Grid item xs={12} md={5} lg={4} xl={3}>
					<Status data={this.state.stats.status} height={300} />
				</Grid>
				<Grid item xs={12} md={6} lg={8}>
					<Typography variant="subheading">{I18n.t("Solved features")}</Typography>
					<Time data={this.state.stats.contributions} height={300} computeMissingValues={true} />
				</Grid>
				<Grid item xs={12} md={6} lg={4}>
					<Score data={this.state.stats.users} user={this.props.user} />
				</Grid>
			</Grid>;
		}
		else {
			content = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div style={this.props.style}>
			{content}
		</div>;
	}
	
	componentWillMount() {
		API.GetMissionStatistics(this.props.mission.id, this.props.user.id)
		.then(s => this.setState({ stats: s }))
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get statistics for this mission"), details: e.message });
		});
	}
}

export default MissionStatisticsComponent;
