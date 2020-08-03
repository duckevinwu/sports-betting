import React from 'react';
import '../style/Style.css';

export default class LeaderboardRow extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      playerInfo: {}
    }
  }

  componentDidMount() {
    this.setState({
      playerInfo: this.props.player
    })
  }

  render() {
    return (
      <div className="leaderboard-row">
        <div className="rank">
          <p className="rank-text">{this.state.playerInfo.rank}</p>
        </div>
        <div className="name">
          <p className="name-text">{this.state.playerInfo.nickname}</p>
        </div>
        <div className="points">
          <p><span className="points-text-big">{(parseFloat(this.state.playerInfo.score)).toFixed(1)}</span> <span className="points-text-sm">PTS</span></p>
        </div>
      </div>
    );
  }
}
