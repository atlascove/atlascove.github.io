import React, { Component } from 'react';
import CONSTS from '../../constants';
import Hash from 'object-hash';
import Leaflet from 'leaflet';
import { Map, TileLayer, FeatureGroup, CircleMarker } from 'react-leaflet';

const sortFeatures = (a,b) => {
	return STATUSES[a.status].priority - STATUSES[b.status].priority;
};

/**
 * Mission map component shows feature of a mission on a map.
 */
class MissionMapComponent extends Component {
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
		if(this.refs.map && this.refs.featureslayer) {
			this.refs.map.leafletElement.fitBounds(this.refs.featureslayer.leafletElement.getBounds());
		}
		else {
			setTimeout(this._featureLayerBounds.bind(this), 100);
		}
	}
	
	/**
	 * Removes feature layers from map.
	 * @private
	 */
	_clearDataLayers() {
		if(this.refs && this.refs.map && this.refs.featureslayer) {
			if(this.refs.map.leafletElement.hasLayer(this.refs.featureslayer.leafletElement)) {
				this.refs.map.leafletElement.removeLayer(this.refs.featureslayer.leafletElement);
				delete this.refs.featureslayer;
			}
		}
	}
	
	render() {
		let position = [this.state.lat, this.state.lng];
		let datalayer = null;
		
		//Count features per status
		const amounts = {};
		if(this.props.features) {
			this.props.features.forEach(f => {
				if(!amounts[f.status]) { amounts[f.status] = 1; }
				else { amounts[f.status] = amounts[f.status] + 1; }
			});
		}
		
		//Legend
		const statuses = this.props.features ? Array.from(new Set(this.props.features.map(f => f.status))) : Object.keys(STATUSES);
		const legend = statuses.map(s => {
			return <span className="p4r-legend" key={s}>
				<span style={{backgroundColor: STATUSES[s].color}}> </span>
				{STATUSES[s].name}{amounts[s] ? " ("+amounts[s]+")" : ""}
			</span>;
		});
		
		//Features
		if(this.props.features !== null && this.props.features.length > 0) {
			this.props.features.sort(sortFeatures);
			let featurelayers = this.props.features.map((f,i) => {
				const color = STATUSES[f.status].color || STATUSES["new"].color;
				return <CircleMarker center={f.coordinates} key={i} radius={7} stroke={false} fill={true} fillColor={color} fillOpacity={1} />;
			});
			
			if(featurelayers.length === 1) { featurelayers = featurelayers[0]; } //Convert if single item in order to avoid FeatureGroup bug
			
			datalayer = <FeatureGroup ref="featureslayer">{featurelayers}</FeatureGroup>;
		}
		
		return <div style={this.props.style}>
			<div style={{textAlign: "center"}}>{legend}</div>
		
			<Map ref="map" center={position} zoom={this.state.zoom} style={{width:"100%", height:"400px"}} preferCanvas={true}>
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
				{datalayer}
			</Map>
		</div>;
	}
	
	componentWillUpdate(nextProps, nextState) {
		if(
			nextProps.features
			&& (
				!this.props.features
				|| nextProps.features.length !== this.props.features.length
				|| Hash(nextProps.features) !== Hash(this.props.features)
			)
		) {
			this._clearDataLayers();
			this._featureLayerBounds();
		}
	}
	
	componentDidMount() {
		if(!this.props.features !== null) {
			this._featureLayerBounds();
		}
	}
	
	componentWillUnmount() {
		this._clearDataLayers();
	}
}

export default MissionMapComponent;
