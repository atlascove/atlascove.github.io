import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import API from '../ctrl/API';
import Grid from 'material-ui/Grid';
import Themes from './MyStatisticsThemesComponent';
import Time from './StatisticsTimeComponent';
import Typography from 'material-ui/Typography';
import Wait from './WaitComponent';

/**
 * My statistics component displays user contribution statistics
 */
class MyStatisticsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			stats: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		let content = null;
		
		//Stats ready
		if(this.props.user && this.state.stats) {
			const style={marginTop: 10};
			
			content = <Grid container spacing={16}>
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Typography variant="subheading" style={style}>
						{I18n.t("Position in leaderboard (last 30 days)")}
					</Typography>
					<Typography variant="body1">
						{this.state.stats.place ? "#"+this.state.stats.place : I18n.t("Unknown, as you haven't contributed yet")}
					</Typography>
				</Grid>
				
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Typography variant="subheading" style={style}>
						{I18n.t("Features")}
					</Typography>
					<Typography variant="body1">
						{I18n.t({one: "One object reviewed", other: "%{count} objects reviewed"}, {count: this.state.stats.featuresEdited})}
					</Typography>
				</Grid>
				
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<Typography variant="subheading" style={style}>
						{I18n.t("Missions")}
					</Typography>
					<Typography variant="body1">
						{I18n.t({one: "One mission created", other: "%{count} missions created"}, {count: this.state.stats.missionsCreated})}
					</Typography>
				</Grid>
				
				<Grid item xs={12}>
					<Typography variant="subheading">{I18n.t("Activity (last 3 months)")}</Typography>
					<Time data={this.state.stats.amountEdits} height={300} />
				</Grid>
				
				<Grid item xs={12}>
					<Themes data={this.state.stats.themes} height={300} style={style} />
				</Grid>
			</Grid>;
		}
		//Wait for login or stats
		else {
			content = <Wait />;
		}
		
		return content;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.RESET");
		
		if(this.props.user) {
			PubSub.publish("UI.TITLE.SET", { title: I18n.t("Your statistics"), subtitle: this.props.user.name });
			
			//Retrieve statistics
			API.GetUserStatistics(this.props.user.id)
			.then(stats => {
				this.setState({ stats: stats });
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get your user statistics"), details: e.message });
			});
		}
	}
}

export default MyStatisticsComponent;
