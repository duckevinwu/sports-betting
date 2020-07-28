import React from 'react';

export default class LandingPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: "",
      nickname: ""
    }

    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleNicknameChange = this.handleNicknameChange.bind(this);
    this.submitEmail = this.submitEmail.bind(this);
  }

  componentDidMount() {

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
    });

  }

  render() {
    return (
      <div>
        <form onSubmit={this.submitEmail}>
          <label htmlFor="email">Email</label>
          <br/>
          <input type="email" id="email" name="email" value={this.state.email} onChange={this.handleEmailChange}/>
          <br/>
          <br/>
          <label htmlFor="nickname">Nickname</label>
          <br/>
          <input type="text" id="nickname" name="nickname" value={this.state.nickname} onChange={this.handleNicknameChange}/>
          <br/>
          <br/>
          <button type="submit">Submit</button>
        </form>
      </div>
    )
  }


}
