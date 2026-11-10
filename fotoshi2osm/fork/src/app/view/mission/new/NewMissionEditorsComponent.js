import React, { Component } from 'react';
import { ChevronDown, PlusCircle } from 'mdi-material-ui';
import Chip from 'material-ui/Chip';
import ExpansionPanel, { ExpansionPanelDetails, ExpansionPanelSummary } from 'material-ui/ExpansionPanel';
import { FormControl, FormLabel, FormControlLabel } from 'material-ui/Form';
import Grid from 'material-ui/Grid';
import Hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Radio, { RadioGroup } from 'material-ui/Radio';
import SingleChoiceAnswerDialog from './NewMissionEditorsSingleChoiceAnswerDialogComponent';
import TagInput from '../../TagInputComponent';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import rfdc from 'rfdc';

/**
 * New mission details component allows users to input mission details (area name, short description, full description...)
 */
class NewMissionEditorsComponent extends Component {
	constructor() {
		super();

		this.state = {
			editor: "disabled",
			singleChoiceAnswerDialogOpen: false,
			singleChoiceAnswerDialogEdit: null,
			data: {
				singlechoice: {
					question: "",
					answers: []
				},
				usertext: {
					question: "",
					tag: "",
					valueType: "text"
				},
				importer: {
					mainTags: {},
					conflation: ""
				}
			}
		};

		this.userTextValueTypes = {
			"text": I18n.t("Free text"),
			"number": I18n.t("Number"),
			"color": I18n.t("Color")
		};
	}

	/**
	 * Change the used editor
	 * @private
	 */
	_changeEditor(id) {
		this.setState({ editor: id });
	}

	/**
	 * Change an editor value
	 * @private
	 */
	_changeProp(editor, prop, value) {
		const newData = rfdc()(this.state.data);

		if(!newData[editor]) {
			newData[editor] = {};
		}

		newData[editor][prop] = value;
		this.setState({ data: newData });
	}

	/**
	 * Add a new answer for a single choice editor
	 * @private
	 */
	_addSingleChoiceAnswer(d) {
		const newData = Object.assign({}, this.state.data);

		if(!newData.singlechoice) {
			newData.singlechoice = { question: "", answers: [] };
		}
		if(!newData.singlechoice.answers) {
			newData.singlechoice.answers = [];
		}

		if(this.state.singleChoiceAnswerDialogEdit !== null) {
			newData.singlechoice.answers[this.state.singleChoiceAnswerDialogEdit] = d;
		}
		else {
			newData.singlechoice.answers.push(d);
		}

		this.setState({ data: newData, singleChoiceAnswerDialogEdit: null, singleChoiceAnswerDialogOpen: false });
	}

	/**
	 * Removes an answer of a single choice editor
	 * @private
	 */
	_removeSingleChoiceAnswer(id) {
		const newData = Object.assign({}, this.state.data);
		newData.singlechoice.answers.splice(id, 1);
		this.setState({ data: newData });
	}

