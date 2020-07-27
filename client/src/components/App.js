import React from 'react';
import {
	BrowserRouter as Router,
	Route,
	Switch
} from 'react-router-dom';
import Test from './Test';
import LoginWrapper from './LoginWrapper';
import RegisterWrapper from './RegisterWrapper';
import Profile from './Profile';
import AdminRoute from './AdminRoute';
import SendEmail from './SendEmail';

export default class App extends React.Component {

	render() {
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route
							exact
							path="/"

						/>
						<Route
							exact
							path="/login"
							render={() => (
								<LoginWrapper />
							)}
						/>
						<Route
							exact
							path="/register"
							render={() => (
								<RegisterWrapper />
							)}
						/>
						<Route
							exact
							path="/profile"
							render={() => (
								<Profile />
							)}
						/>
						<Route
							exact
							path="/sendemail"
							render={() => (
								<AdminRoute success={<SendEmail/>} fail={<LoginWrapper/>}/>
							)}
						/>
					</Switch>
				</Router>
			</div>
		);
	}
}
