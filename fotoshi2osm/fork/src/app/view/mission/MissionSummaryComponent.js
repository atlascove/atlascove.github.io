import React, { Component } from 'react';
import { grey } from 'material-ui/colors';
import withWidth from 'material-ui/utils/withWidth';
import Avatar from 'material-ui/Avatar';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';

const dayOffset = d => {
	d = new Date(d);
	const now = new Date(Date.now());
	const d1 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
	const d2 = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
	return Math.floor((d1-d2) / (1000*60*60*24));
};

/**
 * Mission summary component shows the main descriptive elements of a {@link Mission}.
 */
class MissionSummaryComponent extends Component {
	render() {
		let details = [];
		
		if(this.props.mission.options.stats) {
			if(this.props.mission.options.dateCreation) {
				details.push(I18n.t({
					zero: "Created today",
					one: "Created yesterday",
					other: "Created %{count} days ago"
				}, { count: dayOffset(this.props.mission.options.dateCreation) }));
			}
			
			if(this.props.mission.options.contributors !== null) {
				details.push(I18n.t({
					zero: "No contributors yet",
					one: "1 contributor",
					other: "%{count} contributors"
				}, { count: this.props.mission.options.contributors }));
			}
		}
		
		details = details.join(" - ");
		if(this.props.width !== "xs") { details = " - " + details; }
		
		return <div onClick={this.props.onClick ? this.props.onClick : () => {}}>
			{!this.props.noImage && this.props.width !== "xs" && this.props.mission.options.illustration &&
				<img
					src={this.props.mission.options.illustration}
					style={{ float: "right", maxHeight: 150, maxWidth: 150, marginLeft: 10 }}
				/>
			}
			{!this.props.noImage && this.props.width === "xs" && this.props.mission.options.illustration &&
				<Avatar
					src={this.props.mission.options.illustration}
					style={{float: "left", marginRight: 10, height: 60, width: 60}}
				/>
			}
			<Typography variant={this.props.width === "xs" ? "subheading" : "headline"} style={{verticalAlign: "middle"}}>
				{this.props.mission.description.short}
				
				<span style={{verticalAlign: "middle", color: grey[500], marginLeft: 10, float: "right"}}>
					<Tooltip title={TYPES[this.props.mission.type].name}>
						{TYPES[this.props.mission.type].icon}
					</Tooltip>
					
					<Tooltip title={THEMES[this.props.mission.theme].name}>
						{THEMES[this.props.mission.theme].icon}
					</Tooltip>
					
					{this.props.mission.options.canEdit !== null && <Tooltip title={EDITORS[this.props.mission.options.canEdit || false].name}>
						{EDITORS[this.props.mission.options.canEdit || false].icon}
					</Tooltip>}
				</span>
			</Typography>
			
			<Typography variant={this.props.width === "xs" ? "body1" : "subheading"} style={{margin: 0}}>
				{this.props.mission.area.name}
			</Typography>
			
			{this.props.mission.options.stats && <Typography variant="caption">
				{
					I18n.t("%{pct} % complete (%{nb} features + %{nbno} without pics)", {
						pct: this.props.mission.options.stats.completed,
						nb: this.props.mission.options.stats.total - this.props.mission.options.stats.nopics,
						nbno: this.props.mission.options.stats.nopics
				})}
				{this.props.width === "xs" && <br />}
				{details}
			</Typography>}
		</div>;
	}
}

export default withWidth()(MissionSummaryComponent);
