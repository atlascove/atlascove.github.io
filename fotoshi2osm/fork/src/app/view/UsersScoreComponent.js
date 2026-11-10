import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Typography from 'material-ui/Typography';

/**
 * Users score component allows to display scores of a given list of users.
 */
class UsersScoreComponent extends Component {
	render() {
		return <div>
			<Typography variant="subheading">{I18n.t("Users contributions (last 30 days)")}</Typography>
			<Paper style={{overflowY: "auto"}}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>#</TableCell>
							<TableCell>{I18n.t("User")}</TableCell>
							<TableCell>{I18n.t("Edited features")}</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{this.props.data.map((d,i) => {
							return <TableRow key={i} style={this.props.user && this.props.user.name === d.user ? { backgroundColor: "#FFF9C4" } : {}}>
								<TableCell>{d.place || i+1}</TableCell>
								<TableCell>{d.user}</TableCell>
								<TableCell>{d.featuresEdited}</TableCell>
							</TableRow>
						})}
					</TableBody>
				</Table>
			</Paper>
		</div>;
	}
}

export default UsersScoreComponent;
