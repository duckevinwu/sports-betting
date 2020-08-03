import React from 'react';

export default class SignupForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      nickname: "",
      errors: "",
      loading: false,
      success: false
    }

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
    this.submitEmail = this.submitEmail.bind(this);
  }

  handleEmailChange(e) {
    this.setState({
      email: e.target.value
    })
  }

  handleNicknameChange(e) {
    this.setState({
      nickname: e.target.value
    })
  }

  submitEmail(e) {
    e.preventDefault();

    this.setState({
      loading: true
    })

    fetch("/api/emailsignup", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        email: this.state.email,
        nickname: this.state.nickname
      })
    })
    .then(res => {
			return res.json();
		}, err => {
			console.log(err);
		})
    .then(data => {
      console.log(data);
      var status = data.status;

      if (status === 'success') {
        this.setState({
          success: true
        })
      } else {
        var error = (
          <p className="red-text">{data.message}</p>
        );
        this.setState({
          errors: error
        })
      }

      this.setState({
        loading: false
      })
    });

  }

  render() {
    if (this.state.loading) {
      return (
        <div className="load-container">
          <div className="Box loading">
      			<span>
      				<span></span>
      			</span>
      		</div>
        </div>
      );
    } else {
      if (this.state.success) {
        return (
          <div className="success-container">
            <div className="tree">
                <div><img src="https://i.ibb.co/tQGtcsc/check.png" alt="" width="50px" height="50px" className="pre-img"/></div>
                <img src="https://i.ibb.co/tQGtcsc/check.png" alt="" width="50px" height="50px"/>
            </div>
            <p className="success-text"><font className="gold-text">Success! </font>
            Bluejay emails usually arrive at around 11am EST, so check your email then!</p>
          </div>
        )
      } else {
        return (
          <div>
            <form className="landing-form" onSubmit={this.submitEmail}>
              <div className="errors">
                {this.state.errors}
              </div>
              <input className="landing-input" type="email" name="email" placeholder="Email (gmail account for best performance)" value={this.state.email} onChange={this.handleEmailChange} required/>
              <br/>
              <input className="landing-input" type="text" name="nickname" placeholder="Leaderboard name" maxLength="20" pattern="[A-Za-z0-9_]{1,20}" title="name must be between 1 and 20 alphanumeric characters and/or underscores" value={this.state.nickname} onChange={this.handleNicknameChange} required/>
              <br/>
              <button className="submit-button" type="submit">Sign up free</button>
            </form>
          </div>
        );
      }
    }

  }
}
