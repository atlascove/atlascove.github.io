import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Wait from './WaitComponent';

/**
 * Authorize component checks if user is authenticated before accessing content.
 */
class AuthorizeComponent extends Component {
	constructor() {
		super();
		
		this.state = {
			user: null
		};
		
		this.psTokens = {};
	}
	
	static For(Comp) {
		return () => {
			const Auth = withRouter(AuthorizeComponent);
			return <Auth><Comp /></Auth>;
		};
	}
	
	render() {
		//Not logged in
		if(this.state.user === -1) {
			return <Wait />;
		}
		//Logged in
		else if(this.state.user) {
			const childrenProps = React.Children.map(this.props.children, child => {
				return React.cloneElement(child, { user: this.state.user });
			});
			
			return <div>{childrenProps}</div>;
		}
		//Wait for login
		else {
			return <Wait />;
		}
	}
	
	componentDidMount() {
		this.psTokens.wantUser = PubSub.subscribe("USER.INFO.READY", (msg, data) => {
			this.setState({ user: data ? data : -1 });
		});
		
		setTimeout(() => PubSub.publish("USER.INFO.WANTS"), 1500);
	}
	
	componentDidUpdate() {
		if(this.state.user === -1) {
			PubSub.publish("UI.LOGIN.WANTS");
		}
	}
	
	componentWillUnmount() {
		if(this.psTokens.wantUser) {
			PubSub.unsubscribe(this.psTokens.wantUser);
		}
	}
}

export default withRouter(AuthorizeComponent);
