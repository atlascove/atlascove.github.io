import React, { Component } from 'react';
import { FormControl, FormHelperText } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

/**
 * New mission datasource overpass component allows user to input settings for Overpass datasource
 */
class NewMissionDatasourceOverpassComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			oapiQuery: "",
			allowedEditors: [ "singlechoice", "usertext", "disabled" ],
		};
	}
	
	/**
	 * Restore options from props
	 * @private
	 */
	_restore(props) {
		if(props.data && props.data.query !== this.state.oapiQuery) {
			this.setState({
				oapiQuery: props.data.query
			});
		}
	}
	
	/**
	 * Called when a value has changed
	 * @private
	 */
	_changed(what, value) {
		if(what === "query" && value !== this.state.oapiQuery) {
			if(value === "") {
				this.props.onChange(null);
				this.setState({ oapiQuery: null });
			}
			else {
				this.props.onChange({ query: value, allowedEditors: this.state.allowedEditors });
				this.setState({ oapiQuery: value });
			}
		}
	}
	
	render() {
		return <div>
			<FormControl style={{width: "100%"}}>
				<Typography variant="caption">{I18n.t("Insert the full Overpass query below. Note that your query must return features as JSON, so consider using \"[out:json]\". \"bbox\" parameter will be replaced by selected area.")}</Typography>
				<TextField
					id="oapi-query"
					label={I18n.t("Full Overpass API query")}
					multiline
					rows="4"
					value={this.state.oapiQuery || ""}
					onChange={e => this._changed("query", e.target.value)}
					margin="normal"
				/>
				<FormHelperText><a href="https://overpass-turbo.eu" target="_blank">{I18n.t("Create your query on Overpass Turbo")}</a> | <a href="https://wiki.openstreetmap.org/wiki/Overpass_API" target="_blank">{I18n.t("Overpass API documentation")}</a></FormHelperText>
			</FormControl>
		</div>;
	}
	
	componentWillMount() {
		this._restore(this.props);
	}
	
	componentWillReceiveProps(nextProps) {
		this._restore(nextProps);
	}
}

export default NewMissionDatasourceOverpassComponent;
