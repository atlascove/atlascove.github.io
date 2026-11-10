import React, { Component } from 'react';
import CONSTS from '../../constants';
import CursorMove from 'mdi-material-ui/CursorMove';
import Check from 'mdi-material-ui/Check';
import Close from 'mdi-material-ui/Close';
import Button from 'material-ui/Button';
import Leaflet from 'leaflet';
import LeafletMarker from '../MarkerRotate';
import { Map, GeoJSON, Marker, TileLayer, LayersControl } from 'react-leaflet';
import Tooltip from 'material-ui/Tooltip';

Leaflet.Icon.Default.imagePath = CONSTS.LEAFLET_IMG_PATH;
Leaflet.Marker = LeafletMarker;

const DEFAULT_ZOOM = 18;

const picIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_transparent.png',
	iconSize: [22.6, 21.6],
	iconAnchor: [11.3, 16.3]
});

const picSelectedIcon = Leaflet.icon({
	iconUrl: 'images/marker_directed_opaque.png',
	iconSize: [22.6, 21.6],
	iconAnchor: [11.3, 16.3]
});

/**
 * Mission review map component allows to display current feature being reviewed.
 */
class MissionReviewMapComponent extends Component {
	constructor() {
		super();

		this.state = {
			editingGeom: false,
			markEditGeom: null
		};
	}

	render() {
		const style = Object.assign({}, this.props.style, { width: "100%" });
		this.markers = null;

		if(this.props.pictures !== null && this.props.pictures.length > 0) {
			this.markers = [];

			for(let i in this.props.pictures) {
				const p = this.props.pictures[i];
				this.markers.push(<Marker
					key={i}
					position={p.coordinates}
					icon={this.props.currentPictureId == i || (i === 0 && this.props.currentPictureId === null) ? picSelectedIcon : picIcon}
					iconAngle={p.direction}
					ref={"marker-"+i}
					onClick={() => this.props.onPicClicked(i)}
				/>);
			}
		}

		const feature = this.state.markerEditGeom || { type: "Feature", geometry: this.props.geometry };

		return <Map
			ref="map"
			center={feature.geometry.type === "Point" ? Leaflet.GeoJSON.coordsToLatLng(feature.geometry.coordinates) : this.props.feature.coordinates}
			zoom={this.props.zoom || DEFAULT_ZOOM}
			style={style}
		>
			{this.props.layers ?
				<LayersControl position="topright">
					{this.props.layers.filter(l => l.type === "tms").map((l,i) => {
						const url = l.url
							.replace(/\{zoom\}/g, "{z}")
							.replace(/\{switch:.+?\}/g, "{s}");
						let subdomains = [];
						if(l.url.includes("{switch:")) {
							subdomains = l.url.substring(l.url.indexOf("{switch:")+8);
							subdomains = subdomains.substring(0, subdomains.indexOf("}"));
							subdomains = subdomains.split(",");
						}

						return <LayersControl.BaseLayer name={l.name || l.id} key={l.id} checked={(!this.props.baseLayer && i===0) || (this.props.baseLayer === (l.name || l.id))}>
							<TileLayer
								attribution={l.attribution ? '<a href="'+l.attribution.url+'" target="_blank">'+l.attribution.text+'</a>' : ''}
								url={url}
								minZoom={l.min_zoom || 1}
								maxNativeZoom={l.max_zoom || DEFAULT_ZOOM}
								maxZoom={Math.max(25, l.max_zoom || DEFAULT_ZOOM)}
								subdomains={subdomains}
							/>
						</LayersControl.BaseLayer>;
					})}
				</LayersControl>
				:
				<TileLayer url={CONSTS.TILE_URL} attribution={CONSTS.TILE_ATTRIBUTION} />
			}

			{this.markers}

			{this.state.editingGeom ?
				<Marker
					ref="markerEdit"
					position={Leaflet.GeoJSON.coordsToLatLng(feature.geometry.coordinates)}
					draggable={true}
					onDragEnd={() => this.setState({ markerEditGeom: this.refs.markerEdit.leafletElement.toGeoJSON()})}
				/>
				:
				<GeoJSON
					ref="data"
					data={feature.geometry}
					color="red"
					fillColor="red"
					fillOpacity={0.7}
					onClick={() => this.props.onFeatureClicked()}
					pointToLayer={(geojsonPoint, latlng) => { return Leaflet.circleMarker(latlng, { radius: this.props.width === "xs" ? 10 : 8, color: "red", fillColor: "red", fillOpacity: 0.7 }); }}
				/>
			}

			{this.props.featureMove ?
				(this.state.editingGeom ?
					<div style={{ position: "absolute", left: 5, bottom: 5, zIndex: 1000 }}>
						<Button
							variant="fab"
							color="primary"
							onClick={() => this._editGeomDone()}
						>
							<Check />
						</Button>
						<Button
							variant="fab"
							onClick={() => this._editGeomCancelled()}
							style={{marginLeft: 5}}
						>
							<Close />
						</Button>
					</div>
					:
					<Button
						variant="fab"
						color="secondary"
						style={{ position: "absolute", left: 5, bottom: 5, zIndex: 1000 }}
						onClick={() => this._editGeomStart()}
					>
						<CursorMove />
					</Button>
				)
				: null
			}

			{this.props.similarFeatures &&
				<GeoJSON
					ref="data-similar"
					data={this.props.similarFeatures}
					color="orange"
					fillColor="orange"
					fillOpacity={0.7}
					pointToLayer={(geojsonPoint, latlng) => {
						return Leaflet.circleMarker(latlng, { radius: this.props.width === "xs" ? 8 : 6, color: "orange", fillColor: "orange", fillOpacity: 0.7 });
					}}
					onEachFeature={(feature, layer) => {
						const content = document.createElement("div");
						content.innerHTML = Object.entries(feature.properties).map(e => e[0]+" = "+e[1]).join("<br />");

						if(this.props.similarFeatures.features.length > 1) {
							const btn = document.createElement("button");
							btn.innerHTML = I18n.t("Merge with this feature");
							btn.className = "p4r-smallbtn";
							btn.onclick = () => PubSub.publish("UI.MAP.SIMILARCLICKED", { feature: feature });
							content.appendChild(btn);
						}

						layer.bindPopup(content);
					}}
				/>
			}
		</Map>;
	}

