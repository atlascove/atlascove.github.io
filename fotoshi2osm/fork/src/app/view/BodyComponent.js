require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");
require("leaflet_geocoder_css");
require("leaflet_geocoder_throbber");
require("leaflet_geocoder_icon");
require("leaflet_cluster_css");
import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import createMuiTheme from 'material-ui/styles/createMuiTheme';
import { Switch, Route } from 'react-router-dom';
import Alert from './AlertComponent';
import Authorize from './AuthorizeComponent';
import CopyMission from './mission/new/CopyMissionComponent';
import CreateMission from './mission/new/CreateMissionComponent';
import Header from './HeaderComponent';
import LoginDialog from './LoginDialogComponent';
import Mission from './mission/MissionComponent';
import MissionEdit from './mission/MissionEditComponent';
import Missions from './mission/MissionsComponent';
import MissionsAdmin from './mission/MissionsAdminComponent';
import MyMissions from './mission/MyMissionsComponent';
import MyStatistics from './MyStatisticsComponent';
import NewMission from './mission/new/NewMissionComponent';
import Statistics from './StatisticsComponent';
import WaitDialog from './WaitDialogComponent';
import Welcome from './WelcomeComponent';

/**
 * Body component is the main view component of the application.
 */
class BodyComponent extends Component {
	constructor() {
		super();
		
		this.theme = createMuiTheme({
			palette: {
				primary: {
					light: '#666ad1',
					main: '#3849aa',
					dark: '#001970',
					contrastText: '#ffffff'
				},
				secondary: {
					light: '#ff6659',
					main: '#d32f2f',
					dark: '#9a0007',
					contrastText: '#ffffff'
				}
			}
		});
	}
	
	render() {
		return <MuiThemeProvider theme={this.theme}><div>
			<Header />
			
			<div style={{margin: "15px 20px"}}>
				<Switch>
					<Route exact path='/' component={Welcome} />
					<Route exact path='/missions' component={Missions} />
					<Route exact path='/mission/create' component={Authorize.For(CreateMission)} />
					<Route exact path='/mission/copy' component={Authorize.For(CopyMission)} />
					<Route exact path='/mission/new' component={Authorize.For(NewMission)} />
					<Route exact path='/mission/new/:mid' component={Authorize.For(NewMission)} />
					<Route exact path='/mission/:mid' component={Mission} />
					<Route exact path='/mission/:mid/edit' component={Authorize.For(MissionEdit)} />
					<Route exact path='/mission/:mid/:page' component={Authorize.For(Mission)} />
					<Route exact path='/missions/admin' component={Authorize.For(MissionsAdmin)} />
					<Route exact path='/my/missions' component={Authorize.For(MyMissions)} />
					<Route exact path='/my/statistics' component={Authorize.For(MyStatistics)} />
					<Route exact path='/statistics' component={Authorize.For(Statistics)} />
				</Switch>
			</div>
			
			<Alert />
			<WaitDialog />
			<LoginDialog />
		</div></MuiThemeProvider>;
	}
}

export default BodyComponent;
