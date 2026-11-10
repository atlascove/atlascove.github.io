import React, { Component } from 'react';
import { Account, ArrowUpBold, Pencil, Run, RunFast } from 'mdi-material-ui';
import Grid from 'material-ui/Grid';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

/**
 * Mission review statistics component show user statistics for one mission.
 */
class MissionReviewStatisticsComponent extends Component {
	render() {
		return <div style={this.props.style}>
			<Typography variant="subheading">{I18n.t("Amount of edits")}</Typography>
			
			<Grid container direction="column" justify="flex-start" alignItems="flex-start">
				{this.props.data && this.props.data.next !== undefined && <Grid item>
					<RunFast style={{verticalAlign: "middle"}} />
					<ArrowUpBold style={{verticalAlign: "middle", color: "green"}} />
					{I18n.t("%{count} to overtake next user", { count: this.props.data.next })}
				</Grid>}
				
				{this.props.count !== null && <Grid item>
					<Account style={{verticalAlign: "middle"}} />
					<Pencil style={{verticalAlign: "middle", color: "grey"}} />
					{I18n.t("%{count} since you started", { count: this.props.count })}
					&nbsp;
					{this.props.data && this.props.data.place !== undefined && I18n.t("(ranked #%{rank})", { rank: this.props.data.place })}
				</Grid>}
				
				{this.props.data && this.props.data.prev !== undefined && <Grid item>
					<Run style={{verticalAlign: "middle"}} />
					<ArrowUpBold style={{verticalAlign: "middle", color: "red"}} />
					{I18n.t("%{count} before previous user passes you", { count: this.props.data.prev })}
				</Grid>}
			</Grid>
		</div>;
	}
}

export default MissionReviewStatisticsComponent;
