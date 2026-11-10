import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Input, { InputLabel } from 'material-ui/Input';
import Nominatim from 'nominatim-browser';
import ReactMarkdown from 'react-markdown';
import Select from 'material-ui/Select';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

/**
 * New mission details component allows users to input mission details (area name, short description, full description...)
 */
class NewMissionDetailsComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			theme: "",
			type: "",
			shortdesc: "",
			areaname: "",
			fulldesc: "",
			picbuffer: 20,
			previewOpen: false
		};
	}
	
	/**
	 * Change the value of some input field, and notify parent component
	 * @private
	 */
	_changeVal(what, val) {
		const n = { [what]: val };
		const d = Object.assign({}, this.state, n);
		delete d.previewOpen;
		
		this.props.onChange(d);
		this.setState(n);
	}
	
	render() {
		const fieldStyle = {width: "100%"};
		
		return <div>
			<Typography variant="subheading">{I18n.t("General")}</Typography>
			<Typography variant="caption">{I18n.t("All fields below are mandatory, in order to make your mission easy to understand for contributors.")}</Typography>
			
			<Grid container spacing={16} style={{marginBottom: 10}}>
				<Grid item xs={12} sm={6} md={3}>
					<TextField
						id="mission-new-shortdesc"
						label={I18n.t("Mission name")}
						style={fieldStyle}
						value={this.state.shortdesc}
						helperText={I18n.t("Example: Missing toilets")}
						onChange={e => this._changeVal("shortdesc", e.target.value)}
					/>
				</Grid>
				
				<Grid item xs={12} sm={6} md={3}>
					<TextField
						id="mission-new-areaname"
						label={I18n.t("Area name")}
						style={fieldStyle}
						value={this.state.areaname}
						helperText={I18n.t("Recommended format: city/area, country, continent")}
						onChange={e => this._changeVal("areaname", e.target.value)}
					/>
				</Grid>
				
				<Grid item xs={12} sm={6} md={3}>
					<FormControl style={fieldStyle}>
						<InputLabel htmlFor="mission-new-theme">{I18n.t("Theme")}</InputLabel>
						<Select
							native
							value={this.state.theme}
							onChange={e => this._changeVal("theme", e.target.value)}
							input={<Input id="mission-new-theme" />}
						>
							<option value="" />
							{Object.entries(THEMES).map(e =>
								<option key={e[0]} value={e[0]}>{e[1].name}</option>
							)}
						</Select>
					</FormControl>
				</Grid>
				
				<Grid item xs={12} sm={6} md={3}>
					<TextField
						id="mission-new-picbuffer"
						label={I18n.t("Photo search radius (m)")}
						type="number"
						style={fieldStyle}
						value={this.state.picbuffer}
						helperText={I18n.t("Distance in metres around each feature (default: 20)")}
						inputProps={{ min: 5, max: 500 }}
						onChange={e => this._changeVal("picbuffer", Math.min(500, Math.max(5, parseInt(e.target.value) || 20)))}
					/>
				</Grid>

				<Grid item xs={12} sm={6} md={3}>
					<FormControl style={fieldStyle}>
						<InputLabel htmlFor="mission-new-type">{I18n.t("Type")}</InputLabel>
						<Select
							native
							value={this.state.type}
							onChange={e => this._changeVal("type", e.target.value)}
							input={<Input id="mission-new-type" />}
						>
							<option value="" />
							{Object.entries(TYPES).map(e =>
								<option key={e[0]} value={e[0]}>{e[1].name}</option>
							)}
						</Select>
					</FormControl>
				</Grid>
			</Grid>
			
			<Typography variant="subheading">{I18n.t("Description")}</Typography>
			<Typography variant="caption">{I18n.t("Please, give as much details as possible. You should explain what the mission is about, what are the requested edits, which tags should be used, and where to find documentation. You can use Markdown syntax for formatting your text.")} <a href="https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet" target="_blank">{I18n.t("Markdown doc")}</a></Typography>
			
			<TextField
				id="mission-new-fulldesc"
				multiline
				rows="5"
				value={this.state.fulldesc}
				onChange={e => this._changeVal("fulldesc", e.target.value)}
				style={{width: "100%", marginBottom: 10}}
			/>
			
			<Button onClick={() => this.setState({previewOpen: true})}>{I18n.t("Preview")}</Button>
			
			<Dialog
				onClose={() => this.setState({previewOpen: false})}
				open={this.state.previewOpen}
			>
				<DialogContent>
					<ReactMarkdown source={this.state.fulldesc} />
				</DialogContent>
			</Dialog>
		</div>;
	}
	
	componentWillMount() {
		if(this.props.data) {
			this.setState(this.props.data);
		}
	}
	
	componentDidMount() {
		if(
			this.state.areaname.length === 0
			&& this.props.datasource
			&& this.props.datasource.area
			&& this.props.datasource.area.getCenter
		) {
			Nominatim.reverseGeocode({
				lat: this.props.datasource.area.getCenter().lat,
				lon: this.props.datasource.area.getCenter().lng,
				addressdetails: true
			})
			.then(result => {
				if(this.state.areaname.length === 0) {
					const res = [
						result.address.city,
						result.address.state,
						result.address.country
					].filter(d => d !== null && d !== undefined && d.trim().length > 0);
					
					this._changeVal("areaname", res.join(", "));
				}
			})
			.catch(console.error);
		}
	}
}

export default NewMissionDetailsComponent;
