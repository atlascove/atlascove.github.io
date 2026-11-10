import React, { Component } from 'react';
import { Information, Play } from 'mdi-material-ui';
import { Link } from 'react-router-dom';
import withWidth from 'material-ui/utils/withWidth';
import Button from 'material-ui/Button';

/**
 * Missions summary buttons show buttons to start mission or see details.
 */
class MissionSummaryButtonsComponent extends Component {
	render() {
		return <div>
			<Button
				style={{ color: "#d32f2f" }}
				size={this.props.width === "xs" ? "small" : "medium"}
				component={Link}
				to={'/mission/'+this.props.mid}
			>
				<Information />
				{I18n.t("Details")}
			</Button>
			<Button
				style={{ color: "#d32f2f" }}
				size={this.props.width === "xs" ? "small" : "medium"}
				component={Link}
				to={'/mission/'+this.props.mid+'/review'}
			>
				<Play />
				{I18n.t("Start")}
			</Button>
		</div>;
	}
}

export default withWidth()(MissionSummaryButtonsComponent);
