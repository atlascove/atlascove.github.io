import React, { Component } from 'react';
import { ContentDuplicate, FileOutline } from 'mdi-material-ui';
import Grid from 'material-ui/Grid';
import { Link } from 'react-router-dom';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

/**
 * Create mission component shows a two entries menu to choose if you want to create a new mission using a template or from scratch.
 */
class CreateMissionComponent extends Component {
	render() {
		const iconStyle = { height: 128, width: 128, };
		
		const entries = [
			{ title: I18n.t("Using a template"), subtitle: I18n.t("Fast and relax"), link: '/mission/copy', icon: <ContentDuplicate color="primary" style={iconStyle} /> },
			{ title: I18n.t("From scratch"), subtitle: I18n.t("Highly configurable"), link: '/mission/new', icon: <FileOutline color="primary" style={iconStyle} /> }
		];
		
		return <Grid container spacing={8} justify="center" alignItems="center" style={{marginTop: 20}}>
			<Grid item xs={12} style={{marginBottom: 10, textAlign: "center"}}>
				<Typography variant="body1">{I18n.t("Select the way you want to create your new mission : using existing templates (takes few seconds), or creating from scratch your mission (takes few minutes, but you can do whatever you like).")}</Typography>
			</Grid>
			
			{entries.map((e,i) => {
				return <Grid item xs={12} sm={6} lg={4} xl={3} key={i}>
					<Link to={e.link} style={{textDecoration: "none"}}>
						<Paper style={{ padding: 8, textAlign: "center", textDecoration: "none !important" }}>
							{e.icon}
							<Typography variant="headline">{e.title}</Typography>
							<Typography variant="subheading">{e.subtitle}</Typography>
						</Paper>
					</Link>
				</Grid>;
			})}
		</Grid>;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Create mission") });
	}
}

export default CreateMissionComponent;
