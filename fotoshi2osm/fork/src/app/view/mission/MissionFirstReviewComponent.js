import React, { Component } from 'react';
import Dialog, { DialogContent } from 'material-ui/Dialog';
import { Link } from 'react-router-dom';
import Typography from 'material-ui/Typography';

/**
 * Mission first review component shows a dialog giving hints about how to review features.
 */
class MissionFirstReviewComponent extends Component {
	render() {
		return <Dialog
			open={this.props.open}
			onClose={this.props.onClose}
			onClick={this.props.onClose}
		>
			<DialogContent>
				<div style={{float: "right", cursor: "pointer"}}>❌</div>
				<Typography variant="headline">{I18n.t("Welcome !")}</Typography>
				<Typography variant="body1">
					{I18n.t("Have we already met ? Anyway, welcome to the review page.")}<br />{I18n.t("Here are some tips for a good start in Pic4Review:")}
				</Typography>
				<ul>
					<li>{I18n.t("You have to answer the question by looking to feature pictures")}</li>
					<li>{I18n.t("If you can't see the feature on pictures, or you are not sure of what to do, click on \"Next\"")}</li>
					<li>{I18n.t("If you use an external OSM editor, when done editing feature, click on \"Validate\"")}</li>
					<li>{I18n.t("Every time you answer a question, you earn one point !")} <a href="https://upload.wikimedia.org/wikipedia/en/6/61/Pok%C3%A9mon_Theme_Song_-_Sample.ogg" target="_blank" onClick={e => e.stopPropagation()}>{I18n.t("Gotta Catch 'Em all")}</a></li>
				</ul>
				<Typography variant="body1">
					{I18n.t("You're now ready to start ! Good luck 😉")}
				</Typography>
			</DialogContent>
		</Dialog>;
	}
}

export default MissionFirstReviewComponent;
