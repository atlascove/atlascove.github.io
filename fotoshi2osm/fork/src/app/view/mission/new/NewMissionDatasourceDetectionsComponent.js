import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Input, { InputLabel } from 'material-ui/Input';
import P4C from 'pic4carto';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource detections component allows user to input settings for missions around automated picture detections.
 */
class NewMissionDatasourceDetectionsComponent extends Component {
	constructor() {
		super();

		this.state = {
			selectedType: "",
			allowedEditors: [ "importer" ]
		};

		this.typeNames = {
			[P4C.Detection.OBJECT_BENCH]: I18n.t("Bench"),
			[P4C.Detection.SIGN_STOP]: I18n.t("Stop sign"),
			[P4C.Detection.MARK_CROSSING]: I18n.t("Pedestrian crossing"),
			[P4C.Detection.OBJECT_BICYCLE_PARKING]: I18n.t("Bicycle parking"),
			[P4C.Detection.OBJECT_CCTV]: I18n.t("CCTV camera"),
			[P4C.Detection.OBJECT_HYDRANT]: I18n.t("Fire hydrant"),
			[P4C.Detection.OBJECT_POSTBOX]: I18n.t("Post box"),
			[P4C.Detection.OBJECT_MANHOLE]: I18n.t("Manhole"),
			[P4C.Detection.OBJECT_PARKING_METER]: I18n.t("Parking meter"),
			[P4C.Detection.OBJECT_PHONE]: I18n.t("Phone (public/emergency)"),
			[P4C.Detection.SIGN_ADVERT]: I18n.t("Advert sign"),
			[P4C.Detection.SIGN_INFO]: I18n.t("Information sign"),
			[P4C.Detection.SIGN_STORE]: I18n.t("Store sign"),
			[P4C.Detection.OBJECT_STREET_LIGHT]: I18n.t("Street light"),
			[P4C.Detection.OBJECT_POLE]: I18n.t("Pole"),
			[P4C.Detection.OBJECT_UTILITY_POLE]: I18n.t("Utility pole"),
			[P4C.Detection.SIGN_RESERVED_PARKING]: I18n.t("Reserved parking"),
			[P4C.Detection.SIGN_ANIMAL_CROSSING]: I18n.t("Animal crossing sign"),
			[P4C.Detection.SIGN_RAILWAY_CROSSING]: I18n.t("Railway crossing sign")
		};
	}

	/**
	 * Restore options from props
	 * @private
	 */
	_restore(props) {
		if(props.data && props.data.type !== this.state.selectedType) {
			this.setState({
				selectedType: props.data.type
			});
		}
	}

	/**
	 * Called when a value has changed
	 * @private
	 */
	_changed(what, value) {
		if(what === "type" && value !== this.state.selectedType) {
			if(value === "") {
				this.props.onChange(null);
				this.setState({ selectedType: null });
			}
			else {
				value = parseInt(value);

				let importer = null;
				if(P4C.Detection.TYPE_DETAILS[value]) {
					importer = { mainTags: P4C.Detection.TYPE_DETAILS[value].osmTags, conflation: 50 };
				}

				this.props.onChange({ type: value, importer: importer, allowedEditors: this.state.allowedEditors });
				this.setState({ selectedType: value });
			}
		}
	}

	render() {
		return <FormControl style={{ width: "100%" }}>
			<InputLabel htmlFor="detection-type">{I18n.t("Kind of feature")}</InputLabel>
			<Select
				native
				value={this.state.selectedType || ""}
				onChange={e => this._changed("type", e.target.value)}
				input={<Input id="detection-type" />}
			>
				<option value="" />
				{Object.entries(P4C.Detection.TYPE_DETAILS).map((e, i) => {
					return <option value={e[0]} key={i}>{this.typeNames[e[0]] || e[1].name}</option>;
				})}
			</Select>
		</FormControl>;
	}

	componentWillReceiveProps(nextProps) {
		this._restore(nextProps);
	}

	componentWillMount() {
		this._restore(this.props);
	}
}

export default NewMissionDatasourceDetectionsComponent;
