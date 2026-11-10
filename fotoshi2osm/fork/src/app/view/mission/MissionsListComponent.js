import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withWidth from 'material-ui/utils/withWidth';
import Card, { CardActions, CardContent, CardMedia } from 'material-ui/Card';
import Grid from 'material-ui/Grid';
import MissionSummary from './MissionSummaryComponent';
import MissionSummaryButtons from './MissionSummaryButtonsComponent';

/**
 * Missions list component displays a responsive list of {@link Mission|missions}.
 */
class MissionsListComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <Grid container spacing={16}>
			{this.props.missions.map((m, i) => {
				const done = m.options && m.options.stats && m.options.stats.new && m.options.stats.new > 0;
				
				return <Grid item key={i} xs={12} lg={6}>
					<Card style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: done ? "white": "#e0e0e0"}}>
						<div style={{width: "100%"}}>
							<CardContent style={this.props.width === "xs" ? { paddingBottom: 0 } : null}>
								<MissionSummary
									mission={m}
									noImage={this.props.width !== "xs"}
									onClick={() => this.props.history.push('/mission/'+m.id)}
								/>
							</CardContent>
							<CardActions>
								<MissionSummaryButtons mid={m.id} history={this.props.history} />
							</CardActions>
						</div>
						{this.props.width !== "xs" && m.options.illustration &&
							<div style={{
								background: "url('"+m.options.illustration+"')",
								backgroundSize: "cover",
								height: 150,
								minWidth: 150,
								marginRight: 5,
								position: "relative",
								opacity: 1
							}}
							>&nbsp;</div>
						}
					</Card>
				</Grid>;
			})}
		</Grid>;
	}
}

export default withWidth()(withRouter(MissionsListComponent));
