import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import LibraryPlus from 'mdi-material-ui/LibraryPlus';
import ViewGrid from 'mdi-material-ui/ViewGrid';
import { Link } from 'react-router-dom';
import AppBar from 'material-ui/AppBar';
import Hidden from 'material-ui/Hidden';
import IconButton from 'material-ui/IconButton';
import Toolbar from 'material-ui/Toolbar';
import Tooltip from 'material-ui/Tooltip';
import Typography from 'material-ui/Typography';
import UserButton from './UserButtonComponent';

/**
 * Header component is handling the page header.
 * It contains logo, title, and some menus for user interaction.
 */
class HeaderComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			title: null,
			subtitle: null
		};
		
		this.psTokens = {};
	}
	
	render() {
		return <AppBar position="static">
			<Toolbar style={{display: "flex", justifyContent: "space-between", color: "white"}}>
				<div>
					<Link to='/'>
						<img
							src="images/logo.512.png"
							style={{height: 50, marginRight: 20, verticalAlign: "middle", cursor: "pointer"}}
						/>
					</Link>
					<div style={{display: "inline-block", verticalAlign: "middle"}}>
						<Typography variant="title" style={{marginBottom: 0}} gutterBottom color="inherit">{I18n.t("Pic4Review")}</Typography>
						<Typography variant="body1" style={{marginBottom: 0, fontWeight: "bold"}} gutterBottom color="inherit" title={I18n.t("Better maps created by people using street pictures")}>📸 + 🤗 ➜ 🗺️ 💕</Typography>
					</div>
				</div>
				
				{this.state.title && <Hidden only="xs"><div style={{display: "inline-block", textAlign: "center"}}>
					<Typography variant="title" style={{marginBottom: 0}} color="inherit">{this.state.title}</Typography>
					<Typography variant="caption" style={{marginBottom: 0}} color="inherit">{this.state.subtitle}</Typography>
				</div></Hidden>}
				
				<div>
					<Tooltip title={I18n.t("Missions")} placement="bottom">
						<IconButton
							component={Link}
							to='/missions'
							color="inherit"
						>
							<ViewGrid />
						</IconButton>
					</Tooltip>
					
					<Hidden only="xs">
						<Tooltip title={I18n.t("Create mission")} placement="bottom">
							<IconButton
								component={Link}
								to='/mission/create'
								color="inherit"
							>
								<LibraryPlus />
							</IconButton>
						</Tooltip>
					</Hidden>
					
					<UserButton withLinks={this.props.width === "xs"} />
				</div>
			</Toolbar>
		</AppBar>;
	}
	
	componentDidMount() {
		this.psTokens.title = PubSub.subscribe("UI.TITLE.SET", (msg, data) => {
			this.setState({ title: data.title, subtitle: data.subtitle });
		});
		
		this.psTokens.reset = PubSub.subscribe("UI.TITLE.RESET", (msg, data) => {
			this.setState({ title: null, subtitle: null });
		});
	}
	
	componentWillUnmount() {
		if(this.psTokens.title) {
			PubSub.unsubscribe(this.psTokens.title);
		}
		
		if(this.psTokens.reset) {
			PubSub.unsubscribe(this.psTokens.reset);
		}
	}
}

export default withWidth()(HeaderComponent);

/**
 * Event to display a particular title
 * @event UI.TITLE.SET
 * @type {Object} Event data
 * @property {string} title The page title
 * @property {string} subtitle The page subtitle
 * @memberof Events
 */

/**
 * Event to remove previous title
 * @event UI.TITLE.RESET
 * @memberof Events
 */
