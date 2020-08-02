import React from 'react';
import '../style/BetOnline.css';
import GameRow from './GameRow';
import Preloader from './Preloader';
import PostSubmit from './PostSubmit';

export default class BetOnline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      token: "",
      id: "",
      games: [],
      player: {},
      total: "",
      submitObj: {},
      success: false,
      isLoaded: false,
      showPage: 1,
      gamesToday: false
    };

    this.submitObj = {};

    this.submitForm = this.submitForm.bind(this);
  }

  componentDidMount() {

    this.setState({
      email: this.props.match.params.email,
      token: this.props.match.params.token,
      id: this.props.match.params.id
    })

    var gamesUrl = '/api/getgames';
		var playerUrl = '/api/yesterdayrank/' + this.props.match.params.id;

		var promises = Promise.all([
			fetch(gamesUrl),
			fetch(playerUrl)
		])

		promises
			.then((results) =>
				Promise.all(results.map(r => r.json()))
			)
			.then((data) => {
				var gamesObj = data[0];
				var playerObj = data[1];

        var gameDivs = <p className="white-text">No games today</p>;
        var gamesToday = false;

        if (gamesObj.status === 'success') {

          gamesToday = true;

          var handleOptionChange = (gameId, selected) => {
            this.state.submitObj[gameId] = selected;
          }

          var gameList = gamesObj.games;
          gameDivs = gameList.map((game, i) =>
    				<GameRow key={i} game={game} handleChange={handleOptionChange} />
    			);
        }

  			this.setState({
  				games: gameDivs,
          player: playerObj.player,
          total: playerObj.total,
          isLoaded: true,
          gamesToday: gamesToday
  			});

			});

  }

  submitForm(e) {
    e.preventDefault();
    this.state.submitObj['id'] = this.state.id;
    this.state.submitObj['email'] = this.state.email;

    fetch("/api/submitbet", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        params: this.state.submitObj
      })
    })
    .then(res => {
			return res.json();
		}, err => {
			console.log(err);
		})
    .then(data => {
      console.log(data);
      this.setState({
        success: true
      })
    });
  }


  render() {
    if (!this.state.isLoaded) {
      return (<Preloader />);
    } else {
      if (this.state.showPage === 1) {

        var todayTable = this.state.games;

        console.log(this.state);

        if (this.state.gamesToday) {
          todayTable = (
            <div>
              <table className="games-table">
                <tbody>
                  <tr>
                    <th></th>
                    <th className="blue-text">Home</th>
                    <th className="gold-text">Away</th>
                    <th className="white-text">Spread</th>
                  </tr>
                  {this.state.games}
                </tbody>
              </table>
              <button type="submit" className="form-submit-button">Submit</button>
            </div>
          );
        }

        return (
          <div className="form-container">
            <form onSubmit={this.submitForm} className="bet-form">
              <input type="hidden" name="email" value={this.state.email}/>
              <input type="hidden" name="token" value={this.state.token}/>
              <input type="hidden" name="id" value={this.state.id}/>

              <div className="logo-table-wrapper">
                <table className="logo-table">
                  <tbody>
                    <tr>
                      <td><img src="https://i.ibb.co/TgG3h46/logo-1.png" className="logo-img"></img></td>
                      <td><img src="https://i.ibb.co/nRsWXhS/text.png" className="logo-img"></img></td>
                    </tr>
                  </tbody>
                </table>
                <hr className="divider"/>
                <p className="form-title-text">YESTERDAY</p>
                <table className="yesterday-table">
                  <tbody>
                    <tr>
                      <td className="white-text">Rank</td>
                      <td className="spacer"></td>
                      <td className="white-text">Payout*</td>
                    </tr>
                    <tr>
                      <td className="stat-wrapper">
                        <div><span className="rank-text">{this.state.player.rank}</span><span className="white-text">/{this.state.total}</span></div>
                      </td>
                      <td></td>
                      <td className="stat-wrapper">
                        <div><span className="payout-text">+ ${(this.state.player.payout + this.state.player.f2p).toFixed(2)}</span></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="white-text">*To redeem your payout, signup for <a href="/" className="gold-text">Bluejay Pro</a>!</p>
                <hr className="divider"/>
              </div>

              <p className="form-title-text">TODAY</p>
              {todayTable}
            </form>
          </div>
        )
      } else if (this.state.showPage === 2) {
        return (<PostSubmit status="success"/>);
      } else {
        return (<PostSubmit status="fail"/>);
      }
    }
  }
}
