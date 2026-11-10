import React, { Component } from 'react';
import CONSTS from '../../constants';
import { ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';

const RGX_OSMID = /^(node|way|relation)\/\d+$/;

Math.toRadians = function(degrees) {
	return degrees * Math.PI / 180;
};

Math.toDegrees = function(radians) {
	return radians * 180 / Math.PI;
};

/**
 * Mission review editors component display editor selection menu, and launch appropriate action.
 */
class MissionReviewEditorsComponent extends Component {
	constructor() {
		super();
	}
	
	/**
	 * Mission comment label
	 * @private
	 */
	_getMissionComment() {
		return this.props.mission.description.short + " (" + this.props.mission.area.name + ")";
	}
	
	/**
	 * Opens and zoom in JOSM on current picture area.
	 * @private
	 */
	_editJOSM() {
		//Find bbox
		const Y = this.props.feature.coordinates[0];
		const X = this.props.feature.coordinates[1];
		const R = 6371000;
		const radius = 50;
		const x1 = X - Math.toDegrees(radius / R / Math.cos(Math.toRadians(Y)));
		const x2 = X + Math.toDegrees(radius / R / Math.cos(Math.toRadians(Y)));
		const y1 = Y - Math.toDegrees(radius / R);
		const y2 = Y + Math.toDegrees(radius / R);
		const c = this._getMissionComment();
		const s = "Pic4Review;streetlevel imagery;aerial imagery";

		let url = CONSTS.JOSM_URL+"left="+x1+"&right="+x2+"&top="+y2+"&bottom="+y1+"&changeset_comment="+c+"&changeset_source="+s;
		
		if(this.props.feature.properties.id && RGX_OSMID.test(this.props.feature.properties.id)) {
			const parts = this.props.feature.properties.id.split("/");
			url += "&select=" + parts[0] + parts[1];
		}
		
		fetch(url)
		.then(response => {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Opened in JOSM") });
		})
		.catch(error => {
			console.error(error);
			PubSub.publish("UI.MESSAGE.BASIC", { type: "error", message: I18n.t("Can't open in JOSM, are you sure remote control is enabled ?") });
		});
	}
	
	/**
	 * Opens ID editor on current picture area.
	 * @private
	 */
	_editId() {
		let url = CONSTS.ID_URL + "#";
		
		const params = {
			map: "21/"+this.props.feature.coordinates.join("/"),
			hashtags: "#Pic4Review",
			comment: this._getMissionComment()
		};
		
		if(this.props.feature.properties.id && RGX_OSMID.test(this.props.feature.properties.id)) {
			const parts = this.props.feature.properties.id.split("/");
			params.id = parts[0].substring(0, 1) + parts[1];
		}
		
		url += Object.entries(params).map(p => p[0] + "=" + encodeURIComponent(p[1])).join("&");
		
		window.open(
			url,
			"_blank"
		).focus();
	}
	
	/**
	 * Opens GeoURI compatible applications
	 * @private
	 */
	_editGeoURI() {
		window.open(
			"geo:"+this.props.feature.coordinates.join(","),
			"_system"
		);
	}
	
	_click(editor) {
		this.props.onClose();
		switch(editor) {
			case "id":
				this._editId();
				break;
			case "josm":
				this._editJOSM();
				break;
			case "geouri":
				this._editGeoURI();
				break;
		}
	}
	
	render() {
		const editors = [
			{ id: "id", name: I18n.t("iD"), tip: I18n.t("Recommended, simplest one") },
			{ id: "josm", name: I18n.t("JOSM"), tip: I18n.t("Most complete one") },
			{ id: "geouri", name: I18n.t("Other"), tip: I18n.t("App of your choice") },
		];
		
		return <Menu
			id="editors-menu"
			anchorEl={this.props.anchor}
			open={this.props.open}
			onClose={this.props.onClose}
		>
			{editors.map(e => {
				return <MenuItem key={e.id} onClick={() => this._click(e.id)}><ListItemText primary={e.name} secondary={e.tip} /></MenuItem>
			})}
		</Menu>;
	}
}

export default MissionReviewEditorsComponent;
