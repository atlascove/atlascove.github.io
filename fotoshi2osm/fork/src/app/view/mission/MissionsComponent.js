import React, { Component } from 'react';
import PaginatedList from './PaginatedMissionListComponent';

/**
 * Missions component is the page displaying list of missions to user.
 * There, user can filter missions, select one in the list, and also go to mission creation page.
 */
class MissionsComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		return <PaginatedList />;
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Missions") });
	}
}

export default MissionsComponent;
