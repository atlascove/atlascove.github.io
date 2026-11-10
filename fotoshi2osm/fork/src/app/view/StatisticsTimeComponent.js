import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.toP4RString = function() {
	return this.toISOString().split("T")[0];
};

/**
 * Statistics time component allows to see participation through time.
 */
class StatisticsTimeComponent extends Component {
	render() {
		const partialDays = Object.keys(this.props.data);
		partialDays.sort();
		
		//Find missing days
		const days = {};
		let currentDate = new Date(partialDays[0]);
		const lastDate = new Date(Date.now());
		let lastVal = 0;
		
		while(currentDate <= lastDate) {
			const d = currentDate.toP4RString();
			days[d] = this.props.data[d] ? this.props.data[d] : (this.props.computeMissingValues ? lastVal : 0);
			lastVal = days[d];
			currentDate = currentDate.addDays(1);
		}
		
		const daysList = Object.keys(days);
		daysList.sort();
		
		//Prepare dataset
		const dataset = {
			labels: daysList,
			datasets: [{
				label: I18n.t("Amount"),
				data: daysList.map(d => days[d]),
				fillColor: "rgba(220,220,220,0.5)",
				strokeColor: "rgba(220,220,220,1)",
				pointColor: "rgba(220,220,220,1)",
				pointStrokeColor: "#fff",
				pointHighlightFill: "#fff",
				pointHighlightStroke: "rgba(220,220,220,1)"
			}]
		};
		
		const opts = {
			responsive: true,
			maintainAspectRatio: false,
			scales: { yAxes: [{ ticks: { min: 0 } }] }
		};
		
		return <div>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Line data={dataset} options={opts} />
			</div>
		</div>;
	}
}

export default StatisticsTimeComponent;
