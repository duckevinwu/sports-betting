import React from 'react';

export default class GameRow extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      favored: "",
      spread: "",
      selected: ""
    }

    this.abbToName = this.abbToName.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
  }

  componentDidMount() {
    var team1 = this.props.game.team1;
    var team2 = this.props.game.team2;
    var spread1 = this.props.game.spread1;
    var spread2 = this.props.game.spread2;

    var favored = team1;
    var spread = spread1;

    if (parseFloat(spread1) > parseFloat(spread2)) {
      spread = spread2;
      favored = team2;
    }

    this.setState({
      favored: favored,
      spread: spread
    })
  }

  abbToName(s) {
    var map = {
      GS:	  'GSW',
      NO:	  'NOP',
      NY:	  'NYK',
      PHO:  'PHX',
      SA:	  'SAS'
    }

    if (map[s]) {
      return map[s];
    }

    return s;
  }

  handleOptionChange(e) {
    var gameId = e.target.name;
    var selected = e.target.value
    this.props.handleChange(gameId, selected);
  }

  render() {
    return (
      <tr className="game-row">
        <td className="time-box">
          {this.props.game.time} EST
        </td>
        <td className="game-box">
          <label htmlFor={this.props.game.team1}>
          <input className="radio-button home-radio" type="radio" id={this.props.game.team1} name={this.props.game.id} value={this.props.game.team1} onChange={this.handleOptionChange} />
          <table className="teamTag-home home-box">
            <tbody>
              <tr></tr>
              <tr>
                <td>

                  <img src={"https://www.nba.com/assets/logos/teams/secondary/web/" + this.abbToName(this.props.game.team1) + ".png"} className="team-logo"></img>

                </td>
              </tr>
              <tr><td><span className="white-text">{this.props.game.team1}</span></td></tr>
            </tbody>
          </table>
          </label>
        </td>
        <td className="game-box">
          <label htmlFor={this.props.game.team2}>
          <input className="radio-button away-radio" type="radio" id={this.props.game.team2} name={this.props.game.id} value={this.props.game.team2} onChange={this.handleOptionChange} />
          <table className="teamTag-away away-box">
            <tbody>
              <tr></tr>
              <tr>
                <td>

                  <img src={"https://www.nba.com/assets/logos/teams/secondary/web/" + this.abbToName(this.props.game.team2) + ".png"} className="team-logo"></img>

                </td>
              </tr>
              <tr><td><span className="white-text">{this.props.game.team2}</span></td></tr>
            </tbody>
          </table>
          </label>
        </td>
        <td className="spread-box">
          <span className="white-text">{this.state.favored}</span>
          <br/>
          <span className="white-text">{this.state.spread}</span>
        </td>
      </tr>
    )
  }

}
