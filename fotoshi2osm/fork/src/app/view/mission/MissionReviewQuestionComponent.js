import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import { Check, Pencil, RadioboxBlank, RadioboxMarked, MapMarkerMultiple, MapMarkerPlus, SkipForward } from 'mdi-material-ui';
import Button from 'material-ui/Button';
import { FormControlLabel } from 'material-ui/Form';
import GridList, { GridListTile, GridListTileBar } from 'material-ui/GridList';
import HorizontalScrollGridList from '../HorizontalScrollGridList';
import IconButton from 'material-ui/IconButton';
import Paper from 'material-ui/Paper';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { SwatchesPicker } from 'react-color';
import TextField from 'material-ui/TextField';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

const IMG_HEIGHT = { "xs": 70, "sm": 100, "md": 100, "lg": 120, "xl": 120};

/**
 * Mission review progress component displays a progress bar for the current review session.
 */
class MissionReviewQuestionComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selectedAnswer: -1,
			usertextValue: undefined
		};
	}
	
	_onAnswerChange(key) {
		key = parseInt(key);
		this.setState({ selectedAnswer: key });
		this.props.onAnswerChange(this.props.data.answers[key]);
	}
	
	_onUsertextAnswerChange(value) {
		this.setState({ usertextValue: value });
	}
	
	_onUsertextValidated() {
		this.props.onAnswerChange({
			tags: {
				[this.props.data.tag]: this.state.usertextValue
			}
		});
	}
	
	_onImportValidated() {
		this.props.onAnswerChange({
			validated: true
		});
	}
	
	_handleMerge(feature) {
		if(feature) {
			this.props.onAnswerChange({
				mergeWith: feature
			});
		}
		else if(this.props.similarFeatures && this.props.similarFeatures.features && this.props.similarFeatures.features.length === 1) {
			this.props.onAnswerChange({
				mergeWith: this.props.similarFeatures.features[0]
			});
		}
		else {
			PubSub.publish("UI.MESSAGE.BASIC", { type: "info", message: I18n.t("Choose the feature you want to merge with by clicking on it using the map"), smiley: "🔍", duration: 5000 });
		}
	}
	
	_isMobile() {
		return ["xs","sm"].includes(this.props.width);
	}
	
	render() {
		const btnSize = this._isMobile() ? "small" : "medium";
		
		if(this.props.data && this.props.data.type && this.props.data.type !== "disabled") {
			let content = null;
			let question = this.props.data.question;
			
			if(this.props.data.type === "images") {
				const tiles = this.props.data.answers.map((answer, i) => {
					const onClick = () => this._onAnswerChange(i);
					
					return <GridListTile key={i} style={{cursor:"pointer"}} onClick={onClick}>
						<img src={answer.image} alt={answer.label} />
						<GridListTileBar
							subtitle={answer.label}
							style={this._isMobile() ? {height: 30, fontWeight: "bold", background: "rgba(0,0,0,0.7)"} : {height: 30}}
						/>
					</GridListTile>;
				});
				
				const tilesPerRow = this._isMobile() ? ((tiles.length === 4) ? 2 : 3) : 4;
				content = <div
						style={{
							maxHeight: (tiles.length / tilesPerRow) > 2 && this._isMobile() ? IMG_HEIGHT[this.props.width]*2.5 : null,
							marginTop: 10, overflowX: "hidden", overflowY: this._isMobile() ? "auto" : null
						}}
					>
						<GridList
							cols={Math.min(tilesPerRow, tiles.length)}
							cellHeight={IMG_HEIGHT[this.props.width]}
							style={{margin: 0}}
						>
							{tiles}
						</GridList>
					</div>;
			}
			else if(this.props.data.type === "choice") {
				content = <RadioGroup
					row
					aria-label="answer"
					name="answer"
					value={this.state.selectedAnswer.toString()}
					onChange={ev => this._onAnswerChange(ev.target.value)}
					style={{ justifyContent: "center" }}
				>
					{this.props.data.answers.map((answer, i) => {
						return <FormControlLabel key={i} value={i.toString()} control={<Radio />} label={answer.label} />;
					})}
				</RadioGroup>;
			}
			else if(this.props.data.type === "usertext") {
				let select = null;
				if(this.props.data.type === "usertext" && this.props.data.valueType === "text") {
					select = <TextField
								id="answer"
								label={I18n.t("Your response")}
								value={this.state.usertextValue}
								onChange={ev => this._onUsertextAnswerChange(ev.target.value)}
								type="text"
								fullWidth
							/>;
				}
				else if(this.props.data.type === "usertext" && this.props.data.valueType === "number") {
					select = <TextField
								id="answer"
								label={I18n.t("Your response")}
								value={this.state.usertextValue}
								onChange={ev => this._onUsertextAnswerChange(ev.target.value)}
								type="number"
								fullWidth
							/>;
				}
				else if(this.props.data.type === "usertext" && this.props.data.valueType === "color") {
					select = <SwatchesPicker
								width="100%"
								height={this._isMobile() ? "150px" : "200px"}
								color={this.state.usertextValue}
								onChangeComplete={(color, ev) => this._onUsertextAnswerChange(color.hex)}
							/>;
				}
				
				content = <div>
					{select}
					<Tooltip title={I18n.t("Validate your answer")} style={{width:"100%", marginTop: 10}}>
						<Button size={btnSize} variant="raised" color="primary" onClick={this._onUsertextValidated.bind(this)} style={{width:"100%", height:"100%" }}>
							<Check /> {I18n.t("OK")}
						</Button>
					</Tooltip>
				</div>;
			}
			else if(this.props.data.type === "importer") {
				question = I18n.t("Can you see the feature on pictures ?");
				
				const tags = Object.assign({}, this.props.feature.properties);
				delete tags.error_id;
				delete tags.title;
				
				content = <div>
					{this.props.similarFeatures &&
						<Typography
							variant="subheading"
							style={this._isMobile() ? {fontSize: "0.9rem", marginBottom: 10}: {marginBottom: 20}}
						>
							{I18n.t("There are similar features already existing around in OpenStreetMap (shown in orange on map).")}
						</Typography>
					}
					
					<Tooltip title={I18n.t("Click here if you can see the concerned feature on pictures")} style={{width:"100%"}}>
						<Button size={btnSize} variant="raised" color="primary" onClick={this._onImportValidated.bind(this)} style={{ width:"100%", height:"100%" }}>
							{this.props.similarFeatures ? <MapMarkerPlus /> : <Check />}
							{this.props.similarFeatures ? I18n.t("I see it and it's not in OSM") : I18n.t("I can see the feature")}
						</Button>
					</Tooltip>
					
					{this.props.similarFeatures &&
						<Tooltip title={I18n.t("Click here if you can see the concerned feature on pictures, but also as an already existing feature in OSM shown as in orange on map")} style={{width:"100%", marginTop: 10}}>
							<Button size={btnSize} variant="raised" color="secondary" onClick={() => this._handleMerge()} style={{ width:"100%", height:"100%" }}>
								<MapMarkerMultiple /> {I18n.t("I see it but it already exists in OSM")}
							</Button>
						</Tooltip>
					}
				</div>;
			}
			
			return <div style={{ textAlign: "center", padding: 0, marginTop: (this._isMobile() ? 0 : 10) }}>
				<Typography variant="headline" style={this._isMobile() ? {fontSize: "1.3rem", marginBottom: 5} : {marginBottom: 5}}>
					{question}
				</Typography>
				
				{content}
				
				{this._isMobile() && this.props.skip &&
					<Tooltip title={this.props.skip.tip} style={{width: "100%", marginTop: 10, marginBottom: this._isMobile() ? 20 : undefined}}>
						<Button
							variant="raised"
							size="small"
							style={{width: "100%"}}
							onClick={this.props.skip.click}
						>
							{this.props.skip.icon} {this.props.skip.label}
						</Button>
					</Tooltip>
				}
			</div>;
		}
		else {
			return <div style={{ textAlign: "center", padding: 0, marginTop: (this._isMobile() ? 0 : 10) }}>
				<Typography variant="headline">
					{I18n.t("This need an advanced edit !")}
				</Typography>
				
				{(this.props.feature.properties.title || this.props.feature.properties.details) &&
					<Typography>{I18n.t("Details")} : {this.props.feature.properties.details ? this.props.feature.properties.details : this.props.feature.properties.title}</Typography>
				}
				
				<Button size={btnSize} variant="raised" onClick={this.props.onOpenEditor} style={{ margin: 20, minWidth: 150 }}>
					<Pencil /> {I18n.t("Edit")}
				</Button>
			</div>;
		}
	}
	
	componentDidMount() {
		PubSub.subscribe("UI.MAP.SIMILARCLICKED", (msg, data) => {
			this._handleMerge(data.feature);
		});
	}
	
	componentWillUnmount() {
		PubSub.unsubscribe("UI.MAP.SIMILARCLICKED");
	}
}

export default withWidth()(MissionReviewQuestionComponent);
