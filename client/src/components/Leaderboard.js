import React from 'react';
import '../style/Style.css';
import Preloader from './Preloader';
import LeaderboardRow from './LeaderboardRow';

export default class Leaderboard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: false,
      lbRows: [],
      date: ""
    }

    this.formatDate = this.formatDate.bind(this);
  }

  componentDidMount() {
    fetch("/api/leaderboard",
		{
			method: "GET"
		}).then(res => {
			return res.json();
		}, err => {
			console.log(err);
		}).then(data => {
      console.log(data)

      var date = data.date;

      var lbRows = <p className="white-text">No data</p>;

      if (data.status === 'success') {

        var playerList = data.leaderboard;
        lbRows = playerList.map((player, i) =>
          <LeaderboardRow key={i} player={player} />
        );
      }

      this.setState({
        isLoaded: true,
        date: date,
        lbRows: lbRows
      })
		});
  }

  formatDate(d) {
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var now = new Date(d);
    return (months[now.getMonth()] + ' ' + now.getDate() + ', ' + now.getFullYear());
  }

  render() {
    if (!this.state.isLoaded) {
      return (<Preloader/>);
    } else {
      return (
        <div className="leaderboard-page">
          <div className="lb-links">
            <span className=""><a href="/"><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px" className="lb-logo"></img></a></span>
          </div>
          <div className="lb-container">
            <h2 className="lb-title">Leaderboard</h2>
            <p className="date-text">{this.formatDate(this.state.date)}</p>
            <div className="underline"></div>
            <div className="leaderboard">
              {this.state.lbRows}
            </div>
          </div>
        </div>
      );
    }
  }
}
