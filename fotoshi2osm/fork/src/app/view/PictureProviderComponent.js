import React, { Component } from 'react';
import { Doughnut } from 'react-chartjs-2';
import Typography from 'material-ui/Typography';

/**
 * Picture provider component shows source of used pictures.
 */
class PictureProviderComponent extends Component {
	render() {
		const names = Object.keys(this.props.data);
		const colors = {
			"Mapillary": "#27ae60",
			"Wikimedia Commons": "#2980b9",
			"Flickr": "#34495e",
			"OpenStreetCam": "#f1c40f",
			"default": "#95a5a6"
		};
		
		const dataset = {
			labels: names.map(n => n+" ("+parseInt(this.props.data[n]).toLocaleString()+")"),
			datasets: [{
				data: names.map(n => this.props.data[n]),
				backgroundColor: names.map(n => colors[n] ? colors[n] : colors.default)
			}]
		};
		
		const opts = {
			responsive: true,
			maintainAspectRatio: false,
			legend: {
				position: 'bottom'
			}
		};
		
		return <div style={this.props.style}>
			<div className="chart-container" style={{position: "relative", width: "100%", height: this.props.height, maxHeight: this.props.height}}>
				<Doughnut data={dataset} options={opts} />
			</div>
		</div>;
	}
}

export default PictureProviderComponent;
