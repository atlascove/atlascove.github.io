import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import CONSTS from '../../constants';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import MissionSummary from './MissionSummaryComponent';
import MissionSummaryButtons from './MissionSummaryButtonsComponent';
import Mission from '../../model/Mission';
import RouterForwarder from '../RouterForwarder';

/**
 * Missions map component shows available missions on a map.
 */
class MissionsMapComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			lat: 0,
			lng: 0,
			zoom: 0
		};
	}
	
	/**
	 * Set map view around feature layer bounds.
	 * @private
	 */
	_featureLayerBounds() {
		if(this.props.missions.features && this.props.missions.features.length > 0) {
			if(this.refs.map && this.refs.featureslayer) {
				this.refs.map.leafletElement.fitBounds(this.refs.featureslayer.leafletElement.getBounds());
			}
			else {
				setTimeout(this._featureLayerBounds.bind(this), 100);
			}
		}
	}
	
	render() {
		const style = Object.assign({}, this.props.style, { width: "100%" });
		
		const markers = this.props.missions.features.map((f,i) => {
			const m = Mission.CreateFromAPI(f.properties);
			
			return <CircleMarker
				key={i}
				center={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
				radius={10}
				color="#999"
				fillOpacity={1}
				fillColor={THEMES[f.properties.theme].color}
			>
				<Tooltip>
					<div>{m.description.short}<br />{m.area.name}</div>
				</Tooltip>
				<Popup>
					<RouterForwarder style={{textAlign: "center"}} context={this.context}>
						<MissionSummary
							mission={m}
							noImage={true}
						/>
						<MissionSummaryButtons mid={m.id} history={this.props.history} />
					</RouterForwarder>
				</Popup>
			</CircleMarker>;
		});
		
		return <Map ref="map" center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} style={style} preferCanvas={true}>
			<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			
			{this.props.missions.features && this.props.missions.features.length > 1 &&
			<MarkerClusterGroup ref="featureslayer" maxClusterRadius={50}>
				{markers}
			</MarkerClusterGroup>}
			
			{this.props.missions.features && this.props.missions.features.length === 1 && markers}
		</Map>;
	}
	
	componentDidMount() {
		this._featureLayerBounds();
	}
}

//Fixture for making popup buttons as links work
MissionsMapComponent.contextTypes = {
	router: PropTypes.object
};

export default withRouter(MissionsMapComponent);
