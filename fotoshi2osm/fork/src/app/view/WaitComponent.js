import React, { Component } from 'react';
import { CircularProgress } from 'material-ui/Progress';

/**
 * Wait spinner
 */
class WaitComponent extends Component {
	render() {
		return <div style={{textAlign: "center", width: "100%"}}><CircularProgress size={70} /></div>;
	}
}

export default WaitComponent;
