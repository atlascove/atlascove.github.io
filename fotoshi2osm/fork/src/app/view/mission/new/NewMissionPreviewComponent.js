import React, { Component } from 'react';
import { LinearProgress } from 'material-ui/Progress';
import API from '../../../ctrl/API';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import Map from '../MissionMapComponent';
import Typography from 'material-ui/Typography';
import withWidth from 'material-ui/utils/withWidth';

const WIDTH = { "xs": 100, "sm": 300, "md": 500, "lg": 500, "xl": 500 };

/**
 * New mission preview component allows to preview a mission features before its creation.
 */
class NewMissionPreviewComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			features: null
		};
	}
	
	render() {
		let content = null;
		
		if(this.state.features) {
			if(this.state.features.length > 0) {
				content = <div>
					<Map features={this.state.features} />
					{this.state.features.length === 100 && <Typography variant="caption">{I18n.t("As your request contains many points, only first 100 are shown in this preview")}</Typography>}
				</div>;
			}
			else {
				content = <Typography variant="body1">{I18n.t("It seems that there is no features for this data source in this area...")}<br />{I18n.t("Please try with another data source or area")}</Typography>;
			}
		}
		else {
			content = <div>
				<Typography variant="body1" style={{marginBottom: 20, textAlign: "center"}}>{I18n.t("Loading features and their pictures")}<br />{I18n.t("It can take up to few minutes")}</Typography>
				<LinearProgress />
			</div>;
		}
		
		return <Dialog
			onClose={this.props.onClose}
			open={this.props.open}
		>
			<DialogContent style={{width: WIDTH[this.props.width]}}>
				{content}
			</DialogContent>
		</Dialog>;
	}
	
	componentWillReceiveProps(nextProps) {
		if(nextProps.open && !this.state.features) {
			API.GetMissionPreview(nextProps.data.area, nextProps.data.source, nextProps.data.options)
			.then(features => {
				this.setState({ features: features });
			})
			.catch(e => {
				console.error(e);
				PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't get preview for this mission. Are you sure your parameters are valid ?"), details: e.message });
				nextProps.onClose();
			});
		}
		else if(nextProps.data !== this.props.data) {
			this.setState({ features: null });
		}
	}
}

export default withWidth()(NewMissionPreviewComponent);
