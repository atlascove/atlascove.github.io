import React, { Component } from 'react';
import Button from 'material-ui/Button';
import { FormHelperText } from 'material-ui/Form';
import Typography from 'material-ui/Typography';
import L from 'leaflet';

/**
 * New mission datasource GeoJSON component — lets users upload a GeoJSON
 * FeatureCollection. Each feature becomes one task; the contributor opens
 * JOSM around the feature's location and draws a new OSM object based on
 * street-level imagery (clean-room approach for license-incompatible sources).
 */
class NewMissionDatasourceGeoJSONComponent extends Component {
	constructor() {
		super();

		this.state = {
			error: null,
			featureCount: null,
			filename: null
		};
	}

	/**
	 * Read a File object chosen via the file input.
	 * @private
	 */
	_loadFile(file) {
		if(!file) { return; }

		const reader = new FileReader();
		reader.onload = e => this._parse(e.target.result, file.name);
		reader.onerror = () => {
			this.setState({ error: I18n.t("Could not read the file"), featureCount: null, filename: null });
			this.props.onChange(null);
		};
		reader.readAsText(file);
	}

	/**
	 * Parse a GeoJSON string, compute its bounding box, and notify the parent.
	 * @private
	 */
	_parse(text, filename) {
		let geojson;

		try {
			geojson = JSON.parse(text);
		}
		catch(e) {
			this.setState({ error: I18n.t("Invalid JSON: ") + e.message, featureCount: null, filename: null });
			this.props.onChange(null);
			return;
		}

		if(geojson.type !== "FeatureCollection" || !Array.isArray(geojson.features) || geojson.features.length === 0) {
			this.setState({ error: I18n.t("File must be a GeoJSON FeatureCollection with at least one feature"), featureCount: null, filename: null });
			this.props.onChange(null);
			return;
		}

		let bounds;
		try {
			bounds = L.geoJSON(geojson).getBounds();
		}
		catch(e) {
			this.setState({ error: I18n.t("Could not compute bounds from GeoJSON features: ") + e.message, featureCount: null, filename: null });
			this.props.onChange(null);
			return;
		}

		if(!bounds.isValid()) {
			this.setState({ error: I18n.t("Could not compute a valid bounding box from the GeoJSON features"), featureCount: null, filename: null });
			this.props.onChange(null);
			return;
		}

		this.setState({ error: null, featureCount: geojson.features.length, filename: filename || I18n.t("Pasted content") });
		this.props.onAreaChange(bounds);
		this.props.onChange({ geojson: geojson, allowedEditors: ["disabled"] });
	}

	render() {
		return <div>
			<Typography variant="caption" style={{marginBottom: 10, display: "block"}}>
				{I18n.t("Upload a GeoJSON FeatureCollection. Each feature becomes one task: the contributor opens JOSM around the feature location and creates a new OSM object from street-level imagery, without copying any data from a license-incompatible source.")}
			</Typography>

			<input
				id="geojson-file-input"
				type="file"
				accept=".geojson,.json"
				style={{display: "none"}}
				onChange={e => this._loadFile(e.target.files[0])}
			/>
			<label htmlFor="geojson-file-input">
				<Button component="span" variant="raised">
					{I18n.t("Choose GeoJSON file")}
				</Button>
			</label>

			{this.state.filename &&
				<Typography variant="body1" style={{marginTop: 10}}>
					{this.state.filename} &mdash; {this.state.featureCount} {I18n.t("features loaded")}
				</Typography>
			}

			{this.state.error &&
				<FormHelperText error style={{marginTop: 8}}>{this.state.error}</FormHelperText>
			}
		</div>;
	}
}

export default NewMissionDatasourceGeoJSONComponent;
