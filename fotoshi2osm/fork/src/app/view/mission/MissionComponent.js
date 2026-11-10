import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withWidth from 'material-ui/utils/withWidth';
import { CircularProgress } from 'material-ui/Progress';
import API from '../../ctrl/API';
import Hidden from 'material-ui/Hidden';
import MissionDescription from './MissionDescriptionComponent';
import MissionReview from './MissionReviewComponent';
import MissionStatistics from './MissionStatisticsComponent';
import Tabs, { Tab } from 'material-ui/Tabs';

const PAGES = [ "summary", "review", "statistics" ];

/**
 * Mission component allows to show details about a given {@link Mission}.
 */
class MissionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			mission: null,
			user: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		const tab = PAGES.indexOf(this.props.match.params.page || "summary");
		const contentStyle = this.props.width === "xs" ? {} : { marginTop: 10 };
		let content = null;
		
		if(this.state.mission) {
			switch(tab) {
				case 0:
					content = <MissionDescription mission={this.state.mission} style={contentStyle} synthetic={false} user={this.state.user || this.props.user} />;
					break;
				
				case 1:
					content = <MissionReview mission={this.state.mission} user={this.state.user || this.props.user} />;
					break;
				
				case 2:
					content = <MissionStatistics mission={this.state.mission} style={contentStyle} user={this.state.user || this.props.user} />;
					break;
			}
		}
		else {
			content = <div style={{textAlign: "center"}}><CircularProgress size={70} /></div>;
		}
		
		return <div>
			<Hidden smDown>
				<Tabs
					value={tab}
					onChange={(e,v) => this.props.history.push('/mission/'+this.props.match.params.mid+'/'+PAGES[v])}
					indicatorColor="primary"
					textColor="primary"
				>
					<Tab label={I18n.t("Summary")} />
					<Tab label={I18n.t("Review")} />
					<Tab label={I18n.t("Statistics")} />
				</Tabs>
			</Hidden>
			
			{content}
		</div>;
	}
	
	componentWillMount() {
		this.psTokens.wantUser = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			this.setState({ user: data });
			API.GetMissionDetails(
				this.props.match.params.mid,
				data && data.id !== -1 ? data.id : undefined,
				this.props.width === "xs"
			)
			.then(m => { this.setState({ mission: m }); })
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get details of this mission"), details: e.message });
			});
		});
		setTimeout(() => PubSub.publish("USER.INFO.WANTS"), 1000);
	}
	
	componentDidUpdate() {
		if(this.state.mission) {
			PubSub.publish("UI.TITLE.SET", { title: this.state.mission.description.short, subtitle: this.state.mission.area.name });
		}
		else {
			PubSub.publish("UI.TITLE.RESET");
		}
	}
	
	componentWillUnmount() {
		if(this.psTokens.wantUser) {
			PubSub.unsubscribe(this.psTokens.wantUser);
		}
	}
}

export default withWidth()(withRouter(MissionComponent));
