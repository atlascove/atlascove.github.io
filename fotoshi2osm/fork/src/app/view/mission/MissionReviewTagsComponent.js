import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

/**
 * Mission review tags component shows a feature's tags to user.
 */
class MissionReviewTagsComponent extends Component {
	constructor() {
		super();
	}

	render() {
		const style = Object.assign({}, this.props.style);

		const tags = Object.keys(this.props.feature.properties)
			.map((k, i) => {
				return <TableRow key={i} style={{height: 30}}>
					<TableCell>{k}</TableCell>
					<TableCell>{this.props.feature.properties[k]}</TableCell>
				</TableRow>;
			});

		return <Paper style={{overflowX: "auto"}}><Table style={style}>
			<TableHead>
				<TableRow style={{height: 30}}>
					<TableCell>{I18n.t("Key")}</TableCell>
					<TableCell>{I18n.t("Value")}</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{tags}
			</TableBody>
		</Table></Paper>;
	}
}

export default MissionReviewTagsComponent;
