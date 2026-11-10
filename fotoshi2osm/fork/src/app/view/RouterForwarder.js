import React, { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Fixtures for passing router to popups in Leaflet maps
 */
class RouterForwarder extends Component {
	getChildContext() {
		return this.props.context;
	}
	
	render() {
		return <div style={this.props.style}>{this.props.children}</div>
	}
}

RouterForwarder.childContextTypes = {
	router: PropTypes.object.isRequired
};

RouterForwarder.propTypes = {
	context: PropTypes.object.isRequired
};

export default RouterForwarder;
