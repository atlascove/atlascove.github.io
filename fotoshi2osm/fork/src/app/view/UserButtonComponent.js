import React, { Component } from 'react';
import withWidth from 'material-ui/utils/withWidth';
import { Account, AccountCircle, CameraBurst, ChartPie, LibraryPlus, Login, Logout } from 'mdi-material-ui';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import { Link } from 'react-router-dom';
import { ListItemIcon, ListItemText } from 'material-ui/List';
import Menu, { MenuItem } from 'material-ui/Menu';
import Button from 'material-ui/Button';
import Tooltip from 'material-ui/Tooltip';

/**
 * User button component handles switching between multiple states of user connection.
 */
class UserButtonComponent extends Component {
	constructor() {
		super();
		this.state = {
			connected: false,
			user: null,
			menuOpen: false,
			menuAnchor: null
		};

		this.psTokens = {};
	}

	/**
	 * Closes the menu.
	 * @private
	 */
	_closeMenu() {
		this.setState({ menuOpen: false, menuAnchor: null });
	}

	/**
	 * Handler for logout click.
	 * @private
	 */
	_logoutClick() {
		PubSub.publish("UI.LOGOUT.WANTS");
		this._closeMenu();
		this.setState({ connected: false, user: null });
	}

	render() {
		if(this.state.connected) {
			return <div style={{display: "inline"}}>
				<Tooltip title={I18n.t("Account")} placement="bottom">
					<IconButton
						color="inherit"
						onClick={e => this.setState({ menuOpen: true, menuAnchor: e.currentTarget })}
					>
						<AccountCircle />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={this.state.menuAnchor}
					open={this.state.menuOpen}
					onClose={this._closeMenu.bind(this)}
				>
					<MenuItem disabled>{this.state.user}</MenuItem>
					<MenuItem
						onClick={this._closeMenu.bind(this)}
						component={Link}
						to='/my/missions'
					>
						<ListItemIcon>
							<CameraBurst />
						</ListItemIcon>
						<ListItemText inset primary={I18n.t("Your missions")} />
					</MenuItem>
					<MenuItem
						onClick={this._closeMenu.bind(this)}
						component={Link}
						to='/my/statistics'
					>
						<ListItemIcon>
							<ChartPie />
						</ListItemIcon>
						<ListItemText inset primary={I18n.t("Your statistics")} />
					</MenuItem>
					<MenuItem onClick={this._logoutClick.bind(this)}>
						<ListItemIcon>
							<Logout />
						</ListItemIcon>
						<ListItemText inset primary={I18n.t("Log Out")} />
					</MenuItem>

					{this.props.withLinks && <Divider light />}

					{this.props.withLinks &&
						<MenuItem
							onClick={this._closeMenu.bind(this)}
							component={Link}
							to='/mission/copy'
						>
							<ListItemIcon>
								<LibraryPlus />
							</ListItemIcon>
							<ListItemText inset primary={I18n.t("Create mission")} />
						</MenuItem>
					}
					{this.props.withLinks &&
						<MenuItem
							onClick={this._closeMenu.bind(this)}
							component={Link}
							to='/statistics'
						>
							<ListItemIcon>
								<ChartPie />
							</ListItemIcon>
							<ListItemText inset primary={I18n.t("Statistics")} />
						</MenuItem>
					}
				</Menu>
			</div>;
		}
		else {
			const createLoginButton = width => {
				if(["xs", "sm"].includes(width)) {
					return <IconButton
						color="inherit"
						onClick={() => PubSub.publish("UI.LOGIN.WANTS")}>
						<Account />
					</IconButton>;
				} else {
					return <Button
						color="inherit"
						onClick={() => PubSub.publish("UI.LOGIN.WANTS")}
					>
						<Account />
						{I18n.t("Log In")}
					</Button>;
				}
			};

			return <Tooltip title={I18n.t("Log In")} placement="bottom">
				{createLoginButton(this.props.width)}
			</Tooltip>;
		}
	}

	componentWillMount() {
		this.psTokens.login = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			if(data && data.name) {
				this.setState({ user: data.name, connected: true });
			}
		});
	}

	componentWillUnmount() {
		if(this.psTokens.login) {
			PubSub.unsubscribe(this.psTokens.login);
		}
	}
}

export default withWidth()(UserButtonComponent);

/**
 * Event when the user wants to login.
 * @event UI.LOGIN.WANTS
 * @memberof Events
 */

/**
 * Event when the user wants to logout.
 * @event UI.LOGOUT.WANTS
 * @memberof Events
 */
