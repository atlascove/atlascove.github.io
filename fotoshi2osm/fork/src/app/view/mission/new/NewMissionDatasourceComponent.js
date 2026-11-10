import React, { Component } from 'react';
import { ChevronDown } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import DataDetections from './NewMissionDatasourceDetectionsComponent';
import DataGeoJSON from './NewMissionDatasourceGeoJSONComponent';
import DataOsmose from './NewMissionDatasourceOsmoseComponent';
import DataOverpass from './NewMissionDatasourceOverpassComponent';
import Grid from 'material-ui/Grid';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import MapSelection from '../../MapSelectionComponent';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource component allows to select area for the mission, and the source of the data.
 */
class NewMissionDatasourceComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			source: "osmose",
			area: null
		};
	}
	
	/**
	 * Change the currently shown data source
	 * @private
	 */
	_changeSource(id) {
		this.props.onChange({ source: id, area: this.state.area, options: this.state["options_"+id] });
		this.setState({ source: id });
	}
	
	/**
	 * Change the currently selected area
	 * @private
	 */
	_changeArea(a) {
		this.props.onChange({ source: this.state.source, area: a, options: this.state["options_"+this.state.source] });
		this.setState({ area: a });
	}
	
	/**
	 * Change the current data source options
	 * @private
	 */
	_changeOptions(o) {
		this.props.onChange({ source: this.state.source, area: this.state.area, options: o });
		const newstate = {};
		newstate["options_"+this.state.source] = o;
		this.setState(newstate);
	}
	
	/**
	 * Change base options at mount or update
	 * @private
	 */
	_setDefaultOptions(props) {
		if(props.data) {
			const newstate = {
				source: props.data.source,
				area: props.data.area
			};
			newstate["options_"+props.data.source] = props.data.options;
			
			this.setState(newstate);
		}
	}
	
	render() {
		const isGeoJSON = this.state.source === "geojson";

		const sources = [
			{
				id: "osmose",
				name: I18n.t("Osmose"),
				content: <DataOsmose data={this.state.options_osmose} onChange={d => this._changeOptions(d)} />
			},
			{
				id: "overpass",
				name: I18n.t("Overpass"),
				content: <DataOverpass data={this.state.options_overpass} onChange={d => this._changeOptions(d)} />
			},
			{
				id: "detections",
				name: I18n.t("Automatic detections from pictures"),
				content: <DataDetections data={this.state.options_detections} onChange={d => this._changeOptions(d)} />
			},
			{
				id: "geojson",
				name: I18n.t("GeoJSON file (clean-room import)"),
				content: <DataGeoJSON
					data={this.state.options_geojson}
					onChange={d => this._changeOptions(d)}
					onAreaChange={a => this._changeArea(a)}
				/>
			}
		];

		return <Grid container spacing={16}>
			{!isGeoJSON &&
				<Grid item xs={12} sm={6} lg={4}>
					<MapSelection style={{height: 300}} area={this.state.area} onChange={e => this._changeArea(e)} />
				</Grid>
			}
			<Grid item xs={12} sm={isGeoJSON ? 12 : 6} lg={isGeoJSON ? 12 : 8}>
				<Typography variant="subheading">{I18n.t("Data source")}</Typography>
				<Typography variant="caption" style={{marginBottom: 10}}>{I18n.t("Select one source of data below for your mission")}</Typography>
				{sources.map(s => {
					return <ExpansionPanel expanded={this.state.source === s.id} key={s.id} onChange={() => this._changeSource(s.id)}>
						<ExpansionPanelSummary expandIcon={<ChevronDown />}>
							<Typography variant="body2">{s.name}</Typography>
						</ExpansionPanelSummary>
						<ExpansionPanelDetails style={{display: "block"}}>
							{s.content}
							<div style={{textAlign: "right", marginTop: 10}}>
								<Button onClick={() => this.props.onPreview(s.id)}>{I18n.t("Preview")}</Button>
							</div>
						</ExpansionPanelDetails>
					</ExpansionPanel>
				})}
			</Grid>
		</Grid>;
	}
	
	componentWillMount() {
		this._setDefaultOptions(this.props);
	}
	
	componentWillReceiveProps(nextProps) {
		this._setDefaultOptions(nextProps);
	}
}

export default NewMissionDatasourceComponent;
