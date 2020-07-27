import React from 'react';

export default class SendEmail extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      preview: ""
    }

    this.generateEmail = this.generateEmail.bind(this);
  }

  componentDidMount() {

  }

  generateEmail() {
    fetch("/api/generateemail",
		{
			method: "GET"
		}).then(res => {
			return res.json();
		}, err => {
			console.log(err);
		}).then(data => {
      console.log(data)
      this.setState({
        preview: data.email
      })
		});
  }

  render() {
    return (
      <div>
        <button onClick={this.generateEmail}>Generate Email</button>
        <hr/>
          <div dangerouslySetInnerHTML={{__html: this.state.preview}}/>
        <hr/>
      </div>
    );
  }

}
