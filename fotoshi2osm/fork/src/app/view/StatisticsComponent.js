import React, { Component } from 'react';
import API from '../ctrl/API';
import Grid from 'material-ui/Grid';
import PicProvider from './PictureProviderComponent';
import UsersScore from './UsersScoreComponent';
import Themes from './MyStatisticsThemesComponent';
import Time from './StatisticsTimeComponent';
import Typography from 'material-ui/Typography';
import Wait from './WaitComponent';

/**
 * Statistics component shows statistics for all the community.
 */
class StatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
	}
	
	render() {
		if(this.state.stats) {
			return <div>
				<Grid container spacing={16}>
					<Grid item xs={12}>
						<Typography variant="subheading">{I18n.t("Activity (last 3 months)")}</Typography>
						<Time data={this.state.stats.amountEdits} height={300} />
					</Grid>
					<Grid item xs={12} md={6}>
						<UsersScore data={this.state.stats.scores} user={this.props.user} />
					</Grid>
					<Grid item xs={12} md={6}>
						<Themes data={this.state.stats.themes} height={300} />
						<Typography variant="subheading" style={{marginTop: 10}}>{I18n.t("Sources of used pictures")}</Typography>
						<PicProvider data={this.state.stats.picProviders} height={300} />
					</Grid>
				</Grid>
			</div>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Statistics") });
		
		API.GetUsersStatistics(this.props.user.id)
		.then(stats => {
			this.setState({ stats: stats });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get statistics"), details: e.message });
		});
	}
}

export default StatisticsComponent;