	render() {
		return <div style={this.props.style}>
			<Typography variant="subheading">{I18n.t("Editor")}</Typography>
			<Typography variant="caption">{I18n.t("In order to make mission solving easier, you may create a question to which users can answer simply. This makes possible to contribute on smartphone, and saves time on the desktop version. However, some missions can't be solved with a single question, then users have to contribute using a traditional OSM editor.")}</Typography>
			<Typography variant="caption" style={{marginBottom: 10}}>{I18n.t("Choose the most appropriate editor according to your mission needs.")}</Typography>

			<ExpansionPanel
				expanded={this.state.editor === "singlechoice"}
				disabled={this.props.showOnly !== "all" && !this.props.showOnly.includes("singlechoice")}
				onChange={() => this._changeEditor("singlechoice")}
			>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Question with single choice answer")}</Typography>
				</ExpansionPanelSummary>

				<ExpansionPanelDetails style={{display: "block"}}>
					<TextField
						id="singlechoice_question"
						label={I18n.t("Question label")}
						helperText={I18n.t("A short, explicit question, leading to easy answer")}
						value={this.state.data.singlechoice && this.state.data.singlechoice.question ? this.state.data.singlechoice.question.toString() : ""}
						onChange={e => this._changeProp("singlechoice", "question", e.target.value)}
						fullWidth
					/>

					<Typography variant="body2" style={{marginTop: 10}}>{I18n.t("Answers")}</Typography>
					<Typography variant="caption">{I18n.t("Add as many answers as your mission needs (at least 2).")}</Typography>

					<div>
						{this.state.data.singlechoice && this.state.data.singlechoice.answers && this.state.data.singlechoice.answers.map((answer, i) => {
							return <Chip
								key={i}
								label={answer.label}
								onClick={() => this.setState({ singleChoiceAnswerDialogOpen: true, singleChoiceAnswerDialogEdit: i })}
								onDelete={() => this._removeSingleChoiceAnswer(i)}
								style={{marginRight: 5}}
							/>;
						})}
						<Tooltip title={I18n.t("Add a new answer")}>
							<IconButton onClick={() => this.setState({ singleChoiceAnswerDialogOpen: true, singleChoiceAnswerDialogEdit: null })}>
								<PlusCircle />
							</IconButton>
						</Tooltip>
					</div>

					<SingleChoiceAnswerDialog
						open={this.state.singleChoiceAnswerDialogOpen}
						data={
							this.state.singleChoiceAnswerDialogEdit !== null
							&& this.state.data.singlechoice.answers
							&& this.state.data.singlechoice.answers[this.state.singleChoiceAnswerDialogEdit]
						}
						onClose={() => this.setState({ singleChoiceAnswerDialogOpen: false })}
						onCreate={d => this._addSingleChoiceAnswer(d)}
					/>
				</ExpansionPanelDetails>
			</ExpansionPanel>

			<ExpansionPanel
				expanded={this.state.editor === "usertext"}
				disabled={this.props.showOnly !== "all" && !this.props.showOnly.includes("usertext")}
				onChange={() => this._changeEditor("usertext")}
			>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Question with free user input")}</Typography>
				</ExpansionPanelSummary>

				<ExpansionPanelDetails style={{display: "block"}}>
					<TextField
						id="usertext_question"
						label={I18n.t("Question label")}
						helperText={I18n.t("A short, explicit question, leading to easy answer")}
						value={this.state.data.usertext && this.state.data.usertext.question ? this.state.data.usertext.question.toString() : ""}
						onChange={e => this._changeProp("usertext", "question", e.target.value)}
						fullWidth
					/>

					<TextField
						id="usertext_tag"
						label={I18n.t("Tag to set")}
						helperText={I18n.t("The key to fill with user input, for example \"colour\" or \"building:levels\"")}
						value={this.state.data.usertext && this.state.data.usertext.tag ? this.state.data.usertext.tag.toString() : ""}
						onChange={e => this._changeProp("usertext", "tag", e.target.value)}
						fullWidth
					/>

					<FormControl component="fieldset" style={{marginTop: 20}}>
						<FormLabel component="legend">{I18n.t("Answer type")}</FormLabel>
						<RadioGroup
							row
							aria-label="value type"
							name="value_type"
							value={this.state.data.usertext && this.state.data.usertext.valueType ? this.state.data.usertext.valueType : ""}
							onChange={ev => this._changeProp("usertext", "valueType", ev.target.value)}
							style={{ justifyContent: "center" }}
						>
							{Object.entries(this.userTextValueTypes).map((e, i) => {
								return <FormControlLabel key={i} value={e[0]} control={<Radio />} label={e[1]} />;
							})}
						</RadioGroup>
					</FormControl>
				</ExpansionPanelDetails>
			</ExpansionPanel>

			<ExpansionPanel
				expanded={this.state.editor === "importer"}
				disabled={this.props.showOnly !== "all" && !this.props.showOnly.includes("importer")}
				onChange={() => this._changeEditor("importer")}
			>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Import external features")}</Typography>
				</ExpansionPanelSummary>

				<ExpansionPanelDetails style={{display: "block"}}>
					<Typography variant="body1">
						{I18n.t("Feature will be shown to user, which will validate its presence on pictures.")}
						<br />
						{I18n.t("To allow proper integration of data, some information is necessary to look for existing similar objects.")}
					</Typography>

					<TagInput
						tags={this.state.data.importer && this.state.data.importer.mainTags}
						onChange={newTags => this._changeProp("importer", "mainTags", newTags)}
						onlyAddTags={true}
						label={I18n.t("Main OSM tags")}
						helper={I18n.t("Objects having all these key=value combinations will be retrieved. If any object is found, users will be able to merge external data with existing features.")}
					/>

					<TextField
						id="importer_conflation"
						label={I18n.t("Conflation distance (in meters)")}
						value={this.state.data.importer && this.state.data.importer.conflation}
						onChange={ev => this._changeProp("importer", "conflation", parseInt(ev.target.value))}
						helperText={I18n.t("Distance to look for similar objects (to merge this one with and avoid duplicates)")}
						type="number"
						fullWidth
					/>
				</ExpansionPanelDetails>
			</ExpansionPanel>

			<ExpansionPanel
				expanded={this.state.editor === "disabled"}
				onChange={() => this._changeEditor("disabled")}
				style={{marginBottom: 10}}
			>
				<ExpansionPanelSummary expandIcon={<ChevronDown />}>
					<Typography variant="body2">{I18n.t("Disabled")}</Typography>
				</ExpansionPanelSummary>

				<ExpansionPanelDetails style={{display: "block"}}>
					<Typography variant="body1">{I18n.t("Appropriate when the mission can't be solved easily. Also makes mission unavailable on smartphones.")}</Typography>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		</div>;
	}

	componentWillMount() {
		if(this.props.data && (this.props.showOnly === "all" || this.props.showOnly.includes(this.props.data.editor))) {
			this.setState(this.props.data);
		}
		else {
			const newState = (this.props.data) ? Object.assign({}, this.props.data) : {};

			//Fallback for first shown editor
			const fallbacks = [ "singlechoice", "usertext", "importer", "disabled" ];
			for(const e of fallbacks) {
				if(this.props.showOnly === "all" || this.props.showOnly.includes(e)) {
					newState.editor = e;
					this.setState(newState);
					this.props.onChange(newState);
					break;
				}
			}
		}
	}

	componentWillUpdate(nextProps, nextState) {
		//Notify parent of changes if necessary
		if(Hash(this.state) !== Hash(nextState)) {
			const info = Object.assign({}, nextState);

			if(info.editor === "disabled") {
				info.data = {};
			}

			this.props.onChange(info);
		}
	}
}

export default NewMissionEditorsComponent;