	/**
	 * Is the geometry of the feature being currently edited ?
	 * @return {boolean} True if user is editing
	 */
	isEditingGeometry() {
		return this.state.editingGeom;
	}

	_fitBounds() {
		if(this.refs.map && this.refs.data) {
			if(this.props.geometry.type === "Point") {
				this.refs.map.leafletElement.setView(this.refs.data.leafletElement.getBounds().getCenter(), this.props.zoom || DEFAULT_ZOOM);
			}
			else {
				this.refs.map.leafletElement.fitBounds(this.refs.data.leafletElement.getBounds());
			}
		}
	}

	_editGeomStart() {
		this.setState({ editingGeom: true })
	}

	_editGeomDone() {
		this.props.onFeatureMove(this.state.markerEditGeom);
		this.setState({ editingGeom: false });
	}

	_editGeomCancelled() {
		this.props.onFeatureMove(null);
		this.setState({ editingGeom: false, markerEditGeom: null })
	}

	componentDidMount() {
		this._fitBounds();

		if(this.refs.map) {
			//Zoom
			this.refs.map.leafletElement.on("zoomend", () => {
				const newzoom = this.refs.map.leafletElement.getZoom();

				if(this.props.onZoomChange && newzoom !== this.props.zoom) {
					this.props.onZoomChange(newzoom);
				}
			});

			//Base layer
			this.refs.map.leafletElement.on("baselayerchange", e => {
				if(this.props.onBaseLayerChange && e.name !== this.props.baseLayer) {
					this.props.onBaseLayerChange(e.name);
				}
			});
		}
	}

	componentDidUpdate(prevProps) {
		if(this.refs.map) {
			this.refs.map.leafletElement.invalidateSize();

			if(prevProps.feature && this.props.feature && prevProps.feature.id !== this.props.feature.id) {
				this._fitBounds();
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		this.markers.forEach((m, i) => {
			this.refs["marker-"+i].leafletElement.setIcon(nextProps.currentPictureId == i ? picSelectedIcon : picIcon);
		});
	}

	componentWillUnmount() {
		this.refs.map.leafletElement.off("zoomend");
		this.refs.map.leafletElement.off("baselayerchange");
	}
}

/**
 * Event when user choose a similar feature on map
 * @event UI.MAP.SIMILARCLICKED
 * @type {Object} Event data
 * @property {Object} feature The clicked feature as GeoJSON
 * @memberof Events
 */


export default MissionReviewMapComponent;
