import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Typography from 'material-ui/Typography';

/**
 * Mission statistics status component allows to see feature status.
 */
class MissionStatisticsStatusComponent extends Component {
	render() {
		const statuses = Object.keys(this.props.data);
		
		const dataset = {
			labels: statuses.map(s => STATUSES[s].name),
			datasets: [{
				data: statuses.map(s => this.props.data[s]),
				backgroundColor: statuses.map(s => STATUSES[s].color)
			}]
		};
		
		return <div>
			<Typography variant="subheading">{I18n.t("Feature status")}</Typography>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Doughnut data={dataset} options={{responsive: true, maintainAspectRatio: false, legend: {position: "bottom"}}} />
			</div>
		</div>;
	}
}

export default MissionStatisticsStatusComponent;
