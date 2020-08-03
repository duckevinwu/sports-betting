import React from 'react';
import '../style/Style.css';
import Navbar from './Navbar';
import Preloader from './Preloader';
import PostSubmit from './PostSubmit';

export default class Unsubscribe extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoaded: true,
      page: 1
    }

    this.handleUnsubscribe = this.handleUnsubscribe.bind(this);
  }

  componentDidMount() {
    this.setState({
      email: this.props.match.params.email,
      token: this.props.match.params.token
    })
  }

  handleUnsubscribe() {

    this.setState({
      isLoaded: false
    })

    fetch("/api/unsubscribe", {
      method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      //make sure to serialize your JSON body
      body: JSON.stringify({
        email: this.state.email,
        token: this.state.token
      })
    }).then(res => {
			return res.json();
		}, err => {
			console.log(err);
		}).then(data => {
      if (data.status === 'success') {
        this.setState({
          page: 2
        })
      } else {
        this.setState({
          page: 3
        })
      }

      this.setState({
        isLoaded: true
      })
		});
  }

  render() {
    if (!this.state.isLoaded) {
      return (<Preloader/>);
    } else {
      if (this.state.page === 1) {
        return (
          <div className="unsubscribe-page">
            <Navbar/>
            <p className="ty-text">Are you sure?</p>
            <button className="submit-button" onClick={this.handleUnsubscribe}>Unsubscribe</button>
          </div>
        )
      } else if (this.state.page === 2) {
        return (
          <PostSubmit status="unsubscribe"/>
        );
      } else {
        return (
          <PostSubmit status="fail"/>
        )
      }
    }

  }
}
