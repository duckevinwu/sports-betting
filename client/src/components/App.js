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
import LandingPage from './LandingPage';
import SubmitBet from './SubmitBet';
import ValidatedRoute from './ValidatedRoute';
import BetOnline from './BetOnline';
import Leaderboard from './Leaderboard';

export default class App extends React.Component {

	render() {
		return (
			<div className="App">
				<Router>
					<Switch>
						<Route
							exact
							path="/"
							render={() => (
								<LandingPage/>
							)}
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
							path="/betonline/:email/:token/:id"
							render={(props) => (
								<ValidatedRoute {...props} success={<BetOnline {...props}/>} fail={<BetOnline {...props}/>} />
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
								<AdminRoute success={<SendEmail/>} fail={<SendEmail/>}/>
							)}
						/>
						<Route
							exact
							path="/submitbet"
							render={() => (
								<SubmitBet />
							)}
						/>
						<Route
							exact
							path="/leaderboard"
							render={() => (
								<Leaderboard />
							)}
						/>
					</Switch>
				</Router>
			</div>
		);
	}
}
