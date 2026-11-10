import React, { Component } from 'react';
import PaginatedList from './PaginatedMissionListComponent';
import Wait from '../WaitComponent';

/**
 * Missions admin component is the page where you can set the visibility of existing missions.
 */
class MissionsAdminComponent extends Component {
	constructor() {
		super();
	}
	
	render() {
		if(this.props.user) {
			return <PaginatedList
				synthetic={true}
				user={this.props.user}
				admin={true}
			/>;
		}
		else {
			return <Wait />;
		}
	}
	
	componentWillMount() {
		PubSub.publish("UI.TITLE.SET", { title: I18n.t("Missions administration") });
	}
}

export default MissionsAdminComponent;
