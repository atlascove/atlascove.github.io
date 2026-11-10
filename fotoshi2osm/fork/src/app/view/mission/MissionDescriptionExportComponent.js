import React, { Component } from 'react';
import { ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';

/**
 * Mission description export component display selection menu for exporting features.
 */
class MissionDescriptionExportComponent extends Component {
	constructor() {
		super();
	}
	
	_click(format) {
		this.props.onClose();
		this.props.onSelect(format);
	}
	
	render() {
		const exports = [
			{ id: "kml", name: I18n.t("KML"), tip: I18n.t("For mobile apps") },
			{ id: "gpx", name: I18n.t("GPX"), tip: I18n.t("For GPS devices") },
			{ id: "geojson", name: I18n.t("GeoJSON"), tip: I18n.t("For GIS software") }
		];
		
		return <Menu
			id="exports-menu"
			anchorEl={this.props.anchor}
			open={this.props.open}
			onClose={this.props.onClose}
		>
		{exports.map(e => {
			return <MenuItem key={e.id} onClick={() => this._click(e.id)}><ListItemText primary={e.name} secondary={e.tip} /></MenuItem>
		})}
		</Menu>;
	}
}

export default MissionDescriptionExportComponent;
