import React, { Component } from 'react';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';

/**
 * Icon grid select component allows to choose one item over a list of icons.
 */
class IconGridSelectComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			selected: null
		};
	}
	
	/**
	 * Handler for click on icon
	 * @private
	 */
	_onSelect(id) {
		//Unselect
		if(this.state.selected === id) {
			this.props.onChange(null);
			this.setState({ selected: null });
		}
		//Change selection
		else {
			this.props.onChange(id);
			this.setState({ selected: id });
		}
	}
	
	render() {
		return <Grid container spacing={16} alignItems="center" justify="center">
			{Object.entries(this.props.items).map(e => {
				return <Grid item xs={Math.ceil(12/this.props.cols)} key={e[0]} style={{textAlign: "center"}}>
					<Tooltip title={e[1].name}>
						<IconButton
							onClick={() => this._onSelect(e[0])}
							color={this.state.selected === e[0] ? "secondary": "default"}
						>
							{e[1].icon}
						</IconButton>
					</Tooltip>
				</Grid>;
			})}
		</Grid>;
	}
	
	componentWillMount() {
		if(this.props.value) {
			this.setState({ selected: this.props.value });
		}
	}
}

export default IconGridSelectComponent;
