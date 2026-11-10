import React, { Component } from 'react';
import DotsHorizontal from 'mdi-material-ui/DotsHorizontal';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Typography from 'material-ui/Typography';

/**
 * Tag input component allows user to define, as text, a set of tags (in a key=value format)
 */
class TagInputComponent extends Component {
	constructor() {
		super();

		this.state = {
			text: "",
			error: false,
			showHelp: false
		};
	}

	/**
	 * Transform JS object into string representation
	 * @private
	 */
	_tagsToText(tags) {
		return tags ? Object.entries(tags).map(e => e[0] + "=" + e[1]).join("\n") : "";
	}

	/**
	 * Convert tags text into JS object
	 * @private
	 */
	_textToTags(text) {
		const tags = {};
		text.split("\n").map(e => e.split("=")).forEach(e => {
			tags[e[0]] = e[1];
		});
		return tags;
	}

	/**
	 * Event handler for text change in textfield
	 * @private
	 */
	_textChanged(newText) {
		this.setState({ text: newText, error: false });
		if(newText.trim().match(/^[a-z0-9_\.:\-~]+=[^=\n]+(\n[a-z0-9_\.:\-~]+=[^=\n]+)*$/i)) {
			this.props.onChange(this._textToTags(newText.trim()));
		}
		else {
			this.setState({ error: true });
			this.props.onChange(null);
		}
	}

	render() {
		const helper = this.props.helper ? this.props.helper + " " : "";
		return <div style={{ position: "relative" }}>
			{!this.props.onlyAddTags &&
				<Button
					variant="fab"
					style={{ position: "absolute", right: 5, top: 5, zIndex: 1000 }}
					onClick={() => this.setState({ showHelp: !this.state.showHelp })}
				>
					<DotsHorizontal />
				</Button>
			}

			<TextField
				margin="normal"
				fullWidth multiline required
				error={this.state.error}
				label={this.props.label || I18n.t("OSM tags")}
				helperText={I18n.t("List tags as key=value (one tag per line).")+helper}
				placeholder={"amenity=bench\nbackrest=yes\nmaterial=wood".replace(/\\n/g, '\n')}
				rows="4"
				value={this.state.text}
				onChange={ev => this._textChanged(ev.target.value)}
			/>

			{this.state.showHelp &&
				<Typography variant="body1">
					{I18n.t("You can use advanced syntax for more precise editing of features:")}
					<br />- {I18n.t("To delete a tag: -tagtodelete=*")}
					<br />- {I18n.t("To apply a tag only on specific geometry: ~node:tagfornode=yes")}
				</Typography>
			}
		</div>;
	}

	componentWillMount() {
		this.setState({ text: this._tagsToText(this.props.tags) });
	}
}

export default TagInputComponent;
