import React from 'react';
import '../style/Style.css';
import SignupForm from './SignupForm';

export default class LandingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    }

  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <div className="lp-page">
          <div className="links w3-animate-top">
            <span className="nav-link"><a href="#how-it-works">How it works</a></span>
            <span className="nav-link"><a href="/leaderboard">Leaderboard</a></span>
            <span className="nav-link"><a href="/pro" className="pro-link">Bluejay Pro</a></span>
          </div>
          <div className="text w3-animate-left">
            <div className="inside-text">
              <div className="logo-row">
                <span><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="75px" height="75px"></img></span>
                <span><img src="https://i.ibb.co/nRsWXhS/text.png" width="150px"></img></span>
              </div>
              <p className="subtitle">Email Sports Betting - with the payout, without the risk</p>
              <p className="subtext">
                No accounts. No deposits to win real cash prizes.
                If you're new to sports betting or don't like the risk associated with traditional betting, sign up now!
              </p>
              <SignupForm/>
            </div>
          </div>
          <div className="image w3-animate-right">
            <img src="https://i.ibb.co/njWssDv/phone-silver-v2.png" className="phone-pic"></img>
          </div>
        </div>
        <div id="how-it-works" className="hiw">
          <h2 className="section-title">How it works</h2>
          <div className="underline"></div>
          <div className="lp-grid">
            <div className="lp-card">
              <div>
                <img src="https://i.ibb.co/x8CR3m6/signup.png" width="100px" className="card-icon"></img>
                <h3 className="card-title">Sign up for Bluejay emails</h3>
                <p className="card-text">
                  You'll receive an email every morning that will summarize your performance yesterday (rank + payout) and display today's games.
                  Picks can be made directly in this email!
                </p>
              </div>
            </div>
            <div className="lp-card">
              <div>
                <img src="https://i.ibb.co/dmQ1zC9/pick.png" width="100px" className="card-icon"></img>
                <h3 className="card-title">Make your picks</h3>
                <p className="card-text">
                  Choose your winners of today's games. For score calculation, a favorite winning nets you fewer points than an underdog winning.
                  However, if your pick loses, you'll receive 0 points. Pick wisely!
                </p>
              </div>
            </div>
            <div className="lp-card">
              <div>
                <img src="https://i.ibb.co/wMDbXnY/money.png" width="100px" className="card-icon"></img>
                <h3 className="card-title gold-text">Redeem your payout</h3>
                <p className="card-text">
                  Winnings will be accumulated and paid out monthly. The winner of each day
                  (<span className="tooltip"><span className="tooltiptext">The one who earned the most points from yesterday's games. If a tie occurs, a winner will be randomly selected</span><i className="fa fa-question-circle"></i></span>)
                  will receive + $1 to their daily payout. Daily winner payout can be redeemed by anyone!
                  <br/>
                  <br/>
                  To redeem additional winnings (calculated based on your score), sign up for <a>Bluejay Pro</a>!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


}
