import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Hash from 'object-hash';
import IconGridSelect from '../IconGridSelectComponent';
import Input, { InputLabel } from 'material-ui/Input';
import Radio, { RadioGroup } from 'material-ui/Radio';
import Select from 'material-ui/Select';
import Typography from 'material-ui/Typography';

/**
 * Missions filters component allows user to restrict the amount of missions to display.
 * Component properties: values = The values to restore in select fields (type, theme)
 */
class MissionsFiltersComponent extends Component {
	constructor() {
		super();

		this.state = {
			theme: null,
			type: null,
			status: null,
			complete: null,
			editor: null,
			sort: "pertinence",
			usage: null
		};
	}

	/**
	 * Converts a third-party object into a list of filters
	 * @private
	 */
	_toFilters(o) {
		return {
			type: o.type || "",
			theme: o.theme || "",
			status: o.status || "",
			complete: o.complete || false,
			editor: o.editor || false,
			sort: o.sort || "",
			usage: o.usage || ""
		};
	}

	render() {
		const styleControl = { width: "100%", marginBottom: 20 };

		return <div>
			{this.props.sorting &&
				<FormControl style={styleControl}>
					<InputLabel htmlFor="missions-sort">{I18n.t("Sort by")}</InputLabel>
					<Select
						native
						value={this.state.sort !== null ? this.state.sort : this.props.values.sort}
						onChange={e => this.setState({ sort: e.target.value })}
						input={<Input id="missions-sort" />}
					>
						{Object.entries(SORTS).map(e =>
							<option key={e[0]} value={e[0]}>{e[1].name}</option>
						)}
					</Select>
				</FormControl>
			}

			{this.props.usage &&
				<FormControl style={styleControl}>
					<Typography variant="body1">{I18n.t("Show missions")}</Typography>
					<RadioGroup
						row
						value={this.state.usage}
						onChange={e => this.setState({ usage: e.target.value, status: e.target.value === "contributed" ? "online" : "" })}
					>
						<FormControlLabel value="contributed" control={<Radio />} label={I18n.t("I contributed to")} />
						<FormControlLabel value="created" control={<Radio />} label={I18n.t("I created")} />
					</RadioGroup>
				</FormControl>
			}

			<div style={styleControl}>
				<Typography variant="body1">{I18n.t("Theme")}</Typography>
				<IconGridSelect
					cols={3}
					items={THEMES}
					value={this.state.theme !== null ? this.state.theme : this.props.values.theme}
					onChange={id => this.setState({ theme: id })}
				/>
			</div>

			<div style={styleControl}>
				<Typography variant="body1">{I18n.t("Type")}</Typography>
				<IconGridSelect
					cols={3}
					items={TYPES}
					value={this.state.type !== null ? this.state.type : this.props.values.type}
					onChange={id => this.setState({ type: id })}
				/>
			</div>

			{(this.props.status || this.props.completeness) && <div style={styleControl}>
				<Typography variant="body1">{I18n.t("Others")}</Typography>

				{this.props.status && <FormControl style={styleControl}>
					<InputLabel htmlFor="missions-filters-status">{I18n.t("Status")}</InputLabel>
					<Select
						native
						value={this.state.status !== null ? this.state.status : this.props.values.status}
						onChange={e => this.setState({ status: e.target.value })}
						input={<Input id="missions-filters-status" />}
					>
						<option value="" />
						{Object.entries(MISSION_STATUSES).map(e =>
							<option key={e[0]} value={e[0]}>{e[1].name}</option>
						)}
					</Select>
				</FormControl>}

				{this.props.completeness && <div>
					<FormControlLabel
						control={
							<Checkbox
								checked={this.state.editor}
								onChange={e => this.setState({ editor: e.target.checked })}
							/>
						}
						label={I18n.t("With integrated editor")}
					/>

					<FormControlLabel
						control={
							<Checkbox
								checked={this.state.complete}
								onChange={e => this.setState({ complete: e.target.checked })}
							/>
						}
						label={I18n.t("Show completed missions")}
					/>
				</div>}
			</div>}
		</div>;
	}

	componentWillMount() {
		if(this.props.values) {
			this.setState(this.props.values);
		}
	}

	componentWillUpdate(nextProps, nextState) {
		const prevFilters = this._toFilters(this.state);
		const newFilters = this._toFilters(nextState);

		if(Hash(newFilters) !== Hash(prevFilters)) {
			this.props.onChange(newFilters);
		}
	}
}

export default MissionsFiltersComponent;
