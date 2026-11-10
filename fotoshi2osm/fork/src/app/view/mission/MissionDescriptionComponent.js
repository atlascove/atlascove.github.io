import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import { CameraOff, ContentDuplicate, Email, Pencil, Play } from 'mdi-material-ui';
import API from '../../ctrl/API';
import Button from 'material-ui/Button';
import CONST from '../../constants';
import ExportMenu from './MissionDescriptionExportComponent';
import Grid from 'material-ui/Grid';
import Hidden from 'material-ui/Hidden';
import { Link } from 'react-router-dom';
import MissionMap from './MissionMapComponent';
import MissionSummary from './MissionSummaryComponent';
import ReactMarkdown from 'react-markdown';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

const styles = theme => ({
	root: theme.typography.body1
});

/**
 * Mission description component show a full description of a {@link Mission}.
 * It shows summary, full description and map of features.
 */
class MissionDescriptionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			lat: 0,
			lng: 0,
			zoom: 0,
			features: null,
			openExport: false,
			exportAnchor: null
		};
	}
	
	/**
	 * Function to refresh features shown on map.
	 * @private
	 */
	_updateFeatures(props) {
		API.GetMissionFeatures(props.mission.id, props.user ? props.user.id : null)
		.then(features => {
			this.setState({ features: features });
		})
		.catch(e => {
			console.error(e);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Oops ! Can't retrieve features for this mission."), details: e.message });
			this.setState({ features: null });
		});
	}
	
	render() {
		const percentNoPics = this.state.features ? this.state.features.filter(f => f.status === 'nopics').length / this.state.features.length * 100 : 0;
		const btnStyle = {width: "100%"};
		
		const missingPics = percentNoPics >= 20 && <Typography variant="body2" style={{marginBottom: 10}}>
			{I18n.t("Hey ! This mission is missing a lot of pictures (%{cnt}% of the features). If you have some time and live near this area, you should consider going out and take some pictures. You can export the list of features without pictures using the button below.", { cnt: Math.round(percentNoPics) })}
		</Typography>;
		
		return <div style={this.props.style}>
			<MissionSummary mission={this.props.mission} />
			<div className="limited-images">
				<ReactMarkdown className={this.props.classes.root} source={this.props.mission.description.full} />
			</div>
			
			{this.props.synthetic === false && <div>
				<Hidden only="xs">{missingPics}</Hidden>
				<Grid container justify="center" alignItems="center" style={{marginBottom: 10}} spacing={16}>
					<Grid item xs={12} sm={6} md={4} xl={3}>
						<Button
							variant="raised"
							color="primary"
							component={Link}
							to={'/mission/'+this.props.mission.id+'/review'}
							style={btnStyle}
						>
							<Play />
							{I18n.t("Start review")}
						</Button>
					</Grid>
					
					<Grid item xs={12} sm={6} md={4} xl={3}>
						<Tooltip title={I18n.t("Download the position of features lacking pictures, in order to take some by yourself")} style={btnStyle}>
							<Button
								variant="raised"
								style={btnStyle}
								onClick={e => this.setState({ openExport: true, exportAnchor: e.currentTarget})}
							>
								<CameraOff /> {I18n.t("Export missing pics")}
							</Button>
						</Tooltip>
					</Grid>
					
					<Grid item hidden={{only: "xs"}} sm={6} md={4} xl={3}>
						<Tooltip title={I18n.t("Create a new mission based on this one. Useful for working on same task elsewhere.")} style={btnStyle}>
							<Button
								variant="raised"
								component={Link}
								to={'/mission/new/'+this.props.mission.id}
								style={btnStyle}
							>
								<ContentDuplicate /> {I18n.t("Duplicate mission")}
							</Button>
						</Tooltip>
					</Grid>
					
					{this.props.mission.options.username && <Grid item hidden={{only: "xs"}} sm={6} md={4} xl={3}>
						<Tooltip title={I18n.t("Contact the author of this mission")} style={btnStyle}>
							<Button
								variant="raised"
								href={CONST.OSM_API_URL+'/message/new/'+this.props.mission.options.username}
								target="_blank"
								style={btnStyle}
							>
								<Email /> {I18n.t("Contact author")}
							</Button>
						</Tooltip>
					</Grid>}
					
					{this.props.mission.options.canEdit && <Grid item hidden={{only: "xs"}} sm={6} md={4} xl={3}>
						<Tooltip title={I18n.t("Change the description of this mission")} style={btnStyle}>
							<Button
								variant="raised"
								component={Link}
								to={'/mission/'+this.props.mission.id+'/edit'}
								style={btnStyle}
							>
								<Pencil /> {I18n.t("Edit")}
							</Button>
						</Tooltip>
					</Grid>}
				</Grid>
				
				<Hidden smUp>{missingPics}</Hidden>
				
				<Hidden only="xs"><MissionMap features={this.state.features} /></Hidden>
				
				<ExportMenu
					open={this.state.openExport}
					anchor={this.state.exportAnchor}
					onSelect={f => window.open(API.GetExportMissingUrl(this.props.mission.id, f))}
					onClose={() => this.setState({openExport: false})}
				/>
			</div>}
		</div>;
	}
	
	componentDidMount() {
		if(!this.props.synthetic) {
			this._updateFeatures(this.props);
		}
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(!this.props.synthetic && this.props.mission.id !== nextProps.mission.id) {
			this._updateFeatures(nextProps);
		}
	}
}

export default withStyles(styles)(MissionDescriptionComponent);
